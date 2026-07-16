import React from 'react';
import { Card, Button } from 'react-bootstrap';

// Removed duplicate prop, ensured 'results' is included
export default function RoundWinnerScreen({ results, nextHostName, onNextRound, isHost }) {
  
  // Safety check: Don't crash if results are still loading
  if (!results || !results.winner) return <div>Loading results...</div>;

  return (
    <div className="d-flex justify-content-center align-items-center p-3">
      <Card className="shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
        <Card.Header className="text-center bg-success text-white">
            <div>
                <h1>Winner: {results.winner.name}</h1>
                <p>Answer: {results.winner.currentAnswer.text}</p>
            </div>
        </Card.Header>
        
        <Card.Body className="text-center">
          <div className="mt-4 p-2 bg-light rounded">
            <p className="mb-0">
                Next Judge: <strong>{nextHostName}</strong>
            </p>
          </div>

          {isHost ? (
            <Button className="mt-3" variant="primary" size="lg" onClick={onNextRound}>
              Begin Next Round
            </Button>
          ) : (
            <p className="text-muted mt-3">Waiting for {nextHostName} to start the next round...</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}