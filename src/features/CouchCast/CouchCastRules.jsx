import React from 'react'
import { Container, Card, Button } from 'react-bootstrap' 
import { couchCastSocket as socket } from '../../socket'

export default function CouchCastRules({ roomCode, isHost }) {
    const handleNext = () => {
        console.log(`Sending startPromptSelection event for room: ${roomCode}`)
        socket.emit('startPromptSelection', { roomCode })
    }

    return (
        <Container className='mt-5 d-flex justify-content-center'>
            <Card className='shadow-sm w-100' style={{ maxWidth: '420px' }}>
                <Card.Body className='text-center'>
                    <Card.Title className='fw-bold mb-3 fs-4 text-primary'>
                        How to Play
                    </Card.Title>
                    
                    <div className='text-start fs-6 mb-4 p-3 bg-light rounded border'>
                        <ol className="ps-3 mb-0 text-secondary" style={{ gap: '14px', display: 'flex', flexDirection: 'column' }}>
                            <li>
                                <strong>Host Picks the Prompt:</strong> One player is chosen as the Host each round. They get to pick <strong>1 out of 3 random prompts</strong> to set the vibe.
                            </li>
                            <li>
                                <strong>Players Respond:</strong> The other players look at their hand of <strong>7 options</strong> (6 pre-drawn cards + 1 custom "Write-In") and submit their funniest answer.
                            </li>
                            <li>
                                <strong>Host Judges the Winner:</strong> The Host reads all the submissions anonymously and crowns the winner of the round!
                            </li>
                        </ol>
                    </div>

                    {/* Conditional Rendering based on isHost prop */}
                    {isHost ? (
                        <Button 
                            variant='primary' 
                            size='lg' 
                            className='w-100 fw-bold' 
                            onClick={handleNext}
                        >
                            Start Game
                        </Button>
                    ) : (
                        <div className='p-2 bg-light rounded border border-warning'>
                            <span className='text-muted fw-bold'>Waiting for host to start...</span>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    )
}