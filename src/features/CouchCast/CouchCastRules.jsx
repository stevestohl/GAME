import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastRules({ roomCode }) {
    const [timeLeft, setTimeLeft] = useState(30);
    
    // Add state to track device orientation for the overlay
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    // Listen for screen rotation
    useEffect(() => {
        const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Run the countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            handleNext();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, roomCode]);

    const handleNext = () => {
        console.log(`Sending startPromptSelection event for room: ${roomCode}`);
        socket.emit('startPromptSelection', { roomCode });
    };

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
            
            <div className="d-flex flex-column h-100 p-3 pb-4 w-100">
                
                {/* Main Header */}
                <h2 className="fullscreen-gameplay-header text-center mb-3">
                    How To Play Couch Cast!
                </h2>

                {/* --- TWO COLUMN ROW STARTS HERE --- */}
                <div className="d-flex flex-row flex-grow-1 gap-3 overflow-hidden">
                    
                    {/* LEFT COLUMN: TIMER (Takes up ~33% width) */}
                    <div className="col-4 d-flex flex-column h-100">
                        <div className="shining-border-wrapper h-100">
                            <Card className="fullscreen-gameplay-card h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)' }}>
                                <Card.Body className="d-flex flex-column align-items-center justify-content-between p-3">
                                    
                                    <Card.Title 
                                        className="fw-bold text-dark mb-1 text-center flex-shrink-0"
                                        style={{ fontSize: 'clamp(0.9rem, 2.2vh, 1.4rem)' }}
                                    >
                                        GAME STARTS IN
                                    </Card.Title>
                                    
                                    {/* Timer Text */}
                                    <div className="display-1 fw-bold text-danger text-center">
                                        {timeLeft}s
                                    </div>
                                    
                                    {/* Developer Skip Button */}
                                    <Button 
                                        variant='light' 
                                        size='sm' 
                                        className='w-100 fw-bold mt-auto py-2 shadow-sm'
                                        style={{ fontSize: '0.9rem' }}
                                        onClick={handleNext}
                                    >
                                        ⏭️ Skip
                                    </Button>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: RULES (Takes up ~66% width) */}
                    <div className="col-8 d-flex flex-column h-100">
                        <div className="shining-border-wrapper h-100">
                            <Card className="fullscreen-gameplay-card h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)' }}>
                                <Card.Body className="d-flex flex-column p-3 p-md-4 h-100">
                                    
                                    <Card.Title 
                                        className="fw-bold text-dark mb-3 text-center flex-shrink-0 border-bottom border-secondary pb-2"
                                        style={{ fontSize: 'clamp(1.2rem, 3vh, 1.8rem)' }}
                                    >
                                        RULES
                                    </Card.Title>
                                    
                                    <div className="d-flex flex-column justify-content-center flex-grow-1 h-100 px-2 px-md-4">
                                        <ol className="mb-0 fs-6 fs-md-5 text-secondary d-flex flex-column justify-content-evenly h-100" style={{ fontWeight: '500' }}>
                                            <li className="mb-2">
                                                <strong className="text-dark">Host Picks the Prompt:</strong><br/>
                                                One player is chosen as the Host each round. They get to pick <strong>1 out of 3 random prompts</strong> to set the vibe.
                                            </li>
                                            <li className="mb-2">
                                                <strong className="text-dark">Players Respond:</strong><br/>
                                                The other players look at their hand of <strong>7 options</strong> (6 pre-drawn cards + 1 custom "Write-In") and submit their funniest answer.
                                            </li>
                                            <li>
                                                <strong className="text-dark">Host Judges the Winner:</strong><br/>
                                                The Host reads all the submissions anonymously and crowns the winner of the round!
                                            </li>
                                        </ol>
                                    </div>

                                </Card.Body>
                            </Card>
                        </div>
                    </div>

                </div>
                {/* --- TWO COLUMN ROW ENDS HERE --- */}

            </div>
        </div>
    );
}