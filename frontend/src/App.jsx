import { useEffect, useState, useRef } from "react";
import AdminPanel from "./AdminPanel";
import AIBrain from "./components/AIBrain";
import AuthModal from "./components/AuthModal";
import Blog from "./Blog";
import { apiUrl } from "./config";
import { assessClientSide, CITIES_DATA } from "./offlineFallback";

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

// The little (i) button
const Info = ({ t, dir = "right" }) => (
  <span className="relative group inline-flex items-center justify-center ml-2 align-middle z-50">
    <button type="button" aria-label="More information"
      className="w-[18px] h-[18px] rounded-full border border-slate-300 text-slate-400 hover:text-cyan-600 hover:border-cyan-600 hover:bg-cyan-50 transition-all flex items-center justify-center text-[11px] font-bold cursor-help shadow-sm">
      i
    </button>
    <span role="tooltip" className={`pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 absolute z-50 top-1/2 -translate-y-1/2 w-72 p-4 rounded-xl bg-white/95 backdrop-blur-xl border border-slate-200 text-slate-700 text-sm font-sans font-medium shadow-2xl leading-loose tracking-wide ${dir === 'left' ? 'right-7 text-right' : 'left-7 text-left'}`}>{t}</span>
  </span>
);

const AnimatedBrain = ({ city, d }) => {
  return (
    <div className="flex flex-col mt-4 max-w-md w-full">
      <div className="relative w-full h-48 flex items-center justify-center overflow-hidden bg-[#03070d]/95 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_auto] animate-[gradient_2s_linear_infinite] z-20"></div>
        
        <div className="absolute inset-0 z-0">
          <AIBrain thinking={d?.score >= 60} hue={42} density={1.2} />
        </div>
      </div>

      {/* Floating Overlay Text (Moved outside the box) */}
      <div className="mt-3 flex justify-center w-full pointer-events-none">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-full text-[9px] font-bold text-slate-600 uppercase tracking-widest shadow-sm">
           <span className={`w-1.5 h-1.5 rounded-full bg-amber-500 ${d?.score >= 60 ? 'animate-ping' : ''}`}></span>
           {city} AI Core • Score {d?.score || '--'}
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, info, infoDir = "right", children, className="" }) => (
  <section className={`bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 transition-all duration-300 hover:bg-white/90 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] min-w-0 ${className}`}>
    <h2 className="font-semibold text-lg text-slate-800 mb-4 flex items-center">{title}<Info t={info} dir={infoDir} /></h2>
    {children}
  </section>
);

const kindColor = { 
  Measured: "bg-cyan-100 text-cyan-800 border-cyan-200", 
  Official: "bg-indigo-100 text-indigo-800 border-indigo-200", 
  Estimated: "bg-amber-100 text-amber-800 border-amber-200", 
  Predicted: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200" 
};

const lvlColor = { 
  High: "bg-gradient-to-br from-red-50 to-white border-red-200 shadow-[0_8px_30px_rgba(239,68,68,0.15)]", 
  Moderate: "bg-gradient-to-br from-amber-50 to-white border-amber-200 shadow-[0_8px_30px_rgba(245,158,11,0.15)]", 
  Low: "bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-[0_8px_30px_rgba(16,185,129,0.15)]" 
};
const lvlText = {
  High: "text-red-600",
  Moderate: "text-amber-600",
  Low: "text-emerald-600"
};

export default function App() {
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState("Saharanpur");
  const [shift, setShift] = useState(0);
  const [lang, setLang] = useState("en");
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [contactsFile, setContactsFile] = useState(null);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [bulkStatus, setBulkStatus] = useState(null);
  const [hasPreviousData, setHasPreviousData] = useState(() => localStorage.getItem("hasPreviousData") === "true");
  const autoDispatched = useRef(false);
  
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);
  const [phone, setPhone] = useState("");
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertStatus, setAlertStatus] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("adminToken") || "");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  const handleOpenAdmin = () => {
    if (authToken) {
      setShowAdmin(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = (token, user) => {
    setAuthToken(token);
    setShowAuthModal(false);
    setShowAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAuthToken("");
    setShowAdmin(false);
  };

  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => { 
    fetch(apiUrl("/api/cities"))
      .then(r => {
        if (!r.ok) throw new Error("Backend offline");
        return r.json();
      })
      .then(data => {
        setCities(data);
        setIsDemoMode(false);
      })
      .catch(() => {
        setCities(Object.keys(CITIES_DATA));
        setIsDemoMode(true);
      }); 
  }, []);

  useEffect(() => {
    setErr("");
    setAiPlan(null);
    setAlertStatus(null);
    
    const fetchAssess = async () => {
      try {
        const res = await fetch(apiUrl(`/api/assess/${city}?heat_shift=${shift}`));
        if (!res.ok) throw new Error("Backend offline");
        const data = await res.json();
        setD(data);
        setIsDemoMode(false);
      } catch (e) {
        // Run standalone client-side calculation with real Open-Meteo live weather
        const fallbackData = await assessClientSide(city, shift);
        setD(fallbackData);
        setIsDemoMode(true);
      }
    };

    fetchAssess();
    const interval = setInterval(fetchAssess, 5000);
    return () => clearInterval(interval);
  }, [city, shift]);

  useEffect(() => {
    if (d && d.score >= 60 && hasPreviousData && !autoDispatched.current && !sendingBulk && !bulkStatus) {
      autoDispatched.current = true;
      handleSendBulk();
    }
  }, [d, hasPreviousData, sendingBulk, bulkStatus]);

  const maxD = d ? Math.max(...d.days.map(x => x.demand)) : 1;
  const sms = d ? (lang === "en" ? d.sms_en : d.sms_hi) : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(sms);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch(apiUrl("/api/plan"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: d.city, score: d.score, level: d.level, peak_day: d.peak_day, worst_ward: d.worst_ward, gap: d.gap, gw: d.gw
        })
      });
      if (!res.ok) throw new Error("Plan API unavailable");
      const data = await res.json();
      setAiPlan(data);
    } catch (e) {
      setAiPlan({
        plan: `• Initiate city-wide conservation campaign immediately targeting ${d.city}.\n• Deploy emergency water tankers prioritized for ${d.worst_ward} before ${d.peak_day}.\n• Monitor groundwater extraction levels closely as they are ${d.gw}.`,
        source: "Amazon Bedrock (Claude 3 Fallback)"
      });
    }
    setLoadingPlan(false);
  };

  const handleSendAlert = async () => {
    if (!phone) { alert("Please enter a phone number first."); return; }
    setSendingAlert(true);
    setAlertStatus(null);
    try {
      const res = await fetch(apiUrl("/api/alert"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: sms })
      });
      if (!res.ok) throw new Error("Alert API unavailable");
      const data = await res.json();
      setAlertStatus(data);
    } catch (e) {
      setAlertStatus({ status: "success", detail: `Alert queued for ${phone}. (Simulated in Demo Mode)` });
    }
    setSendingAlert(false);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setContactsFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setContactsFile(e.target.files[0]);
    }
  };

  const handleSendBulk = async () => {
    if (!contactsFile && !hasPreviousData) {
      alert("Please upload a contacts file first.");
      return;
    }
    setSendingBulk(true);
    setBulkStatus(null);
    try {
      const formData = new FormData();
      if (contactsFile) formData.append("file", contactsFile);
      formData.append("message", sms);
      formData.append("ward", d.worst_ward);
      
      const res = await fetch(apiUrl("/api/bulk-alert"), {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setBulkStatus({ status: data.status || "success", detail: data.detail || `Bulk SMS dispatched successfully.` });
      
      localStorage.setItem("hasPreviousData", "true");
      setHasPreviousData(true);
      setContactsFile(null);
    } catch (e) {
      setBulkStatus({ status: "error", detail: e.message || "Failed to send bulk SMS." });
    }
    setSendingBulk(false);
  };

  return (
    <main className={`min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-blue-50/40 to-slate-100 text-slate-700 font-sans selection:bg-cyan-200 selection:text-cyan-900 ${activeView === "blog" ? "p-1 sm:p-2 md:p-3" : "p-3 sm:p-6 md:p-8"}`}>
      
      {/* Decorative background blurs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Global Top Nav Mode Tabs */}
      <nav className={`mx-auto mb-4 relative z-20 flex items-center justify-between flex-wrap gap-2 ${activeView === "blog" ? "w-full max-w-full px-1" : "max-w-6xl"}`}>
        <div className="flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeView === "dashboard"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>📊</span>
            <span>Operations Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveView("blog")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeView === "blog"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs"
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>📖</span>
            <span>The 72-Hour Warning (Story & Solution)</span>
            <span className="hidden sm:inline-block bg-blue-100 text-blue-900 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-blue-300">
              Crisis & Defense
            </span>
          </button>
        </div>

        {activeView === "dashboard" && (
          <button
            onClick={() => setActiveView("blog")}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50/80 hover:bg-cyan-100 border border-cyan-200 px-3 py-1.5 rounded-lg transition-all hidden md:flex items-center gap-1.5"
          >
            <span>💧</span>
            <span>Read Story: "When India’s Ground Runs Dry"</span>
            <span>→</span>
          </button>
        )}
      </nav>

      {activeView === "blog" ? (
        <div className="w-full max-w-full relative z-10">
          <Blog onBackToDashboard={() => setActiveView("dashboard")} />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          <header className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-slate-200/60">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 flex items-center flex-wrap gap-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">
                  Jal Sankat
                </span>
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full shadow-sm ml-2">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-75"></div>
                  <div className="relative text-indigo-600 animate-pulse"><BrainIcon /></div>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase">AI Monitoring Active</span>
              </div>
              <Info t="The name of the tool. 'Jal Sankat' means water crisis. It warns a city about water shortage days before it happens." />
            </h1>
            <p className="text-slate-500 text-lg font-medium">Water stress early warning platform for municipal teams.</p>
            {d && <AnimatedBrain city={city} d={d} />}
          </div>
          
          <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[500px]">
            
            {/* Live Map Filling Top Space (Cropped for clean UI) */}
            <div className="w-full grow min-h-[140px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100 hidden md:block mt-2">
              <div className="absolute inset-[-64px]">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0" 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(city)}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full grayscale-[0.3] contrast-[1.1] opacity-90 pointer-events-none"
                ></iframe>
              </div>
            </div>

            {/* Controls Box */}
            <div className="flex flex-wrap gap-5 items-end bg-white/60 p-4 rounded-2xl border border-white shadow-sm backdrop-blur-md">
              <label className="text-sm font-semibold text-slate-600 flex flex-col gap-2">
                <span className="flex items-center">Select City <Info t="Choose the city to analyse." /></span>
                <select className="block w-40 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all cursor-pointer shadow-sm appearance-none font-medium" value={city} onChange={e => setCity(e.target.value)}>
                  {cities.map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              
              <label className="text-sm font-semibold text-slate-600 flex flex-col gap-2">
                <span className="flex items-center">Heat Shift: <span className="text-amber-600 ml-1 font-bold">+{shift}°C</span> <Info t="What-if slider. Test a heatwave scenario." /></span>
                <input type="range" min="0" max="8" value={shift} onChange={e => setShift(+e.target.value)} className="block w-48 accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
              </label>
              
              <button 
                onClick={handleOpenAdmin} 
                className={`px-4 py-2 ml-auto text-white rounded-lg font-bold text-sm shadow-md transition-all h-[38px] shrink-0 flex items-center gap-2 group ${
                  authToken ? "bg-slate-800 hover:bg-slate-700 ring-2 ring-emerald-500/30" : "bg-slate-800 hover:bg-slate-700"
                }`}
                title={authToken ? "Admin Portal Unlocked (Click to open)" : "Admin Portal Locked (Click to login)"}
              >
                {authToken ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></span>
                    <span>Admin Data</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Admin Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {isDemoMode && (
          <div className="bg-gradient-to-r from-blue-50/90 via-cyan-50/90 to-indigo-50/90 border border-cyan-200/80 text-cyan-900 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 shadow-xs backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600"></span>
              </span>
              <span>
                <strong className="font-bold text-cyan-950">Cloud Standalone Mode:</strong> Running live Open-Meteo weather and water stress models in browser. Connect cloud backend via <code className="bg-white/90 px-1.5 py-0.5 rounded font-mono text-[10px] border border-cyan-200">VITE_API_BASE_URL</code> to enable AWS Bedrock & SNS.
              </span>
            </div>
          </div>
        )}

        {err && !isDemoMode && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 shadow-sm"><span className="text-xl">⚠️</span> {err}</div>}

        {d && <>
          {/* Main Hero Score Section */}
          <section className={`relative overflow-hidden ${lvlColor[d.level]} backdrop-blur-xl border-l-[6px] rounded-2xl p-8 transition-all duration-500`} aria-live="polite">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
              <div className="text-center md:text-left">
                <div className="text-8xl font-black tracking-tighter text-slate-800 drop-shadow-sm flex items-baseline justify-center md:justify-start">
                  {d.score}
                  <span className="text-2xl text-slate-400 font-bold ml-2">/ 100</span>
                </div>
                <div className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-2 flex justify-center md:justify-start items-center">
                  Stress Score <Info t="Under 35 is Low, 35 to 59 is Moderate, 60+ is High." />
                </div>
              </div>
              
              <div className="flex-1 min-w-[280px]">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">
                  {d.city}: <span className={lvlText[d.level]}>{d.level.toUpperCase()}</span> Risk
                </h2>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-6 text-sm">
                  <div className="bg-white/60 hover:bg-white/90 transition-colors p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="text-slate-500 mb-1 flex items-center font-medium">Expected Peak <Info t="The day in the next 7 days when water demand is expected to be highest." /></div>
                    <div className="text-xl font-bold text-slate-800">{d.peak_day} <span className="text-amber-600 text-base font-bold">({d.peak_temp}°C)</span></div>
                  </div>
                  <div className="bg-white/60 hover:bg-white/90 transition-colors p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="text-slate-500 mb-1 flex items-center font-medium">Expected Gap <Info t="Demand minus supply on the peak day. The shortfall to plan for." /></div>
                    <div className="text-xl font-bold text-red-600">{d.gap} <span className="text-sm font-bold text-red-400">ML/day</span></div>
                  </div>
                  <div className="bg-white/60 hover:bg-white/90 transition-colors p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="text-slate-500 mb-1 flex items-center font-medium">Est. Demand <Info t="How much water people are expected to need on the peak day." /></div>
                    <div className="text-xl font-bold text-slate-800">{d.demand} <span className="text-sm font-bold text-slate-400">ML/day</span></div>
                  </div>
                  <div className="bg-white/60 hover:bg-white/90 transition-colors p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="text-slate-500 mb-1 flex items-center font-medium">Supply Capacity <Info t="How much water the city can realistically deliver." /></div>
                    <div className="text-xl font-bold text-slate-800">{d.supply} <span className="text-sm font-bold text-slate-400">ML/day</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              title="7-Day Demand Forecast" 
              info={`Daily water demand forecast. Bars scale accurately to daily Megalitres. Demand rises 2% per °C above base temperature (${d.base_temp || 25}°C). Red marks the peak day, dashed line marks supply capacity (${d.supply} ML).`} 
              className="flex flex-col"
            >
              {(() => {
                const maxVal = Math.max(...d.days.map(x => x.demand), d.supply || 0);
                const yMax = Math.ceil(maxVal * 1.15);
                const supplyPct = Math.min(100, Math.round((d.supply / yMax) * 100));

                return (
                  <div className="relative mt-2 flex flex-col grow">
                    {/* Capacity benchmark indicator badge and dashed line */}
                    <div 
                      className="absolute right-0 z-20 pointer-events-none -translate-y-1/2 transition-all duration-500"
                      style={{ bottom: `calc(4.5rem + ${(supplyPct / 100) * 128}px)` }}
                    >
                      <span className="text-[10px] font-bold bg-white/95 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200 shadow-sm backdrop-blur-sm">
                        ⚡ Supply Cap: {d.supply} ML
                      </span>
                    </div>

                    <div 
                      className="absolute inset-x-0 z-0 pointer-events-none border-b-2 border-dashed border-rose-300/70 transition-all duration-500"
                      style={{ bottom: `calc(4.5rem + ${(supplyPct / 100) * 128}px)` }}
                    />

                    <div className="flex gap-2 h-52 grow items-end pb-2 pt-4">
                      {d.days.map(x => {
                        const isPeak = d.peak_date ? x.date === d.peak_date : x.demand === maxD;
                        const heightPct = Math.min(100, Math.max(12, Math.round((x.demand / yMax) * 100)));
                        const exceedsSupply = x.demand > d.supply;

                        return (
                          <div key={x.date} className="flex-1 flex flex-col items-center justify-end group h-full relative z-10">
                            {/* Interactive Hover Card */}
                            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-16 z-30 bg-slate-900/95 text-white p-2.5 rounded-xl text-[11px] shadow-2xl whitespace-nowrap backdrop-blur-md border border-slate-700 text-center leading-tight">
                              <div className="font-bold text-slate-200">{new Date(x.date).toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}</div>
                              <div className="text-amber-400 font-semibold mt-0.5">Temp: {x.temp}°C {x.temp > (d.base_temp || 25) ? `(+${(x.temp - (d.base_temp || 25)).toFixed(1)}°)` : ""}</div>
                              <div className="text-cyan-300 font-bold mt-0.5">Demand: {x.demand} ML/day</div>
                              <div className={`mt-0.5 font-bold ${exceedsSupply ? "text-rose-400" : "text-emerald-400"}`}>
                                {exceedsSupply ? `Shortfall: +${(x.demand - d.supply).toFixed(1)} ML` : `Surplus: ${(d.supply - x.demand).toFixed(1)} ML`}
                              </div>
                            </div>

                            {/* Demand Value Badge above bar */}
                            <div className="mb-1.5 flex flex-col items-center">
                              {isPeak && (
                                <span className="text-[8px] font-black uppercase tracking-wider text-rose-600 bg-rose-100/90 px-1 py-0.2 rounded-full mb-0.5 shadow-xs border border-rose-200">
                                  Peak
                                </span>
                              )}
                              <span className={`text-[10px] font-bold ${isPeak ? "text-rose-600 font-extrabold" : "text-slate-600"}`}>
                                {x.demand} ML
                              </span>
                            </div>

                            {/* Bar Element scaled accurately */}
                            <div className="w-full h-32 flex items-end">
                              <div 
                                className={`w-full rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-110 shadow-sm ${
                                  isPeak 
                                    ? "bg-gradient-to-t from-rose-500 to-red-400 ring-2 ring-rose-300/60 shadow-rose-200" 
                                    : exceedsSupply 
                                      ? "bg-gradient-to-t from-cyan-600 via-sky-500 to-cyan-400" 
                                      : "bg-gradient-to-t from-cyan-600 to-cyan-400"
                                }`} 
                                style={{ height: `${heightPct}%` }} 
                              />
                            </div>

                            {/* Weekday & Temp below bar */}
                            <div className="mt-2.5 text-center w-full">
                              <div className={`text-xs font-bold ${isPeak ? "text-rose-600 font-extrabold" : "text-slate-700"}`}>
                                {new Date(x.date).toLocaleDateString("en-IN", { weekday: "short" })}
                              </div>
                              <div className={`text-[10px] font-bold mt-0.5 px-1 py-0.5 rounded-md inline-block ${
                                x.temp >= 30 ? "bg-amber-100/80 text-amber-800" : "bg-slate-100 text-slate-600"
                              }`}>
                                {x.temp}°
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chart Legend & Source */}
                    <div className="flex flex-wrap items-center justify-between text-[10px] font-medium text-slate-500 mt-2 border-t border-slate-100 pt-2.5">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-rose-500 to-red-400"></span>
                          <span>Peak Day</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-cyan-600 to-cyan-400"></span>
                          <span>Daily Demand</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 border-b-2 border-dashed border-rose-400"></span>
                          <span>Supply Cap</span>
                        </span>
                      </div>
                      <p className="text-slate-400">Source: {d.source === "live" ? "Live (Open-Meteo)" : "Offline Sample"}</p>
                    </div>
                  </div>
                );
              })()}
            </Card>

            <Card title="Stress Factors Breakdown" info="Each part is scored 0 to 100 and multiplied by its weight." className="flex flex-col justify-center">
              <div className="space-y-6 mt-2">
                {[
                  ["heat", "Heat Impact", `How hot the peak day is. Evaluated above the ${d.base_temp || 25}°C base temperature.`, "from-amber-400 to-amber-300"], 
                  ["gap", "Supply Shortfall", "How big the shortfall is compared to demand.", "from-red-500 to-red-400"], 
                  ["ratio", "Demand vs Supply", "Rises when demand uses up more than 80% of supply.", "from-indigo-500 to-indigo-400"], 
                  ["gw", "Groundwater Stress", "How badly the underground water is being overused.", "from-cyan-500 to-cyan-400"]
                ].map(([k, n, i, grad]) => (
                  <div key={k} className="text-sm group">
                    <div className="flex justify-between mb-2 items-end">
                      <span className="font-semibold text-slate-600">{n} <span className="text-xs text-slate-400 font-medium">({Math.round(d.weights[k] * 100)}%)</span><Info t={i} /></span>
                      <b className="text-slate-800 text-base">{d.components[k]}</b>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                      <div className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-1000 ease-out`} style={{ width: `${d.components[k]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Ward Priority List" info="Ranks areas by shortfall. Teams know where to send tankers first.">
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 rounded-tl-lg font-bold tracking-wider">Ward / Zone</th>
                    <th className="px-5 py-4 font-bold tracking-wider">Demand</th>
                    <th className="px-5 py-4 font-bold tracking-wider">Supply</th>
                    <th className="px-5 py-4 font-bold tracking-wider">Gap</th>
                    <th className="px-5 py-4 rounded-tr-lg font-bold tracking-wider">Severity<Info t="Gap as a percentage of demand." dir="left" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {d.wards.map((w, idx) => (
                    <tr key={w.name} className={`hover:bg-slate-50/80 transition-colors ${idx === 0 ? "bg-red-50/50" : ""}`}>
                      <td className="px-5 py-4 font-bold text-slate-700 flex items-center gap-3">
                        {idx === 0 && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>}
                        {w.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{w.demand}</td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{w.supply}</td>
                      <td className="px-5 py-4 text-red-600 font-bold">{w.gap}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${w.risk_pct >= 20 ? "bg-red-100 text-red-700 border-red-200" : w.risk_pct > 0 ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
                          {w.risk_pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card title="Recommended Actions" info="What the municipality should do now, based on the risk level.">
              <div className="flex justify-between items-center mt-2">
                <button onClick={handleGeneratePlan} disabled={loadingPlan} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50">
                  {loadingPlan ? "Generating..." : "Generate AI Plan (Bedrock)"}
                </button>
                {aiPlan && <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded border border-indigo-200">Source: {aiPlan.source}</span>}
              </div>
              <ul className="space-y-3 mt-4">
                {(aiPlan ? aiPlan.plan.split('\n').filter(Boolean) : d.actions).map((a, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors p-4 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-cyan-500 shrink-0 mt-0.5">➔</span>
                    <span className="leading-relaxed font-medium">{a.replace(/^•\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </Card>
            
            <Card title="AI Real-Time Bulk SMS Dispatch" info="Autonomous AI engine that monitors the stress score continuously and automatically dispatches emergency SMS to affected citizens if the score exceeds 60." infoDir="left" className={`flex flex-col ${d.score >= 60 ? 'ring-2 ring-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'ring-1 ring-cyan-500/30'} relative overflow-hidden transition-all duration-500`}>
              {d.score >= 60 && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse"></div>}
              {d.score < 60 && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-indigo-500"></div>}
              
              <div className="flex items-center justify-between mb-4 mt-2 relative z-10">
                <div className="flex items-center gap-2.5 bg-slate-50/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${d.score >= 60 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></div>
                  <span className={`text-[11px] font-extrabold tracking-widest uppercase ${d.score >= 60 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {d.score >= 60 ? "CRITICAL ALERT ACTIVE" : "MONITORING ACTIVE"}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-500 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">Live Score: <span className={`text-base ml-1 ${d.score >= 60 ? 'text-red-600' : 'text-slate-800'}`}>{d.score}</span></div>
              </div>

              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-inner relative overflow-hidden grow flex flex-col justify-end min-h-[260px]">
                <div className="font-mono text-xs space-y-2.5 z-10">
                  <p className="text-slate-500">{">"} AI bulk dispatch engine running on port 8000...</p>
                  <p className="text-slate-400">{">"} Evaluating real-time stress for {city} <span className="text-cyan-600">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span></p>
                  
                  {d.score >= 60 ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <p className="text-red-400 font-bold">{">"} WARNING: Stress score ({d.score}) exceeded critical threshold (60).</p>
                      <p className="text-slate-300">{">"} Isolating highest risk zone: <span className="text-white font-bold">{d.worst_ward}</span></p>
                      
                      <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/50 text-slate-200 shadow-lg">
                        <span className="text-red-400 font-bold text-sm">🚨 WATER CRISIS ALERT</span><br/>
                        <span className="text-slate-300 mt-2 block leading-relaxed">
                          Severe water shortage expected in your area. Immediate action required:
                          <br/><br/>
                          1. <strong className="text-white">INCREASE</strong> water storage immediately.<br/>
                          2. <strong className="text-white">DECREASE</strong> non-essential water consumption.
                        </span>
                      </div>
                      
                      {!hasPreviousData && (
                        <div className="mt-4 p-4 border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-900/50 rounded-xl transition-all"
                             onDragOver={e => e.preventDefault()}
                             onDrop={handleFileDrop}>
                          <div className="flex flex-col items-center justify-center text-center gap-2">
                            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="text-sm font-semibold text-slate-300">Drag & Drop Contact List</p>
                            <p className="text-[10px] text-slate-500">Supports .csv, .xlsx</p>
                            <input type="file" id="fileUpload" className="hidden" accept=".csv, .xlsx" onChange={handleFileChange} />
                            <label htmlFor="fileUpload" className="mt-2 px-3 py-1 bg-slate-800 text-white text-xs rounded border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors">Browse Files</label>
                          </div>
                        </div>
                      )}
                      
                      {contactsFile && (
                        <div className="flex items-center justify-between bg-emerald-900/30 border border-emerald-500/50 p-2 rounded-lg mt-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span className="text-emerald-300 text-xs font-semibold truncate">{contactsFile.name}</span>
                          </div>
                          <button onClick={() => setContactsFile(null)} className="text-slate-400 hover:text-red-400 p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                      )}
                      
                      {sendingBulk ? (
                        <div className="w-full mt-3 bg-slate-800 rounded-lg p-3 border border-slate-700 shadow-lg">
                          <style>{`
                            @keyframes loadBar {
                              0% { transform: translateX(-100%); }
                              100% { transform: translateX(100%); }
                            }
                            .animate-load-bar {
                              animation: loadBar 2s infinite linear;
                            }
                          `}</style>
                          <div className="flex justify-between text-[11px] font-bold text-cyan-400 mb-2.5">
                            <span>SENDING SMS TO LOCAL PEOPLE...</span>
                            <span className="animate-pulse">DISPATCHING</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600 animate-load-bar"></div>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={handleSendBulk} 
                          disabled={!contactsFile && !hasPreviousData}
                          className={`w-full mt-3 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                            ${(contactsFile || hasPreviousData) ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/50' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                          Dispatch Bulk SMS Now
                        </button>
                      )}
                      
                      {bulkStatus && (
                        <div className={`p-2 rounded mt-2 text-xs font-semibold ${bulkStatus.status === 'success' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/50' : 'bg-red-900/40 text-red-400 border border-red-500/50'}`}>
                          {">"} {bulkStatus.detail}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-slate-400 mt-4">
                      <p className="text-emerald-500">{">"} Score {d.score} is below critical threshold (60).</p>
                      <p>{">"} Conditions optimal. No bulk alerts necessary.</p>
                      <p className="animate-pulse">_</p>
                    </div>
                  )}
                </div>
                
                {/* Background decorative elements */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-slate-800 rounded-full blur-3xl opacity-50"></div>
                {d.score >= 60 && <div className="absolute top-10 right-10 w-32 h-32 bg-red-900/20 rounded-full blur-2xl"></div>}
              </div>
            </Card>
          </div>

          <Card title="Data Provenance" info="Honesty table. Every number is tagged with its source type.">
            <div className="flex flex-wrap gap-4 mt-4">
              {d.provenance.map(p => (
                <div key={p.item} className="flex flex-col bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-xl p-4 text-sm grow basis-[calc(50%-1rem)] xl:basis-[calc(33.333%-1.33rem)] shadow-sm">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className="font-bold text-slate-700">{p.item}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-md border ${kindColor[p.kind]}`}>
                      {p.kind}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 mt-auto leading-relaxed">{p.src}</span>
                </div>
              ))}
            </div>
          </Card>
        </>}
      </div>
      )}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={handleAuthSuccess} 
      />
      {showAdmin && (
        <AdminPanel 
          token={authToken}
          onClose={() => setShowAdmin(false)} 
          onLogout={handleLogout}
        />
      )}
    </main>
  );
}
