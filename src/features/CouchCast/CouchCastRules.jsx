import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastRules({ roomCode }) {
    const [timeLeft, setTimeLeft] = useState(30);

    // Run the countdown timer
    useEffect(() => {
        // Hide background scrollbar
        document.body.style.overflow = 'hidden';
        // When timer hits 0, auto-advance!
        if (timeLeft <= 0) {
            handleNext();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        // Cleanup interval on unmount
        return () => clearInterval(timerId);
    }, [timeLeft, roomCode]);

    const handleNext = () => {
        console.log(`Sending startPromptSelection event for room: ${roomCode}`);
        socket.emit('startPromptSelection', { roomCode });
    };

    return (
        <div className="fullscreen-gameplay-container">
            <div className="shining-border-wrapper">
                
                {/* d-flex flex-column forces the card to fill the space and manage internal height */}
                <Card className="fullscreen-gameplay-card">
                    <Card.Header
                        as='h5'
                        className="fullscreen-gameplay-card-header">
                        HOW TO PLAY COUCH CAST!
                    </Card.Header>

                    {/* flex-grow-1 takes the rest of the height, min-height: 0 stops overflow */}
                    <div className="row g-0 flex-grow-1" style={{ minHeight: 0 }}>
                        
                        {/* --- LEFT COLUMN: Title & Timer --- */}
                        <div className="col-4 d-flex flex-column justify-content-between align-items-center bg-light p-2 p-md-5 border-end h-100">                           
                            <div className="text-center mb-2 mb-md-4 flex-grow-1 d-flex flex-column justify-content-center">
                                <div className="text-muted fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.1em', fontSize: '0.7em' }}>
                                    Game Starts In
                                </div>
                                {/* Responsive display text so it doesn't break tiny screens */}
                                <div className="display-6 display-md-2 fw-bold text-danger">
                                    {timeLeft}s
                                </div>
                            </div>

                            {/* Developer Skip Button */}
                            <Button 
                                variant='outline-secondary' 
                                size='sm' 
                                className='w-100 fw-bold mt-auto py-1 py-md-2'
                                style={{ fontSize: '0.75em' }}
                                onClick={handleNext}
                            >
                                ⏭️ Skip (Dev)
                            </Button>
                        </div>

                        {/* --- RIGHT COLUMN: The Rules --- */}
                        {/* Switched to col-8 for wider text area */}
                        <div className="col-8 d-flex flex-column justify-content-center p-2 p-md-5 h-100">
                            {/* Space-evenly dynamically stretches the gap based on screen height! */}
                            <ol className="ps-3 ps-md-4 mb-0 fs-6 fs-md-5 text-secondary d-flex flex-column justify-content-evenly h-100 py-2">
                                <li>
                                    <strong className="text-dark">Host Picks the Prompt:</strong><br/>
                                    One player is chosen as the Host each round. They get to pick <strong>1 out of 3 random prompts</strong> to set the vibe.
                                </li>
                                <li>
                                    <strong className="text-dark">Players Respond:</strong><br/>
                                    The other players look at their hand of <strong>7 options</strong> (6 pre-drawn cards + 1 custom "Write-In") and submit their funniest answer.
                                </li>
                                <li>
                                    <strong className="text-dark">Host Judges the Winner:</strong><br/>
                                    The Host reads all the submissions anonymously and crowns the winner of the round!
                                </li>
                            </ol>
                        </div>

                    </div>
                </Card>
            </div>
        </div>
    );
}