import React from 'react';
import { Container, Card, ListGroup, Badge } from 'react-bootstrap';

export default function CouchCastScoreboardTV({ players }) {
    // Filter out the Caster and sort the rest by score (highest to lowest)
    const rankedPlayers = players
        .filter(p => !p.isCaster)
        .sort((a, b) => b.score - a.score);

    const winner = rankedPlayers[0];

    return (
        <Container className="mt-5 d-flex flex-column align-items-center pb-5 text-center">
            <h2 className="text-warning fw-bold mb-2 tracking-widest text-uppercase">
                Final Standings
            </h2>
            
            {winner && (
                <div className="mb-4">
                    <div className="display-1 mb-2">👑</div>
                    <h1 className="display-4 fw-bold text-white mb-0">
                        {winner.name} Wins!
                    </h1>
                </div>
            )}

            <Card className="shadow-lg w-100 border-0" style={{ maxWidth: '700px', backgroundColor: '#fdfdfd' }}>
                <Card.Body className="p-0">
                    <ListGroup variant="flush" className="rounded">
                        {rankedPlayers.map((player, index) => (
                            <ListGroup.Item 
                                key={player.id} 
                                className={`d-flex justify-content-between align-items-center p-4 ${index === 0 ? 'bg-primary text-white' : ''}`}
                            >
                                <div className="d-flex align-items-center">
                                    <h3 className={`m-0 me-4 fw-bold ${index === 0 ? 'text-warning' : 'text-muted'}`}>
                                        #{index + 1}
                                    </h3>
                                    <h3 className="m-0 fw-bold">{player.name}</h3>
                                </div>
                                
                                <Badge 
                                    bg={index === 0 ? 'warning' : 'secondary'} 
                                    text={index === 0 ? 'dark' : 'light'}
                                    className="fs-4 rounded-pill px-4"
                                >
                                    {player.score} pts
                                </Badge>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>
            
            <h4 className="text-light mt-4 opacity-75">
                Thanks for playing! Close the room to start a new game.
            </h4>
        </Container>
    );
}