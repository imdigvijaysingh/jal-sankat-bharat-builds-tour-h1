import { useEffect, useState } from "react";

export default function AdminPanel({ onClose }) {
  const [config, setConfig] = useState(null);
  const [cities, setCities] = useState(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/config").then(r => r.json()).then(setConfig);
    fetch("/api/cities/raw").then(r => r.json()).then(data => {
      setCities(data);
      if (Object.keys(data).length > 0) setSelectedCity(Object.keys(data)[0]);
    });
  }, []);

  const saveConfig = async () => {
    setStatus("Saving config...");
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      setStatus("Config saved!");
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      setStatus("Error saving config.");
    }
  };

  const saveCity = async () => {
    setStatus("Saving city...");
    try {
      await fetch("/api/cities/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedCity, ...cities[selectedCity] })
      });
      setStatus("City saved!");
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      setStatus("Error saving city.");
    }
  };

  if (!config || !cities) return <div className="fixed inset-0 z-50 bg-slate-900/50 flex justify-center items-center"><div className="bg-white p-8 rounded-xl font-bold text-slate-800 shadow-2xl">Loading Data...</div></div>;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto p-4 md:p-8 flex items-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto p-6 md:p-8">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-2xl font-bold text-slate-800">Admin / Data Entry</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 font-bold px-4 py-2 bg-slate-100 rounded-lg transition-colors hover:bg-slate-200">Close</button>
        </div>
        
        {status && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg mb-6 text-center font-bold shadow-sm transition-all">{status}</div>}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Config Section */}
          <section className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">⚙️ Model Configuration</h3>
            <div className="space-y-4 text-sm font-medium flex flex-col flex-1">
              <label className="flex justify-between items-center text-slate-600">
                LPCD (Litres/person/day)
                <input type="number" value={config.LPCD} onChange={e => setConfig({...config, LPCD: +e.target.value})} className="border border-slate-300 p-2 rounded-lg w-24 text-right shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-bold bg-white" />
              </label>
              <label className="flex justify-between items-center text-slate-600">
                Heat Uplift (per °C)
                <input type="number" step="0.01" value={config.HEAT_UPLIFT} onChange={e => setConfig({...config, HEAT_UPLIFT: +e.target.value})} className="border border-slate-300 p-2 rounded-lg w-24 text-right shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-bold bg-white" />
              </label>
              <label className="flex justify-between items-center text-slate-600">
                Groundwater Derate
                <input type="number" step="0.0001" value={config.GW_DERATE} onChange={e => setConfig({...config, GW_DERATE: +e.target.value})} className="border border-slate-300 p-2 rounded-lg w-32 text-right shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-bold bg-white" />
              </label>
              
              <div className="pt-4 border-t border-slate-200 mt-4">
                <h4 className="font-bold text-slate-700 mb-3">Score Weights</h4>
                {Object.keys(config.W).map(k => (
                  <label key={k} className="flex justify-between items-center mt-2 text-slate-600">
                    {k.toUpperCase()}
                    <input type="number" step="0.01" value={config.W[k]} onChange={e => setConfig({...config, W: {...config.W, [k]: +e.target.value}})} className="border border-slate-300 p-1.5 rounded-lg w-24 text-right shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-bold bg-white" />
                  </label>
                ))}
              </div>
              <button onClick={saveConfig} className="w-full mt-auto bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-[0.98]">Save Config</button>
            </div>
          </section>

          {/* City Section */}
          <section className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">🏙️ City Data</h3>
              <select className="border border-slate-300 p-2 rounded-lg font-bold bg-white text-slate-800 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                {Object.keys(cities).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            {selectedCity && cities[selectedCity] && (
              <div className="space-y-4 text-sm font-medium mt-6 flex flex-col flex-1">
                <label className="flex justify-between items-center text-slate-600">
                  Population
                  <input type="number" value={cities[selectedCity].pop} onChange={e => setCities({...cities, [selectedCity]: {...cities[selectedCity], pop: +e.target.value}})} className="border border-slate-300 p-2 rounded-lg w-32 text-right shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-bold bg-white" />
                </label>
                <label className="flex justify-between items-center text-slate-600">
                  Supply (ML/day)
                  <input type="number" step="0.1" value={cities[selectedCity].supply} onChange={e => setCities({...cities, [selectedCity]: {...cities[selectedCity], supply: +e.target.value}})} className="border border-slate-300 p-2 rounded-lg w-32 text-right shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-bold bg-white" />
                </label>
                <label className="flex justify-between items-center text-slate-600">
                  GW Score (0-100)
                  <input type="number" value={cities[selectedCity].gw_score} onChange={e => setCities({...cities, [selectedCity]: {...cities[selectedCity], gw_score: +e.target.value}})} className="border border-slate-300 p-2 rounded-lg w-24 text-right shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-bold bg-white" />
                </label>
                <label className="flex justify-between items-center text-slate-600">
                  GW Category
                  <input type="text" value={cities[selectedCity].gw} onChange={e => setCities({...cities, [selectedCity]: {...cities[selectedCity], gw: e.target.value}})} className="border border-slate-300 p-2 rounded-lg w-40 text-right shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-bold bg-white" />
                </label>
                
                <button onClick={saveCity} className="w-full mt-auto bg-emerald-600 text-white py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-md transition-all active:scale-[0.98]">Save {selectedCity} Data</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
