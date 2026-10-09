"""Jal Sankat: city water-stress early warning API (FastAPI)."""
import json, pathlib, datetime as dt
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Jal Sankat Early Warning")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
CITIES = json.loads((pathlib.Path(__file__).parent / "data" / "cities.json").read_text(encoding="utf-8"))

LPCD = 135            # CPHEEO urban norm, litres per person per day
HEAT_UPLIFT = 0.02    # +2% demand per degC above 30 (ASSUMPTION, tune with real data)
GW_DERATE = 0.0015    # supply loss per groundwater stress point (ASSUMPTION)
W = dict(heat=.25, gap=.30, ratio=.25, gw=.20)  # score weights (ASSUMPTION)

async def get_forecast(c):
    try:
        async with httpx.AsyncClient(timeout=6) as cl:
            r = await cl.get("https://api.open-meteo.com/v1/forecast", params={
                "latitude": c["lat"], "longitude": c["lon"], "daily": "temperature_2m_max",
                "timezone": "Asia/Kolkata", "forecast_days": 7})
            r.raise_for_status()
            d = r.json()["daily"]
            return d["time"], d["temperature_2m_max"], "live"
    except Exception:
        today = dt.date.today()
        return [(today + dt.timedelta(days=i)).isoformat() for i in range(7)], c["fallback"], "offline-sample"

def level(score):
    return "High" if score >= 60 else "Moderate" if score >= 35 else "Low"

@app.get("/api/cities")
def cities():
    return list(CITIES.keys())

@app.get("/api/assess/{city}")
async def assess(city: str, heat_shift: float = 0):
    c = CITIES.get(city)
    if not c:
        raise HTTPException(404, "Unknown city")
    dates, temps, source = await get_forecast(c)
    temps = [round(t + heat_shift, 1) for t in temps]
    base = c["pop"] * LPCD / 1e6  # ML/day
    dem = [base * (1 + HEAT_UPLIFT * max(0, t - 30)) for t in temps]
    pk = dem.index(max(dem))
    supply = c["supply"] * (1 - GW_DERATE * c["gw_score"])
    gap = max(0, dem[pk] - supply)
    comp = dict(
        heat=min(100, max(0, (temps[pk] - 30) * 10)),
        gap=min(100, gap / dem[pk] * 400),
        ratio=min(100, max(0, (dem[pk] / supply - 0.8) * 250)),
        gw=c["gw_score"])
    score = round(sum(W[k] * comp[k] for k in W))
    lvl = level(score)
    day = dt.date.fromisoformat(dates[pk]).strftime("%A")
    wards = []
    for w in c["wards"]:
        wd, ws = dem[pk] * w["pop"], supply * w["sup"]
        wg = max(0, wd - ws)
        wards.append(dict(name=w["name"], demand=round(wd, 1), supply=round(ws, 1),
                          gap=round(wg, 1), risk_pct=round(wg / wd * 100)))
    wards.sort(key=lambda x: -x["risk_pct"])
    worst = wards[0]["name"]
    actions = {"High": ["Conservation campaign across the city", f"Targeted alerts for {worst} first",
                        "Pre-position tankers and plan pumping schedule before " + day],
               "Moderate": ["Conservation messaging", f"Alert {worst}", "Keep reserve supply on standby"],
               "Low": ["Routine monitoring"]}[lvl]
    return dict(city=city, level=lvl, score=score, source=source, peak_day=day,
        peak_temp=temps[pk], demand=round(dem[pk], 1), supply=round(supply, 1), gap=round(gap, 1), gw=c["gw"],
        components={k: round(v) for k, v in comp.items()}, weights=W,
        days=[dict(date=d, temp=t, demand=round(x, 1)) for d, t, x in zip(dates, temps, dem)],
        wards=wards, worst_ward=worst, actions=actions,
        sms_en=f"Water alert: high demand expected on {day} in {worst}. Please store water and avoid wastage.",
        sms_hi=f"जल चेतावनी: {day} को {worst} में पानी की मांग अधिक रहेगी। कृपया पानी जमा करें और बर्बादी रोकें।",
        provenance=[
            dict(item="Temperature forecast", kind="Measured" if source == "live" else "Estimated", src="Open-Meteo" if source == "live" else "Offline sample"),
            dict(item="Population", kind="Official", src="Census projection (placeholder)"),
            dict(item="Water norm 135 L/person/day", kind="Official", src="CPHEEO"),
            dict(item="Supply capacity", kind="Official", src="City water dept (placeholder)"),
            dict(item="Groundwater category", kind="Official", src="CGWB (placeholder)"),
            dict(item="Demand, gap, score", kind="Estimated", src="Model in main.py"),
            dict(item="Peak day", kind="Predicted", src="Forecast + model")])

class PlanRequest(BaseModel):
    city: str
    score: int
    level: str
    peak_day: str
    worst_ward: str
    gap: float
    gw: str

@app.post("/api/plan")
def generate_plan(req: PlanRequest):
    prompt = f"Write a short, professional 3-bullet crisis response plan for a municipal water engineer in {req.city}. The city is facing a {req.level} water stress risk (Score: {req.score}/100) peaking on {req.peak_day} with a supply gap of {req.gap} ML/day. The worst affected area will be {req.worst_ward}. The groundwater is {req.gw}."
    
    fallback_plan = f"• Initiate city-wide conservation campaign immediately targeting {req.city}.\n• Deploy emergency water tankers prioritized for {req.worst_ward} before {req.peak_day}.\n• Monitor groundwater extraction levels closely as they are {req.gw}."
    
    try:
        import boto3
        client = boto3.client("bedrock-runtime", region_name="us-east-1")
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 300,
            "messages": [{"role": "user", "content": prompt}]
        })
        response = client.invoke_model(
            modelId="anthropic.claude-3-haiku-20240307-v1:0", 
            body=body,
            contentType="application/json"
        )
        res_body = json.loads(response['body'].read())
        return {"plan": res_body['content'][0]['text'], "source": "Amazon Bedrock (Claude 3)"}
    except Exception as e:
        print("Bedrock error:", e)
        return {"plan": fallback_plan, "source": "Built-in Fallback (No AWS Access)"}

class AlertRequest(BaseModel):
    phone: str
    message: str

@app.post("/api/alert")
def send_alert(req: AlertRequest):
    try:
        import boto3
        sns = boto3.client("sns", region_name="ap-south-1")
        sns.publish(PhoneNumber=req.phone, Message=req.message)
        return {"status": "success", "detail": "SMS sent successfully via Amazon SNS!"}
    except Exception as e:
        print("SNS error:", e)
        return {"status": "fallback", "detail": "AWS SNS not configured. (Simulated success)"}
