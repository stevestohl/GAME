import React, { useState, useEffect } from 'react';
import { Card, Badge } from 'react-bootstrap';
import Confetti from 'react-confetti';

export default function CouchCastWinnerRevealTV({ 
    currentPrompt, 
    winner, 
    winningSubmission, 
    nextHostName, 
    isGameOver 
}) {
    // Track both the window size (for confetti) and device orientation (for overlay)
    const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
            setIsPortrait(window.innerHeight > window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="fullscreen-gameplay-container">
            {/* --- LANDSCAPE REMINDER OVERLAY --- */}
            {isPortrait && (
                <div className="landscape-overlay">
                    <svg viewBox="0 0 24 24" className="rotate-device-icon">
                        <path d="M16 1H8C6.9 1 6 1.9 6 3V21C6 22.1 6.9 23 8 23H16C17.1 23 18 22.1 18 21V3C18 1.9 17.1 1 16 1ZM16 19H8V5H16V19Z" />
                    </svg>
                    <h2 className="fw-bold mb-3">Rotate Your Device</h2>
                    <p className="fs-5">Couch Cast is best experienced in landscape mode!</p>
                </div>
            )}

            {/* 🎆 THE FIREWORKS / CONFETTI OVERLAY 🎆 */}
            <Confetti
                width={windowDimensions.width}
                height={windowDimensions.height}
                numberOfPieces={600}      
                recycle={false}           
                gravity={0.15}
                initialVelocityY={20}     
                style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} 
            />

            {/* Custom Keyframe Animation */}
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

            <div className="d-flex flex-column h-100 p-3 pb-4 w-100 align-items-center justify-content-center text-center" style={{ zIndex: 10 }}>
                
                <h2 className="fw-bold text-uppercase flex-shrink-0" style={{ color: '#ffd700', letterSpacing: '4px', textShadow: '2px 2px 4px rgba(0,0,0,0.6)', fontSize: 'clamp(1.1rem, 5vh, 2.5rem)', marginBottom: '2vh' }}>
                    And the winner is...
                </h2>
                
                {/* height: auto + minHeight: 0 lets the card shrink to fit short screens instead of spilling off */}
                <div className="shining-border-wrapper animate-pop-in w-100" style={{ maxWidth: '900px', height: 'auto', minHeight: 0, marginBottom: '2vh' }}>
                    <Card className="fullscreen-gameplay-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(15px)', border: '3px solid #198754', minHeight: 0 }}>
                        <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center" style={{ padding: 'clamp(0.5rem, 3.5vh, 3rem)', minHeight: 0 }}>
                            
                            <h4 className="fst-italic text-dark" style={{ fontSize: 'clamp(0.8rem, 3.6vh, 1.8rem)', marginBottom: '2vh' }}>
                                "{currentPrompt?.text || currentPrompt}"
                            </h4>
                            
                            {/* Long answers get smaller type so they still fit */}
                            <h1 className="fw-bold text-dark px-3" style={{ fontSize: (winningSubmission?.answer || '').length > 45 ? 'clamp(1rem, 5vh, 2.6rem)' : 'clamp(1.2rem, 7vh, 3.5rem)', lineHeight: 1.15, marginBottom: '2vh' }}>
                                "{winningSubmission?.answer}"
                            </h1>
                            
                            <hr className="w-75 mx-auto opacity-50 border-secondary flex-shrink-0" style={{ marginTop: 0, marginBottom: '2vh' }} />
                            
                            <Badge bg="success" className="shadow-sm rounded-pill flex-shrink-0" style={{ fontSize: 'clamp(0.9rem, 4vh, 2rem)', padding: '1.5vh 3vh', marginBottom: '1.5vh' }}>
                                🎉 {winningSubmission?.playerName} 🎉
                            </Badge>
                            
                            <div className="fw-bold text-dark flex-shrink-0" style={{ fontSize: 'clamp(0.9rem, 3.6vh, 1.5rem)' }}>
                                Total Score: <span className="text-success">{winner?.score}</span>
                            </div>
                            
                        </Card.Body>
                    </Card>
                </div>

                {isGameOver ? (
                    <div className="shining-border-wrapper animate-pop-in flex-shrink-0" style={{ animationDelay: '1.5s', height: 'auto', width: 'auto' }}>
                        <Card className="fullscreen-gameplay-card" style={{ backgroundColor: 'rgba(220, 53, 69, 0.8)', backdropFilter: 'blur(10px)' }}>
                            <Card.Body className="py-2 px-4">
                                <h3 className="text-white m-0 fw-bold" style={{ fontSize: 'clamp(0.9rem, 3.6vh, 1.8rem)' }}>Game Over! Calculating final scores...</h3>
                            </Card.Body>
                        </Card>
                    </div>
                ) : (
                    <h4 className="text-white fw-bold m-0 flex-shrink-0 animate-pop-in" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)', fontSize: 'clamp(0.9rem, 3.6vh, 1.8rem)', animationDelay: '1.5s', opacity: 0 }}>
                        Get ready! <span style={{ color: '#ffd700' }}>{nextHostName}</span> is the next Host.
                    </h4>
                )}
            </div>
        </div>
    );
}