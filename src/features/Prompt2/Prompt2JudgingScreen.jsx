import React from 'react';
import { Card, Button } from 'react-bootstrap';

// Fix 1: Make sure 'submissions' is inside the curly braces { }
export default function Prompt2JudgingScreen({ isHost, submissions = [], onPickWinner }) {
  
  return (
    <div className="d-flex justify-content-center align-items-center p-3">
      <Card className="shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
        <Card.Header as="h5" className="border-0 py-2 fw-black tracking-widest text-uppercase fs-6 text-center" 
          style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
          Judging Time
        </Card.Header>

        <Card.Body className="p-3">
          
          {/* Fix 2: Added conditional UI for guests vs host */}
          {isHost ? (
            <>
              <p className="text-center fw-bold mb-4">Host: Pick the best response!</p>
              <div className="d-flex flex-column gap-3">
                {submissions.map((sub, idx) => (
                  <Card key={idx} className="border shadow-sm p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-medium text-dark">{sub.answer.text}</span>
                      <Button 
                        variant="outline-success" 
                        size="sm" 
                        onClick={() => onPickWinner(sub.playerId)}
                      >
                        🏆 Pick
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <div className="fs-1 mb-3">⚖️</div>
              <h5 className="text-primary fw-bold">Waiting for Judge</h5>
              <p className="text-muted">The host is currently reviewing the answers. Sit tight!</p>
            </div>
          )}

        </Card.Body>
      </Card>
    </div>
  );
}