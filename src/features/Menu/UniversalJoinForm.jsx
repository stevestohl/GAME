import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Toast, ToastContainer } from 'react-bootstrap';
import { Avatar, AvatarPicker, getMyAvatar, setMyAvatar } from '../../avatars.jsx';
import { getRandomFunnyName } from '../../funnyNames.js';
import '../../styles/join.css';

/**
 * 🚪 Join a Room: type the 4-letter code from the TV (or arrive with ?room=ABCD from its QR code),
 * pick a name and an avatar, and jump in. The first letter of the code says which game it is.
 *
 * It fits on one phone screen: the avatar grid takes whatever height is left and scrolls inside its own box
 * (styles in src/styles/join.css). The way home is the Game Temple logo in the nav bar.
 */

const CODE_LENGTH = 4;

export default function UniversalJoinScreen() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [toastMsg, setToastMsg] = useState(location.state?.toastMessage || '');
    // Accepts 'room' or 'roomCode' from URL parameters
    const urlRoomCode = (searchParams.get('room') || searchParams.get('roomCode') || '').toUpperCase().trim();

    const [roomCode, setRoomCode] = useState(urlRoomCode);
    const [codeFocused, setCodeFocused] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [avatar, setAvatar] = useState(() => getMyAvatar());
    const [error, setError] = useState('');
    const [diceRolls, setDiceRolls] = useState(0);
    const codeInputRef = useRef(null);

    useEffect(() => {
        const savedName = localStorage.getItem('templePlayerName');
        setPlayerName(savedName || getRandomFunnyName());
    }, []);

    useEffect(() => {
        if (urlRoomCode) setRoomCode(urlRoomCode);
    }, [urlRoomCode]);

    useEffect(() => {
        if (location.state?.toastMessage) {
            setToastMsg(location.state.toastMessage);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleCodeChange = (e) => {
        setError('');
        setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH));
    };

    const handleRandomizeName = () => {
        setPlayerName(getRandomFunnyName());
        setDiceRolls((n) => n + 1);
    };

    const handleJoin = (e) => {
        e.preventDefault();
        setError('');

        const code = roomCode.toUpperCase().trim();
        if (code.length !== CODE_LENGTH) {
            setError("Enter the 4-letter room code shown on the host's screen.");
            codeInputRef.current?.focus();
            return;
        }
        if (!playerName.trim()) {
            setError('Pick a nickname (or roll the dice for one).');
            return;
        }

        const name = encodeURIComponent(playerName.trim());
        const prefix = code.charAt(0);
        let targetRoute = '';

        switch (prefix) {
            case 'C':
                targetRoute = `/couchcast?room=${code}&role=guest&name=${name}`;
                break;
            case 'M':
                // Temple Mix Up
                targetRoute = `/mixup?room=${code}&role=guest&name=${name}`;
                break;
            case 'S':
                // Couch Cast Re-Shuffled (experimental)
                targetRoute = `/reshuffled?room=${code}&role=guest&name=${name}`;
                break;
            case 'Q':
                targetRoute = `/triviacast?room=${code}&role=guest&name=${name}`;
                break;
            case 'L':
                targetRoute = `/listcast?room=${code}&role=guest&name=${name}`;
                break;
            case 'O':
                targetRoute = `/listopia?room=${code}&name=${name}`;
                break;
            case 'P':
                targetRoute = `/prompt2?room=${code}&role=guest&name=${name}`;
                break;
            case 'T':
                targetRoute = `/tictactoe?room=${code}&role=guest&name=${name}`;
                break;
            case 'R':
                // Routes to the TriviaManager with guest credentials
                targetRoute = `/trivia?room=${code}&role=guest&name=${name}`;
                break;
            default:
                setError(`Hmm, we don't recognize a game starting with '${prefix}'. Check the TV!`);
                return;
        }

        localStorage.setItem('templePlayerName', playerName.trim());
        setMyAvatar(avatar);
        navigate(targetRoute);
    };

    const locked = !!urlRoomCode;
    // The tile the next letter goes in (none once all four are typed)
    const activeSlot = codeFocused && roomCode.length < CODE_LENGTH ? roomCode.length : -1;

    return (
        <div className="page-container gt-join">

            {/* Floating Toast Notification */}
            <ToastContainer
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 99999
                }}
            >
                <Toast show={!!toastMsg} onClose={() => setToastMsg('')} delay={4000} autohide bg="danger">
                    <Toast.Body className="fw-bold text-white text-center px-4 py-2">
                        ⚠️ {toastMsg}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <Card className="main-card gt-join-card">
                <Card.Header className="main-card-header">
                    Join a Room
                </Card.Header>
                <Card.Body className="gt-join-body">
                    <Form onSubmit={handleJoin} className="gt-join-form" noValidate>

                        {/* 🔤 Room code: four tiles, one real input on top of them */}
                        <div className="gt-join-section">
                            <div className="gt-join-label-row">
                                <label htmlFor="gt-join-code" className="gt-join-label">Room code</label>
                                {locked
                                    ? <span className="gt-join-chip">✓ From your link</span>
                                    : <span className="gt-join-hint">Shown on the host's screen</span>}
                            </div>
                            <div className={`gt-code ${locked ? 'is-locked' : ''}`}>
                                {Array.from({ length: CODE_LENGTH }, (_, i) => (
                                    <span
                                        key={`${i}-${roomCode[i] || ''}`}
                                        className={`gt-code-slot ${roomCode[i] ? 'is-filled' : ''} ${i === activeSlot ? 'is-active' : ''}`}
                                        aria-hidden="true"
                                    >
                                        {roomCode[i] || ''}
                                    </span>
                                ))}
                                <input
                                    id="gt-join-code"
                                    ref={codeInputRef}
                                    className="gt-code-input"
                                    type="text"
                                    value={roomCode}
                                    onChange={handleCodeChange}
                                    onFocus={() => setCodeFocused(true)}
                                    onBlur={() => setCodeFocused(false)}
                                    maxLength={CODE_LENGTH}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="characters"
                                    spellCheck={false}
                                    enterKeyHint="go"
                                    aria-label="4-letter room code"
                                    disabled={locked}
                                />
                            </div>
                        </div>

                        {/* 🙂 You: your avatar and your name, as the TV will show them */}
                        <div className="gt-join-section">
                            <label htmlFor="gt-join-name" className="gt-join-label">Your name</label>
                            <div className="gt-join-player">
                                <Avatar id={avatar} size={52} />
                                <div className="gt-join-name">
                                    <Form.Control
                                        id="gt-join-name"
                                        className="gt-join-input"
                                        type="text"
                                        placeholder="Your nickname"
                                        value={playerName}
                                        onChange={(e) => { setError(''); setPlayerName(e.target.value); }}
                                        maxLength={12}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        enterKeyHint="go"
                                    />
                                    <button
                                        type="button"
                                        className="gt-join-dice"
                                        onClick={handleRandomizeName}
                                        title="Random name"
                                        aria-label="Random name"
                                    >
                                        <span key={diceRolls} className={`gt-join-dice-face ${diceRolls ? 'is-rolling' : ''}`} aria-hidden="true">🎲</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 🎭 Avatar: shown next to your name on the TV */}
                        <div className="gt-join-section gt-join-avatars">
                            <span className="gt-join-label">Avatar</span>
                            <AvatarPicker value={avatar} onChange={setAvatar} />
                        </div>

                        {error && <div className="gt-join-error" role="alert">{error}</div>}

                        <button type="submit" className="gt-join-go glass-btn">
                            Jump In!
                        </button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}
