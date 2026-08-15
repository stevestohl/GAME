import React from 'react';
import { Container, Card } from 'react-bootstrap';

export default function CouchCastWinnerRevealTV({ currentPrompt, winner, nextHostName, isGameOver }) {
    return (
        <Container className="mt-5 d-flex flex-column align-items-center pb-5 text-center">
            <h2 className="text-warning fw-bold mb-3 tracking-widest text-uppercase">
                And the winner is...
            </h2>
            
            <Card className="shadow-lg w-100 mb-4 border-0" style={{ maxWidth: '800px', backgroundColor: '#fdfdfd' }}>
                <Card.Body className="p-5">
                    <h4 className="text-secondary mb-4 fst-italic">"{currentPrompt}"</h4>
                    
                    <h1 className="display-3 fw-bold text-primary mb-4 px-3">
                        "{winner?.currentAnswer}"
                    </h1>
                    
                    <hr className="w-50 mx-auto opacity-25" />
                    
                    <div className="display-6 fw-bold text-success mt-4">
                        🎉 {winner?.name} 🎉
                    </div>
                    <div className="mt-3 fs-4 fw-bold text-muted">
                        Total Score: <span className="text-dark">{winner?.score}</span>
                    </div>
                </Card.Body>
            </Card>

            {isGameOver ? (
                <div className="bg-danger text-white p-4 rounded-pill shadow-lg mt-3 px-5">
                    <h3 className="m-0 fw-bold">Game Over! Calculating final scores...</h3>
                </div>
            ) : (
                <h4 className="text-light mt-3">
                    Get ready! <span className="text-warning fw-bold">{nextHostName}</span> is the next Judge.
                </h4>
            )}
        </Container>
    );
}