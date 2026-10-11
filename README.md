# 🌊 Jal Sankat (जल संकट): Water Stress Early Warning System

> **A 7-day radar for municipal water departments — predicting heatwave demand surges and preventing dry taps before citizens suffer.**  
> *Built for the **WeMakeDevs × AWS Bharat Builds Tour (Environmental Hacks Track)**.*

[![AWS](https://img.shields.io/badge/AWS-Powered-orange.svg)](https://aws.amazon.com)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)](https://vitejs.dev)
[![Bedrock](https://img.shields.io/badge/AI-Amazon%20Bedrock%20Claude%203-blueviolet.svg)](https://aws.amazon.com/bedrock)
[![SNS](https://img.shields.io/badge/Alerts-Amazon%20SNS-E7157B.svg)](https://aws.amazon.com/sns)

---

## 📌 The Problem: The 72-Hour Blind Spot

In Indian cities like Saharanpur, Mathura, and Meerut, municipal water departments operate in the **blind rear-view mirror**:
1. A sudden summer heatwave pushes temperatures past 38°C.
2. Demand surges by **+2% for every 1°C increase** (desert coolers, hygiene, verandas).
3. Simultaneously, thousands of groundwater borewells pump at once, dropping the underground aquifer table and reducing pump yields.
4. By Wednesday morning, taps whistle dry air.
5. By the time furious citizens call municipal helplines, **the crisis is already 72 hours old**—overhead reservoirs are dry, and emergency tanker trucks are 36 hours away.

**Jal Sankat solves this by giving city officials a 7-day head start**, turning panic and protests into an orderly, calm relief plan.

---

## 🚀 Key Features

### 1. 🌐 Interactive Story & Architecture Blog
- Built directly into the app for citizen awareness, judges, and non-technical stakeholders.
- **Smart Glossary Tooltips (`<Term>`)**: Hover or tap any technical term (*Open-Meteo*, *CPHEEO Rule*, *Aquifer*, *Amazon Bedrock*, *Amazon SNS*) to see a 1-sentence plain-English explanation.
- **High-Impact Figures**: Custom visual models illustrating the real crisis:
  - **Fig 1.0**: Saharanpur municipality brass tap & street queue reality.
  - **Fig 2.0**: 3D urban geological cutaway of heat domes and groundwater depletion.
  - **Fig 3.0**: Spaceborne thermal satellite detection analyzed by Amazon Bedrock AI.
- **Calibrated Ergonomic Typography**: Sized between `text-sm` (14px) and `text-lg` (18px) to eliminate eye strain.

### 2. 🧠 3D Holographic AI Brain & Real-Time Monitoring
- A custom, zero-dependency HTML5 `<canvas>` visualization that pulses and shifts color dynamically based on city water stress score (0–100).
- Live real-time polling (every 5 seconds) with live AI thought-process updates.

### 3. 🤖 Amazon Bedrock (Claude 3) Emergency Action Planner
- Instantly translates quantitative deficits into concise, actionable 3-point municipal emergency directives in under 1 second.
- Recommends overnight tank filling, industrial pump rationing, and neighborhood-specific tanker dispatch routes.

### 4. 📲 Autonomous Bulk SMS Dispatch (Amazon SNS)
- Drag-and-drop support for neighborhood contact lists (`.csv`, `.xlsx`).
- Dispatches bilingual SMS alerts (Hindi and English) directly to tanker drivers and ward councilors before water pressure drops.
- Autonomous memory triggers when stress crosses critical threshold (score ≥ 60).

### 5. 🛰️ Live Satellite Forecasts & Demand Simulation
- Integrated with free satellite feeds via the **Open-Meteo API** (7-day daily maximum temperature forecast).
- **Interactive Heat What-If Slider**: Allows engineers to simulate unexpected temperature spikes (+1°C to +5°C) and watch the whole city's demand recalculate in real time.

### 6. 🛡️ Resilient Offline Fallback Mode
- Built for real Indian municipal field conditions (frequent power cuts, weak 2G signals).
- If the backend or cloud connection drops, the browser automatically switches to an in-memory client-side math model without crashing or showing error screens.

### 7. 🔒 Municipal Admin Panel & Parameter Tuner
- Password-gated administration suite (`admin` / `admin123`).
- Dynamically tune CPHEEO consumption norms (135 LPCD default), base heat thresholds, groundwater derate coefficients, and ward population shares.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS v4, Lucide Icons | Responsive dashboard & storytelling blog |
| **Backend** | Python 3.10+, FastAPI, Uvicorn | Real-time assessment model & REST APIs |
| **AI Brain** | Amazon Bedrock (Anthropic Claude 3 Sonnet / Haiku) | Generative municipal action plans |
| **Notification** | Amazon SNS (Simple Notification Service) | High-speed multi-lingual SMS delivery |
| **Weather Feed** | Open-Meteo Satellite API | 7-day daily maximum temperature forecasts |
| **Hosting** | AWS Amplify (Frontend) & AWS App Runner (Backend) | Scalable cloud deployment with auto-CI/CD |

---

## 📂 Repository Structure

```
jal-sankat/
├── backend/
│   ├── main.py                     # FastAPI application & scoring engine
│   ├── requirements.txt            # Python dependencies (fastapi, boto3, etc.)
│   └── data/
│       ├── cities.json             # City metadata, populations & ward shares
│       └── config.json             # Model weights and CPHEEO assumptions
├── frontend/
│   ├── public/
│   │   └── images/                 # Generated blog visuals (Fig 1.0, 2.0, 3.0)
│   ├── src/
│   │   ├── App.jsx                 # Core dashboard, holographic canvas & tabs
│   │   ├── Blog.jsx                # Story & Architecture blog with hover terms
│   │   ├── AdminPanel.jsx          # Municipal data & weight configuration
│   │   ├── index.css               # Styling and typography tokens
│   │   └── main.jsx                # Vite React root
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite configuration
├── AWS_BUILDER_CENTER_BLOG.md      # Full publication-ready blog article
└── README.md                       # Project documentation
```

---

## 💻 How to Run Locally

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### 1. Start the Backend API
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*The FastAPI server starts at `http://localhost:8000` (interactive docs at `http://localhost:8000/docs`).*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 📊 The Mathematical Model

Jal Sankat implements a transparent, physics-grounded municipal formula:

$$\text{Daily Demand} = \text{Population} \times \text{LPCD} \times (1 + \alpha \times \max(0, T_{\text{peak}} - T_{\text{base}}))$$

$$\text{Effective Supply} = \text{Design Capacity} \times (1 - \beta \times \text{GW Score})$$

$$\text{Stress Score} = 0.25 \cdot S_{\text{heat}} + 0.30 \cdot S_{\text{gap}} + 0.25 \cdot S_{\text{ratio}} + 0.20 \cdot S_{\text{groundwater}}$$

- **Default Parameters**: $\text{LPCD} = 135\text{ L}$, $T_{\text{base}} = 25^\circ\text{C}$, $\alpha = 0.02$ (+2% demand / °C), $\beta = 0.0015$ (aquifer derate).
- **Transparency**: Every figure on the dashboard is tagged `Measured`, `Official`, `Estimated`, or `Predicted`.

---

## 🏆 Hackathon Context

- **Event**: WeMakeDevs × AWS Bharat Builds Tour (Hybrid Week: Oct 8 – 11, 2026).
- **Track**: Environmental Hacks (Water Shortage & Climate Resilience).
- **Competition**: Competing for Grand Prize and the **AirPods 5 AWS Builder Center Blog Challenge** ([`AWS_BUILDER_CENTER_BLOG.md`](./AWS_BUILDER_CENTER_BLOG.md)).

---

## 📄 License
This project is open-source under the **MIT License**.
