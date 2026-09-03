import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, ProgressBar } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastPromptSelection({ 
    isCastScreen, 
    isJudge, 
    judgeName, 
    roomCode,
    prompts = [] 
}) {
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    // Track device orientation for the TV display
    useEffect(() => {
        const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Helper to safely extract text from MongoDB objects
    const getPromptText = (p) => {
        if (!p) return "";
        if (typeof p === 'string') return p;
        return p.prompt || p.text || "Unknown Prompt"; 
    };

    // --- LOGIC: The Countdown & Auto-Pick / Auto-Submit ---
    useEffect(() => {
        if (timeLeft <= 0) {
            if (isJudge && prompts.length > 0) {
                // Submit their chosen prompt if they picked one, otherwise pick randomly
                const promptToSubmit = selectedPrompt || prompts[Math.floor(Math.random() * prompts.length)];
                socket.emit('select_prompt', { roomCode, selectedPrompt: promptToSubmit });
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isJudge, prompts, roomCode, selectedPrompt]);

    // --- LOGIC: The TV Juggling Effect ---
    useEffect(() => {
        if (!isCastScreen || timeLeft <= 0 || prompts.length === 0) return;

        const roulette = setInterval(() => {
            setHighlightIndex((prev) => (prev + 1) % prompts.length);
        }, 250);

        return () => clearInterval(roulette);
    }, [isCastScreen, timeLeft, prompts.length]);

    const handlePromptSubmit = () => {
        if (!selectedPrompt) return;
        socket.emit('select_prompt', { roomCode, selectedPrompt });
    };

    // ==========================================
    // 1. CAST SCREEN (The TV / Shared Display)
    // ==========================================
    if (isCastScreen) {
        if (prompts.length === 0) {
            return (
                <div className="fullscreen-gameplay-container d-flex justify-content-center align-items-center">
                    <Spinner animation="border" variant="light" style={{ width: '4rem', height: '4rem' }} />
                </div>
            );
        }

        return (
            <div className="fullscreen-gameplay-container">
                {/* --- LANDSCAPE REMINDER OVERLAY --- */}
                {isPortrait && (
                    <div className="landscape-overlay">
                        <svg viewBox="0 0 24 24" className="rotate-device-icon">
                            <path d="M16 1H8C6.9 1 6 1.9 6 3V21C6 22.1 6.9 23 8 23H16C17.1 23 18 22.1 18 21V3C18 1.9 17.1 1 16 1ZM16 19H8V5H16V19Z" />
                        </svg>
                        <h2 className="fw-bold mb-3 text-white">Rotate Your TV/Device</h2>
                        <p className="fs-5 text-white">Couch Cast is best experienced in landscape mode!</p>
                    </div>
                )}

                <div className="d-flex flex-column h-100 p-3 pb-4 w-100 align-items-center justify-content-between">
                    
                    {/* Header */}
                    <h2 className="fullscreen-gameplay-header text-center mt-2 mb-4 flex-shrink-0">
                        <span className="text-primary">{judgeName}</span> is picking the poison...
                    </h2>
                    
                    {/* The 3 Juggling Cards */}
                    <div className="d-flex flex-row justify-content-center align-items-stretch w-100 gap-3 gap-md-4 px-2 px-md-5" style={{ flexGrow: 1, maxHeight: '55vh' }}>
                        {prompts.map((p, idx) => {
                            const isHighlighted = highlightIndex === idx;
                            return (
                                <div 
                                    key={idx} 
                                    className="d-flex flex-column h-100 transition-all"
                                    style={{ 
                                        flex: '1 1 0', 
                                        transform: isHighlighted ? 'scale(1.05)' : 'scale(0.95)',
                                        transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
                                        opacity: isHighlighted ? 1 : 0.6
                                    }}
                                >
                                    {/* Wrapper is now always present to maintain strict layout boundaries */}
                                    <div className="h-100 w-100 shining-border-wrapper">
                                        <Card 
                                            className="fullscreen-gameplay-card h-100 w-100 border-0" 
                                            style={{ 
                                                backgroundColor: isHighlighted ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.25)', 
                                                backdropFilter: 'blur(10px)',
                                                transition: 'background-color 0.2s ease-in-out'
                                            }}
                                        >
                                            <Card.Body className="d-flex align-items-center justify-content-center p-3 p-md-4 text-center">
                                                <h3 
                                                    className={`fw-bold m-0 ${isHighlighted ? 'text-dark' : 'text-white'}`} 
                                                    style={{ 
                                                        fontSize: 'clamp(1.2rem, 3vh, 2.2rem)',
                                                        textShadow: isHighlighted ? 'none' : '1px 1px 5px rgba(0,0,0,0.8)'
                                                    }}
                                                >
                                                    {getPromptText(p)}
                                                </h3>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Timer Bar */}
                    <div className="w-100 mt-4 px-3 flex-shrink-0" style={{ maxWidth: '800px' }}>
                        <div className="display-3 fw-bold text-center text-white mb-2" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                            {timeLeft}s
                        </div>
                        <ProgressBar 
                            animated 
                            now={(timeLeft / 15) * 100} 
                            variant={timeLeft <= 5 ? 'danger' : 'light'} 
                            style={{ 
                                height: '20px', 
                                backgroundColor: 'rgba(255,255,255,0.2)', 
                                backdropFilter: 'blur(5px)',
                                borderRadius: '10px' 
                            }}
                        />
                    </div>

                </div>
            </div>
        );
    }

    // ==========================================
    // 2. JUDGE SCREEN (The Host selecting on Mobile)
    // ==========================================
    if (isJudge) {
        return (
            <Container className='mt-4 d-flex justify-content-center'>
                <Card className='shadow-sm w-100' style={{ maxWidth: '420px' }}>
                    <Card.Body className='text-center'>
                        <Card.Title className='fw-bold mb-3 fs-4 text-primary'>
                            Set the Vibe
                        </Card.Title>
                        <p className='text-muted mb-3'>Pick 1 of the 3 prompts below.</p>

                        <h4 className={`fw-bold mb-4 ${timeLeft <= 5 ? 'text-danger' : 'text-info'}`}>
                            ⏱️ {timeLeft}s
                        </h4>

                        <div className='d-flex flex-column mb-4' style={{ gap: '10px' }}>
                            {prompts.map((promptObj, index) => (
                                <Button
                                    key={index}
                                    variant={selectedPrompt === promptObj ? 'primary' : 'outline-secondary'}
                                    className='text-start p-3 text-wrap'
                                    onClick={() => setSelectedPrompt(promptObj)}
                                >
                                    {getPromptText(promptObj)}
                                </Button>
                            ))}
                        </div>

                        <Button 
                            variant={selectedPrompt ? 'success' : 'secondary'} 
                            size='lg' 
                            className='w-100 fw-bold' 
                            disabled={!selectedPrompt}
                            onClick={handlePromptSubmit}
                        >
                            {selectedPrompt ? "Make 'Em Write!" : "Select a Prompt"}
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // ==========================================
    // 3. PLAYER SCREEN (Waiting on Mobile)
    // ==========================================
    return (
        <Container className='mt-5 d-flex justify-content-center'>
            <Card className='shadow-sm w-100 border-warning' style={{ maxWidth: '420px' }}>
                <Card.Body className='text-center p-5'>
                    <Spinner animation="grow" variant="warning" className='mb-4' style={{ width: '3rem', height: '3rem' }} />
                    <Card.Title className='fw-bold fs-4 text-dark mb-2'>
                        Hold Your Horses...
                    </Card.Title>
                    <Card.Text className='text-muted fs-6'>
                        <strong>{judgeName}</strong> is judging their options. <br/>({timeLeft}s left)
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
}