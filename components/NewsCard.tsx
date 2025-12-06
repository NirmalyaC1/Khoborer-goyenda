
import React from 'react';
import { Article, Bias, Source } from '../types';
import { EyeOff, ShieldCheck } from './Icons';

interface NewsCardProps {
  article: Article;
}

const getBiasColor = (bias: string) => {
    switch (bias) {
        case Bias.PRO_AL: return 'bg-green-600';
        case Bias.PRO_BNP: return 'bg-orange-600';
        case Bias.PRO_JAMAAT: return 'bg-emerald-800';
        case Bias.PRO_STUDENT: return 'bg-red-500';
        case Bias.INDIA: return 'bg-orange-400';
        case Bias.STATE: return 'bg-green-800';
        case Bias.WESTERN: return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
};

const BiasStrip = ({ sources }: { sources: Source[] }) => {
  const total = sources.length || 1;
  return (
    <div className="w-full h-2 rounded-full overflow-hidden flex bg-gray-700 mt-3">
        {sources.map((s, i) => (
            <div key={i} style={{ width: `${100/total}%` }} className={`h-full ${getBiasColor(s.bias)}`} title={`${s.name} (${s.bias})`} />
        ))}
    </div>
  );
};

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <div className="bg-brand-card rounded-xl border border-gray-700 overflow-hidden hover:border-brand-accent transition-colors duration-300 flex flex-col h-full group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={article.imageUrl} 
          alt={article.headline} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Blindspot Badge */}
        {article.blindspot && article.blindspot !== 'NONE' && (
          <div className="absolute top-2 right-2 bg-gray-900/90 backdrop-blur px-2 py-1 rounded border border-gray-600 flex items-center gap-1 shadow-lg">
            <EyeOff className="w-3 h-3 text-gray-400" />
            <div className="flex flex-col leading-none">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Ignored by</span>
                <span className={`text-xs font-bold ${getBiasColor(article.blindspot).replace('bg-', 'text-')}`}>
                    {article.blindspot.replace('PRO_', '')}
                </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Tags */}
        <div className="flex gap-2 mb-3">
            {article.isFactChecked && (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                ${article.factCheckVerdict === 'TRUE' ? 'bg-green-900/30 text-green-400 border border-green-800' : 
                article.factCheckVerdict === 'FALSE' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'}
            `}>
                <ShieldCheck className="w-3 h-3" />
                {article.factCheckVerdict}
            </div>
            )}
            {article.isDarkPool && (
                <div className="bg-purple-900/40 text-purple-300 border border-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    Dark Pool
                </div>
            )}
        </div>

        <h3 className="text-lg font-bold text-white mb-2 leading-tight hover:text-brand-accent cursor-pointer">
          {article.headline}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
          {article.summary}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-800">
            {/* Sources & Ownership */}
            <div className="flex flex-wrap gap-2 mb-2">
                {article.sources.slice(0, 3).map(s => (
                    <div key={s.id} className="group/source relative">
                        <span className="text-[10px] bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-300 border border-gray-700 cursor-help">
                            {s.name}
                        </span>
                        {/* Tooltip for Ownership */}
                        {s.ownership && (
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover/source:opacity-100 transition-opacity pointer-events-none z-20">
                                Own: {s.ownership}
                             </div>
                        )}
                    </div>
                ))}
                {article.sources.length > 3 && <span className="text-[10px] text-gray-500 py-1">+{article.sources.length - 3}</span>}
            </div>

            <BiasStrip sources={article.sources} />
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
