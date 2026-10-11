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
- **Stunning 3D Holographic AI Brain**: A custom zero-dependency `<canvas>` visualization that dynamically reacts to the city's water stress in real time—spinning, pulsing, and changing state when alerts trigger.
- **Continuous AI Monitoring**: True real-time data polling (every 3s) with a live AI thought-process terminal.
- **Autonomous Bulk SMS Dispatch**: Drag-and-drop support for contact lists (.csv, .xlsx). The AI auto-triggers crisis mode (score >= 60) and dispatches emergency SMS to affected citizens, complete with a clean UI linear progress bar. It even remembers previously uploaded data for seamless, zero-click autonomous dispatching on subsequent crises.
- **Embedded Geographic Mapping**: A live, interactive map integration styled with negative CSS margins to perfectly fit the UI without messy overlays, providing immediate visual location context.
- **Water Stress Score**: One actionable number plus Low / Moderate / High status indicators.
- **7-day Demand Forecast**: Dynamically scaling charts for each day, with the peak day highlighted in red.
- **Ward Priority List**: Highlights precisely which area needs help first.
- **AI-Generated Action Plans**: Recommended emergency steps for the municipality, generated instantly by AWS Bedrock AI.
- **Heat What-if Slider**: Test a heatwave scenario instantly and watch the entire dashboard recalculate.
- **Honesty Table**: Every number is transparently tagged Measured, Official, Estimated, or Predicted.
- **(i) Context Buttons**: Hover over them on any section for plain-English explanations.
- **Live Data Admin Panel & Authentication Gate**: Secure municipal login gate protecting model weights, city parameters, and ward demographics (Default credentials: `admin` / `admin123`).

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
- `backend/data/config.json`: stores the dynamically editable model weights (LPCD, derate, etc).
- `backend/data/cities.json`: city data and wards. **Placeholder numbers, replace via the Admin Panel.**
- `frontend/src/App.jsx`: the whole screen, including the (i) tooltips.
- `frontend/src/AdminPanel.jsx`: the UI to input real data.

## The model (and its assumptions)
- Demand = population x 135 litres x (1 + 2% per degree above base temperature, default 25°C)
- Supply = official capacity, reduced 0.15% per groundwater stress point
- Score = 25% heat + 30% supply gap + 25% demand/supply ratio + 20% groundwater

The 25°C base temperature, 2% heat uplift, 0.15% groundwater derate, and weights are **configurable assumptions**. You can tune them **directly via the Admin Data button** on the website. This is a rules-based model, not machine learning yet.

## Honest limits (and how to fix them)
- Population, supply, groundwater and ward shares are placeholders. **Fix:** Click the "Admin Data" button on the website to input real figures from the Census, city water department and CGWB.
- Ward demand is split by population share, not measured.
- Only 4 cities are included initially (you can add more to `cities.json`).

## API
- `POST /api/admin/login`: authenticate admin with username & password
- `GET /api/admin/verify`: verify active admin session token
- `GET /api/cities`: list of cities
- `GET /api/assess/{city}?heat_shift=0`: full assessment
- `GET /api/cities/raw`: raw data for all cities
- `POST /api/cities/update`: overwrite data for a city (requires Auth)
- `GET /api/config` and `POST /api/config`: read and update model constants (POST requires Auth)

## Hosting
Localhost is enough for submission. If you want it online later, Render can host both parts (the free tier sleeps when idle).

## Architecture & Roadmap (Built vs. Planned)

**Currently Built & Working (MVP)**
- **Frontend**: React (Vite) with a premium glassmorphism-inspired UI, custom 3D `<canvas>` rendering, live maps, dynamic scaling charts, and a heatwave slider.
- **Backend**: FastAPI serving the real-time rules-based scoring model.
- **Data Integration**: Live weather via Open-Meteo API.
- **AI Planning & Auto-Decision**: Amazon Bedrock (Claude 3) integration for crisis response generation, and an active AI decision loop that triggers emergency bulk SMS dispatch when stress >= 60.
- **Alerting**: Amazon SNS integration configured for sending emergency SMS warnings to citizens based on drag-and-dropped contact data.

**Planned Architecture (Future Scale)**
- **Data Storage (Planned)**: Amazon DynamoDB to store historical water demand, supply logs, and ward population data.
- **Compute (Planned)**: AWS Lambda for serverless, event-driven score recalculations when new data streams in.
- **IoT Streaming (Planned)**: AWS IoT Core to ingest real-time smart meter data and tank levels.
- **Advanced AI (Planned)**: Amazon SageMaker to train predictive machine learning models on past demand instead of the current rules-based assumptions.
