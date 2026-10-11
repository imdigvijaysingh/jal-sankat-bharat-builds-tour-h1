# The Day Saharanpur Ran Out of Water: 72 Hours Before It Happened
### *How We Built Jal Sankat on AWS Bedrock to Stop India’s Invisible Groundwater Collapse*

**Track:** Track 02 — Heat and Water (WeMakeDevs × AWS Bharat Builds Tour 2026)  
**Authors:** Team Radhawarriors (Digvijay Singh, Anjali Tiwari)  
**Live Demo:** [https://main.d3q1u01b5z27g6.amplifyapp.com](https://main.d3q1u01b5z27g6.amplifyapp.com)  
**GitHub Repository:** [https://github.com/imdigvijaysingh/jal-sankat-bharat-builds-tour-h1](https://github.com/imdigvijaysingh/jal-sankat-bharat-builds-tour-h1)  

---

> *"A city does not run out of water on the day it rains. It runs out **72 hours before** anyone realizes the heat curve has crossed the threshold."*

It was **2:14 AM**. The room smelled of cold filter coffee and overheating cooling fans. Outside, the world was asleep. But on our screens, **Saharanpur—a bustling city of 705,000 people in Western Uttar Pradesh—was sliding toward a quiet municipal disaster**.

Not from a flood. Not from a broken dam. But from a silent, invisible ***mathematical assassin***.

According to the Open-Meteo live satellite feeds our backend was ingesting, an intense heat dome was parking directly over Northern India. In 72 hours, Wednesday’s ambient temperature was forecast to reach **38.4°C**.

To a generic consumer weather app, that's just a hot day in India. But feed that thermal spike into an urban hydrological balance equation, and the numbers scream in *terrifying clarity*:

* **Baseline Municipal Supply:** `90.9 Million Liters/day (ML/day)` *(after 12% groundwater de-rate)*
* **Projected Peak Demand with +3°C Heat Uplift:** `105.5 ML/day` *(+16% surge driven by evaporative air coolers and domestic surge)*
* **The Looming Deficit:** ***14.6 Million Liters. Per Single Day.***

That deficit is equal to **5,840 commercial water tankers** vanishing into thin air.

By Wednesday dawn, without proactive intervention, over **14,000 households** in *Nawab Ganj (Ward 1)* and *Ward 3* would turn their brass taps and hear nothing but a dry, dusty rattle.

And the most terrifying part? **Municipal engineers wouldn't know a thing until desperate citizens began blocking roads with empty plastic buckets.**

This is why we built **Jal Sankat (जल संकट)** for the **AWS Bharat Builds Tour**.

---

## 01. The Ground Reality: India’s Groundwater Roulette

Here is an extraordinary fact that should alarm every developer and civil servant:

> 💡 **India extracts more groundwater than China and the United States combined.**

Over **250 billion cubic meters** of water are pumped from beneath Indian soil every year. In tier-2 and tier-3 municipalities across Uttar Pradesh, Rajasthan, and Punjab, urban water supply is not an infinite utility—it is a *precarious daily balancing act* dependent on overdrawn borewells.

When a sudden heatwave rolls in:
1. **Demand Explodes Non-Linearly:** Household water consumption spikes by **+2% per degree above 25°C** as evaporative desert coolers run continuously.
2. **Supply Shrinks in Tandem:** Over-stressed borewells suffer from thermal drawdown, shrinking deep-aquifer pumping yield by **0.15% per stress point**.
3. **The Scissors Effect:** *Demand rockets upward* at the exact moment *supply collapses downward*.

Municipal water officers don't have supercomputers or hydrologist task forces. They manage shortages **reactively**—dispatching expensive private tankers *after* tempers flare and dry taps spark panic.

We asked ourselves: ***What if the cloud could sound the alarm 7 days before the crisis strikes?***

---

## 02. The Architecture: How Jal Sankat Thinks in Under 800ms

We didn't want to build another static dashboard. Dashboards are passive; **water crises are fast, unforgiving, and localized**. We built an autonomous operational nerve center designed for the municipal engineer's war room.

### The Autonomous AWS Pipeline

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   JAL SANKAT AUTONOMOUS AWS PIPELINE                   │
└────────────────────────────────────────────────────────────────────────┘
       │
       ▼
 [ Open-Meteo Satellite API ]  ──► (7-Day Predictive Heatwave Telemetry)
       │
       ▼
 [ AWS App Runner / FastAPI ] ──► (CPHEEO 135 LPCD Demand Uplift Model)
       │                                  │
       ▼                                  ▼
 [ Hydrological Score (0-100) ]     [ Ward-Level Deficit Localization ]
       │
       ├──────────────────────────────────────────────┐
       ▼                                              ▼
 [ Amazon Bedrock: Claude 3 Haiku ]         [ Amazon SNS Multi-Carrier ]
   * Sub-800ms Crisis Synthesis               * Instant Dual-Language Dispatch
   * Ward-specific Tanker Rationing           * English & Hindi SMS Broadcasts
   * Pumping Schedules for Engineers          * Direct to Field Tanker Drivers
       │                                              │
       └──────────────────────┬───────────────────────┘
                              ▼
        [ AWS Amplify: Edge-Resilient React UI ]
          * Zero-Downtime Standalone Fallback
          * Interactive What-If Heat Shift Simulator
```

### 1. The Sensory Cortex (FastAPI + Hydrological Equations)
The backend polls real-time satellite forecasts. Every calculation is anchored to India's official **CPHEEO municipal benchmark (135 Liters per capita per day)**:

```python
# Baseline consumption scaled by ward population
base_demand = (population * 135) / 1_000_000  # ML/day

# Thermal uplift activated only above base comfortable threshold (25°C)
heat_multiplier = 1 + (0.02 * max(0, peak_temp - 25))
projected_demand = base_demand * heat_multiplier

# Supply capacity derated against groundwater vulnerability
effective_supply = nominal_supply * (1 - 0.0015 * gw_score)
```

### 2. The Generative AI General (Amazon Bedrock: Claude 3 Haiku)
Standard rule-based systems output generic advice like *"Conserve water today"*. But in a real crisis, a municipal engineer needs **surgical, tactical instructions**.

When our composite stress score exceeds **60/100 (HIGH RISK)**, Jal Sankat invokes **Amazon Bedrock Claude 3 Haiku** (`anthropic.claude-3-haiku-20240307-v1:0`) in `us-east-1`. In under **740 milliseconds**, Bedrock returns a 3-bullet military-grade response plan:

1. **Pre-emptive Tanker Rationing:** *"Pre-position 18 municipal water tankers along Nawab Ganj bypass 24 hours prior to Wednesday."*
2. **Groundwater Extraction Caps:** *"Throttle non-essential commercial extraction licenses in Ward 2 by 40% between 11:00 AM and 4:00 PM."*
3. **Overnight Pressure Balancing:** *"Step down distribution pressure by 15% during off-peak night hours to force recharge into overhead reservoirs."*

### 3. The Emergency Dispatch Nerve (Amazon SNS)
With one click, **Amazon SNS** fires multi-carrier broadcasts across telecom channels in both English and Hindi (*"महत्वपूर्ण जल चेतावनी: लू के कारण..."*), alerting ward councilors, field tanker drivers, and registered community leaders before pipeline pressure dies.

### 4. Edge-Resilient Frontend (AWS Amplify)
The user interface is hosted on **AWS Amplify**. It features an interactive **What-If Heat Shift Slider (+0°C to +8°C)**, allowing municipal leadership to stress-test their grid against extreme climate scenarios in real-time.

---

## 03. What Fought Back: The 2:00 AM War Stories

Building this was not a clean tutorial walk-through. Real hackathons are forged in debugging fire, and the cloud fought back:

### 🥊 War Story #1: The Transatlantic Region Paradox
Our **AWS Amplify** frontend deployed seamlessly into **Stockholm (`eu-north-1`)**. But **Amazon Bedrock Claude 3 Haiku** was provisioned in **N. Virginia (`us-east-1`)**, while **Amazon SNS** was mapped to **Mumbai (`ap-south-1`)** for Indian carrier compliance.
*The result?* At 1:00 AM, cross-region IAM authorization failures and latency spikes collided. We solved this by architecting dedicated regional `boto3` client handlers in Python with zero-trust token verification, routing each AWS request cleanly to its optimal home region.

### 🥊 War Story #2: The Mysterious "Negative Water" Glitch
At 3:30 AM, during stress testing, sliding the heatwave simulator slider down caused the demand curve to collapse into negative numbers! An unconstrained delta in the formula was subtracting baseline water from the city. For twenty bewildering minutes, our math claimed Saharanpur was magically donating millions of liters of water back to the clouds. We locked the mathematical floor at `BASE_TEMP = 25°C` and wrote **5 rigorous automated pytest test cases** to ensure rock-solid numerical guarantees.

### 🥊 War Story #3: The 2G Field Office Miracle (Client-Side Edge Resilience)
In real Indian municipal offices, storms or power failures knock out cloud connectivity. If a water officer opens Jal Sankat during an emergency, a spinning loader is unacceptable. We engineered an **Autonomous Client-Side Edge Fallback Engine** right in the browser. If the backend ever drops a packet, the frontend instantly shifts into standalone mode—running live Open-Meteo satellite calculations and heuristic emergency plans directly in client memory without missing a single beat!

---

## 04. The Breakthrough: Seeing the Invisible

The climax of our weekend came when we tested our completed system against a simulated **+4°C heatwave in Saharanpur**.

Within 800 milliseconds:
* The water stress score leapt from **63** to **84 (CRITICAL)**.
* The chart pinpointed Wednesday as the exact tipping point where demand would eclipse supply by **18.2 ML/day**.
* **Ward 1 (Nawab Ganj)** was flagged as the most vulnerable sector.
* Amazon Bedrock instantly drafted a crisis containment plan.
* Dual-language SMS alerts were prepared for one-click field dispatch.

What would have been a blind, chaotic municipal emergency on Wednesday was transformed into an orderly, pre-emptive logistical operation on Monday morning.

---

## 05. Why This Changes Everything

The difference between a **humanitarian crisis** and a **managed inconvenience** is **72 hours of notice**.

With **Jal Sankat on AWS**:
* Municipal teams stop playing defense and start predicting outcomes.
* Tankers are deployed **before** taps run dry, preventing civil unrest.
* Ground aquifers are protected from sudden catastrophic drawdowns.

We didn't just build a hackathon demo this weekend. We built an intelligent shield for India's water future.

***Next time the heat climbs past 40°C in Saharanpur, the taps will not run dry in silence. The cloud will have warned them first.***

---

*Published for the WeMakeDevs × AWS Bharat Builds Tour 2026.*  
*Built with ❤️ on AWS Amplify, Amazon Bedrock, Amazon SNS, and AWS App Runner.*
