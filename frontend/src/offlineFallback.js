// Standalone client-side fallback for Jal Sankat when cloud backend is not connected
export const DEFAULT_CONFIG = {
  LPCD: 135,
  BASE_TEMP: 25,
  HEAT_UPLIFT: 0.02,
  GW_DERATE: 0.0015,
  W: { heat: 0.25, gap: 0.30, ratio: 0.25, gw: 0.20 }
};

export const CITIES_DATA = {
  "Saharanpur": {
    lat: 29.97, lon: 77.55, pop: 705478, supply: 104.15, gw: "Over-exploited", gw_score: 85,
    fallback: [33, 34, 35, 36, 37, 38, 36],
    wards: [
      { name: "Ward A (Old City)", pop: 0.4, sup: 0.3 },
      { name: "Ward B (Civil Lines)", pop: 0.25, sup: 0.35 },
      { name: "Ward C (Outskirts)", pop: 0.35, sup: 0.35 }
    ]
  },
  "Mathura": {
    lat: 27.49, lon: 77.67, pop: 450000, supply: 60, gw: "Over-exploited", gw_score: 95,
    fallback: [34, 34, 35, 35, 36, 37, 36],
    wards: [
      { name: "Ward A (Temple Area)", pop: 0.45, sup: 0.3 },
      { name: "Ward B (Cantt)", pop: 0.2, sup: 0.35 },
      { name: "Ward C (Outskirts)", pop: 0.35, sup: 0.35 }
    ]
  },
  "Meerut": {
    lat: 28.98, lon: 77.71, pop: 1305429, supply: 185, gw: "Over-exploited", gw_score: 90,
    fallback: [33, 34, 35, 36, 36, 37, 35],
    wards: [
      { name: "Ward A (Dense Core)", pop: 0.45, sup: 0.3 },
      { name: "Ward B (Cantt)", pop: 0.15, sup: 0.3 },
      { name: "Ward C (New Colonies)", pop: 0.4, sup: 0.4 }
    ]
  },
  "Lucknow": {
    lat: 26.85, lon: 80.95, pop: 4200000, supply: 800, gw: "Critical", gw_score: 75,
    fallback: [33, 33, 34, 35, 36, 36, 35],
    wards: [
      { name: "Ward A (Old Lucknow)", pop: 0.35, sup: 0.3 },
      { name: "Ward B (Gomti Nagar)", pop: 0.3, sup: 0.38 },
      { name: "Ward C (Outskirts)", pop: 0.35, sup: 0.32 }
    ]
  }
};

function getLevel(score) {
  return score >= 60 ? "High" : score >= 35 ? "Moderate" : "Low";
}

export async function assessClientSide(cityName, heatShift = 0) {
  const c = CITIES_DATA[cityName] || CITIES_DATA["Saharanpur"];
  const cfg = DEFAULT_CONFIG;
  const { LPCD, BASE_TEMP, HEAT_UPLIFT, GW_DERATE, W } = cfg;

  let dates = [];
  let temps = [];
  let source = "offline-sample";

  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&daily=temperature_2m_max&timezone=Asia%2FKolkata&forecast_days=7`, { signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    if (data?.daily?.time && data?.daily?.temperature_2m_max) {
      dates = data.daily.time;
      temps = data.daily.temperature_2m_max;
      source = "live";
    }
  } catch (e) {
    const today = new Date();
    dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0];
    });
    temps = c.fallback;
    source = "offline-sample";
  }

  temps = temps.map(t => +(t + heatShift).toFixed(1));
  const base = (c.pop * LPCD) / 1e6;
  const dem = temps.map(t => +(base * (1 + HEAT_UPLIFT * Math.max(0, t - BASE_TEMP))).toFixed(1));
  const maxD = Math.max(...dem);
  const pk = dem.indexOf(maxD);
  const supply = +(c.supply * (1 - GW_DERATE * c.gw_score)).toFixed(1);
  const gap = +(Math.max(0, dem[pk] - supply)).toFixed(1);

  const comp = {
    heat: Math.round(Math.min(100, Math.max(0, (temps[pk] - BASE_TEMP) * 5))),
    gap: Math.round(Math.min(100, (gap / dem[pk]) * 400)),
    ratio: Math.round(Math.min(100, Math.max(0, (dem[pk] / supply - 0.8) * 250))),
    gw: c.gw_score
  };

  const score = Math.round(
    W.heat * comp.heat +
    W.gap * comp.gap +
    W.ratio * comp.ratio +
    W.gw * comp.gw
  );

  const lvl = getLevel(score);
  const dayDate = new Date(dates[pk]);
  const day = dayDate.toLocaleDateString("en-US", { weekday: "long" });

  const wards = c.wards.map(w => {
    const wd = +(dem[pk] * w.pop).toFixed(1);
    const ws = +(supply * w.sup).toFixed(1);
    const wg = +(Math.max(0, wd - ws)).toFixed(1);
    const risk_pct = Math.round((wg / wd) * 100);
    return { name: w.name, demand: wd, supply: ws, gap: wg, risk_pct };
  }).sort((a, b) => b.risk_pct - a.risk_pct);

  const worst = wards[0]?.name || "Core Ward";
  const actions = {
    High: [
      "Conservation campaign across the city",
      `Targeted alerts for ${worst} first`,
      `Pre-position tankers and plan pumping schedule before ${day}`
    ],
    Moderate: [
      "Conservation messaging",
      `Alert ${worst}`,
      "Keep reserve supply on standby"
    ],
    Low: ["Routine monitoring"]
  }[lvl];

  const sms_en = lvl === "High"
    ? `CRITICAL WATER ALERT: High demand expected starting ${day} in ${worst} due to heat waves. Please decrease water consumption and store water at home for 2-3 days.`
    : `Water alert: high demand expected on ${day} in ${worst}. Please store water and avoid wastage.`;

  const sms_hi = lvl === "High"
    ? `महत्वपूर्ण जल चेतावनी: लू (heat waves) के कारण ${day} से ${worst} में पानी की कमी हो सकती है। कृपया पानी का उपयोग कम करें और 2-3 दिनों के लिए पानी घर पर स्टोर करें।`
    : `जल चेतावनी: ${day} को ${worst} में पानी की मांग अधिक रहेगी। कृपया पानी जमा करें और बर्बादी रोकें।`;

  return {
    city: cityName,
    level: lvl,
    score,
    source,
    peak_day: day,
    peak_date: dates[pk],
    peak_temp: temps[pk],
    demand: +(dem[pk]).toFixed(1),
    supply,
    gap,
    gw: c.gw,
    base_temp: BASE_TEMP,
    components: comp,
    weights: W,
    days: dates.map((d, i) => ({ date: d, temp: temps[i], demand: dem[i] })),
    wards,
    worst_ward: worst,
    actions,
    sms_en,
    sms_hi,
    isClientFallback: true,
    provenance: [
      { item: "Temperature forecast", kind: source === "live" ? "Measured" : "Estimated", src: source === "live" ? "Live (Open-Meteo)" : "Offline sample" },
      { item: "Population", kind: "Official", src: "Census projection (placeholder)" },
      { item: "Water norm 135 L/person/day", kind: "Official", src: "CPHEEO" },
      { item: "Supply capacity", kind: "Official", src: "City water dept (placeholder)" },
      { item: "Groundwater category", kind: "Official", src: "CGWB (placeholder)" },
      { item: "Demand, gap, score", kind: "Estimated", src: "Client Model fallback" },
      { item: "Peak day", kind: "Predicted", src: "Forecast + model" }
    ]
  };
}
