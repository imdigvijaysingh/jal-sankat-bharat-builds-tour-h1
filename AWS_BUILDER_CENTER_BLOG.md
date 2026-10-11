# The 72-Hour Warning: When a City’s Water Runs Out Before Anyone Notices
### *How a sudden heatwave almost left 700,000 people without water—and how Jal Sankat alerts the city 7 days before taps run dry.*

**Project:** Jal Sankat (जल संकट) — Water Stress Early Warning System  
**Track:** Track 02 — Heat and Water (WeMakeDevs × AWS Bharat Builds Tour 2026)  
**Live Platform:** [https://main.d3q1u01b5z27g6.amplifyapp.com](https://main.d3q1u01b5z27g6.amplifyapp.com)  
**Code Repository:** [https://github.com/imdigvijaysingh/jal-sankat-bharat-builds-tour-h1](https://github.com/imdigvijaysingh/jal-sankat-bharat-builds-tour-h1)  

---

> *"A city does not run out of water on the day it rains. It runs out **72 hours before** anyone realizes the heat has crossed the danger mark."*

It begins on a blistering Wednesday morning in **Saharanpur, Uttar Pradesh** (a city of 705,000 people). 
The summer temperature reaches **38.4°C**. 
A mother turns on her kitchen tap. She expects cool water for morning tea and cooking. 

Instead, she hears only a dry, whistling hiss: **air, not water.**

Outside, neighbors line up blue plastic drums along the road. Children miss school to guard buckets in line. Private water tanker trucks start charging ₹1,800 for a single tank. At the city water office, furious people crowd the gates asking: *"Why did no one tell us?"*

Yet two days earlier on Monday, the official water dials in the municipal control room looked completely safe. 

*How does a whole city lose 14.6 million liters of water in just 48 hours without anyone noticing?*

---

## 01. The Double Trap: Why Heat Silently Breaks City Water

Most people think cities only run dry during long summer droughts. But in real life, water collapses in a fast, hidden **"Double Trap"**:

### Trap #1: Everyone Suddenly Needs Much More Water
When the temperature climbs above **25°C**, every household starts running desert coolers (each cooler swallows **40 to 60 liters of water every day**). People shower more, wash dusty verandas, and animals drink triple.  
For every single **1°C increase in heat**, the whole city's water demand jumps by **+2%**.  
In just 48 hours, daily demand jumped from 95 Million Liters to **105.5 Million Liters**.

### Trap #2: Underground Tube Wells Start Sucking Air
Did you know that **India pumps more underground water than the US and China combined**—over *250 billion cubic meters a year*?  
Over **80% of drinking water** in cities like Saharanpur comes from deep underground borewells.  
When thousands of motors across the city turn on at the exact same hour, the underground water table falls fast. The deep pumps can't reach the water anymore, and their yield drops from 100 ML/day down to **90.9 ML/day**.

### What Does A 14.6 Million Liter Deficit Look Like?
* **Water people needed:** 105.5 Million Liters/day
* **Water the city could actually pump:** 90.9 Million Liters/day
* **The Shortage:** **14.6 Million Liters every single day**

To picture this:  
Imagine **5,840 big blue municipal water tanker trucks** parked bumper-to-bumper. That much water vanished in just 24 hours.

---

## 02. The 72-Hour Blind Spot: Why Nobody Knew

City water departments usually operate in the **blind rear-view mirror**. 

They wait for someone to call the complaint hotline. But by the time a citizen calls:
1. The underground wells are already exhausted.
2. The giant overhead concrete storage tanks are already empty.
3. The nearest available emergency water trucks are **36 hours away**.

City officials were managing the crisis *reactively*—scrambling to hire expensive private tankers after tempers flared in the streets.

We asked: ***What if the city knew 7 days in advance which neighborhood would run dry, and exactly how many water tankers to send before people even notice?***

---

## 03. The Solution: How Jal Sankat Works in 4 Simple Steps

We built **Jal Sankat (जल संकट)** to give cities an autonomous **7-day radar for water**:

### 🛰️ Step 1: Eye in the Sky (Weather Satellites)
Every hour, Jal Sankat checks free weather satellites (via **Open-Meteo**) to spot heatwaves coming a full 7 days ahead.

### 📐 Step 2: The Neighborhood Calculator
It uses India's official **CPHEEO Rule** (every person needs at least 135 liters of water daily) and multiplies it by the heat forecast to pinpoint the exact neighborhood that will run short first (e.g., *Ward 1: 42% shortage*).

### 🧠 Step 3: The Smart AI Helper (Amazon Bedrock Claude 3)
Instead of confusing charts, Amazon's AI helper writes a simple, 3-point plan in under 1 second:
1. *"Send 18 water trucks to Ward 1 (Nawab Ganj) 24 hours before Wednesday peak."*
2. *"Pause non-essential factory pumping in Ward 2 during the hottest afternoon hours."*
3. *"Lower night pipeline pressure slightly to fill the big overhead storage tanks."*

### 📲 Step 4: Instant SMS to Drivers and Leaders (Amazon SNS)
With one click, the system automatically sends text messages in both **Hindi and English** directly to tanker drivers and neighborhood councilors before water pressure drops!

---

## 04. The Difference: Panic vs. Calm Preparation

| Day | The Old Way (Panic & Protests) | The Jal Sankat Way (Prepared & Calm) |
| :--- | :--- | :--- |
| **Sunday** | Heatwave is coming; nobody in the city has any idea. | Radar spots the heatwave; alerts engineers that risk will reach High on Wednesday. |
| **Monday** | Taps still work normally; overhead storage tanks are drained without rationing. | AI recommends filling overhead tanks overnight and putting tanker trucks on standby. |
| **Tuesday** | Underground wells start dropping; coolers run full blast. | SMS sent to local councilors; families quietly store water in advance. |
| **Wednesday** | **Taps run dry.** Crowds shout outside municipal gates; water mafias gouge prices. | **Zero dry taps.** Pre-positioned tankers arrive on time in Nawab Ganj; everyone has water. |

---

## 05. Built for Real Life: Works Even Without Internet

In small towns across India, electricity cuts and weak 2G phone signals happen frequently during extreme summer heat.  
If an emergency worker opens the website and the internet is down, **Jal Sankat does not freeze**. 

It has an **Autonomous Offline Engine** built directly into the browser that keeps calculating water needs right on your phone or laptop without needing cloud servers.

---

## 06. The Big Vision: Turning Panic Into Simple Plans

A water shortage does not have to become a disaster. 
When a city gets a **72-hour head start**, chaos turns into a simple, calm plan.

Next summer, when temperatures pass 40°C in Saharanpur, **taps will not run dry in silence. Jal Sankat will have protected them 7 days before.**
