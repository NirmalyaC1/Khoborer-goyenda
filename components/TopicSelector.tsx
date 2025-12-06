
import React from 'react';

export interface Topic {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

const TOPICS: Topic[] = [
  // Key Figures
  { id: 'Dr. Muhammad Yunus', label: 'Dr. Yunus', emoji: '☁️', color: 'bg-sky-600' },
  { id: 'Sheikh Hasina', label: 'Hasina', emoji: '👵', color: 'bg-green-700' },
  { id: 'Khaleda Zia', label: 'Khaleda', emoji: '👵', color: 'bg-orange-600' },
  { id: 'Student Coordinators', label: 'Students', emoji: '✊', color: 'bg-red-600' },
  
  // Parties
  { id: 'Awami League', label: 'AL', emoji: '🏫', color: 'bg-green-800' },
  { id: 'BNP', label: 'BNP', emoji: '🟢', color: 'bg-orange-700' },
  { id: 'Hefazat/Islami Parties', label: 'Islamist', emoji: '🕌', color: 'bg-emerald-800' },
  
  // Institutions
  { id: 'Bangladesh Army', label: 'Army', emoji: '🪖', color: 'bg-olive-600' },
  { id: 'Bangladesh Police', label: 'Police', emoji: '👮', color: 'bg-blue-800' },
  { id: 'Judiciary', label: 'Judiciary', emoji: '⚖️', color: 'bg-slate-600' },
  
  // Topics/External
  { id: 'India-Bangladesh Relations', label: 'India', emoji: '🇮🇳', color: 'bg-orange-500' },
  { id: 'UN/International', label: 'Intl', emoji: '🌐', color: 'bg-blue-500' },
  { id: 'Election 2025', label: 'Election', emoji: '🗳️', color: 'bg-purple-600' },
  { id: 'Quota Reform/Gen-Z', label: 'Gen-Z', emoji: '🔥', color: 'bg-red-500' },
  { id: 'Digital Security Act', label: 'DSA/Cyber', emoji: '🔐', color: 'bg-gray-700' },
];

interface TopicSelectorProps {
  selectedTopic: string | null;
  onSelect: (topicId: string | null) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ selectedTopic, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex space-x-3 min-w-max px-1">
        {/* 'All' Option */}
        <button
          onClick={() => onSelect(null)}
          className={`flex flex-col items-center gap-2 group transition-all duration-300 ${!selectedTopic ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
        >
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all border-2 ${!selectedTopic ? 'bg-brand-accent border-white' : 'bg-gray-800 border-gray-700'}`}>
            🔍
          </div>
          <span className={`text-[10px] md:text-xs font-bold uppercase ${!selectedTopic ? 'text-brand-accent' : 'text-gray-400'}`}>Feed</span>
        </button>

        {TOPICS.map((topic) => {
          const isSelected = selectedTopic === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => onSelect(topic.id)}
              className={`flex flex-col items-center gap-2 group transition-all duration-300 ${isSelected ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-all border-2 
                ${isSelected ? 'border-white ring-2 ring-brand-accent ring-offset-2 ring-offset-brand-dark' : 'border-transparent'} 
                ${topic.color}
              `}>
                {topic.emoji}
              </div>
              <span className={`text-[10px] md:text-xs font-bold uppercase whitespace-nowrap ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                {topic.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopicSelector;
