import React, { useMemo } from 'react';
import { Card, Button } from 'react-bootstrap'; 
import { triviaSocket as socket } from '../../socket.js';

export default function QuestionScreen({ roomCode, currentQuestion, playerAnswers }) {
    const hasAnswered = !!playerAnswers?.[socket.id];

    const choices = useMemo(() => {
        if (!currentQuestion) return [];
        
        const incorrects = Array.isArray(currentQuestion.incorrect_answers)
            ? currentQuestion.incorrect_answers.flat()
            : [];
            
        const combined = [...incorrects, currentQuestion.correct_answer];
        return combined.sort((a, b) => a.localeCompare(b));
    }, [currentQuestion]);

    const handleChoiceClick = (selectedChoice) => {
        if (hasAnswered) return; 
        socket.emit('submitAnswer', { roomCode, answer: selectedChoice });
    };

    return (
        <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: "80vh" }}>        
            <Card className="text-center shadow-lg border-0 w-100" style={{ maxWidth: "450px" }}>
                <Card.Header
                    as="h5"
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-bold text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}
                >
                    TRIVIA-TEMPLE
                </Card.Header>
                
                <Card.Body className="p-3">
                    {/* 1. Added w-100 container padding constraint */}
                    <div className="w-100 text-center p-2">
                        
                        {/* 2. Added 'text-break' here so long questions wrap elegantly down */}
                        <Card.Title className="fs-4 fw-bold mb-4 text-dark text-break">
                            {currentQuestion?.question}
                        </Card.Title>

                        <div className="d-grid gap-2">
                            {choices.map((choice, index) => {
                                const isMyChoice = playerAnswers?.[socket.id] === choice;
                                return (
                                    <Button
                                        key={index}
                                        variant={isMyChoice ? "primary" : "outline-secondary"}
                                        disabled={hasAnswered}
                                        onClick={() => handleChoiceClick(choice)}
                                        // 3. Added 'text-break' to the buttons to handle long answers gracefully
                                        className="py-2 fw-semibold text-start px-3 shadow-sm text-break"
                                    >
                                        {choice}
                                    </Button>
                                );
                            })}
                        </div>

                        {hasAnswered && (
                            // 4. Added 'text-break' to the locked message banner
                            <div className="text-muted small py-2 border border-dashed rounded bg-light mt-4 animate-pulse text-break">
                                ⏳ Answer locked! Waiting for remaining players...
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card> 
        </div> 
    );
}