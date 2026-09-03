import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Spinner } from 'react-bootstrap';

export default function CouchCastScoreboardTV({ players, isGameOver }) {
    const [isPortrait, setIsPortrait] = useState(false);
    
    // Filter out the Caster and sort the rest by score (highest to lowest)
    const rankedPlayers = players
        .filter(p => !p.isCaster)
        .sort((a, b) => b.score - a.score);

    const leader = rankedPlayers[0];

    // Detect if the device is in portrait mode
    useEffect(() => {
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };
        
        // Check immediately on mount
        checkOrientation();
        
        // Listen for resizes or orientation changes
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);
        
        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
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
            )} {/* <--- FIXED: Added the missing closing bracket here! */}
            
            {/* Header & Leader Banner */}
            <div className="w-100 text-center flex-shrink-0" style={{ maxWidth: '800px' }}>
                <h2 className="text-warning fw-bold mb-2 text-uppercase fs-3" style={{ letterSpacing: '2px', textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                    {isGameOver ? 'Final Standings' : 'Current Scores'}
                </h2>
                
                {leader && (
                    <div className="mb-2">
                        <div className="display-3 mb-1" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}>👑</div>
                        <h1 className="fw-bold text-white mb-0" style={{ fontSize: 'clamp(1.5rem, 3.5vh, 2.5rem)', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                            {isGameOver ? `${leader.name} Wins the Game!` : `${leader.name} is in the lead!`}
                        </h1>
                    </div>
                )}
            </div>

            {/* Scoreboard List Card */}
            <div className="w-100 flex-grow-1 d-flex align-items-center justify-content-center my-3" style={{ maxWidth: '750px', maxHeight: '58vh' }}>
                <Card className="shadow-lg w-100 border-0 h-100 overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(12px)', borderRadius: '15px' }}>
                    {/* Added custom-scrollbar here */}
                    <Card.Body className="p-0 overflow-auto h-100 custom-scrollbar">
                        <ListGroup variant="flush" className="h-100 bg-transparent">
                            {rankedPlayers.map((player, index) => {
                                const isLeader = index === 0;
                                return (
                                    <ListGroup.Item 
                                        key={player.id} 
                                        className="d-flex justify-content-between align-items-center p-3 p-md-4 border-0"
                                        style={{ 
                                            backgroundColor: isLeader ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                                            transition: 'background-color 0.2s ease-in-out'
                                        }}
                                    >
                                        <div className="d-flex align-items-center text-start">
                                            <h3 className={`m-0 me-3 me-md-4 fw-bold ${isLeader ? 'text-primary' : 'text-white-50'}`} style={{ fontSize: 'clamp(1.2rem, 2.5vh, 1.8rem)' }}>
                                                #{index + 1}
                                            </h3>
                                            <h3 className={`m-0 fw-bold text-truncate ${isLeader ? 'text-dark' : 'text-white'}`} style={{ fontSize: 'clamp(1.2rem, 2.5vh, 1.8rem)', maxWidth: '300px', textShadow: isLeader ? 'none' : '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                                {player.name}
                                            </h3>
                                        </div>
                                        
                                        <Badge 
                                            bg={isLeader ? 'primary' : 'light'} 
                                            text="dark"
                                            className="fs-5 rounded-pill px-3 px-md-4 py-2 shadow-sm fw-bold"
                                        >
                                            {player.score} pts
                                        </Badge>
                                    </ListGroup.Item>
                                );
                            })}
                        </ListGroup>
                    </Card.Body>
                </Card>
            </div>

            {/* Footer Section */}
            <div className="flex-shrink-0 text-center w-100 mt-2">
                {isGameOver ? (
                    <h4 className="text-white fw-semibold m-0" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)', fontSize: 'clamp(1rem, 2vh, 1.3rem)' }}>
                        Thanks for playing! Close the room to start a new game.
                    </h4>
                ) : (
                    <div className="d-flex align-items-center justify-content-center text-white opacity-90">
                        <Spinner animation="border" size="sm" className="me-2 text-warning" />
                        <h4 className="m-0 fw-semibold" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)', fontSize: 'clamp(1rem, 2vh, 1.3rem)' }}>
                            Next round starting soon...
                        </h4>
                    </div>
                )}
            </div>
        </div>
    );
}