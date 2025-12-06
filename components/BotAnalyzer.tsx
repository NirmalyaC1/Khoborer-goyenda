import React, { useState } from 'react';
import { Bot, ShieldCheck } from './Icons';
import { analyzeBotContent } from '../services/geminiService';
import { BotCheckResult } from '../types';

const BotAnalyzer: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BotCheckResult | null>(null);

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await analyzeBotContent(input);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="bg-brand-card p-6 rounded-xl border border-gray-700 shadow-lg mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-brand-accent" />
        <h2 className="text-xl font-bold text-white">Viral Bot Check</h2>
      </div>
      <p className="text-gray-400 mb-4 text-sm">
        Paste a suspicious comment or viral post caption below. Our AI checks for syntax patterns common in political bot farms.
      </p>

      <textarea
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-accent h-32 mb-4"
        placeholder="Paste text here (e.g., 'Copy paste this everywhere...')"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleCheck}
        disabled={loading || !input}
        className={`w-full py-2 px-4 rounded-lg font-bold text-white transition-colors flex justify-center items-center ${
          loading || !input ? 'bg-gray-600 cursor-not-allowed' : 'bg-brand-accent hover:bg-blue-600'
        }`}
      >
        {loading ? (
          <span className="animate-pulse">Analyzing Patterns...</span>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5 mr-2" /> Verify Authenticity
          </>
        )}
      </button>

      {result && (
        <div className={`mt-6 p-4 rounded-lg border ${result.isBot ? 'bg-red-900/20 border-red-500/50' : 'bg-green-900/20 border-green-500/50'}`}>
          <div className="flex justify-between items-start">
            <h3 className={`font-bold text-lg ${result.isBot ? 'text-red-400' : 'text-green-400'}`}>
              {result.isBot ? '⚠️ High Bot Probability' : '✅ Likely Organic'}
            </h3>
            <span className="text-sm font-mono bg-gray-800 px-2 py-1 rounded">
              Confidence: {result.confidence}%
            </span>
          </div>
          <p className="text-gray-300 mt-2 text-sm">{result.reasoning}</p>
          
          {result.flags.length > 0 && (
            <div className="mt-4">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Suspicious Indicators:</span>
              <ul className="list-disc list-inside text-gray-400 text-sm mt-1">
                {result.flags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BotAnalyzer;
