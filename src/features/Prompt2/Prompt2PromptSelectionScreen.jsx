import React, { useState, useEffect } from 'react';

/**
 * Prompt2PromptSelectionScreen
 * * @param {boolean} isHost - Determines if the current player is the host.
 * @param {function} onSelectPrompt - Callback function triggered when the host selects a card.
 */
export default function Prompt2PromptSelectionScreen({
  isHost,
  onSelectPrompt
}) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch random prompts from the backend when the Host view mounts
useEffect(() => {
  if (isHost) {
    // 1. Check if we are running locally
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // 2. Point to localhost for local dev, or the working Render backend for production
    const backendBase = isLocal 
      ? 'http://localhost:5000' // Change this to your Render URL if you aren't running a local backend
      : 'https://game-temple-backend.onrender.com';

    setIsLoading(true);
    
    // 3. Fetch using the dynamically resolved backend base
    fetch(`${backendBase}/api/prompt2host`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch cards: Status ${res.status}`);
        }
        return res.json();
      })
      .then((response) => {
        if (response.success && Array.isArray(response.data)) {
          setOptions(response.data);
        } else {
          throw new Error("Invalid API response structure");
        }
      })
      .catch((err) => {
        console.error("Error fetching prompts:", err);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
}, [isHost]);
  // ----------------------------------------------------
  // PLAYER VIEW (Non-Host)
  // ----------------------------------------------------
  if (!isHost) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-black p-6">
        <div className="text-center space-y-6 max-w-md">
          {/* Animated loading spinner / indicator */}
          <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-25"></div>
            <div className="relative inline-flex rounded-full h-12 w-12 bg-indigo-600 items-center justify-center">
              <span className="text-xl">🤔</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold tracking-wide text-slate-100 animate-pulse">
            Host is selecting prompt...
          </h2>
          
          <p className="text-slate-400 text-sm">
            Think ahead! Get ready to play your best response cards once the prompt is chosen.
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // HOST VIEW - LOADING STATE
  // ----------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-black p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-lg">Gathering potential prompts...</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // HOST VIEW - ERROR STATE
  // ----------------------------------------------------
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-black p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h3 className="text-xl font-bold text-slate-200">Failed to load prompts</h3>
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // HOST VIEW - SUCCESS STATE
  // ----------------------------------------------------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-black p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest bg-indigo-600/30 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
            Host Turn
          </span>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mt-3">
            Pick the Perfect Prompt
          </h1>
          <p className="text-slate-400 mt-2 text-base md:text-lg">
            Choose one of the three random cards below to set the theme for this round.
          </p>
        </div>

        {/* 3-Card Grid Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {options.map((card, index) => (
            <button
              key={card._id || index} // MongoDB uses _id instead of id
              onClick={() => onSelectPrompt(card)}
              className="flex flex-col justify-between p-6 bg-slate-800 border-2 border-slate-700/60 rounded-2xl text-left transition-all duration-300 hover:border-indigo-500 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-98 group min-h-[220px]"
            >
              {/* Card Header Tag */}
              <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-950/60 px-2.5 py-1 rounded-md w-max border border-indigo-500/10">
                {card.type || 'prompt'}
              </span>
              
              {/* Card Body Text */}
              <p className="text-lg font-medium text-slate-200 mt-4 flex-grow group-hover:text-black leading-relaxed">
                {card.text}
              </p>
              
              {/* Action Prompt Indicator */}
              <div className="mt-6 text-sm font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                Choose this prompt <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}