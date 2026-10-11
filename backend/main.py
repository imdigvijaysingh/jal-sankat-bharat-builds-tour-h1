import json, pathlib, datetime as dt, hmac, hashlib, time, os
import httpx
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Jal Sankat Early Warning")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/")
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Jal Sankat Early Warning API"}
CITIES_PATH = pathlib.Path(__file__).parent / "data" / "cities.json"
CONFIG_PATH = pathlib.Path(__file__).parent / "data" / "config.json"

CITIES = json.loads(CITIES_PATH.read_text(encoding="utf-8"))

# Authentication Gate Configuration
ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
AUTH_SECRET = os.getenv("AUTH_SECRET", "jal-sankat-auth-secret-key-2026")

def generate_token(username: str) -> str:
    timestamp = str(int(time.time()))
    signature = hmac.new(AUTH_SECRET.encode(), f"{username}:{timestamp}".encode(), hashlib.sha256).hexdigest()
    return f"{username}.{timestamp}.{signature}"

def is_valid_token(token: str) -> bool:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return False
        username, timestamp, signature = parts
        if username != ADMIN_USER:
            return False
        # Valid for 24 hours (86400 seconds)
        if time.time() - int(timestamp) > 86400:
            return False
        expected_sig = hmac.new(AUTH_SECRET.encode(), f"{username}:{timestamp}".encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(signature, expected_sig)
    except Exception:
        return False

def verify_admin_auth(authorization: str = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required. Please log in.")
    token = authorization.replace("Bearer ", "").strip()
    if not is_valid_token(token):
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in again.")
    return True

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/admin/login")
def admin_login(req: LoginRequest):
    if req.username == ADMIN_USER and req.password == ADMIN_PASSWORD:
        token = generate_token(req.username)
        return {"status": "success", "token": token, "username": req.username}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.get("/api/admin/verify")
def verify_admin(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.replace("Bearer ", "").strip()
    if is_valid_token(token):
        return {"authenticated": True, "username": ADMIN_USER}
    raise HTTPException(status_code=401, detail="Invalid or expired session")

def get_config():
    if not CONFIG_PATH.exists():
        CONFIG_PATH.write_text(json.dumps({
            "LPCD": 135,
            "BASE_TEMP": 25,
            "HEAT_UPLIFT": 0.02,
            "GW_DERATE": 0.0015,
            "W": {"heat": 0.25, "gap": 0.30, "ratio": 0.25, "gw": 0.20}
        }))
    cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    if "BASE_TEMP" not in cfg:
        cfg["BASE_TEMP"] = 25
    return cfg

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

@app.get("/api/config")
def read_config():
    return get_config()

@app.get("/api/cities/raw")
def raw_cities():
    return CITIES

@app.post("/api/config")
def update_config(new_config: dict, authorization: str = Header(None)):
    verify_admin_auth(authorization)
    CONFIG_PATH.write_text(json.dumps(new_config, indent=4))
    return {"status": "success"}

@app.post("/api/cities/update")
def update_city(city_data: dict, authorization: str = Header(None)):
    verify_admin_auth(authorization)
    city_name = city_data.get("name")
    if not city_name:
        raise HTTPException(400, "City name required")
    # Update the global object and save
    c_data = {k: v for k, v in city_data.items() if k != "name"}
    CITIES[city_name] = c_data
    CITIES_PATH.write_text(json.dumps(CITIES, indent=4))
    return {"status": "success"}

@app.get("/api/assess/{city}")
async def assess(city: str, heat_shift: float = 0):
    c = CITIES.get(city)
    if not c:
        raise HTTPException(404, "Unknown city")
    
    cfg = get_config()
    LPCD = cfg["LPCD"]
    BASE_TEMP = cfg.get("BASE_TEMP", 25)
    HEAT_UPLIFT = cfg["HEAT_UPLIFT"]
    GW_DERATE = cfg["GW_DERATE"]
    W = cfg["W"]

    dates, temps, source = await get_forecast(c)
    temps = [round(t + heat_shift, 1) for t in temps]
    base = c["pop"] * LPCD / 1e6  # ML/day
    dem = [base * (1 + HEAT_UPLIFT * max(0, t - BASE_TEMP)) for t in temps]
    pk = dem.index(max(dem))
    supply = c["supply"] * (1 - GW_DERATE * c["gw_score"])
    gap = max(0, dem[pk] - supply)
    comp = dict(
        heat=min(100, max(0, (temps[pk] - BASE_TEMP) * 5)),
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
    if lvl == "High":
        sms_en = f"CRITICAL WATER ALERT: High demand expected starting {day} in {worst} due to heat waves. Please decrease water consumption and store water at home for 2-3 days."
        sms_hi = f"महत्वपूर्ण जल चेतावनी: लू (heat waves) के कारण {day} से {worst} में पानी की कमी हो सकती है। कृपया पानी का उपयोग कम करें और 2-3 दिनों के लिए पानी घर पर स्टोर करें।"
    else:
        sms_en = f"Water alert: high demand expected on {day} in {worst}. Please store water and avoid wastage."
        sms_hi = f"जल चेतावनी: {day} को {worst} में पानी की मांग अधिक रहेगी। कृपया पानी जमा करें और बर्बादी रोकें।"

    return dict(city=city, level=lvl, score=score, source=source, peak_day=day, peak_date=dates[pk],
        peak_temp=temps[pk], demand=round(dem[pk], 1), supply=round(supply, 1), gap=round(gap, 1), gw=c["gw"],
        base_temp=BASE_TEMP,
        components={k: round(v) for k, v in comp.items()}, weights=W,
        days=[dict(date=d, temp=t, demand=round(x, 1)) for d, t, x in zip(dates, temps, dem)],
        wards=wards, worst_ward=worst, actions=actions,
        sms_en=sms_en,
        sms_hi=sms_hi,
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
        phones = [p.strip() for p in req.phone.split(",") if p.strip()]
        for p in phones:
            # Auto-format 10 digit Indian numbers to E.164
            if len(p) == 10 and p.isdigit():
                p = "+91" + p
            elif not p.startswith("+"):
                p = "+" + p
            sns.publish(PhoneNumber=p, Message=req.message)
        return {"status": "success", "detail": f"WhatsApp message sent to {len(phones)} number(s)!"}
    except Exception as e:
        print("WhatsApp error:", e)
        return {"status": "fallback", "detail": "WhatsApp API not configured. (Simulated success)"}
