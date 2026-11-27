import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import couchCastImg from '../../assets/logos/Couch_Cast_Button.jpg';
import joinImg from '../../assets/logos/Join_Room_Button.jpeg';
import TriviaCastTile from '../TriviaCast/TriviaCastTile.jsx';
import { ListCastTile } from '../Lists/ListTiles.jsx';
import MixupTile from '../Mixup/MixupTile.jsx';
import TownTile from '../Town/TownTile.jsx';
import SpadesTile from '../Spades/SpadesTile.jsx';
import WordWeaveTile from '../WordWeave/WordWeaveTile.jsx';
import TicTacToeTile from '../TicTacToe/TicTacToeTile.jsx';
import GameRow from './GameRow.jsx';
import CastPartyScene from './CastPartyScene.jsx';
import { useGameVisibility } from '../../gameVisibility.js';
import burglarEmpty from '../../assets/logos/Burglar_Alone.png';
import burglarWithButton from '../../assets/logos/Burglar_with_Button.png';

// 📺 Step icons: white line drawings, same style as the game tiles
const STEP_ICONS = {
    // A spare device beaming to a TV
    mirror: (
        <>
            <rect x="34" y="14" width="56" height="40" rx="5" />
            <path d="M62 54 V62 M50 62 H74" />
            <rect x="8" y="38" width="20" height="34" rx="4" />
            <path d="M15 66 H21" />
            <path d="M32 44 a10 10 0 0 1 8 -6" className="gt-wave w1" />
            <path d="M32 34 a20 20 0 0 1 14 -10" className="gt-wave w2" />
        </>
    ),
    // Three game tiles, one picked
    choose: (
        <>
            <rect x="10" y="20" width="22" height="22" rx="5" className="gt-tile t1" />
            <rect x="38" y="20" width="22" height="22" rx="5" className="gt-tile t2" />
            <rect x="66" y="20" width="22" height="22" rx="5" className="gt-tile t3" />
            <path d="M44 50 L49 64 L52 57 L59 60 Z" className="gt-pointer" />
        </>
    ),
    // A TV with cast waves: the game is on, friends join
    cast: (
        <>
            <g className="gt-cast-tv">
                <rect x="14" y="10" width="70" height="48" rx="6" />
                <path d="M49 58 V66 M37 66 H61" />
            </g>
            <circle cx="24" cy="49" r="2.5" className="gt-cast-dot" />
            <path d="M24 40 a9 9 0 0 1 9 9" className="gt-wave w1" />
            <path d="M24 31 a18 18 0 0 1 18 18" className="gt-wave w2" />
            <path d="M24 22 a27 27 0 0 1 27 27" className="gt-wave w3" />
        </>
    ),
};

const STEPS = [
    {
        icon: 'mirror',
        title: 'Mirror your TV',
        text: 'Grab an extra phone, tablet or laptop and screen-mirror it to your TV (AirPlay, Chromecast, Smart View or an HDMI cable). That device becomes the game screen.',
    },
    {
        icon: 'choose',
        title: 'Choose a game',
        text: 'On that same device, pick one of the games on this page.',
    },
    {
        icon: 'cast',
        title: 'Start & invite friends',
        text: 'Start the game, then everyone scans the QR code on the TV (or taps Join Room and types the code) to play from their own phone.',
    },
];

function HowToSetUp({ show, onClose }) {
    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold fs-5">How to set up</Modal.Title>
            </Modal.Header>
            <Modal.Body className="gt-cast-steps p-2">
                <ol className="gt-cast-steps-list">
                    {STEPS.map((step, i) => (
                        <li key={step.icon} className="gt-cast-step">
                            <span className="gt-cast-step-icon" aria-hidden="true">
                                <svg viewBox="0 0 98 80">{STEP_ICONS[step.icon]}</svg>
                                <span className="gt-cast-step-num">{i + 1}</span>
                            </span>
                            <span className="text-start">
                                <span className="d-block fw-bold text-dark">Step {i + 1}: {step.title}</span>
                                <span className="d-block small text-secondary lh-sm">{step.text}</span>
                            </span>
                        </li>
                    ))}
                </ol>
            </Modal.Body>
        </Modal>
    );
}

const ROW_IMG_STYLE = { objectFit: 'cover', display: 'block' };

// 🎮 Every game on the menu, in order. `phones`: the id of its phone-only version (started from its setup screen).
const GAME_ROWS = [
    {
        id: 'couchcast', phones: 'prompt2', title: 'Couch Cast', players: '3+ players', to: '/couchcast-decks', label: 'Set up a Couch Cast game',
        description: 'An Apples to Apples–style party game. A rotating judge reads a prompt and everyone secretly plays their best card from their phone.',
        tile: <img src={couchCastImg} alt="Couch Cast" className="w-100 h-100" style={ROW_IMG_STYLE} />,
    },
    {
        id: 'triviacast', phones: 'trivia', title: 'Trivia Cast', players: '2+ players', to: '/triviacast-decks', label: 'Set up a Trivia Cast game',
        description: 'Trivia night on the big screen. Questions show on the TV and everyone answers on their phone.',
        tile: <TriviaCastTile />,
    },
    {
        id: 'mixup', title: '3 Ring Circus', players: '3+ players', to: '/mixup-setup', label: 'Set up a 3 Ring Circus game',
        description: "Three games under one big tent: caption a meme and vote for the funniest, draw and guess Pictionary-style, then match your friends' answers.",
        tile: <MixupTile />,
    },
    {
        id: 'town', title: 'Temple Town', players: '3–8 players', to: '/town-setup', label: 'Set up a Temple Town game',
        description: 'Bid on lots in secret, build Shops and Towers, then pick where to go out each night. Visitors pay rent to the owners.',
        tile: <TownTile />,
    },
    {
        id: 'listcast', phones: 'listopia', title: 'List Cast', players: '3+ players', to: '/listcast-setup', label: 'Set up a List Cast game',
        description: 'Write a list on your phone and try not to match anyone. Matching answers get crossed out on the TV, then everyone votes on the rest.',
        tile: <ListCastTile />,
    },
    {
        id: 'spades', title: 'Spades', players: '1–4 players', to: '/spades-setup', label: 'Set up a Spades game',
        description: 'The classic card game, two teams of two. Bid your tricks, then make them. Bots fill any empty seats.',
        tile: <SpadesTile />,
    },
    {
        id: 'wordweave', phones: 'wordweavephones', title: 'Word Weave', players: '2+ players', to: '/wordweave-setup', label: 'Set up a Word Weave game',
        description: 'Race the clock to find words in a grid of letters. Any word someone else also found gets crossed out, so go long!',
        tile: <WordWeaveTile />,
    },
    {
        id: 'tictactoe', phonesOnly: true, title: 'Tic-Tac-Toe', players: '2 players', to: '/tictactoe-create', label: 'Start a Tic-Tac-Toe game',
        description: 'The timeless classic, head to head. Take turns on your own phones: first to get three in a row wins.',
        tile: <TicTacToeTile />,
    },
];

/**
 * 📺 Game-Cast: the landing page, and the one list of games. Most put a shared screen on the TV (a party scene
 * at the top, the "how to cast" steps a tap away); Couch Cast, Trivia Cast, List Cast and Word Weave also play on just
 * phones (picked on their setup screen), and Tic-Tac-Toe is phones only.
 */
export default function GameCastHome() {
    const navigate = useNavigate();
    const location = useLocation();
    const { canSeeGame, isGameHidden } = useGameVisibility();
    const [showSetup, setShowSetup] = useState(false);

    // 🍞 "That game has ended" and friends land here
    const [toastMsg, setToastMsg] = useState(location.state?.toastMessage || '');
    useEffect(() => {
        if (location.state?.toastMessage) {
            setToastMsg(location.state.toastMessage);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // 🥷 The button burglar sneaks in and steals the divider
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

    // Global Scroll Unlock Safety Net
    useEffect(() => {
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, []);

    // 🎮 The games this person can see. A game that also comes on just phones shows if either version is open,
    // and only reads "Hidden" when both are hidden from the public.
    const shownToPublic = (id) => canSeeGame(id) && !isGameHidden(id);
    const rows = GAME_ROWS
        .filter((row) => canSeeGame(row.id) || (row.phones && canSeeGame(row.phones)))
        .map((row) => ({
            ...row,
            hidden: !shownToPublic(row.id) && !(row.phones && shownToPublic(row.phones)),
            note: row.phonesOnly ? '📱 Just phones, no TV' : row.phones && canSeeGame(row.phones) ? '📱 No TV? Plays on just phones too' : null,
        }));

    const imgBtnClass = 'glass-btn w-100 h-100 p-0 overflow-hidden shadow-sm border-0';
    const gameImgBtnClass = 'glass-btn w-100 p-0 overflow-hidden shadow-sm border-0 align-self-center';
    const squareStyle = { aspectRatio: '1 / 1' };
    const imgStyle = { objectFit: 'cover', display: 'block' };

    return (
        <div className="page-container">
            <ToastContainer style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999 }}>
                <Toast show={!!toastMsg} onClose={() => setToastMsg('')} delay={4000} autohide bg="dark">
                    <Toast.Body className="fw-bold text-white text-center px-4 py-2">👋 {toastMsg}</Toast.Body>
                </Toast>
            </ToastContainer>

            <Card className="main-card">
                <Card.Header className="main-card-header">GAME-CAST</Card.Header>

                <Card.Body className="p-2">
                    <CastPartyScene />
                    <div className="text-center mt-1">
                        <Button variant="link" size="sm" className="fw-bold" onClick={() => setShowSetup(true)}>
                            How to set up
                        </Button>
                    </div>
                    <HowToSetUp show={showSetup} onClose={() => setShowSetup(false)} />

                    <Row className="g-2 mt-2">
                        <Col xs={12}>
                            <Button
                                variant="primary"
                                className={imgBtnClass}
                                onClick={() => navigate('/join')}
                                aria-label="Join a room"
                                style={{ '--shimmer-delay': '0s' }}
                            >
                                <img src={joinImg} alt="Join a Room" className="w-100 h-100" style={imgStyle} />
                            </Button>
                        </Col>

                        {/* OR / Cast a New Game — 🥷 the burglar steals the tile behind this text */}
                        <Col xs={12} className="d-flex align-items-center mb-1 position-relative">
                            <hr className="flex-grow-1 my-0 opacity-25" />
                            <span className={`gt-loot mx-2 small fw-bold text-center ${isStolen ? 'stolen' : ''}`}>
                                OR <br />
                                Start a New Game
                            </span>
                            <hr className="flex-grow-1 my-0 opacity-25" />

                            <div className={`burglar-divider ${burglarActive ? 'active' : ''}`}>
                                <img
                                    src={isStolen ? burglarWithButton : burglarEmpty}
                                    alt=""
                                    aria-hidden="true"
                                    style={{ width: '60px', height: 'auto', mixBlendMode: 'multiply' }}
                                />
                            </div>
                        </Col>

                        <Col xs={12}>
                            <Row className="g-1">
                                {rows.map((row, i) => (
                                    <GameRow
                                        key={row.id}
                                        flip={i % 2 === 1}
                                        hidden={row.hidden}
                                        title={row.title}
                                        players={row.players}
                                        description={row.description}
                                        note={row.note}
                                    >
                                        <Button
                                            variant="primary"
                                            className={gameImgBtnClass}
                                            onClick={() => navigate(row.to)}
                                            aria-label={row.label}
                                            style={{ '--shimmer-delay': `${0.4 * (i + 1)}s`, ...squareStyle }}
                                        >
                                            {row.tile}
                                        </Button>
                                    </GameRow>
                                ))}
                            </Row>
                        </Col>

                        <Col xs={12} className="text-center mt-2 mb-1">
                            <Link to="/privacy" className="small gt-privacy-link">Privacy policy</Link>
                            <span className="small text-muted mx-2">·</span>
                            <Link to="/credits" className="small gt-privacy-link">Credits</Link>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}
