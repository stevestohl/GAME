import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { couchCastSocket as socket } from '../../socket';

// 🔀 How a card reads in this prompt (see models/ReshuffledCard.js for the tags).
// Every card can still be played; the ones that fit the blank are listed first.
const SLOT_HINTS = {
    thing: 'This one wants a thing',
    action: 'This one wants something you do',
    verb: 'This one wants something to do',
    word: 'This one wants a name',
};

export function cardForSlot(card, slot) {
    const kinds = card.kinds || [];
    switch (slot) {
        case 'thing':
        case 'action':
            return { fits: kinds.includes(slot), text: card.text };
        case 'verb':
            return card.forms?.verb ? { fits: true, text: card.forms.verb } : { fits: false, text: card.text };
        case 'word':
            return card.forms?.bare ? { fits: true, text: card.forms.bare } : { fits: false, text: card.text };
        default:
            return { fits: true, text: card.text };
    }
}

const LONG_PRESS_MS = 500;

// 🔄 What a whole new hand costs (the server takes it off the score; it can go below zero)
const NEW_HAND_COST = 50;

/** One card in the hand: tap to play it, press and hold for its alternates (when it has any) */
function HandCard({ card, text, fits, onPlay, onLongPress }) {
    const timer = useRef(null);
    const didLongPress = useRef(false);
    const hasAlternates = (card.alternates || []).length > 0;

    const startPress = () => {
        didLongPress.current = false;
        if (!hasAlternates) return;
        timer.current = setTimeout(() => {
            didLongPress.current = true;
            if (navigator.vibrate) navigator.vibrate(15);
            onLongPress(card);
        }, LONG_PRESS_MS);
    };
    const endPress = () => clearTimeout(timer.current);

    return (
        <Button
            variant="outline-secondary"
            // text-dark: the outline button's hover turns text white, which vanishes on this white card
            className={`text-start p-3 text-wrap fw-bold shadow-sm bg-white text-dark cc-tap-option d-flex justify-content-between align-items-center gap-2 ${fits ? '' : 'opacity-75'}`}
            style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
            onPointerDown={startPress}
            onPointerUp={endPress}
            onPointerLeave={endPress}
            onPointerCancel={endPress}
            onContextMenu={(e) => { if (hasAlternates) e.preventDefault(); }}
            onClick={() => { if (!didLongPress.current) onPlay(text); }}
        >
            <span>{text}</span>
            {hasAlternates && <span className="small text-muted fw-normal flex-shrink-0" aria-hidden="true" title="Press and hold for more">⋯</span>}
        </Button>
    );
}

/** ⭐ The judge's job while everyone writes: star the prompts that made them laugh (for an All-Stars deck) */
function PromptStars({ roomCode, promptOptions = [], judgeStars = [], currentPrompt }) {
    const starred = new Set(judgeStars);
    if (!promptOptions.length) return null;

    const toggle = (prompt) => {
        socket.emit('star_prompt', { roomCode, promptId: prompt._id, starred: !starred.has(String(prompt._id)) });
    };

    return (
        <div className="text-start mt-4">
            <div className="fw-bold text-dark mb-1">⭐ Any funny prompts?</div>
            <p className="small text-muted mb-2">Star as many as you like. The best ones go in an All-Stars deck.</p>
            <div className="d-flex flex-column gap-2">
                {promptOptions.map((prompt) => {
                    const isStarred = starred.has(String(prompt._id));
                    const isPicked = String(prompt._id) === String(currentPrompt?._id);
                    return (
                        <Button
                            key={prompt._id}
                            variant={isStarred ? 'warning' : 'outline-secondary'}
                            className="text-start p-2 text-wrap d-flex align-items-start gap-2"
                            aria-pressed={isStarred}
                            onClick={() => toggle(prompt)}
                        >
                            <span className="fs-5 lh-1" aria-hidden="true">{isStarred ? '★' : '☆'}</span>
                            <span className="small fw-bold">
                                {prompt.text}
                                {isPicked && <span className="d-block fw-normal text-muted">(this round's prompt)</span>}
                            </span>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

export default function CouchCastWritingPlayer({ roomCode, currentPrompt, endTime, isJudge, hasSubmitted, hasUsedWriteIn, promptOptions, judgeStars }) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [writeIn, setWriteIn] = useState("");
    
    // NEW: State to hold the real database cards
    const [playerHand, setPlayerHand] = useState([]);

    // Timer Sync
    useEffect(() => {
        if (!endTime) return;
        const updateTime = () => {
            const remaining = Math.floor((endTime - Date.now()) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    // NEW: Fetch hand from the backend
    useEffect(() => {
        if (!isJudge && !hasSubmitted) {
            socket.emit('request_hand');
            
            socket.on('receive_hand', (data) => {
                setPlayerHand(data.hand);
            });
        }
        
        return () => socket.off('receive_hand');
    }, [isJudge, hasSubmitted]);

    const getPromptText = (p) => {
        if (!p) return "";
        if (typeof p === 'string') return p;
        return p.prompt || p.text || "Unknown Prompt";
    };

    // Tapping a card plays it straight away, in the wording shown on it
    const handlePlayCard = (card, text = card.text) => {
        setAlternatesFor(null);
        socket.emit('submit_answer', { roomCode, answer: text, cardId: card._id, usedWriteIn: false });
    };

    // 🔀 The prompt's blank decides how each card reads, and which ones go to the top
    const slot = currentPrompt?.slot || 'any';
    const shownHand = playerHand.map((card) => ({ card, ...cardForSlot(card, slot) }));
    const goodFits = shownHand.filter((c) => c.fits);
    const wildCards = shownHand.filter((c) => !c.fits);

    // Press and hold: the card's funny alternates
    const [alternatesFor, setAlternatesFor] = useState(null);

    // 🔄 Swap the whole hand for a new one, for points. First tap asks, second tap pays.
    const [confirmNewHand, setConfirmNewHand] = useState(false);
    const handleNewHand = () => {
        if (!confirmNewHand) {
            setConfirmNewHand(true);
            return;
        }
        setConfirmNewHand(false);
        setPlayerHand([]);   // shows "Drawing cards..." until the new hand arrives
        socket.emit('new_hand', { roomCode });
    };

    // The write-in is the only answer that needs a send button
    const handleSendWriteIn = (e) => {
        e.preventDefault();
        const answer = writeIn.trim();
        if (!answer) return;
        socket.emit('submit_answer', { roomCode, answer, usedWriteIn: true });
    };

    // ==========================================
    // 1. JUDGE VIEW (Waiting for answers)
    // ==========================================
    if (isJudge) {
        return (
            <Container className="mt-5 d-flex justify-content-center">
                <Card className="shadow-sm w-100 border-primary" style={{ maxWidth: '420px' }}>
                    <Card.Body className="text-center p-4">
                        <h3 className="text-primary fw-bold mb-3">You set the vibe!</h3>
                        <h5 className="text-dark mb-4">"{getPromptText(currentPrompt)}"</h5>
                        <Spinner animation="border" variant="primary" className="mb-3" />
                        <p className="text-muted">Waiting for players to submit their answers...</p>
                        <h4 className={`fw-bold mt-4 ${timeLeft <= 10 ? 'text-danger' : 'text-info'}`}>⏱️ {timeLeft}s</h4>
                        <PromptStars roomCode={roomCode} promptOptions={promptOptions} judgeStars={judgeStars} currentPrompt={currentPrompt} />
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // ==========================================
    // 2. PLAYER VIEW (Answer Locked In)
    // ==========================================
    if (hasSubmitted) {
        return (
            <Container className="mt-5 d-flex justify-content-center">
                <Card className="shadow-sm w-100 bg-success text-white border-0" style={{ maxWidth: '420px' }}>
                    <Card.Body className="text-center p-5">
                        <h1 className="display-1 mb-3">✅</h1>
                        <h2 className="fw-bold mb-3">Answer Locked!</h2>
                        <p className="fs-5">Waiting for the rest of the room...</p>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // ==========================================
    // 3. PLAYER VIEW (Currently Writing)
    // ==========================================
    return (
        <Container className="mt-4 pb-4 d-flex justify-content-center">
            <Card className="shadow-sm w-100 border-0" style={{ maxWidth: '450px' }}>
                <Card.Header className="bg-primary text-white text-center py-4 border-0">
                    <h4 className="mb-0 fw-bold lh-base">{getPromptText(currentPrompt)}</h4>
                </Card.Header>
                
                <Card.Body className="p-4 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-muted text-uppercase small">Tap your answer:</span>
                        <span className={`fw-bold fs-5 ${timeLeft <= 10 ? 'text-danger' : 'text-info'}`}>⏱️ {timeLeft}s</span>
                    </div>
                    {SLOT_HINTS[slot] && <p className="small text-muted mb-3">💡 {SLOT_HINTS[slot]}, so those cards are on top.</p>}

                    <div className="d-flex flex-column gap-2">
                        {/* Render real cards, with a loading state just in case */}
                        {playerHand.length === 0 ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="secondary" />
                                <p className="text-muted mt-2 mb-0">Drawing cards...</p>
                            </div>
                        ) : (
                            <>
                                {goodFits.map(({ card, text }) => (
                                    <HandCard key={card._id} card={card} text={text} fits onPlay={(t) => handlePlayCard(card, t)} onLongPress={setAlternatesFor} />
                                ))}
                                {wildCards.length > 0 && (
                                    <div className="text-center small text-muted text-uppercase fw-bold mt-2">
                                        {goodFits.length ? 'Wild cards (might read funny)' : 'Your cards'}
                                    </div>
                                )}
                                {wildCards.map(({ card, text }) => (
                                    <HandCard key={card._id} card={card} text={text} fits={false} onPlay={(t) => handlePlayCard(card, t)} onLongPress={setAlternatesFor} />
                                ))}
                            </>
                        )}
                        
                        {/* Custom Write-In Option: type it, then hit send. One per game:
                            once it's used, the server deals a 7th card in its place. */}
                        {!hasUsedWriteIn && (
                        <Card className="shadow-sm mt-2 border-0">
                            <Card.Body className="p-2">
                                <Form onSubmit={handleSendWriteIn}>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="✍️ Write your own (1 per game)"
                                            value={writeIn}
                                            onChange={(e) => setWriteIn(e.target.value)}
                                            className="fw-bold border-0 shadow-none fs-5 py-2"
                                            maxLength={60}
                                            aria-label="Custom write-in answer"
                                        />
                                        <Button
                                            type="submit"
                                            variant={writeIn.trim() ? 'success' : 'secondary'}
                                            className="fw-bold px-3 rounded"
                                            disabled={!writeIn.trim()}
                                            aria-label="Send write-in answer"
                                        >
                                            Send
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Card.Body>
                        </Card>
                        )}

                        {playerHand.length > 0 && (
                            <div className="d-flex gap-2 mt-2">
                                <Button
                                    variant={confirmNewHand ? 'warning' : 'outline-secondary'}
                                    className="fw-bold flex-grow-1"
                                    onClick={handleNewHand}
                                >
                                    {confirmNewHand ? `Yes, pay ${NEW_HAND_COST} points` : `🔄 New hand (costs ${NEW_HAND_COST} points)`}
                                </Button>
                                {confirmNewHand && (
                                    <Button variant="outline-secondary" className="fw-bold" onClick={() => setConfirmNewHand(false)}>
                                        Keep
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* ⋯ Press and hold: the same card, said other ways */}
            <Modal show={!!alternatesFor} onHide={() => setAlternatesFor(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5">Play it another way</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex flex-column gap-2">
                    {/* The card itself, then each alternate, all worded for this prompt's blank */}
                    {alternatesFor && [alternatesFor, ...(alternatesFor.alternates || []).map((alt) => ({ ...alt, kinds: alternatesFor.kinds }))]
                        .map((version) => cardForSlot(version, slot).text)
                        .map((text, i) => (
                        <Button
                            key={i}
                            variant={i === 0 ? 'outline-secondary' : 'outline-primary'}
                            className="text-start p-3 text-wrap fw-bold"
                            onClick={() => handlePlayCard(alternatesFor, text)}
                        >
                            {text}
                        </Button>
                    ))}
                </Modal.Body>
            </Modal>
        </Container>
    );
}