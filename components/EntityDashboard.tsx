
import React from 'react';
import { EntityReport, Article, Bias } from '../types';
import NewsCard from './NewsCard';
import { Bot, Activity, TrendingUp, ShieldCheck } from './Icons';

interface EntityDashboardProps {
  report: EntityReport;
}

const Sparkline: React.FC<{ data: { date: string; value: number }[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const height = 60;
  const width = 200;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.value / maxVal) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={`M0,${height} ${points} L${width},${height} Z`} fill="rgba(14, 165, 233, 0.2)" />
      <polyline points={points} fill="none" stroke="#0ea5e9" strokeWidth="2" />
    </svg>
  );
};

const NarrativeCard: React.FC<{ title: string; narrative: any; color: string }> = ({ title, narrative, color }) => (
    <div className={`p-4 rounded-xl border border-gray-700 bg-gray-800/40 backdrop-blur-sm relative overflow-hidden`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${color}`}></div>
        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</h4>
        <h3 className="text-white font-bold text-lg mb-2">"{narrative.name}"</h3>
        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{narrative.description}</p>
        <div className="flex flex-wrap gap-2">
            {narrative.supportedBy.map((s: string) => (
                <span key={s} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-700 text-gray-400 border border-gray-600">
                    {s.replace('PRO_', '')}
                </span>
            ))}
        </div>
    </div>
);

const EntityDashboard: React.FC<EntityDashboardProps> = ({ report }) => {
  
  // Group articles by date for the timeline
  const groupedArticles = report.articles.reduce((acc, article) => {
    const date = new Date(article.timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let key = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    if (date.toDateString() === today.toDateString()) key = "Today";
    else if (date.toDateString() === yesterday.toDateString()) key = "Yesterday";

    if (!acc[key]) acc[key] = [];
    acc[key].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  const sortedKeys = Object.keys(groupedArticles).sort((a, b) => {
     if (a === 'Today') return -1;
     if (b === 'Today') return 1;
     if (a === 'Yesterday') return -1;
     if (b === 'Yesterday') return 1;
     return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Intelligence Card */}
      <div className="bg-brand-card/90 backdrop-blur-md border border-gray-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity className="w-32 h-32 text-brand-accent" />
        </div>

        <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-brand-accent">#</span> {report.topic}
                    </h1>
                    <p className="text-gray-300 max-w-2xl">{report.summary}</p>
                </div>
                {/* Bot Score */}
                <div className="text-center">
                    <div className="flex items-center gap-2 justify-end mb-1">
                        <Bot className={`w-5 h-5 ${report.botActivity > 50 ? 'text-red-500' : 'text-green-500'}`} />
                        <span className="text-gray-400 text-xs font-bold uppercase">Bot Activity</span>
                    </div>
                    <div className={`text-3xl font-black ${report.botActivity > 50 ? 'text-red-400' : 'text-green-400'}`}>
                        {report.botActivity}%
                    </div>
                </div>
            </div>

            {/* Narrative War Room */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <NarrativeCard 
                    title="Dominant Narrative" 
                    narrative={report.dominantNarrative} 
                    color="bg-green-500" 
                />
                <NarrativeCard 
                    title="Counter Narrative" 
                    narrative={report.counterNarrative} 
                    color="bg-orange-500" 
                />
            </div>
            
            {/* Stats Row */}
            <div className="flex flex-col md:flex-row gap-6 mt-6 pt-6 border-t border-gray-700">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-2">Bias Distribution</div>
                    <div className="flex h-2 rounded-full overflow-hidden w-full bg-gray-800">
                        {Object.entries(report.biasDistribution || {}).map(([bias, val]) => (
                            (val as number) > 0 && <div key={bias} style={{ width: `${val}%` }} 
                            className={`h-full ${
                                bias === 'PRO_AL' ? 'bg-emerald-600' : 
                                bias === 'PRO_BNP' ? 'bg-orange-600' :
                                bias === 'PRO_JAMAAT' ? 'bg-teal-600' :
                                bias === 'PRO_STUDENT' ? 'bg-rose-600' :
                                bias === 'INDIA' ? 'bg-amber-600' :
                                bias === 'STATE' ? 'bg-cyan-700' :
                                bias === 'WESTERN' ? 'bg-blue-600' :
                                'bg-gray-600'
                            }`} title={`${bias}: ${val}%`}></div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(report.biasDistribution || {}).map(([bias, val]) => (
                             (val as number) > 10 && <span key={bias} className="text-[10px] text-gray-400">{bias.replace('PRO_', '')}: {val as number}%</span>
                        ))}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Mention Volume (90 Days)
                            </span>
                        </div>
                        <Sparkline data={report.mentionTrend} />
                 </div>
            </div>
        </div>
      </div>

      {/* Dark Pool Alerts */}
      {report.articles.some(a => a.isDarkPool) && (
          <div className="bg-purple-900/20 border border-purple-500/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <h3 className="font-bold text-purple-200">Dark Pool Detect: Viral on FB, Ignored by Media</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.articles.filter(a => a.isDarkPool).map(article => (
                      <NewsCard key={article.id} article={article} />
                  ))}
              </div>
          </div>
      )}

      {/* Timeline Feed */}
      <div className="relative border-l-2 border-gray-800 ml-4 space-y-12 pb-12">
        {sortedKeys.map((dateKey) => (
            <div key={dateKey} className="relative pl-8">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-accent border-4 border-brand-dark shadow-glow"></div>
                <h3 className="text-xl font-bold text-brand-accent mb-4 uppercase tracking-wider">{dateKey}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedArticles[dateKey].filter(a => !a.isDarkPool).map(article => (
                        <NewsCard key={article.id} article={article} />
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default EntityDashboard;
