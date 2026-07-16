import React, { useState, useEffect } from 'react';
// Fixed 2: Added Row and Col to the Bootstrap imports
import { Card, Badge, Row, Col } from 'react-bootstrap';

/**
 * Prompt2PromptSelectionScreen
 * @param {boolean} isHost - Determines if the current player is the host.
 * @param {function} onSelectPrompt - Callback function triggered when the host selects a card.
 */
export default function Prompt2PromptSelectionScreen({
  isHost,
  onSelectPrompt
}) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch random prompts from the backend when the Host view mounts
  useEffect(() => {
    if (isHost) {
      // 1. Check if we are running locally
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // 2. Point to localhost for local dev, or the working Render backend for production
      const backendBase = isLocal 
        ? 'http://localhost:5000' 
        : 'https://game-temple-backend.onrender.com';

      setIsLoading(true);
      
      // Fixed 3: Fetch using the dynamically resolved backend base string variable
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
    <div className="d-flex justify-content-center align-items-center p-3">
      {/* Main Framework Container locked down tightly to 450px */}
      <Card className="text-center shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
        <Card.Header
          as="h5"
          className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
          style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}
        >
          Prompt Selection
        </Card.Header>

        <Card.Body className="p-3">
          {/* Core Context Headers */}
          <p className="text-muted small mx-auto mb-4">
            Choose one of the three random cards below to set the theme for this round.
          </p>

          {/* Fixed: Added align-items-center to drop the buttons perfectly into the middle */}
          <div className="d-flex flex-column align-items-center gap-3 mt-1" style={{ width: '100%' }}>
            {options.map((card, index) => (
              <Card 
                key={card._id || index}
                role="button"
                tabIndex={0} 
                onClick={() => onSelectPrompt(card)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectPrompt(card);
                  }
                }}
                // Left text-start so the inside text stays aligned nicely to the left
                className="text-start p-3 border shadow-sm bg-white prompt-card-btn"
                style={{ 
                  width: '92%', // Fixed: Forces a deliberate, controlled width
                  cursor: "pointer",
                  transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Enforced content container alignment rules */}
                <div className="w-100">
                  {/* Content Categorization Flag */}
                  <Badge 
                    bg="light" 
                    className="text-uppercase text-muted border tracking-wide px-2 py-1 fw-semibold"
                    style={{ fontSize: '0.65rem' }}
                  >
                    {card.type || 'prompt'}
                  </Badge>

                  {/* Display Prompt Text */}
                  <p className="fw-medium text-dark mb-0 mt-2 fs-6 lh-base">
                    {card.text}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Custom hover transition rules styling */}
      <style>{`
        .prompt-card-btn {
          border-color: rgba(0,0,0,0.1) !important;
        }
        .prompt-card-btn:hover {
          transform: translateY(-2px);
          border-color: #014eb6 !important;
          box-shadow: 0 6px 12px rgba(1, 78, 182, 0.1) !important;
        }
        .prompt-card-btn:active {
          transform: translateY(0px);
        }
        .prompt-card-btn:focus-visible {
          outline: 2px solid #014eb6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}