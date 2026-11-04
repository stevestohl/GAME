import React, { useEffect, useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarTheme } from '../../avatars.jsx';
import burglarEmpty from '../../assets/logos/Burglar_Alone.png';
import burglarWithButton from '../../assets/logos/Burglar_with_Button.png';

// Fetched ahead of time (see CouchCastPlayerSetup), so he doesn't turn up empty-handed on a slow connection
export const preloadBurglar = () => [burglarEmpty, burglarWithButton].forEach((src) => { new Image().src = src; });

export default function CouchCastScoreboard({ playerData, players, isGameOver, expansion, nextLabel = 'Next round starting soon...' }) { // 👈 Catching isGameOver
    const navigate = useNavigate();

    // 🥷 The button burglar sneaks in and steals this player's name tile (same timing as the home page)
    const [burglarActive, setBurglarActive] = useState(false);
    const [isStolen, setIsStolen] = useState(false);
    useEffect(() => {
        let stealTimer;
        const initialTimer = setTimeout(() => {
            setBurglarActive(true);
            stealTimer = setTimeout(() => setIsStolen(true), 1200);
        }, 2000);
        return () => {
            clearTimeout(initialTimer);
            clearTimeout(stealTimer);
        };
    }, []);

    // Highest score first. Tied players share a rank, and a lead needs at least one point.
    const rankedPlayers = players
        .filter(p => !p.isCaster)
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    const rankOf = (player) => rankedPlayers.filter(p => (p.score || 0) > (player.score || 0)).length + 1;
    const isFirstPlace = (playerData.score || 0) > 0 && rankOf(playerData) === 1;

    return (
        <Container className="mt-4 d-flex justify-content-center pb-5">
            <Card className="shadow-sm w-100 text-center border-0 bg-light overflow-hidden" style={{ maxWidth: '420px' }}>
                <Card.Header className="bg-dark text-white py-3 border-0">
                    <h4 className="mb-0 fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>
                        {isGameOver ? 'Game Over' : 'Current Standings'}
                    </h4>
                </Card.Header>

                <Card.Body className="p-3">
                    <DeckMascot expansion={expansion} />

                    {isFirstPlace ? (
                        <div className="mb-3">
                            <h3 className="fw-bold text-success mb-1">
                                {isGameOver ? 'Ultimate Champion!' : 'You are in the lead!'}
                            </h3>
                            <p className="text-muted fw-bold mb-0">
                                {isGameOver ? 'You destroyed the competition.' : 'Keep it up!'}
                            </p>
                        </div>
                    ) : (
                        <div className="mb-3">
                            <h3 className="fw-bold text-primary mb-1">
                                {isGameOver ? 'Good Effort.' : 'Time to catch up!'}
                            </h3>
                            <p className="text-muted mb-0">
                                {isGameOver ? 'But not good enough to win.' : 'You can still win this round!'}
                            </p>
                        </div>
                    )}

                    {/* 🎃 A Halloween-deck game: everyone's avatar shows up in costume, same as on the TV */}
                    <AvatarTheme theme={expansion === 'halloween' ? 'halloween' : null}>
                        <div className="cc-scores mb-3">
                            {rankedPlayers.map((player) => (
                                <div key={player.id} className="cc-scores-row">
                                    <span className="cc-scores-rank">{rankOf(player)}</span>
                                    <Avatar id={player.avatar} name={player.name} size={32} />
                                    <span className="cc-scores-name">
                                        {player.id === playerData.id ? (
                                            <span className="cc-scores-loot">
                                                <span className={`gt-loot text-truncate ${isStolen ? 'stolen' : ''}`}>{player.name}</span>
                                                <span className={`burglar-divider ${burglarActive ? 'active' : ''}`}>
                                                    <img
                                                        src={isStolen ? burglarWithButton : burglarEmpty}
                                                        alt=""
                                                        aria-hidden="true"
                                                        style={{ width: '60px', height: 'auto', mixBlendMode: 'multiply' }}
                                                    />
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="text-truncate">{player.name}</span>
                                        )}
                                    </span>
                                    <span className="cc-scores-points">{player.score || 0}</span>
                                </div>
                            ))}
                        </div>
                    </AvatarTheme>

                    {/* Conditional render: Leave the room OR wait for next round */}
                    {isGameOver ? (
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-100 fw-bold py-3 shadow-sm"
                            onClick={() => navigate('/')}
                        >
                            Return to Hub
                        </Button>
                    ) : (
                        <div className="text-muted fw-bold">Look at the TV! {nextLabel}</div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

// 🌟 The picture at the top of the scores: a character for each deck
function DeckMascot({ expansion }) {
    if (expansion === 'halloween') return <JackOLantern />;
    if (expansion === 'holiday') return <Ornament />;
    return <Star />;
}

function Star() {
    return (
        <svg viewBox="0 0 120 110" className="cc-mascot cc-mascot-star" aria-hidden="true">
            <defs>
                <linearGradient id="cc-star-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffe873" />
                    <stop offset="1" stopColor="#ffb31a" />
                </linearGradient>
            </defs>
            <path className="cc-mascot-sparkle" d="M14 18 l2.5 6.5 l6.5 2.5 l-6.5 2.5 l-2.5 6.5 l-2.5 -6.5 l-6.5 -2.5 l6.5 -2.5 z" fill="#ffc933" />
            <path className="cc-mascot-sparkle cc-mascot-sparkle-late" d="M106 12 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill="#4a66d8" />
            <path className="cc-mascot-sparkle cc-mascot-sparkle-later" d="M104 78 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill="#ffc933" />
            <g className="cc-mascot-bob">
                <path
                    d="M60 9 L73.5 37.5 L104.5 41.5 L81.5 62.5 L87.5 93.5 L60 78 L32.5 93.5 L38.5 62.5 L15.5 41.5 L46.5 37.5 Z"
                    fill="url(#cc-star-fill)" stroke="#e08a00" strokeWidth="5" strokeLinejoin="round"
                />
                <ellipse cx="50" cy="50" rx="4" ry="5.5" fill="#16245e" />
                <ellipse cx="70" cy="50" rx="4" ry="5.5" fill="#16245e" />
                <circle cx="51.5" cy="48" r="1.5" fill="#fff" />
                <circle cx="71.5" cy="48" r="1.5" fill="#fff" />
                <path d="M50 61 q10 10 20 0" fill="none" stroke="#16245e" strokeWidth="3.5" strokeLinecap="round" />
                <ellipse cx="41" cy="59" rx="4.5" ry="3" fill="#ff8a5c" opacity="0.7" />
                <ellipse cx="79" cy="59" rx="4.5" ry="3" fill="#ff8a5c" opacity="0.7" />
            </g>
        </svg>
    );
}

function JackOLantern() {
    return (
        <svg viewBox="0 0 120 110" className="cc-mascot cc-mascot-pumpkin" aria-hidden="true">
            <g className="cc-mascot-bob">
                <path d="M55 24 q-1 -13 11 -18 l6 8 q-8 3 -8 11 z" fill="#3f8a3a" stroke="#235c22" strokeWidth="3" strokeLinejoin="round" />
                <ellipse cx="33" cy="62" rx="24" ry="33" fill="#e06a10" stroke="#a84a05" strokeWidth="3" />
                <ellipse cx="87" cy="62" rx="24" ry="33" fill="#e06a10" stroke="#a84a05" strokeWidth="3" />
                <ellipse cx="60" cy="62" rx="26" ry="38" fill="#f58220" stroke="#a84a05" strokeWidth="3" />
                <path d="M23 45 q3 -11 12 -15" fill="none" stroke="#ffc48a" strokeWidth="4" strokeLinecap="round" />
                <g className="cc-mascot-flicker" fill="#ffe14d" stroke="#6b2f00" strokeWidth="2.5" strokeLinejoin="round">
                    <path d="M31 58 L42 41 L52 58 Z" />
                    <path d="M89 58 L78 41 L68 58 Z" />
                    <path d="M60 58 L54 69 H66 Z" />
                    <path d="M25 71 L37 76 L43 70 L52 79 L60 72 L68 79 L77 70 L83 76 L95 71 Q89 93 60 93 Q31 93 25 71 Z" />
                </g>
            </g>
        </svg>
    );
}

function Ornament() {
    return (
        <svg viewBox="0 0 120 110" className="cc-mascot cc-mascot-ornament" aria-hidden="true">
            <path className="cc-mascot-sparkle" d="M14 30 l2.5 6.5 l6.5 2.5 l-6.5 2.5 l-2.5 6.5 l-2.5 -6.5 l-6.5 -2.5 l6.5 -2.5 z" fill="#3ecf83" />
            <path className="cc-mascot-sparkle cc-mascot-sparkle-late" d="M106 44 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill="#ffc933" />
            <g className="cc-mascot-swing">
                <circle cx="60" cy="9" r="5" fill="none" stroke="#a87b12" strokeWidth="3" />
                <rect x="50" y="13" width="20" height="11" rx="2.5" fill="#ffc933" stroke="#a87b12" strokeWidth="3" />
                <circle cx="60" cy="62" r="39" fill="#e23b45" stroke="#94161f" strokeWidth="3" />
                <path d="M23 53 q37 16 74 0 v14 q-37 16 -74 0 z" fill="#fff" opacity="0.92" />
                <path d="M33 39 q6 -10 16 -13" fill="none" stroke="#ffc7cb" strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="50" cy="60" rx="4" ry="5.5" fill="#16245e" />
                <ellipse cx="70" cy="60" rx="4" ry="5.5" fill="#16245e" />
                <path d="M51 69 q9 8 18 0" fill="none" stroke="#16245e" strokeWidth="3.5" strokeLinecap="round" />
            </g>
        </svg>
    );
}
