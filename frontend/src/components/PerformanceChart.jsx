import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

export default function PerformanceChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center bg-slate-900/50 border border-slate-800 rounded-sm text-slate-500">
        <Activity className="w-10 h-10 mb-2 opacity-20" />
        <p className="text-xs font-bold uppercase tracking-widest">No Telemetry Data</p>
      </div>
    );
  }

  // Convert createdAt to nice label and ensure chronological order
  const chartData = [...data]
    .map((p) => ({
      name: new Date(p.createdAt || p._id?.toString().slice(0, 8)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      fullDate: new Date(p.createdAt || p._id?.toString().slice(0, 8)).toLocaleString(),
      speed: p.speed,
      stamina: p.stamina,
      strength: p.strength,
    }))
    .reverse(); // oldest → newest

  // Custom Tooltip for the Tactical Look
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-700 p-3 rounded-sm shadow-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs font-mono mb-1 last:mb-0">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 uppercase font-bold">{entry.name}:</span>
              <span className="text-white font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-sm border border-white/5 shadow-2xl h-96 flex flex-col relative overflow-hidden">
      {/* Decorative Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black italic uppercase text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Performance Trend
        </h3>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-800 px-2 py-1 rounded-sm">
          Live Analysis
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
            <Legend 
              iconType="rect" 
              wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }} 
            />
            
            <Line 
              type="monotone" 
              dataKey="speed" 
              name="Speed"
              stroke="#eab308" /* yellow-500 */
              strokeWidth={2} 
              dot={{ r: 3, fill: '#eab308', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#eab308', strokeWidth: 2, fill: '#0f172a' }}
            />
            <Line 
              type="monotone" 
              dataKey="stamina" 
              name="Stamina"
              stroke="#3b82f6" /* blue-500 */
              strokeWidth={2} 
              dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#0f172a' }}
            />
            <Line 
              type="monotone" 
              dataKey="strength" 
              name="Strength"
              stroke="#a855f7" /* purple-500 */
              strokeWidth={2} 
              dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#a855f7', strokeWidth: 2, fill: '#0f172a' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}