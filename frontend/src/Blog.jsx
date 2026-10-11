import { useState, useRef, useEffect } from "react";

// Smooth Lazy Scroll Reveal Component
function Reveal({ children, delay = 0, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const current = domRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: "750ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)"
      }}
      className={`transition-all transform will-change-transform ${
        isVisible
          ? "opacity-100 translate-y-0 filter-none"
          : "opacity-0 translate-y-6 blur-[0.8px]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Interactive Glossary Term with Smart Boundary-Aware Hover & Tap Explanation
function Term({ word, explain, tag = "Simple Meaning" }) {
  const [active, setActive] = useState(false);
  const [align, setAlign] = useState("left");
  const [isTop, setIsTop] = useState(false);
  const spanRef = useRef(null);

  const updatePosition = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      
      // Horizontal alignment: detect proximity to edges
      if (rect.left < 180) {
        setAlign("left");
      } else if (screenWidth - rect.right < 180) {
        setAlign("right");
      } else {
        setAlign("center");
      }

      // Vertical alignment: if too close to top of viewport, open downwards
      if (rect.top < 150) {
        setIsTop(true);
      } else {
        setIsTop(false);
      }
    }
  };

  const handleOpen = () => {
    updatePosition();
    setActive(true);
  };

  const handleClose = () => {
    setActive(false);
  };

  const toggle = (e) => {
    e.stopPropagation();
    if (!active) {
      updatePosition();
      setActive(true);
    } else {
      setActive(false);
    }
  };

  let alignClasses = "left-1/2 -translate-x-1/2";
  let arrowXClasses = "left-1/2 -translate-x-1/2";
  if (align === "left") {
    alignClasses = "left-0 translate-x-0";
    arrowXClasses = "left-5";
  } else if (align === "right") {
    alignClasses = "right-0 left-auto translate-x-0";
    arrowXClasses = "right-5";
  }

  const verticalClasses = isTop ? "top-full mt-2.5" : "bottom-full mb-2.5";
  const arrowYClasses = isTop 
    ? "bottom-full -mb-1 border-t-transparent border-b-slate-900" 
    : "top-full -mt-1 border-b-transparent border-t-slate-900";

  return (
    <span 
      ref={spanRef}
      className="relative inline-block cursor-help group mx-1 align-baseline"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onClick={toggle}
    >
      <span className="font-bold text-cyan-900 bg-cyan-100/80 hover:bg-cyan-200/90 border-b-2 border-dotted border-cyan-600 px-2 py-0.5 rounded-md transition-all inline-flex items-center gap-1.5 shadow-xs text-base sm:text-lg">
        <span>{word}</span>
        <span className="text-xs text-cyan-700 bg-white/90 rounded-full w-4 h-4 inline-flex items-center justify-center font-black shadow-xs">?</span>
      </span>

      {/* Floating Popover Card - Large readable text */}
      <span 
        role="tooltip"
        className={`pointer-events-none transition-all duration-200 absolute z-50 ${verticalClasses} ${alignClasses} w-72 sm:w-80 max-w-[calc(100vw-2rem)] p-3.5 sm:p-4 rounded-xl bg-slate-900/95 text-white shadow-2xl backdrop-blur-md border border-slate-700 leading-relaxed font-sans ${
          active ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <span className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-cyan-300 pb-1.5 mb-1.5 border-b border-slate-700">
          <span>💡 {tag}</span>
          <span className="text-slate-400 font-mono text-[11px]">{word}</span>
        </span>
        <span className="text-slate-100 block text-sm sm:text-base leading-relaxed font-medium">
          {explain}
        </span>
        <span className={`absolute ${arrowYClasses} ${arrowXClasses} border-4 border-transparent`}></span>
      </span>
    </span>
  );
}

export default function Blog({ onBackToDashboard }) {
  const [copied, setCopied] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Reading Progress Bar
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollPercent(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const plainMarkdown = `# The 72-Hour Warning: When a City’s Water Runs Out Before Anyone Notices
### *How a sudden heatwave almost left 700,000 people without water—and how Jal Sankat alerts the city 7 days before taps run dry.*

> "A city does not run out of water on the day it rains. It runs out 72 hours before anyone smells the danger."

It begins on a Wednesday morning in Saharanpur, Uttar Pradesh (a city of 705,000 people). 
The summer temperature reaches 38.4°C. 
A mother turns on her kitchen tap. She expects cool water for tea and cooking. 
Instead, she hears only a dry, whistling hiss: air, not water.

Outside, neighbors line up blue plastic drums on the road. Children miss school to guard buckets in line. Private water tanker trucks start charging ₹1,800 for a single tank. At the city water office, furious people crowd the gates asking: "Why did no one tell us?"

Yet two days earlier on Monday, the official water dials looked completely safe. 

How does a whole city lose 14.6 million liters of water in just 48 hours without warning?

---

## 1. The Double Trap: Why Heat Silently Breaks City Water

Most people think cities only run dry during long droughts. But in real life, water collapses in a fast "Double Trap":

### Trap #1: Everyone Suddenly Needs More Water
When the temperature climbs above 25°C, every household starts running desert coolers (each cooler swallows 40 to 60 liters of water every day). People shower more, wash dusty floors, and animals drink triple.
For every single 1°C rise in heat, the whole city's water demand jumps by +2%.
In 48 hours, daily demand jumped from 95 Million Liters to 105.5 Million Liters.

### Trap #2: Underground Tube Wells Start Sucking Air
India pumps more underground water than the US and China combined (over 250 billion cubic meters a year). 
Over 80% of drinking water in cities like Saharanpur comes from underground borewells.
When thousands of neighborhood motors turn on at the exact same hour, the underground water level falls fast. The deep pumps can't reach the water anymore and their yield drops.

### The Missing 14.6 Million Liters
* Water people needed: 105.5 Million Liters
* Water the city could actually pump: 90.9 Million Liters
* The Shortage: 14.6 Million Liters every day

How big is 14.6 Million Liters?
Imagine 5,840 big blue water tanker trucks lined up bumper-to-bumper. That much water vanished in one day.

---

## 2. The 72-Hour Blind Spot: Why Nobody Knew

City water departments usually work by waiting for telephone complaints. 
By the time families realize their taps are dry and call the complaint number:
* The underground wells are already exhausted.
* The big overhead water tanks are already drained.
* The nearest available water trucks are 36 hours away.

City officials were managing the crisis like looking in a rear-view mirror: reacting only after the disaster happened.

We asked: "What if the city knew 7 days in advance which neighborhood would run dry, and exactly how many water tankers to send before people even notice?"

---

## 3. The Solution: How Jal Sankat Works in 4 Simple Steps

We built Jal Sankat (which means "Water Crisis") to give cities a 7-day radar for water:

1. Step 1: Sky Watch (Satellites)
Jal Sankat checks free weather satellites every hour to spot heatwaves coming a full week ahead.

2. Step 2: The Math Engine
It calculates India's official water rule (every person needs 135 liters per day) and multiplies it by heat increases to see how much water each neighborhood will need.

3. Step 3: The Smart AI Helper (Amazon Bedrock)
Instead of confusing charts, Amazon's AI helper writes a simple 3-step action plan in under 1 second:
* "Send 18 water trucks to Nawab Ganj 24 hours before Wednesday."
* "Pause non-essential factory pumping in Ward 2 during the hottest afternoon hours."
* "Lower night pipeline pressure slightly to fill the big overhead water storage tanks."

4. Step 4: Instant SMS Alerts (Amazon SNS)
With one click, it sends text messages in Hindi and English directly to water truck drivers and local neighborhood leaders before water pressure dies!

---

## 4. The Old Way vs. The Jal Sankat Way

* Sunday: Heatwave is coming. 
  - Old Way: Nobody knows.
  - Jal Sankat: Radar warns of +3.4°C heatwave; sets Risk to High.
* Monday:
  - Old Way: Taps work fine; storage tanks get quietly emptied.
  - Jal Sankat: AI tells engineers to fill overhead tanks overnight and put trucks on standby.
* Tuesday:
  - Old Way: People run coolers; wells dry up silently.
  - Jal Sankat: SMS alerts sent to neighborhood heads; families quietly store 2 days of water.
* Wednesday (Peak Heat):
  - Old Way: Taps run dry. Protests in the streets. People fight over tankers.
  - Jal Sankat: Zero dry taps. Pre-arranged tankers arrive smoothly. Crisis avoided!

---

## 5. Built to Never Stop: Works Even Without Internet

In small towns, electricity cuts and bad phone signals happen often during heatwaves. 
If an emergency worker opens the website and the internet is down, Jal Sankat does not freeze. 
It has an offline engine built directly into the browser that keeps calculating water needs right on your phone or laptop.

---

## 6. Why This Matters

A water shortage does not have to become a disaster. 
When a city gets a 72-hour head start, chaos turns into a simple, calm plan.

Next summer, when temperatures pass 40°C in Saharanpur, taps will not run dry in silence. Jal Sankat will have protected them 7 days before.`;

  const handleCopyBlog = () => {
    navigator.clipboard.writeText(plainMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-full text-slate-800 font-sans selection:bg-cyan-200 selection:text-cyan-900 pb-20">
      
      {/* Top Floating Action Bar with Integrated Reading Progress */}
      <div className="sticky top-2 z-40 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl p-2.5 sm:p-3 mb-4 flex items-center justify-between gap-3 overflow-hidden relative">
        
        {/* Subtle Reading Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 transition-all duration-150 ease-out"
          style={{ width: `${scrollPercent}%` }}
        />

        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm sm:text-base transition-all shadow-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Live Dashboard
        </button>

        <div className="flex items-center gap-2.5">
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cyan-900 bg-cyan-100/70 border border-cyan-200 px-3 py-1 rounded-full">
            <span>✨</span> Easy Everyday Language Mode
          </span>

          <button
            onClick={handleCopyBlog}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Copied Article!</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
                <span>Copy Easy Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reader Tip Banner */}
      <Reveal delay={30}>
        <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 border border-cyan-200 text-cyan-950 rounded-xl p-3 sm:p-4 mb-6 flex items-center gap-3 text-sm sm:text-base font-medium shadow-xs">
          <span className="text-xl shrink-0">👆</span>
          <span>
            <strong>Reader Guide:</strong> Any technical word highlighted like{" "}
            <span className="font-bold text-cyan-900 bg-cyan-200/80 border-b-2 border-dotted border-cyan-600 px-1.5 py-0.5 rounded">
              this ?
            </span>{" "}
            can be <strong>hovered or tapped</strong> to see a simple 1-sentence everyday explanation!
          </span>
        </div>
      </Reveal>

      {/* Main Blog Article Container - max-w-full with comfortable padding */}
      <article className="w-full max-w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 sm:p-7 md:p-10 shadow-xl space-y-6 sm:space-y-8">
        
        {/* Header Tags */}
        <Reveal delay={60}>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-md text-xs sm:text-sm font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
              Real Story & Solution
            </span>
            <span className="px-3 py-1 rounded-md text-xs sm:text-sm font-black uppercase tracking-wider bg-cyan-100 text-cyan-900 border border-cyan-200">
              For Everyone To Read
            </span>
            <span className="text-slate-500 text-xs sm:text-sm ml-auto font-medium">⏱️ 5 min read • Easy Storytelling</span>
          </div>
        </Reveal>

        {/* Title */}
        <Reveal delay={90}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-3">
            The 72-Hour Warning: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">When a City’s Water Runs Out Before Anyone Notices</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
            *How a silent heatwave nearly left 705,000 people without water—and how <strong className="text-slate-800 font-bold">Jal Sankat</strong> gives the city a 7-day head start before taps run dry.*
          </p>
        </Reveal>

        {/* Hero Incident Card */}
        <Reveal delay={120}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-5 sm:p-8 my-4 shadow-xl border border-slate-800">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2.5 mb-3">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-red-400 font-bold uppercase tracking-widest text-xs sm:text-sm">Real Scenario • Saharanpur City</span>
            </div>

            <blockquote className="text-xl sm:text-2xl md:text-3xl font-serif italic text-slate-100 border-l-4 border-cyan-400 pl-4 sm:pl-6 my-4 leading-relaxed">
              “A city does not run out of water on the day it rains. It runs out <strong>72 hours before</strong> anyone realizes the heat has crossed the danger mark.”
            </blockquote>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm sm:text-base text-slate-300 mt-4 font-mono">
              <span>• People Living Here: <strong className="text-white">705,478</strong></span>
              <span>• Regular Daily Supply: <strong className="text-white">90.9 Million Liters</strong></span>
              <span>• Heat Increase: <strong className="text-amber-400">+3.0°C</strong></span>
              <span>• Sudden Daily Shortage: <strong className="text-red-400">14.6 Million Liters</strong></span>
            </div>
          </div>
        </Reveal>

        {/* Section 1: The Problem */}
        <section className="space-y-4 pt-2">
          <Reveal delay={70}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3 border-b border-slate-200 pb-2">
              <span className="text-cyan-600">01.</span> The Sound of Nothing: When Taps Start Whistling Air
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed mt-3">
              It begins with a sound that scares every water officer: <em>nothing</em>. 
              No gentle splash in the morning bucket. No rush of water in the pipeline. Just a dry, rattling wheeze of trapped air coming out of a brass tap in{" "}
              <Term 
                word="Ward 1 (Nawab Ganj)" 
                explain="A local neighborhood in the city with thousands of homes and small shops."
                tag="Neighborhood"
              />.
            </p>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed">
              By 7:30 AM on a blistering Wednesday, the heat in <strong>Saharanpur (a busy town of 705,000 citizens in Western Uttar Pradesh)</strong> reaches <strong>38.4°C</strong>.
              Down in the neighborhood lanes, families wake up to an immediate crisis:
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-2.5 text-base sm:text-lg text-slate-700 my-4 shadow-xs">
              <div className="flex items-start gap-3">
                <span className="text-red-500 font-bold text-xl leading-none">•</span>
                <span>Long lines of blue plastic water drums stretch down the road.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 font-bold text-xl leading-none">•</span>
                <span>Parents miss their work shifts and children miss school just to guard buckets in line.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 font-bold text-xl leading-none">•</span>
                <span>Private water tankers show up charging ₹1,800 for a single tank of water.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 font-bold text-xl leading-none">•</span>
                <span>Angry crowds gather outside the water office shouting: <em>"Why did nobody warn us?"</em></span>
              </div>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed mt-3">
              Yet on Monday morning—just two days earlier—the officer’s logbook had said everything was normal. 
              <em>How did a modern Indian city lose 14.6 million liters of water overnight without anyone noticing?</em>
            </p>
          </Reveal>
        </section>

        {/* Section 2: The Double Trap */}
        <section className="space-y-4 pt-2">
          <Reveal delay={70}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3 border-b border-slate-200 pb-2">
              <span className="text-cyan-600">02.</span> The Double Trap: Why Heat Silently Breaks City Water
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed mt-3">
              The city didn't run out of water on Wednesday. Its fate was already sealed on Sunday.
              When a sudden{" "}
              <Term 
                word="Heatwave" 
                explain="A wave of unusually hot air that stays over a city for days, making everyone use vastly more water."
                tag="Weather Event"
              />{" "}
              hits, two bad things happen at the exact same time:
            </p>
          </Reveal>

          {/* Simple Visual Cards for the Two Traps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <Reveal delay={100}>
              <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 sm:p-6 h-full shadow-xs">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-600 block mb-1.5">
                  Trap #1 • Demand Shoots Up 🚀
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl mb-2">People Need Much More Water</h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  As soon as heat crosses 25°C, every house turns on desert coolers (each cooler swallows 40–60 liters a day). People shower twice, wash dusty verandas, and animals drink triple.
                  For every 1°C increase, the whole city needs <strong>+2% more water</strong>.
                </p>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 sm:p-6 h-full shadow-xs">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-700 block mb-1.5">
                  Trap #2 • Supply Chokes Down 📉
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl mb-2">Underground Wells Start Failing</h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  Over 80% of drinking water in cities like Saharanpur comes from deep{" "}
                  <Term 
                    word="Borewells" 
                    explain="Deep holes drilled hundreds of feet into the ground to pump up freshwater using electric motors."
                    tag="Water Source"
                  />.
                  When thousands of motors pump at once, the underground{" "}
                  <Term 
                    word="Aquifer" 
                    explain="A natural underground layer of sand and rock that holds water like a giant sponge."
                    tag="Underground Reservoir"
                  />{" "}
                  drops, so pumps suck up mostly air instead of water.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Stat Comparison */}
          <Reveal delay={110}>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-8 my-4 text-center shadow-xs">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 block mb-2">
                What Does A 14.6 Million Liter Deficit Look Like?
              </span>
              <span className="text-3xl sm:text-5xl md:text-6xl font-black text-amber-600 block my-1">
                14,600,000 Liters Missing / Day
              </span>
              <p className="text-base sm:text-lg md:text-xl text-slate-700 mt-2 font-medium">
                That is equal to <strong>5,840 big municipal water tanker trucks</strong> disappearing in 24 hours!
              </p>
            </div>
          </Reveal>
        </section>

        {/* Fact Callout Box */}
        <Reveal delay={80}>
          <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 border-l-4 border-blue-600 p-4 sm:p-6 rounded-r-2xl my-6 shadow-xs">
            <h3 className="font-black text-blue-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="text-lg">💡</span> Ground Reality: The 250 Billion Cubic Meter Truth
            </h3>
            <p className="text-base sm:text-lg text-blue-950 mt-2 leading-relaxed">
              Did you know? <strong>India pumps out more underground water than the United States and China combined</strong>—over <em>250 billion cubic meters every single year</em>. 
              Because underground water is invisible beneath our feet, cities don't know it's dropping until taps run dry!
            </p>
          </div>
        </Reveal>

        {/* Section 3: The 72-Hour Blind Spot */}
        <section className="space-y-4 pt-2">
          <Reveal delay={70}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3 border-b border-slate-200 pb-2">
              <span className="text-cyan-600">03.</span> The 72-Hour Blind Spot: Why Nobody Knew
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed mt-3">
              Why do our towns suffer this panic every single summer?
              Because municipal water departments are forced to operate in the <strong>blind rear-view mirror</strong>.
            </p>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed">
              They wait for someone to call the complaint hotline. But by the time a citizen calls:
            </p>
            <ul className="list-disc list-inside text-base sm:text-lg text-slate-700 space-y-1.5 ml-3">
              <li>The underground wells are already depleted.</li>
              <li>The giant overhead concrete storage tanks are already empty.</li>
              <li>The nearest spare water trucks are still 36 hours away.</li>
            </ul>

            <p className="text-base sm:text-lg md:text-xl text-slate-800 leading-relaxed font-semibold mt-3">
              We asked: <em>What if the city had a 7-day weather radar for water, warning officers before a single bucket goes empty?</em>
            </p>
          </Reveal>
        </section>

        {/* Section 4: The Solution (Jal Sankat) */}
        <section className="space-y-4 pt-2">
          <Reveal delay={70}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3 border-b border-slate-200 pb-2">
              <span className="text-cyan-600">04.</span> The Solution: How Jal Sankat Works in 4 Easy Steps
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed mt-3">
              To stop this crisis, we built <strong>Jal Sankat (जल संकट)</strong>. It is an early-warning defense system that acts like a 24/7 radar for city water:
            </p>
          </Reveal>

          {/* The 4 Steps in Plain Cards */}
          <div className="space-y-3.5 my-4">
            <Reveal delay={90}>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex items-start gap-4 hover:border-blue-300 transition-colors">
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-800 font-black flex items-center justify-center shrink-0 text-base sm:text-lg">
                  1
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Eye in the Sky (Weather Satellites)
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
                    Every hour, Jal Sankat checks free weather satellites (via{" "}
                    <Term 
                      word="Open-Meteo" 
                      explain="A free global weather service that provides live temperature and wind forecasts from satellite data."
                      tag="Weather Data"
                    />
                    ) to spot heatwaves coming a full 7 days ahead.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex items-start gap-4 hover:border-indigo-300 transition-colors">
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 text-indigo-800 font-black flex items-center justify-center shrink-0 text-base sm:text-lg">
                  2
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    The Neighborhood Calculator
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
                    It uses India's official{" "}
                    <Term 
                      word="CPHEEO Rule" 
                      explain="Government of India guidelines stating every urban citizen needs at least 135 liters of clean water daily for drinking, cooking, and hygiene."
                      tag="Water Rule"
                    />{" "}
                    (135 liters per person per day) and multiplies it by the heat forecast to pinpoint the exact neighborhood that will run short first.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex items-start gap-4 hover:border-purple-300 transition-colors">
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 text-purple-800 font-black flex items-center justify-center shrink-0 text-base sm:text-lg">
                  3
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    The Smart AI Rescue Planner
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
                    Instead of confusing charts, Amazon's AI (
                    <Term 
                      word="Amazon Bedrock Claude 3" 
                      explain="A smart artificial intelligence brain made by Amazon that reads the crisis data and writes an emergency action plan in under 1 second."
                      tag="AI Brain"
                    />
                    ) writes a simple, 3-point plan in under 1 second:
                    <em> "Send 18 water trucks to Ward 1 on Tuesday; fill overhead tanks at night; pause factory pumping during peak afternoon hours."</em>
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex items-start gap-4 hover:border-emerald-300 transition-colors">
                <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-base sm:text-lg">
                  4
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Instant SMS to Drivers and Leaders
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
                    Using{" "}
                    <Term 
                      word="Amazon SNS" 
                      explain="Amazon's high-speed phone messaging service that sends urgent SMS texts to thousands of numbers at the same time."
                      tag="SMS Service"
                    />
                    , the system automatically sends text messages in both Hindi and English directly to tanker drivers and neighborhood councilors before water pressure drops!
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Section 5: The Comparison Table */}
        <section className="space-y-4 pt-2">
          <Reveal delay={70}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3 border-b border-slate-200 pb-2">
              <span className="text-cyan-600">05.</span> The Difference: Panic vs. Calm Preparation
            </h2>

            <div className="overflow-x-auto my-3 border border-slate-200 rounded-2xl shadow-xs">
              <table className="w-full text-left text-sm sm:text-base border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/80">
                    <th className="p-3 sm:p-4 font-bold text-slate-700 w-28 sm:w-36 text-sm sm:text-base">Day</th>
                    <th className="p-3 sm:p-4 font-bold text-red-600 text-sm sm:text-base">The Old Way (Panic & Protests)</th>
                    <th className="p-3 sm:p-4 font-bold text-cyan-800 text-sm sm:text-base">The Jal Sankat Way (Prepared & Calm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 sm:p-4 font-extrabold text-slate-800">Sunday</td>
                    <td className="p-3 sm:p-4 text-slate-600">Heatwave is coming; nobody in the city has any idea.</td>
                    <td className="p-3 sm:p-4 text-slate-900 font-semibold bg-cyan-50/40">Radar spots the heatwave; alerts engineers that risk will reach High on Wednesday.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 sm:p-4 font-extrabold text-slate-800">Monday</td>
                    <td className="p-3 sm:p-4 text-slate-600">Taps still work normally; overhead storage tanks are drained without rationing.</td>
                    <td className="p-3 sm:p-4 text-slate-900 font-semibold bg-cyan-50/40">AI recommends filling overhead tanks overnight and putting tanker trucks on standby.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 sm:p-4 font-extrabold text-slate-800">Tuesday</td>
                    <td className="p-3 sm:p-4 text-slate-600">Underground wells start dropping; coolers run full blast.</td>
                    <td className="p-3 sm:p-4 text-slate-900 font-semibold bg-cyan-50/40">SMS sent to local councilors; families quietly store water in advance.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 sm:p-4 font-extrabold text-slate-800">Wednesday</td>
                    <td className="p-3 sm:p-4 text-red-600 font-semibold"><strong>Taps run dry.</strong> Crowds shout outside municipal gates; black-market water prices spike.</td>
                    <td className="p-3 sm:p-4 text-emerald-800 font-semibold bg-emerald-50/40"><strong>Zero dry taps.</strong> Pre-positioned tankers arrive on time in Nawab Ganj; everyone has water.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        {/* Section 6: Works Offline */}
        <section className="space-y-4 pt-2">
          <Reveal delay={70}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3 border-b border-slate-200 pb-2">
              <span className="text-cyan-600">06.</span> Built for Real Life: Works Even Without Internet
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed mt-3">
              In Indian towns, electricity cuts and weak 2G phone signals happen frequently during extreme summer heat.
              If a water officer opens the system during a power cut, a spinning loading icon could leave thousands of families without drinking water.
            </p>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed">
              We built Jal Sankat with a{" "}
              <Term 
                word="Offline Fallback Mode" 
                explain="Special code that lets the app keep calculating water numbers inside your laptop or phone even if the server drops connection."
                tag="Offline Feature"
              />
              . Even if the cloud goes offline, the website keeps computing water demand right inside the officer's browser without crashing.
            </p>
          </Reveal>
        </section>

        {/* Conclusion */}
        <Reveal delay={80}>
          <section className="space-y-4 pt-4 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 my-4 shadow-xs">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900">
              The Big Vision: Turning Panic Into Simple Plans
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed">
              Water crises in India are not inevitable curses of nature. They happen because cities find out too late.
            </p>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed">
              When municipal officers gain <strong>72 hours of advance notice</strong>, a humanitarian disaster turns into a calm, orderly plan.
              Water trucks arrive on time. Underground wells are saved from drying out. Families get clean water with peace and dignity.
            </p>

            <p className="text-slate-900 font-extrabold text-lg sm:text-xl md:text-2xl pt-2">
              *Next summer, when temperatures cross 40°C in Saharanpur, taps will not run dry in silence. Jal Sankat will have protected them 7 days before.*
            </p>
          </section>
        </Reveal>

        {/* Footer */}
        <Reveal delay={60}>
          <div className="border-t border-slate-200 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
                JS
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-800">Jal Sankat (जल संकट)</h4>
                <p className="text-xs sm:text-sm text-slate-500">Water Stress Early Warning System</p>
              </div>
            </div>

            <button
              onClick={handleCopyBlog}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm sm:text-base font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {copied ? "✓ Copied Easy Markdown!" : "📋 Copy Easy Markdown"}
            </button>
          </div>
        </Reveal>

      </article>
    </div>
  );
}
