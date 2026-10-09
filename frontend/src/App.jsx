import { useEffect, useState } from "react";

// The little (i) button
const Info = ({ t }) => (
  <span className="relative group inline-flex items-center justify-center ml-2 align-middle">
    <button type="button" aria-label="More information"
      className="w-[18px] h-[18px] rounded-full border border-slate-300 text-slate-400 hover:text-cyan-600 hover:border-cyan-600 hover:bg-cyan-50 transition-all flex items-center justify-center text-[11px] font-bold cursor-help shadow-sm">
      i
    </button>
    <span role="tooltip" className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 absolute z-50 left-7 top-1/2 -translate-y-1/2 w-64 p-3 rounded-xl bg-white/95 backdrop-blur-xl border border-slate-200 text-slate-700 text-xs font-medium shadow-2xl leading-relaxed">{t}</span>
  </span>
);

const Card = ({ title, info, children, className="" }) => (
  <section className={`bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 transition-all duration-300 hover:bg-white/90 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] min-w-0 ${className}`}>
    <h2 className="font-semibold text-lg text-slate-800 mb-4 flex items-center">{title}<Info t={info} /></h2>
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
  const down = "Backend not running. Start it on port 8000 (see README).";

  useEffect(() => { fetch("/api/cities").then(r => r.json()).then(setCities).catch(() => setErr(down)); }, []);
  useEffect(() => {
    setErr("");
    fetch(`/api/assess/${city}?heat_shift=${shift}`).then(r => r.json()).then(setD).catch(() => setErr(down));
  }, [city, shift]);

  const maxD = d ? Math.max(...d.days.map(x => x.demand)) : 1;
  const sms = d ? (lang === "en" ? d.sms_en : d.sms_hi) : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(sms);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-blue-50/40 to-slate-100 text-slate-700 p-4 md:p-8 font-sans selection:bg-cyan-200 selection:text-cyan-900">
      
      {/* Decorative background blurs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">
                Jal Sankat
              </span>
              <Info t="The name of the tool. 'Jal Sankat' means water crisis. It warns a city about water shortage days before it happens." />
            </h1>
            <p className="text-slate-500 text-lg font-medium">Water stress early warning platform for municipal teams.</p>
          </div>
          
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
          </div>
        </header>

        {err && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 shadow-sm"><span className="text-xl">⚠️</span> {err}</div>}

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
            <Card title="7-Day Demand Forecast" info="Red is the peak day. Demand rises about 2% for every degree above 30°C." className="flex flex-col">
              <div className="flex items-end gap-3 h-48 mt-4 grow">
                {d.days.map(x => (
                  <div key={x.date} className="flex-1 flex flex-col items-center justify-end group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-slate-800 px-2 py-1 rounded text-white mb-2 shadow-lg whitespace-nowrap">
                      {x.demand} ML
                    </div>
                    <div 
                      className={`w-full rounded-t-md transition-all duration-500 ease-out group-hover:brightness-110 shadow-sm ${x.demand === maxD ? "bg-gradient-to-t from-red-500 to-red-400" : "bg-gradient-to-t from-cyan-600 to-cyan-400"}`} 
                      style={{ height: `${Math.max(12, (x.demand / maxD) * 100)}%` }} 
                    />
                    <div className="mt-3 text-center">
                      <div className="text-xs font-bold text-slate-600">{new Date(x.date).toLocaleDateString("en-IN", { weekday: "short" })}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{x.temp}°</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-medium text-slate-400 mt-6 text-right border-t border-slate-100 pt-3">Source: {d.source === "live" ? "Live (Open-Meteo)" : "Offline Sample"}</p>
            </Card>

            <Card title="Stress Factors Breakdown" info="Each part is scored 0 to 100 and multiplied by its weight." className="flex flex-col justify-center">
              <div className="space-y-6 mt-2">
                {[
                  ["heat", "Heat Impact", "How hot the peak day is. 10 points for each degree above 30°C.", "from-amber-400 to-amber-300"], 
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
                    <th className="px-5 py-4 rounded-tr-lg font-bold tracking-wider">Severity<Info t="Gap as a percentage of demand." /></th>
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
              <ul className="space-y-3 mt-4">
                {d.actions.map((a, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors p-4 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-cyan-500 shrink-0 mt-0.5">➔</span>
                    <span className="leading-relaxed font-medium">{a}</span>
                  </li>
                ))}
              </ul>
            </Card>
            
            <Card title="Citizen Alert Message" info="Ready-to-send SMS for the worst ward. Copy it into your SMS system." className="flex flex-col">
              <div className="flex gap-2 mb-4 bg-slate-100 p-1.5 rounded-lg w-max border border-slate-200">
                {["en", "hi"].map(l => (
                  <button key={l} onClick={() => setLang(l)} className={`px-5 py-1.5 rounded-md text-sm font-bold transition-all duration-300 ${lang === l ? "bg-white text-cyan-700 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}>
                    {l === "en" ? "English" : "हिन्दी"}
                  </button>
                ))}
              </div>
              <div className="relative group grow flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-xl opacity-80 pointer-events-none"></div>
                <p className="relative text-sm text-slate-700 bg-white/60 backdrop-blur-sm border border-slate-200 p-5 rounded-xl leading-relaxed grow font-semibold whitespace-pre-wrap shadow-sm">
                  {sms}
                </p>
                <button 
                  className="absolute bottom-3 right-3 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 shadow-md flex items-center gap-2 border border-cyan-500"
                  onClick={handleCopy}
                >
                  {copied ? "✓ Copied!" : "Copy Text"}
                </button>
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
    </main>
  );
}
