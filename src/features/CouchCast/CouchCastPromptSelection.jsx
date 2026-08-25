import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, ProgressBar } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

export default function CouchCastPromptSelection({ 
    isCastScreen, 
    isJudge, 
    judgeName, 
    roomCode,
    prompts = [
        "What's the worst thing to say at a funeral?",
        "Name a sequel that shouldn't exist.",
        "What's hiding under my bed?"
    ] 
}) {
    const [timeLeft, setTimeLeft] = useState(20);
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    useEffect(() => {
        if (!isCastScreen) return; 

        if (timeLeft === 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isCastScreen]);

    const handlePromptSubmit = () => {
        if (!selectedPrompt) return;
        
        console.log(`Sending selected prompt for room: ${roomCode}`);
        // FIXED: Emit 'select_prompt' to match the Node.js backend listener
        socket.emit('select_prompt', { roomCode, selectedPrompt: selectedPrompt });
    };

    // Helper function to handle both dummy strings and MongoDB objects safely
    const getPromptText = (p) => {
        if (!p) return "";
        if (typeof p === 'string') return p;
        // Adjust 'p.prompt' to 'p.text' if your Prompt2 DB schema uses a different key!
        return p.prompt || p.text || "Unknown Prompt"; 
    };

    // ==========================================
    // 1. CAST SCREEN (The TV / Shared Display)
    // ==========================================
    if (isCastScreen) {
        return (
            <Container className='mt-5 d-flex flex-column align-items-center text-center'>
                <h1 className='display-5 fw-bold text-primary mb-4'>
                    <span className="text-warning">{judgeName}</span> is picking the poison...
                </h1>
                
                <Card className='shadow-sm w-100 p-4' style={{ maxWidth: '600px' }}>
                    <div className='display-1 fw-bold text-secondary mb-3'>
                        {timeLeft}
                    </div>
                    <ProgressBar 
                        animated 
                        now={(timeLeft / 20) * 100} 
                        variant={timeLeft <= 5 ? 'danger' : 'info'} 
                        style={{ height: '20px' }}
                    />
                    <div className='mt-3 text-muted fs-5'>
                        Seconds remaining to set the vibe!
                    </div>
                </Card>
            </Container>
        );
    }

    // ==========================================
    // 2. JUDGE SCREEN (The Host selecting)
    // ==========================================
    if (isJudge) {
        return (
            <Container className='mt-4 d-flex justify-content-center'>
                <Card className='shadow-sm w-100' style={{ maxWidth: '420px' }}>
                    <Card.Body className='text-center'>
                        <Card.Title className='fw-bold mb-3 fs-4 text-primary'>
                            Set the Vibe
                        </Card.Title>
                        <p className='text-muted mb-4'>Pick 1 of the 3 prompts below.</p>

                        <div className='d-flex flex-column mb-4' style={{ gap: '10px' }}>
                            {prompts.map((promptObj, index) => (
                                <Button
                                    key={index}
                                    variant={selectedPrompt === promptObj ? 'primary' : 'outline-secondary'}
                                    className='text-start p-3 text-wrap'
                                    onClick={() => setSelectedPrompt(promptObj)}
                                >
                                    {/* FIXED: Safely render the text whether it's a string or an object */}
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
    // 3. PLAYER SCREEN (Waiting for the Judge)
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
                        <strong>{judgeName}</strong> is currently judging their options. Prepare your best answers!
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
}