'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Zap, Folder, Settings, Search, Bell,
  Calendar, CheckCircle2, FileText, Menu, X,
  User, Diamond, Snowflake, Sparkles, Target, SplitSquareHorizontal, BarChart3, RefreshCw
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_BASE = API_BASE.replace(/^http/, 'ws');

const AGENTS = ['Researcher', 'Analyst', 'Strategist', 'Executor'];
const COLORS: Record<string, string> = {
  Researcher: '#06b6d4', Analyst: '#9333ea',
  Strategist: '#10b981', Executor: '#f97316', System: '#6b7280',
};

export default function Dashboard() {
  const [tab, setTab] = useState('Dashboard');
  const [goal, setGoal] = useState('Optimize user acquisition funnel and increase conversion rate by 20% in Q4.');
  const [goalInput, setGoalInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<{ agent: string; message: string }[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Structured input state
  const [audience, setAudience] = useState('');
  const [constraints, setConstraints] = useState('');

  const run = async () => {
    if (!goal || busy) return;
    setBusy(true); setLogs([]); setActive('Researcher'); setDone([]); setTab('Dashboard');
    try {
      const r = await fetch(`${API_BASE}/api/v1/stratagem/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, audience, constraints, user_id: 'u1', context_files: [] }),
      });
      const { job_id } = await r.json();
      const ws = new WebSocket(`${WS_BASE}/ws/v1/stratagem/${job_id}/logs`);
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        setLogs((p) => [...p, d]);
        if (d.agent && AGENTS.includes(d.agent)) {
          setDone((p) => p.includes(d.agent) ? p : [...p, d.agent]);
          const nx = AGENTS.indexOf(d.agent) + 1;
          setActive(nx < AGENTS.length ? AGENTS[nx] : null);
        }
        if (d.message === 'Task Completed.') {
          fetch(`${API_BASE}/api/v1/stratagem/${job_id}`)
            .then(res => res.json())
            .then(data => setResults(data.result))
            .catch(err => console.error("Failed to fetch results", err));
          setBusy(false); setActive(null); ws.close(); setTab('Results');
        }
      };
      ws.onerror = () => { setBusy(false); setActive(null); };
    } catch {
      setLogs([{ agent: 'System', message: 'API unreachable. Start backend first.' }]);
      setBusy(false); setActive(null);
    }
  };

  const handleDownload = (filename: string) => {
    const content = `Mock data generated for ${filename}\n\nThis is a simulation of the execution asset output.`;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename.replace(/\.[^/.]+$/, "") + "_mock.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const nav = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Users, label: 'Agents' },
    { icon: Zap, label: 'Strategies' },
    { icon: Folder, label: 'Assets' },
    { icon: FileText, label: 'Results' },
    { icon: Settings, label: 'Settings' },
  ];

  const reports = [
    { title: 'Q3 Marketing Automation', date: 'Dec 15, 2023', color: '#06b6d4' },
    { title: 'Lead Gen Sync v4', date: 'Dec 15, 2023', color: '#9333ea' },
    { title: 'Market Entry Strategy', date: 'Nov 13, 2023', color: '#10b981' },
    { title: 'AI Ops Flow v12', date: 'Nov 13, 2023', color: '#f97316' },
  ];

  const agentCards = [
    { name: 'Agent Apex', mapped: 'Researcher', status: 'Running', color: '#2dd4bf', perf: 'Processing', ms: '22ms' },
    { name: 'Sentinel AI', mapped: 'Analyst', status: 'Monitoring', color: '#2dd4bf', perf: 'Ounnning', ms: '22ms' },
    { name: 'Flux', mapped: 'Strategist', status: 'Completing', color: '#64748b', perf: 'Gunnning', ms: '12ms' },
    { name: 'Voyager', mapped: 'Executor', status: 'Completing', color: '#64748b', perf: 'Gunnning', ms: '22ms' },
  ];

  const nodes = [
    { id: 'mr', x: 80, y: 180, label: 'Market\nResearch', icon: Search, color: '#c084fc', outline: true },
    { id: 'pa', x: 220, y: 80, label: 'Persona\nAnalysis', icon: User, color: '#c084fc' },
    { id: 'dp', x: 220, y: 180, label: 'Decision\nPoint', icon: Diamond, color: '#c084fc', badge: 'Processing' },
    { id: 'ta', x: 220, y: 280, label: 'Targeting\nAPI', icon: Snowflake, color: '#c084fc' },
    { id: 'cc', x: 340, y: 60, label: 'Campaign\nCreation', icon: Sparkles, color: '#c084fc', check: true },
    { id: 'at', x: 340, y: 140, label: 'Ad Targeting', icon: Target, color: '#2dd4bf', badge: 'Processing', badgeColor: '#047857' },
    { id: 'ab1', x: 340, y: 220, label: 'A/B Testing', icon: FileText, color: '#c084fc' },
    { id: 'ts', x: 340, y: 320, label: 'Target Seat\nEewoiar', icon: Settings, color: '#64748b', badge: 'Idle', badgeColor: '#334155' },
    { id: 'ab2', x: 460, y: 140, label: 'AB Testing\n- Optimization', icon: SplitSquareHorizontal, color: '#c084fc', badge: 'Bid Adjustment', badgeColor: '#334155' },
    { id: 'opt', x: 460, y: 220, label: 'Optimization', icon: BarChart3, color: '#2dd4bf' },
    { id: 'ra', x: 600, y: 180, label: 'Result\nAnalysis', icon: RefreshCw, color: '#2dd4bf' },
  ];

  const edges = [
    { d: 'M100 180 C 160 180, 160 80, 200 80', color: '#c084fc' },
    { d: 'M100 180 C 160 180, 160 180, 200 180', color: '#c084fc' },
    { d: 'M100 180 C 160 180, 160 280, 200 280', color: '#c084fc' },
    { d: 'M240 80 C 290 80, 290 60, 320 60', color: '#c084fc' },
    { d: 'M360 60 C 420 60, 420 140, 440 140', color: '#2dd4bf' },
    { d: 'M240 180 C 290 180, 290 140, 320 140', color: '#2dd4bf' },
    { d: 'M240 180 C 290 180, 290 220, 320 220', color: '#c084fc' },
    { d: 'M240 280 C 290 280, 290 320, 320 320', color: '#c084fc' },
    { d: 'M360 140 L 440 140', color: '#2dd4bf' },
    { d: 'M360 220 L 440 220', color: '#c084fc' },
    { d: 'M360 320 C 480 320, 480 180, 580 180', color: '#2dd4bf' },
    { d: 'M480 140 C 530 140, 530 180, 580 180', color: '#2dd4bf' },
    { d: 'M480 220 C 530 220, 530 180, 580 180', color: '#2dd4bf' },
  ];

  return (
    <div className="h-screen bg-[#05050f] text-white flex relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Dynamic Background matching mockup */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-900/10 blur-[150px]" />
        {/* Diagonal glow lines */}
        <div className="absolute top-[20%] left-[-10%] w-[200%] h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent rotate-[30deg] blur-md" />
        <div className="absolute top-[50%] left-[-20%] w-[200%] h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent rotate-[-20deg] blur-lg" />
      </div>

      {/* Main App Window */}
      <div className="relative z-10 w-full h-full bg-[#12131e]/90 backdrop-blur-3xl flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-[240px] flex-shrink-0 border-r border-white/5 bg-[#12131e]/50 hidden md:flex flex-col">
          <div className="px-6 py-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap size={16} fill="white" />
            </div>
            <span className="font-bold text-lg tracking-wide">Stratos AI</span>
          </div>
          
          <nav className="px-4 space-y-1 flex-1 mt-2">
            {nav.map((n) => (
              <button key={n.label} onClick={() => setTab(n.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === n.label ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}>
                <n.icon size={18} />
                {n.label}
              </button>
            ))}
          </nav>

          <div className="px-6 pb-6">
            <p className="text-[10px] uppercase font-bold text-white/30 tracking-[0.15em] mb-4">Strategy Reports</p>
            <div className="space-y-4">
              {reports.map((r, i) => (
                <div key={r.title} className="flex gap-3 items-start cursor-pointer group">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${r.color}20`, color: r.color }}>
                    <FileText size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/70 group-hover:text-white leading-tight">{r.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={10} className="text-white/30" />
                      <span className="text-[10px] text-white/40">{r.date}</span>
                      <span className="text-[10px] text-emerald-400 font-medium">Completed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#161724]/60">
          
          {/* Header */}
          <header className="h-[60px] flex items-center justify-between px-8 shrink-0 border-b border-white/5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
              <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-mono text-white/50">H1</span>
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-medium">
                <Bell size={16} /> Notifications
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-emerald-500 border-2 border-[#161724] shadow-sm"></div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <input placeholder="Search" className="bg-[#1c1d2c] border border-white/5 rounded-full py-2 pl-9 pr-4 text-xs w-48 focus:outline-none focus:border-white/20 transition-all text-white/80 placeholder:text-white/30" />
              </div>
            </div>
          </header>

          {tab === 'Dashboard' ? (
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-4 md:p-6 gap-4 md:gap-6 relative custom-scrollbar">
              
              {/* Mission Briefing Section */}
              <div className="flex flex-col gap-3 relative z-20 shrink-0 bg-[#12131e]/80 border border-white/5 rounded-2xl p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold tracking-wider uppercase text-white/80">Mission Briefing</h2>
                  <button onClick={run} disabled={busy}
                    className="px-6 py-2 bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] hover:from-[#b573f8] hover:to-[#9f7aea] text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50">
                    {busy ? 'Deploying Agents...' : 'Configure Agents'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5 md:col-span-3">
                    <label className="text-[11px] text-white/70 uppercase font-semibold">Primary Goal</label>
                    <input value={goal} onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g. Optimize user acquisition funnel..."
                      className="bg-[#1e1f2e] border border-white/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/80 transition-colors placeholder:text-white/40 text-white font-medium" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 md:col-span-1">
                    <label className="text-[11px] text-white/70 uppercase font-semibold">Target Audience</label>
                    <input value={audience} onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g. B2B SaaS Founders"
                      className="bg-[#1e1f2e] border border-white/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/80 transition-colors placeholder:text-white/40 text-white font-medium" />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[11px] text-white/70 uppercase font-semibold">Constraints & Budgets</label>
                    <input value={constraints} onChange={(e) => setConstraints(e.target.value)}
                      placeholder="e.g. Zero marketing budget, launch in 2 weeks"
                      className="bg-[#1e1f2e] border border-white/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/80 transition-colors placeholder:text-white/40 text-white font-medium" />
                  </div>
                </div>
              </div>

              {/* Main Visualization & Status Panel */}
              <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-[450px] relative z-10">
                
                {/* Graph Panel */}
                <div className="flex-1 bg-[#12131e]/80 border border-white/5 rounded-2xl p-4 relative overflow-hidden flex flex-col shadow-inner">
                  
                  {/* Telemetry Header */}
                  <div className="flex justify-between items-start mb-6 shrink-0 relative z-10">
                    <p className="text-[11px] uppercase font-bold text-white/70 tracking-widest">Real-time Agent Activity</p>
                    <div className="flex gap-8">
                      <div className="text-right">
                        <p className="text-[11px] text-white/70 mb-1">Active Agents</p>
                        <p className="text-xl font-bold leading-none text-white">{busy ? '14' : '0'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-white/70 mb-1">Tasks in Progress</p>
                        <p className="text-xl font-bold leading-none text-white">{busy ? '87' : '0'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-white/70 mb-1">Success Rate</p>
                        <p className="text-xl font-bold leading-none text-emerald-400">98.6%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-white/70 mb-1">API Latency</p>
                        <p className="text-xl font-bold leading-none text-white">22ms</p>
                      </div>
                    </div>
                  </div>

                  {/* Node Graph SVG */}
                  <div className="flex-1 relative overflow-auto pr-2 custom-scrollbar">
                    <div className="min-w-[650px] min-h-[450px] w-full h-full flex items-center justify-center pt-4 pb-8">
                      <svg viewBox="0 0 700 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="6" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Edges */}
                      {edges.map((e, i) => (
                        <path key={i} d={e.d} stroke={e.color} strokeWidth="2" fill="none" opacity="0.6" />
                      ))}
                      
                      {/* Animated Packets */}
                      {busy && edges.map((e, i) => (
                        <path key={`anim-${i}`} d={e.d} stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.9" strokeDasharray="4 24" className="data-packet-flow" />
                      ))}

                      {/* Nodes */}
                      {nodes.map((n) => {
                        const lines = n.label.split('\n');
                        return (
                          <g key={n.id} className="cursor-pointer" style={{ transition: 'transform 0.2s' }}>
                            {/* Outer Glow */}
                            <circle cx={n.x} cy={n.y} r="18" fill="none" stroke={n.color} strokeWidth="1" opacity="0.3" filter="url(#glow)" />
                            
                            {/* Node Body */}
                            <circle cx={n.x} cy={n.y} r={n.outline ? 20 : 16} fill={n.outline ? 'none' : n.color} stroke={n.outline ? n.color : 'none'} strokeWidth={n.outline ? 2 : 0} />
                            {n.outline && <circle cx={n.x} cy={n.y} r={14} fill={n.color} opacity="0.2" />}
                            
                            {/* Icon inside Node */}
                            <g transform={`translate(${n.x - 8}, ${n.y - 8})`}>
                              <n.icon size={16} color="white" />
                            </g>
                            
                            {/* Node Label */}
                            {lines.map((line, i) => (
                              <text key={i} x={n.x} y={n.y + 34 + i * 14} textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="500" fontFamily="Inter">
                                {line}
                              </text>
                            ))}

                            {/* Badge */}
                            {n.badge && (
                              <g transform={`translate(${n.x + (n.badge.length > 8 ? -30 : -20)}, ${n.y + 30 + lines.length * 16})`}>
                                <rect width={n.badge.length > 8 ? 60 : 40} height="14" rx="7" fill={n.badgeColor || '#047857'} opacity="0.9" />
                                <text x={n.badge.length > 8 ? 30 : 20} y="10" textAnchor="middle" fontSize="8" fill="white" fontFamily="Inter" fontWeight="bold">
                                  {n.badge}
                                </text>
                              </g>
                            )}

                            {/* Checkmark */}
                            {n.check && (
                              <g transform={`translate(${n.x + 10}, ${n.y - 20})`}>
                                <circle cx="5" cy="5" r="7" fill="#10b981" />
                                <CheckCircle2 size={10} color="white" x="0" y="0" />
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                    </div>
                  </div>
                </div>

                {/* Agents Status Panel */}
                <div className="w-full lg:w-[300px] shrink-0 bg-[#1e2030] rounded-2xl border border-white/10 p-5 shadow-2xl flex flex-col relative z-20">
                  <p className="text-[11px] uppercase font-bold text-white/80 tracking-wider mb-4">Agents Status</p>
                  
                  <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                    {agentCards.map((a) => (
                      <div key={a.name} className="p-4 bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm font-bold text-white">{a.name}</p>
                          <span className="text-xs font-mono text-white/70">100%</span>
                        </div>
                        <p className="text-[11px] font-semibold mb-3" style={{ color: a.color }}>{a.status}</p>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-white/60">Performance</span>
                            <span className="text-white/60">Metrics</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-medium text-white/80">
                            <span>{a.perf}</span>
                            <span>{a.ms}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : tab === 'Results' ? (
            <div className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto">
               <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                 <FileText className="text-purple-400" /> Strategic Analysis Results
               </h2>
               {!results ? (
                 <div className="flex-1 flex items-center justify-center">
                   <p className="text-white/40">No results found or still processing...</p>
                 </div>
               ) : (
                 <div className="max-w-4xl space-y-6">
                   {/* Analyst Insights */}
                   <div className="bg-[#12131e]/80 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <User size={18} className="text-cyan-400" /> Analyst Insights
                     </h3>
                     <ul className="space-y-3">
                       {results.insights?.map((insight: string, i: number) => (
                         <li key={i} className="flex gap-3 text-sm text-white/80">
                           <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                           {insight}
                         </li>
                       ))}
                     </ul>
                   </div>

                   {/* Strategist Plan */}
                   <div className="bg-[#12131e]/80 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <Diamond size={18} className="text-purple-500" /> Strategic Plan
                     </h3>
                     <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                       {results.plan}
                     </p>
                   </div>

                   {/* Executor Assets */}
                   <div className="bg-[#12131e]/80 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                     <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <Settings size={18} className="text-orange-500" /> Execution Deliverables
                     </h3>
                     <div className="flex flex-wrap gap-4">
                       {Object.keys(results.artifacts || {}).map((assetName) => (
                         <button key={assetName} onClick={() => handleDownload(assetName)}
                           className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group cursor-pointer text-left">
                           <Folder size={16} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                           <span className="text-sm font-medium">{assetName}</span>
                         </button>
                       ))}
                     </div>
                   </div>
                 </div>
               )}
            </div>
          ) : (
             <div className="flex-1 p-8 flex items-center justify-center">
               <p className="text-white/40">{tab} tab mock placeholder</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}
