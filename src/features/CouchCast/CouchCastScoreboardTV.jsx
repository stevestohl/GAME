import React, { useState, useEffect } from 'react';
import { Card, Badge, Spinner } from 'react-bootstrap';

export default function CouchCastScoreboardTV({ players, isGameOver }) {
    const [isPortrait, setIsPortrait] = useState(false);
    
    // Filter out the Caster and sort the rest by score (highest to lowest)
    // To this (add the fallback):
    const rankedPlayers = (players || [])
        .filter(p => !p?.isCaster)
        .sort((a, b) => (b?.score || 0) - (a?.score || 0));

    const leader = rankedPlayers[0];

    // More players = more columns, so the whole table fits on the TV without scrolling
    const columnCount = rankedPlayers.length <= 3 ? 1 : rankedPlayers.length <= 8 ? 2 : 3;
    const rowCount = Math.max(1, Math.ceil(rankedPlayers.length / columnCount));

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
            )}
            
            {/* Header & Leader Banner - compact so the scores get the room */}
            <div className="w-100 text-center flex-shrink-0 px-3" style={{ maxWidth: '800px', marginBottom: '1.5vh' }}>
                <div className="shining-border-wrapper" style={{ borderRadius: '15px' }}>
                    <Card className="border-0 text-white w-100 frosted-glass-panel" style={{ borderRadius: '10px' }}>
                        <Card.Body style={{ padding: 'clamp(0.3rem, 1.5vh, 1rem) 1rem' }}>
                            <h2 className="fw-bold mb-0 text-uppercase" style={{ color: 'var(--gt-gold)', letterSpacing: '2px', textShadow: '1px 1px 4px rgba(0,0,0,0.8)', fontSize: 'clamp(0.85rem, 3.2vh, 1.5rem)' }}>
                                {isGameOver ? 'Final Standings' : 'Current Scores'}
                            </h2>
                            
                            {leader && (
                                <h1 className="fw-bold text-white mb-0" style={{ fontSize: 'clamp(1rem, 4.5vh, 2.2rem)', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                                    👑 {isGameOver ? `${leader.name} Wins the Game!` : `${leader.name} is in the lead!`}
                                </h1>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Scoreboard grid: fills top-to-bottom, then starts a new column */}
            <div className="w-100 flex-grow-1 px-3" style={{ maxWidth: columnCount === 1 ? '750px' : '1100px', minHeight: 0 }}>
                <div
                    className="h-100 overflow-auto custom-scrollbar"
                    style={{
                        display: 'grid',
                        gridAutoFlow: 'column',
                        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${rowCount}, minmax(0, auto))`,
                        alignContent: 'center',
                        gap: 'clamp(0.25rem, 1.2vh, 0.75rem) 0.75rem',
                    }}
                >
                    {rankedPlayers.map((player, index) => {
                        const isLeader = index === 0;
                        return (
                            <div 
                                key={player.id} 
                                className={`d-flex justify-content-between align-items-center ${isLeader ? 'shadow' : 'frosted-glass-panel'}`}
                                style={{ 
                                    // The leader's row is solid white so it stands out from the glass rows
                                    backgroundColor: isLeader ? 'rgba(255, 255, 255, 0.92)' : undefined,
                                    borderRadius: '12px',
                                    padding: 'clamp(0.25rem, 1.4vh, 0.9rem) clamp(0.6rem, 2vh, 1.25rem)',
                                    minWidth: 0,
                                }}
                            >
                                <div className="d-flex align-items-center text-start" style={{ minWidth: 0 }}>
                                    <span className={`fw-bold me-2 me-md-3 flex-shrink-0 ${isLeader ? 'text-primary' : 'text-white-50'}`} style={{ fontSize: 'clamp(0.9rem, 3.6vh, 1.8rem)' }}>
                                        #{index + 1}
                                    </span>
                                    <span className={`fw-bold text-truncate ${isLeader ? 'text-dark' : 'text-white'}`} style={{ fontSize: 'clamp(0.9rem, 3.6vh, 1.8rem)', textShadow: isLeader ? 'none' : '1px 1px 3px rgba(0,0,0,0.8)' }}>
                                        {player.name}
                                    </span>
                                </div>
                                
                                <Badge 
                                    bg={isLeader ? 'primary' : 'light'} 
                                    text={isLeader ? 'light' : 'dark'}
                                    className="rounded-pill shadow-sm fw-bold flex-shrink-0 ms-2"
                                    style={{ fontSize: 'clamp(0.75rem, 3vh, 1.25rem)', padding: '0.8vh 1.6vh' }}
                                >
                                    {player.score} pts
                                </Badge>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Section */}
            <div className="flex-shrink-0 text-center w-100" style={{ marginTop: '1.5vh', paddingBottom: '1.75rem' }}>
                {isGameOver ? (
                    <h4 className="text-white fw-semibold m-0" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)', fontSize: 'clamp(1rem, 2vh, 1.3rem)' }}>
                        Thanks for playing! Close the room to start a new game.
                    </h4>
                ) : (
                    <div className="d-flex align-items-center justify-content-center text-white opacity-90">
                        <Spinner animation="border" size="sm" className="me-2 text-primary" />
                        <h4 className="m-0 fw-semibold" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)', fontSize: 'clamp(1rem, 2vh, 1.3rem)' }}>
                            Next round starting soon...
                        </h4>
                    </div>
                )}
            </div>
        </div>
    );
}