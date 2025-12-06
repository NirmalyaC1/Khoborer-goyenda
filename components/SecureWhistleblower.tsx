import React, { useState } from 'react';
import { Lock } from './Icons';

const SecureWhistleblower: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate encryption and submission
    setTimeout(() => {
      setSubmitted(true);
      setText('');
      setTimeout(() => setSubmitted(false), 3000);
    }, 800);
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-5 h-5 text-green-500" />
        <h3 className="font-bold text-white">Secure Publisher Channel</h3>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        End-to-End Encrypted. Submit tips anonymously. Metadata is stripped locally before transmission. 
        (Simulated for this demo).
      </p>

      {submitted ? (
        <div className="bg-green-900/20 border border-green-500 text-green-400 p-4 rounded-lg text-center text-sm">
          Tip submitted securely. No logs retained.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-gray-800 rounded border border-gray-700 p-2 text-sm text-white focus:border-green-500 focus:outline-none mb-3"
            rows={3}
            placeholder="Describe the incident safely..."
          />
          <button type="submit" className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded border border-gray-600 uppercase tracking-wide">
            Encrypt & Send
          </button>
        </form>
      )}
    </div>
  );
};

export default SecureWhistleblower;
