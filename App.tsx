
import React, { useState, useEffect } from 'react';
import { generateNewsFeed, generateEntityReport } from './services/geminiService';
import NewsCard from './components/NewsCard';
import BotAnalyzer from './components/BotAnalyzer';
import SecureWhistleblower from './components/SecureWhistleblower';
import TopicSelector from './components/TopicSelector';
import EntityDashboard from './components/EntityDashboard';
import { Menu, TrendingUp } from './components/Icons';
import { Article, Bias, EntityReport } from './types';

// Initial Mock Data
const MOCK_NEWS: Article[] = [
  {
    id: '1',
    headline: "Fuel Price Hikes Spark Protests Across Dhaka",
    summary: "Demonstrations have erupted in Shahbagh and Mirpur following the sudden increase in petrol prices. Government cites global market volatility, while opposition claims mismanagement.",
    imageUrl: "https://picsum.photos/800/400?random=1",
    blindspot: Bias.PRO_AL, 
    isFactChecked: true,
    factCheckVerdict: "TRUE",
    timestamp: new Date().toISOString(),
    topics: ["Economy", "Protest"],
    sources: [
      { id: 's1', name: 'Naya Diganta', bias: Bias.PRO_BNP, reliabilityScore: 80, url: '#', ownership: 'Diganta Media' },
      { id: 's2', name: 'Manab Zamin', bias: Bias.NEUTRAL, reliabilityScore: 85, url: '#' },
      { id: 's3', name: 'The Daily Star', bias: Bias.NEUTRAL, reliabilityScore: 90, url: '#', ownership: 'Transcom' }
    ]
  },
  {
    id: '3',
    headline: "Viral Claim: 'Bridge Collapse' Video is actually from 2018",
    summary: "A video circulating on Facebook claiming the Padma Bridge has cracks is false. Fact checkers confirm the footage is from an unrelated incident.",
    imageUrl: "https://picsum.photos/800/400?random=3",
    blindspot: 'NONE',
    isFactChecked: true,
    factCheckVerdict: "FALSE",
    timestamp: new Date().toISOString(),
    topics: ["FactCheck", "Infrastructure"],
    sources: [
        { id: 's7', name: 'Rumor Scanner', bias: Bias.NEUTRAL, reliabilityScore: 99, url: '#' },
        { id: 's8', name: 'Somoy TV', bias: Bias.PRO_AL, reliabilityScore: 85, url: '#', ownership: 'City Group' }
    ]
  }
];

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(MOCK_NEWS);
  const [entityReport, setEntityReport] = useState<EntityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [filterBlindspot, setFilterBlindspot] = useState<string>('ALL');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // PWA Install Prompt Listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      setInstallPrompt(null);
    }
  };

  const fetchContent = async (topic: string | null) => {
    setLoading(true);
    setArticles([]);
    setEntityReport(null);

    if (topic) {
        const report = await generateEntityReport(topic);
        if (report) setEntityReport(report);
        else {
             const newArticles = await generateNewsFeed(topic);
             setArticles(newArticles);
        }
    } else {
        const newArticles = await generateNewsFeed(null);
        if (newArticles.length > 0) setArticles(newArticles);
    }
    setLoading(false);
  };

  const handleTopicSelect = (topicId: string | null) => {
    setSelectedTopic(topicId);
    fetchContent(topicId);
  };

  const processedArticles = [...articles]
    .filter(a => filterBlindspot === 'ALL' ? true : a.blindspot === filterBlindspot);

  return (
    <div className="min-h-screen font-sans pb-20 bg-brand-dark text-slate-100">
      <nav className="sticky top-0 z-50 bg-brand-dark/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTopicSelect(null)}>
              <div className="bg-brand-accent w-8 h-8 rounded flex items-center justify-center font-black text-brand-dark">K</div>
              <span className="text-xl font-bold tracking-tight text-white">Khoborer<span className="text-brand-accent">Goyenda</span></span>
            </div>
            
            <div className="flex items-center gap-4">
               {installPrompt && (
                   <button onClick={handleInstall} className="hidden md:block text-xs font-bold text-brand-accent border border-brand-accent px-3 py-1 rounded hover:bg-brand-accent hover:text-white transition">
                       Install App
                   </button>
               )}
               <button onClick={() => fetchContent(selectedTopic)} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full border border-gray-600 transition-colors">
                  {loading ? 'Analyzing...' : 'Refresh AI'}
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4">Intelligence Dashboard</h3>
          <TopicSelector selectedTopic={selectedTopic} onSelect={handleTopicSelect} />
        </div>

        {loading && (
             <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="h-12 w-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm">Gathering intelligence...</p>
             </div>
        )}

        {!loading && selectedTopic && entityReport && (
            <EntityDashboard report={entityReport} />
        )}

        {!loading && !selectedTopic && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">Media Intelligence Unit</h1>
                        <p className="text-gray-400">
                            Zero-cost investigative tool for Bangladesh. Spot bots, uncover ownership, and break the echo chamber.
                        </p>
                    </div>
                    <BotAnalyzer />
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <SecureWhistleblower />
                    <div className="bg-brand-card p-6 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-2 mb-4 text-white font-bold">
                            <TrendingUp className="w-5 h-5 text-brand-accent" />
                            <h3>Narrative Watch</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['#IndiaOut', '#Reform', '#Election2025', '#Inflation'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 rounded-full cursor-pointer transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-white">Latest Intelligence</h2>
                    <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
                        <span className="text-xs text-gray-400 px-2 uppercase font-bold">Filter Blindspots:</span>
                        <select 
                            value={filterBlindspot}
                            onChange={(e) => setFilterBlindspot(e.target.value)}
                            className="bg-transparent text-sm text-white focus:outline-none p-1"
                        >
                            <option value="ALL">Show All</option>
                            <option value={Bias.PRO_AL}>Hidden by Pro-AL</option>
                            <option value={Bias.PRO_BNP}>Hidden by Pro-BNP</option>
                            <option value={Bias.INDIA}>Hidden by India</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {processedArticles.map(article => (
                        <NewsCard key={article.id} article={article} />
                    ))}
                </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-gray-800 bg-brand-card mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
            <p className="mb-2">Khoborer Goyenda &copy; 2025. Non-profit Initiative.</p>
            <p className="text-xs">Data verified by AI + Community. Not affiliated with any party.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
