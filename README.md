# Jal Sankat: Water Stress Early Warning

Jal Sankat ("water crisis") tells a city's water team **which days and which areas** will run short of water, so they can act before people suffer.

## The idea in simple words
1. You pick a city.
2. The system gets the 7-day weather forecast and the city's basic water data.
3. It estimates how much water people will need (hotter days mean more demand).
4. It compares that with how much water the city can supply (less if groundwater is low).
5. It gives a **score from 0 to 100**, the peak day, the shortfall, the worst wards, and a ready SMS alert.

We do **not** survey people. We use public data, simple maths, and clear labels.

## Features
- **Water Stress Score**: one number plus Low / Moderate / High.
- **7-day demand forecast**: bars for each day, peak in red.
- **Score breakdown**: shows what is pushing the score up.
- **Ward priority list**: which area needs help first.
- **Recommended actions** for the municipality.
- **Citizen alert** in English and Hindi, with a copy button.
- **Heat what-if slider**: test a heatwave.
- **Honesty table**: every number is tagged Measured, Official, Estimated or Predicted.
- **(i) buttons** on every section: hover over them for a plain explanation.

## How to run on your computer
You need Python 3.10+ and Node.js 18+.

**Terminal 1: backend**
```
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows. On Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
**Terminal 2: frontend**
```
cd frontend
npm install
npm run dev
```
Open the link shown (usually http://localhost:5173). If there is no internet, the weather falls back to a sample and the page says so.

## Folder map
- `backend/main.py`: the API and the scoring model.
- `backend/data/cities.json`: city data and wards. **Placeholder numbers, replace with real data.**
- `frontend/src/App.jsx`: the whole screen, including the (i) tooltips.

## The model (and its assumptions)
- Demand = population x 135 litres x (1 + 2% per degree above 30°C)
- Supply = official capacity, reduced 0.15% per groundwater stress point
- Score = 25% heat + 30% supply gap + 25% demand/supply ratio + 20% groundwater

The 2%, 0.15% and weights are **assumptions**. Say so openly, and tune them with real historical data. This is a rules-based model, not machine learning yet.

## Honest limits
- Population, supply, groundwater and ward shares are placeholders. Replace them with Census, city water department and CGWB figures.
- Ward demand is split by population share, not measured.
- Only 4 cities are included.

## API
- `GET /api/cities`: list of cities
- `GET /api/assess/{city}?heat_shift=0`: full assessment (interactive docs at http://localhost:8000/docs)

## Hosting
Localhost is enough for submission. If you want it online later, Render can host both parts (the free tier sleeps when idle).

## Architecture & Roadmap (Built vs. Planned)

**Currently Built & Working (MVP)**
- **Frontend**: React (Vite) with dynamic UI, score visualisations, and heatwave slider.
- **Backend**: FastAPI serving rules-based scoring model.
- **Data Integration**: Live weather via Open-Meteo API.
- **AI Planning**: Amazon Bedrock (Claude 3) integration for crisis response generation.
- **Alerting**: Amazon SNS integration for sending SMS warnings to municipal engineers/citizens.

**Planned Architecture (Future Scale)**
- **Data Storage (Planned)**: Amazon DynamoDB to store historical water demand, supply logs, and ward population data.
- **Compute (Planned)**: AWS Lambda for serverless, event-driven score recalculations when new data streams in.
- **IoT Streaming (Planned)**: AWS IoT Core to ingest real-time smart meter data and tank levels.
- **Advanced AI (Planned)**: Amazon SageMaker to train predictive machine learning models on past demand instead of the current rules-based assumptions.
- **Visualisation (Planned)**: Interactive ward-level map highlighting stress zones geographically.
