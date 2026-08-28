import React, { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import Confetti from 'react-confetti';

export default function CouchCastWinnerRevealTV({ 
    currentPrompt, 
    winner, 
    winningSubmission, // 👈 Using this ensures the text doesn't disappear!
    nextHostName, 
    isGameOver 
}) {
    // We need to track the window size so the confetti covers the whole TV screen
    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {/* 🎆 THE FIREWORKS / CONFETTI OVERLAY 🎆 */}
            <Confetti
                width={windowDimensions.width}
                height={windowDimensions.height}
                numberOfPieces={600}      // Big explosion!
                recycle={false}           // Stops generating new pieces so they fall away nicely
                gravity={0.15}
                initialVelocityY={20}     // Shoots them up like fireworks
                style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }} // Ensures it's on top of everything
            />

            <Container className="mt-5 d-flex flex-column align-items-center pb-5 text-center" style={{ zIndex: 10 }}>
                <h2 className="text-warning fw-bold mb-3 text-uppercase" style={{ letterSpacing: '4px' }}>
                    And the winner is...
                </h2>
                
                {/* 
                  I added a quick inline animation here so the card "pops" onto the screen.
                  (You can put this keyframe in your CSS file if you prefer!)
                */}
                <style>
                    {`
                        @keyframes popIn {
                            0% { transform: scale(0.8); opacity: 0; }
                            80% { transform: scale(1.05); opacity: 1; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                        .animate-pop-in {
                            animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                        }
                    `}
                </style>

                <Card className="shadow-lg w-100 mb-4 border-0 animate-pop-in" style={{ maxWidth: '800px', backgroundColor: '#fdfdfd' }}>
                    <Card.Body className="p-5">
                        <h4 className="text-secondary mb-4 fst-italic">"{currentPrompt}"</h4>
                        
                        <h1 className="display-3 fw-bold text-primary mb-4 px-3">
                            "{winningSubmission?.answer}"
                        </h1>
                        
                        <hr className="w-50 mx-auto opacity-25" />
                        
                        <div className="display-6 fw-bold text-success mt-4">
                            🎉 {winningSubmission?.playerName} 🎉
                        </div>
                        <div className="mt-3 fs-4 fw-bold text-muted">
                            Total Score: <span className="text-dark">{winner?.score}</span>
                        </div>
                    </Card.Body>
                </Card>

                {isGameOver ? (
                    <div className="bg-danger text-white p-4 rounded-pill shadow-lg mt-3 px-5 animate-pop-in" style={{ animationDelay: '2s' }}>
                        <h3 className="m-0 fw-bold">Game Over! Calculating final scores...</h3>
                    </div>
                ) : (
                    <h4 className="text-light mt-3">
                        Get ready! <span className="text-warning fw-bold">{nextHostName}</span> is the next Judge.
                    </h4>
                )}
            </Container>
        </>
    );
}