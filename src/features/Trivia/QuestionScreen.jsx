import React, { useMemo } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { triviaSocket as socket } from '../../socket.js';

export default function QuestionScreen({ roomCode, currentQuestion, playerAnswers }) {
    // Check if this specific player has logged an answer already
    const hasAnswered = playerAnswers.hasOwnProperty(socket.id);

    // Stably merge correct and incorrect options together
    const choices = useMemo(() => {
        if (!currentQuestion) return [];
        
        // Flatten array just in case your data parsing maps it deeply
        const incorrects = Array.isArray(currentQuestion.incorrect_answers)
            ? currentQuestion.incorrect_answers.flat()
            : [];
            
        const combined = [...incorrects, currentQuestion.correct_answer];
        
        // Sorts choices alphabetically so all devices see buttons in identical positions
        return combined.sort((a, b) => a.localeCompare(b));
    }, [currentQuestion]);

    const handleChoiceClick = (selectedChoice) => {
        if (hasAnswered) return; // Prevention lock
        socket.emit('submitAnswer', { roomCode, answer: selectedChoice });
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="shadow-sm w-100" style={{ maxWidth: '460px' }}>
                <Card.Body className="text-center">
                    {/* <Card.Text className="text-muted small mb-1 uppercase tracking-wider fw-bold">
                        Question Station
                    </Card.Text> */}
                    <Card.Title className="fs-4 fw-bold mb-4 text-dark">
                        {currentQuestion?.question}
                    </Card.Title>

                    <div className="d-grid gap-2.5">
                        {choices.map((choice, index) => {
                            const isMyChoice = playerAnswers[socket.id] === choice;
                            return (
                                <Button
                                    key={index}
                                    variant={isMyChoice ? "primary" : "outline-secondary"}
                                    disabled={hasAnswered}
                                    onClick={() => handleChoiceClick(choice)}
                                    className="py-2.5 fw-semibold text-start px-3 shadow-sm"
                                >
                                    {choice}
                                </Button>
                            );
                        })}
                    </div>

                    {hasAnswered && (
                        <div className="text-muted small py-2 border border-dashed rounded bg-light mt-4 animate-pulse">
                            ⏳ Answer locked! Waiting for remaining players...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}