import React, { useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { Avatar } from '../../avatars.jsx';

/**
 * 🏛️ The waiting room for the Game-Temple games (Trivia, Prompt 2, Listopia, Tic-Tac-Toe), played on phones with no TV:
 * the game's own moving picture, the code and QR to get friends in, who's here, and the leader's start button
 * pinned under the nav bar so it can't be scrolled away.
 *
 *   game:      which picture ('trivia', 'prompt2', 'listopia', 'tictactoe')
 *   players:   [{ id, name, avatar }]; `meId` marks yours, `leaderId` wears the crown
 *   onStart:   the leader's button (leave it out for no button: Tic-Tac-Toe starts by itself)
 *   startLabel, startDisabledLabel: its words, ready and not ready; `canStart` says which
 *   status:    the line for everyone else ("Waiting for Ann to start the game...")
 */
export default function TempleWaitingRoom({ game, title, roomCode, players = [], meId, leaderId, onStart, canStart = true, startLabel = 'Start Game', startDisabledLabel, status }) {
    const [copied, setCopied] = useState(false);
    const joinUrl = `${window.location.origin}/join?room=${roomCode || ''}`;
    const Picture = PICTURES[game];

    const handleInvite = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title, text: `Join my ${title} game! Room code ${roomCode}`, url: joinUrl });
                return;
            }
            await navigator.clipboard.writeText(joinUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // They closed the share sheet, or this browser won't let us copy: the code's still on screen
        }
    };

    return (
        <>
            {onStart && (
                <div className="tc-leader-bar">
                    <span className="fw-bold text-dark small">👑 Room Leader</span>
                    <Button variant={canStart ? 'primary' : 'secondary'} className="fw-bold flex-grow-1" disabled={!canStart} onClick={onStart}>
                        {canStart ? startLabel : startDisabledLabel}
                    </Button>
                </div>
            )}
            <div className="page-container">
                <Card className="main-card">
                    <Card.Header className="main-card-header">{title}</Card.Header>
                    <Card.Body className="p-3">
                        <div className={`tw-picture tw-picture-${game}`} aria-hidden="true">{Picture && <Picture />}</div>

                        <div className="tw-invite">
                            <div className="tw-invite-code">
                                <div className="tw-label">Room code</div>
                                <div className="tw-code">{roomCode}</div>
                                <button type="button" className="tw-share" onClick={handleInvite}>
                                    {copied ? '✅ Link copied' : '🔗 Invite friends'}
                                </button>
                            </div>
                            <div className="tw-qr">
                                <QRCodeSVG value={joinUrl} size={104} level="M" fgColor="#014eb6" />
                                <div className="tw-qr-label">Scan to join</div>
                            </div>
                        </div>

                        <div className="tw-label text-start mb-2">
                            Players <span className="tw-count">{players.length}</span>
                        </div>
                        <div className="tw-players">
                            {players.map((p) => (
                                <div key={p.id} className={`tw-player ${p.id === meId ? 'is-me' : ''}`}>
                                    <Avatar id={p.avatar} name={p.name} size={30} />
                                    <span className="tw-player-name">{p.name}{p.id === meId ? ' (you)' : ''}</span>
                                    {p.id === leaderId && <span aria-label="Room leader">👑</span>}
                                </div>
                            ))}
                        </div>

                        {status && (
                            <div className="tw-status">
                                <Spinner animation="grow" size="sm" variant="primary" />
                                <span>{status}</span>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </>
    );
}

// --- Each game's picture, on the same blue (300 × 92) ---

function TriviaPicture() {
    // Three contestants' buzzers, lighting up in turn under the questions floating by
    const colors = ['#ff6b6b', '#ffd23f', '#4dd97a'];
    return (
        <svg viewBox="0 0 300 92">
            {[[52, 34, 0], [150, 26, 1], [248, 34, 2]].map(([x, y, i]) => (
                <text key={x} className={`tw-float tw-delay-${i}`} x={x} y={y} textAnchor="middle" fontSize="28" fontWeight="900" fill="#fff" opacity="0.92" fontFamily="system-ui, sans-serif">?</text>
            ))}
            {colors.map((color, i) => {
                const x = 60 + i * 90;
                return (
                    <g key={color}>
                        <rect x={x - 28} y={68} width={56} height={18} rx={5} fill="#16245e" />
                        <ellipse className={`tw-buzz tw-delay-${i}`} cx={x} cy={64} rx={22} ry={10} fill={color} stroke="#fff" strokeWidth={2} />
                    </g>
                );
            })}
        </svg>
    );
}

function Prompt2Picture() {
    // A hand of cards fanning out, with a blank to fill in
    const cards = [[-22, 96, 0], [-7, 128, 1], [7, 160, 2], [22, 192, 3]];
    return (
        <svg viewBox="0 0 300 92">
            {cards.map(([tilt, x, i]) => (
                <g key={x} className={`tw-card tw-delay-${i}`} style={{ transformOrigin: `${x + 6}px 112px` }}>
                    <g transform={`rotate(${tilt} ${x + 6} 112)`}>
                        <rect x={x - 18} y={14} width={48} height={70} rx={6} fill={i === 3 ? '#ffd23f' : '#fff'} stroke="#16245e" strokeWidth={2} />
                        <path d={`M ${x - 10} 30 H ${x + 22} M ${x - 10} 40 H ${x + 14}`} stroke="#3a53c4" strokeWidth={3} strokeLinecap="round" />
                        <path d={`M ${x - 10} 54 H ${x + 22}`} stroke="#e5484d" strokeWidth={3} strokeDasharray="4 3" />
                    </g>
                </g>
            ))}
        </svg>
    );
}

function ListopiaPicture() {
    // Answers on a list, one crossed out for matching someone else's
    const rows = [28, 46, 64];
    return (
        <svg viewBox="0 0 300 92">
            <rect x={76} y={8} width={148} height={78} rx={8} fill="#fff" stroke="#16245e" strokeWidth={2} />
            <rect x={132} y={3} width={36} height={11} rx={3} fill="#ffd23f" stroke="#16245e" strokeWidth={2} />
            {rows.map((y, i) => (
                <g key={y}>
                    <circle cx={94} cy={y} r={5} fill={i === 1 ? '#e5484d' : '#2ea866'} />
                    <rect x={108} y={y - 3} width={i === 2 ? 70 : 96} height={6} rx={3} fill="#93a7f0" />
                </g>
            ))}
            <path className="tw-strike" d="M 104 46 H 208" stroke="#e5484d" strokeWidth={4} strokeLinecap="round" pathLength="1" />
        </svg>
    );
}

function TicTacToePicture() {
    // Marks going down on the board, one after another, over and over
    const x = (cx, cy) => `M ${cx - 9} ${cy - 9} L ${cx + 9} ${cy + 9} M ${cx + 9} ${cy - 9} L ${cx - 9} ${cy + 9}`;
    return (
        <svg viewBox="0 0 300 92">
            <path d="M 128 8 V 84 M 172 8 V 84 M 102 32 H 198 M 102 60 H 198" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
            <path className="tw-mark tw-delay-0" d={x(116, 20)} stroke="#ffd23f" strokeWidth={6} strokeLinecap="round" pathLength="1" fill="none" />
            <circle className="tw-mark tw-delay-1" cx={150} cy={46} r={10} stroke="#ff8fa3" strokeWidth={6} fill="none" pathLength="1" />
            <path className="tw-mark tw-delay-2" d={x(184, 20)} stroke="#ffd23f" strokeWidth={6} strokeLinecap="round" pathLength="1" fill="none" />
            <circle className="tw-mark tw-delay-3" cx={116} cy={72} r={10} stroke="#ff8fa3" strokeWidth={6} fill="none" pathLength="1" />
        </svg>
    );
}

const PICTURES = { trivia: TriviaPicture, prompt2: Prompt2Picture, listopia: ListopiaPicture, tictactoe: TicTacToePicture };
