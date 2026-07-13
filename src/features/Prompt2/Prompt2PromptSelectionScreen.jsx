import React from'react'

/**
 * Prompt2PromptSelectionScreen
 * 
 * @param {boolean} isHost - Determines if the current player is the host.
 * @param {Array} options - An array of exactly 3 random prompt card objects.
 * @param {function} onSelectPrompt - Callback function triggered when the host selects a card.
 */

export default function Prompt2PromptSelectionScreen({
    isHost,
    options = [],
    onSelectPrompt
}) {

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
    // HOST VIEW
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
              key={card.id || index}
              onClick={() => onSelectPrompt(card)}
              className="flex flex-col justify-between p-6 bg-slate-800 border-2 border-slate-700/60 rounded-2xl text-left transition-all duration-300 hover:border-indigo-500 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-98 group min-h-[220px]"
            >
              {/* Card Header Tag */}
              <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-950/60 px-2.5 py-1 rounded-md w-max border border-indigo-500/10">
                {card.type || 'prompt'}
              </span>
              
              {/* Card Body Text */}
              <p className="text-lg font-medium text-slate-200 mt-4 flex-grow group-hover:text-white leading-relaxed">
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
