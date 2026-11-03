import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Form, ProgressBar } from 'react-bootstrap';

const RESHUFFLE_COST = 50;   // the server takes it off the score; it can go below zero

export default function Prompt2ResponseSelectionScreen({
  isHost,
  expansion = 'core',
  promptText = "Default Prompt: What is the meaning of life?",
  submittedCount = 0,
  totalPlayers = 4,
  onSubmitResponse,
  onRevealChoices,
  onReshuffle,
  hasUsedWriteIn = false,
  myScore = 0
}) {
  // 1. Keep these as state - they belong to this component's lifecycle
  const [responses, setResponses] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(!isHost);
  const [error, setError] = useState(null);
  const [writeIn, setWriteIn] = useState('');
  const [dealNumber, setDealNumber] = useState(0);        // goes up for a reshuffle: deals a new hand
  const [confirmReshuffle, setConfirmReshuffle] = useState(false);

  // 2. Define your backend base URL

  const isLocal = window.location.hostname ==='localhost' || window.location.hostname ==='127.0.0.1'

  const backendBase = isLocal
    ? 'http://localhost:5005'
    : 'https://game-temple-backend.onrender.com';

  // Fetch 7 random responses for the player
  useEffect(() => {
    if (isHost) return;

    const fetchResponses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendBase}/api/prompt2players?expansion=${encodeURIComponent(expansion)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch responses from server.');
        }
        const data = await response.json();
        
        const fetchedList = data.data || []
        setResponses(fetchedList.slice(0, 7));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [isHost, expansion, dealNumber]);

  // 🔄 Reshuffle: a whole new hand, for points. First tap asks, second tap pays.
  const handleReshuffle = () => {
    if (!confirmReshuffle) {
      setConfirmReshuffle(true);
      return;
    }
    setConfirmReshuffle(false);
    setSelectedIdx(null);
    onReshuffle?.();
    setDealNumber((n) => n + 1);
  };

  // ✍️ The write-in: one per game
  const handleSendWriteIn = (e) => {
    e.preventDefault();
    const text = writeIn.trim();
    if (!text) return;
    setHasSubmitted(true);
    onSubmitResponse?.({ text, isWriteIn: true });
  };

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
    const progress = totalPlayers > 0 ? (submittedCount / totalPlayers) * 100 : 0;

    return (
      <div className="d-flex justify-content-center align-items-center p-3">
        <Card className="text-center shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
          <Card.Header as="h5" className="border-0 py-2 fw-black tracking-widest text-uppercase fs-6" 
            style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
            PROMPT2
          </Card.Header>
          
          <Card.Body className="p-4">
            <p className="text-muted small mb-1">Waiting for players to submit their responses...</p>
            <h5 className="fw-bold text-dark mb-4">"{promptText}"</h5>
            
            <hr />
            
            <div className="my-4">
              <div className="text-muted small fw-bold mb-2">Submissions Received</div>
              <div className="display-6 fw-black text-dark">{submittedCount} / {totalPlayers}</div>
              <ProgressBar now={progress} variant="success" className="mt-3" style={{ height: '10px' }} />
            </div>

            <Button 
              variant={allPlayersSubmitted ? "success" : "secondary"}
              className="w-100 py-3 fw-bold"
              disabled={!allPlayersSubmitted}
              onClick={onRevealChoices}
            >
              {allPlayersSubmitted ? '💡 Reveal Choices!' : 'Waiting for Players...'}
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // --- PLAYER VIEW ---
  return (
    <div className="d-flex justify-content-center align-items-center p-3">
      <Card className="shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
        <Card.Header as="h5" className="border-0 py-2 fw-black tracking-widest text-uppercase fs-6 text-center" 
          style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
          Response Selection
        </Card.Header>

        <Card.Body className="p-3">
          <div className="text-center mb-4">
            <Badge bg="light" text="dark" className="border mb-2 text-uppercase">The Prompt</Badge>
            <p className="fw-medium fs-6">{promptText}</p>
          </div>

          {loading ? (
             <div className="text-center py-4 text-muted">Loading options...</div>
          ) : error ? (
             <div className="text-danger text-center p-2 border border-danger rounded">{error}</div>
          ) : hasSubmitted ? (
            <div className="text-center py-5">
              <div className="fs-1 mb-2">✅</div>
              <h5 className="text-success fw-bold">Submitted!</h5>
              <p className="text-muted small">Waiting for others...</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              <p className="text-muted small fw-bold text-center text-uppercase">Pick one:</p>
              
              {responses.map((resp, idx) => (
                <Button
                  key={idx}
                  variant={selectedIdx === idx ? "primary" : "outline-primary"}
                  className="text-start p-3 cc-tap-option"
                  onClick={() => setSelectedIdx(idx)}
                >
                  <span className="text-muted me-2">{idx + 1}.</span> 
                  {/* ACCESS THE .text PROPERTY HERE */}
                  {resp.text} 
                </Button>
              ))}
              <Button 
                variant="warning" 
                className="w-100 mt-3 fw-bold text-dark"
                disabled={selectedIdx === null}
                onClick={handleSubmit}
              >
                Submit Answer
              </Button>

              {!hasUsedWriteIn && (
                <Form onSubmit={handleSendWriteIn} className="mt-3 text-start">
                  <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Or write your own (one per game)</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      value={writeIn}
                      maxLength={120}
                      placeholder="Your own answer..."
                      aria-label="Write your own answer"
                      onChange={(e) => setWriteIn(e.target.value)}
                    />
                    <Button type="submit" variant="primary" className="fw-bold" disabled={!writeIn.trim()}>Send</Button>
                  </div>
                </Form>
              )}

              <Button variant={confirmReshuffle ? 'danger' : 'outline-secondary'} className="w-100 mt-2 fw-bold" onClick={handleReshuffle}>
                {confirmReshuffle ? `Yes, spend ${RESHUFFLE_COST} points` : `🔀 Re-shuffle my cards (-${RESHUFFLE_COST} points)`}
              </Button>
              <div className="small text-muted text-center">You have {myScore} points</div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}