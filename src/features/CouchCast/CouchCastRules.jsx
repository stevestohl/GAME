import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';
import { speak, stopVoice } from '../../voice.js';

// 🎙️ What the host voice says while the rules are on screen
export const RULES_NARRATION = [
    "Welcome to Couch Cast! An Apples to Apples style party game, with a rotating judge.",
    "Here's how it works. Each round, the judge picks one of three prompts to set the vibe. Everyone else taps their funniest answer from the cards on their phone. You also get one custom write-in per game, so make it count.",
    "Then the judge crowns the winner. Let's get started!",
];

// If the voice stalls, start the game anyway this many seconds after the countdown ends
const NARRATION_GRACE_SECONDS = 20;

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

    // True while the host voice is still reading the rules
    const [isNarrating, setIsNarrating] = useState(true);
    const hasStarted = useRef(false);

    // Read the rules aloud. When the voice finishes, the game starts straight away;
    // with no voice available, the countdown below runs the show as before.
    useEffect(() => {
        let isCurrent = true;

        speak(RULES_NARRATION, roomCode).then((wasSpoken) => {
            if (!isCurrent) return;
            setIsNarrating(false);
            if (wasSpoken) setTimeout(() => isCurrent && handleNext(), 800);
        });

        return () => {
            isCurrent = false;
            stopVoice();
        };
    }, [roomCode]);

    // Run the countdown timer (it waits at zero for the voice to finish its sentence)
    useEffect(() => {
        if (timeLeft <= 0 && (!isNarrating || timeLeft <= -NARRATION_GRACE_SECONDS)) {
            handleNext();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, roomCode, isNarrating]);

    const handleNext = () => {
        if (hasStarted.current) return; // voice, countdown and Skip can all land here: only go once
        hasStarted.current = true;
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
                <h2 className="fullscreen-gameplay-header text-center">
                    How To Play Couch Cast!
                </h2>

                {/* --- TWO COLUMN ROW STARTS HERE --- */}
                <div className="d-flex flex-row flex-grow-1 gap-3" style={{ minHeight: 0 }}>
                    
                    {/* LEFT COLUMN: RULES (Takes up ~66% width) */}
                    <div className="d-flex flex-column h-100" style={{ flex: '2 1 0', minWidth: 0 }}>
                        <div className="shining-border-wrapper h-100">
                            <Card className="fullscreen-gameplay-card h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                                <Card.Body className="d-flex flex-column h-100" style={{ padding: 'clamp(0.5rem, 3vh, 1.5rem)', minHeight: 0 }}>
                                    
                                    <Card.Title 
                                        className="fw-bold text-dark text-center flex-shrink-0 border-bottom border-secondary"
                                        style={{ fontSize: 'clamp(1rem, 3.5vh, 1.8rem)', paddingBottom: '0.6vh', marginBottom: '1.5vh' }}
                                    >
                                        RULES
                                    </Card.Title>
                                    
                                    {/* Wrapping div centers the list without forcing it to stretch vertically */}
                                    <div className="d-flex flex-column flex-grow-1 px-2 px-md-3 overflow-auto custom-scrollbar" style={{ minHeight: 0 }}>
                                        <ol className="my-auto text-secondary d-flex flex-column" style={{ fontWeight: '500', fontSize: 'clamp(0.7rem, 3.3vh, 1.3rem)', lineHeight: 1.3, gap: 'clamp(0.3rem, 2vh, 1rem)' }}>
                                            <li>
                                                <strong className="text-dark">Host Picks the Prompt:</strong><br/>
                                                Each round, one player is the Host and picks <strong>1 of 3 prompts</strong> to set the vibe.
                                            </li>
                                            <li>
                                                <strong className="text-dark">Contestants Respond:</strong><br/>
                                                Players pick from <strong>6 responses</strong> to submit their funniest answer. You get 1 custom "Write-In" per game, so make it count!
                                            </li>
                                            <li>
                                                <strong className="text-dark">Host Judges the Winner:</strong><br/>
                                                The Host reads all the submissions and crowns the winner of the round!
                                            </li>
                                        </ol>
                                    </div>

                                </Card.Body>
                            </Card>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: TIMER (Takes up ~33% width) */}
                    <div className="d-flex flex-column h-100" style={{ flex: '1 1 0', minWidth: 0 }}>
                        <div className="shining-border-wrapper h-100">
                            <Card className="fullscreen-gameplay-card h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                                <Card.Body className="d-flex flex-column align-items-center justify-content-between" style={{ padding: 'clamp(0.5rem, 3vh, 1rem)', minHeight: 0 }}>
                                    
                                    <Card.Title 
                                        className="fw-bold text-dark mb-1 text-center flex-shrink-0"
                                        style={{ fontSize: 'clamp(0.9rem, 2.2vh, 1.4rem)' }}
                                    >
                                        GAME STARTS IN
                                    </Card.Title>
                                    
                                    {/* Timer Text */}
                                    <div className="fw-bold text-danger text-center" style={{ fontSize: 'clamp(2.5rem, 18vh, 6rem)', lineHeight: 1 }}>
                                        {Math.max(timeLeft, 0)}s
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

                </div>
                {/* --- TWO COLUMN ROW ENDS HERE --- */}

            </div>
        </div>
    );
}