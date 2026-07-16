import React from "react";
import { Card, Button } from 'react-bootstrap'

export default function Prompt2JudgingScreen({ isHost, submission, onPickWinner}){

return (
    <div className="d-flex justify-content-center align-items-center p-3">
      <Card className="shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
        <Card.Header as="h5" className="border-0 py-2 fw-black tracking-widest text-uppercase fs-6 text-center" 
          style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
          Judging Time
        </Card.Header>

        <Card.Body className="p-3">
          <p className="text-center text-muted fw-bold mb-4">
            {isHost ? "Pick the best response!" : "Waiting for the judge to decide..."}
          </p>

          <div className="d-flex flex-column gap-3">
            {submissions && submissions.length > 0 ? (
              submissions.map((sub, idx) => (
                <Card key={idx} className="border shadow-sm p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-medium text-dark">{sub.answer}</span>
                    
                    {isHost && (
                      <Button 
                        variant="outline-success" 
                        size="sm" 
                        onClick={() => onPickWinner(sub.playerId)}
                      >
                        🏆 Pick
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center p-4 text-muted">No submissions yet...</div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}