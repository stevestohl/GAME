import React, { useState, useEffect } from 'react';

/**
 * Prompt2ResponseSelectionScreen Component
 * * @param {boolean} isHost - Whether the current client is the host.
 * @param {string} promptText - The prompt selected for this round.
 * @param {number} submittedCount - Number of players who have already submitted.
 * @param {number} totalPlayers - Total number of active players (excluding host).
 * @param {function} onSubmitResponse - Callback when player submits a response. Takes selected response string.
 * @param {function} onRevealChoices - Callback when host clicks 'Reveal Choices'.
 */
export default function Prompt2ResponseSelectionScreen({
  isHost,
  promptText = "Default Prompt: What is the meaning of life?",
  submittedCount = 0,
  totalPlayers = 4,
  onSubmitResponse,
  onRevealChoices
}) {
  // Player-specific state
  const [responses, setResponses] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(!isHost);
  const [error, setError] = useState(null);

  // Fetch 7 random responses for the player
  useEffect(() => {
    if (isHost) return;

    const fetchResponses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/prompt2players');
        if (!response.ok) {
          throw new Error('Failed to fetch responses from server.');
        }
        const data = await response.json();
        
        // Expecting an array of strings or objects from the API. 
        // Adjust "data.responses" if your API returns a nested object.
        const fetchedList = Array.isArray(data) ? data : data.responses || [];
        setResponses(fetchedList.slice(0, 7)); // Ensure we grab exactly 7
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [isHost]);

  // Handle Player Submission
  const handleSubmit = () => {
    if (selectedIdx === null) return;
    const choice = responses[selectedIdx];
    setHasSubmitted(true);
    if (onSubmitResponse) {
      onSubmitResponse(choice);
    }
  };

  // --- HOST VIEW ---
  if (isHost) {
    const allPlayersSubmitted = submittedCount >= totalPlayers;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-2xl w-full text-center space-y-8 bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
          <span className="px-4 py-1.5 bg-indigo-600/30 text-indigo-400 rounded-full text-sm font-semibold tracking-wide uppercase">
            Host Screen
          </span>
          
          <div className="space-y-3">
            <p className="text-slate-400 text-sm font-medium">Active Prompt</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-amber-400 leading-snug">
              "{promptText}"
            </h1>
          </div>

          <hr className="border-slate-700" />

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="text-lg font-medium text-slate-300">
              Submissions Received
            </div>
            <div className="text-4xl font-black text-white">
              {submittedCount} <span className="text-slate-500">/</span> {totalPlayers}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500 ease-out" 
                style={{ width: `${(submittedCount / totalPlayers) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Reveal Button */}
          <div className="pt-6">
            <button
              onClick={onRevealChoices}
              disabled={!allPlayersSubmitted}
              className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 ${
                allPlayersSubmitted
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer animate-pulse'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {allPlayersSubmitted ? '💡 Reveal Choices!' : 'Waiting for Players...'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- PLAYER VIEW ---
  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* Prompt Header */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center shadow-lg">
          <span className="text-xs font-bold text-amber-400 tracking-wider uppercase block mb-2">
            The Prompt
          </span>
          <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-slate-100">
            {promptText}
          </h2>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="text-center py-12 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500 mx-auto"></div>
            <p className="text-slate-400">Loading your answer choices...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Selection / Submitted State */}
        {!loading && !error && (
          <>
            {hasSubmitted ? (
              <div className="bg-slate-900 p-12 rounded-2xl border border-slate-800 text-center space-y-4">
                <div className="text-5xl">✅</div>
                <h3 className="text-xl font-bold text-emerald-400">Response Submitted!</h3>
                <p className="text-slate-400 text-sm">
                  Sit tight. Waiting for the rest of the players to choose their answers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider text-center">
                  Select your favorite response:
                </p>
                
                {/* 7 Responses Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {responses.map((resp, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      className={`w-full p-4 text-left rounded-xl border font-medium transition duration-150 transform hover:-translate-y-0.5 ${
                        selectedIdx === idx
                          ? 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-500 shadow-indigo-500/25 shadow-md'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="inline-block w-6 text-slate-500 font-mono text-sm">
                        {idx + 1}.
                      </span>
                      {resp}
                    </button>
                  ))}
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={selectedIdx === null}
                    className={`w-full md:w-64 py-4 rounded-xl font-bold text-lg shadow-lg transition duration-200 transform active:scale-95 ${
                      selectedIdx !== null
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                        : 'bg-slate-850 text-slate-600 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}