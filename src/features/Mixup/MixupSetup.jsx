import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MixupTile from './MixupTile.jsx';
import { createMixupRoom } from './mixupCreate.js';
import PickerPill, { numberOptions } from '../Menu/PickerPill.jsx';
import { LEVEL_OPTIONS, DEFAULT_LEVEL } from '../../cardDecks.js';
import DeckCard from '../Menu/DeckCard.jsx';
import { MIXUP_DECKS } from '../../cardDecks.js';
import { useGameVisibility } from '../../gameVisibility.js';
import { preloadLobbyMusic } from '../CouchCast/lobbyMusic.js';
import { useSetBackgroundTheme } from '../Menu/backgroundTheme.js';

// A multiple of 3 (the same number of each of the three games), 3 to 48
export const MIXUP_ROUND_OPTIONS = Array.from({ length: 16 }, (_, i) => (i + 1) * 3);
const DEFAULT_MIXUP_ROUNDS = 9;

/**
 * 🎪 3 Ring Circus (Temple Mix Up) setup: what the game is, how many rounds, how hard, then tap a deck to start.
 */
export default function MixupSetup() {
    const { visibleDecks } = useGameVisibility();
    const navigate = useNavigate();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [totalRounds, setTotalRounds] = useState(DEFAULT_MIXUP_ROUNDS);
    const [level, setLevel] = useState(DEFAULT_LEVEL);
    useSetBackgroundTheme('circus');   // 🎪 bears on unicycles, clowns and the big top

    useEffect(() => {
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, []);

    // Start downloading the circus lobby song now, so it plays the moment a deck is tapped
    useEffect(() => { preloadLobbyMusic('mixup'); }, []);

    const each = totalRounds / 3;

    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">3 Ring Circus</Card.Header>

                <Card.Body className="p-2">
                    <Card className="bg-light border-0 shadow-sm m-0">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <MixupTile className="w-100 rounded shadow-sm" />
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        3 Ring Circus
                                        <span className="text-muted fw-normal small ms-2">3+ players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        Three games under one big tent: caption a meme and vote for the funniest, draw and guess
                                        Pictionary-style, then match your friends' answers in Threefold. Cast one extra device to the TV as the main screen.
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <div className="d-flex align-items-center my-2">
                        <hr className="flex-grow-1 my-0 opacity-25" />
                        <span className="mx-2 small fw-bold text-muted text-uppercase">Rounds &amp; Drawing Level</span>
                        <hr className="flex-grow-1 my-0 opacity-25" />
                    </div>

                    {/* How many rounds and how hard to draw, side by side: each opens the phone's own picker */}
                    <div className="gt-picker-row">
                        <PickerPill label="Rounds" value={totalRounds} options={numberOptions(MIXUP_ROUND_OPTIONS)} onChange={setTotalRounds} disabled={isCreatingRoom} />
                        <PickerPill
                            label="Drawing level"
                            value={level}
                            options={LEVEL_OPTIONS.map(({ id, label }) => ({ value: id, label }))}
                            onChange={setLevel}
                            disabled={isCreatingRoom}
                        />
                    </div>

                    <p className="small text-muted text-center mt-2 mb-3">
                        🖼️ {each} meme rounds, then ✏️ {each} Pictionary, then 🤝 {each} Threefold.
                    </p>

                    <div className="d-flex align-items-center mt-3 mb-2">
                        <hr className="flex-grow-1 my-0 opacity-25" />
                        <span className="mx-2 small fw-bold text-muted text-uppercase">Then Tap a Deck to Start</span>
                        <hr className="flex-grow-1 my-0 opacity-25" />
                    </div>

                    <Row className="g-2">
                        {visibleDecks('mixup', MIXUP_DECKS).map((deck, i) => (
                            <Col xs={6} key={deck.id}>
                                <DeckCard
                                    deck={deck}
                                    index={i}
                                    disabled={isCreatingRoom}
                                    onClick={() => createMixupRoom(navigate, setIsCreatingRoom, { totalRounds, level, expansion: deck.id })}
                                    ariaLabel={`Create a 3 Ring Circus room with the ${deck.title}`}
                                />
                            </Col>
                        ))}
                    </Row>

                    <Button
                        variant="outline-secondary"
                        className="w-100 fw-bold mt-3"
                        disabled={isCreatingRoom}
                        onClick={() => navigate('/home')}
                    >
                        Back
                    </Button>
                </Card.Body>
            </Card>

            <Modal show={isCreatingRoom} backdrop="static" keyboard={false} centered>
                <Modal.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <h4 className="fw-bold text-dark">Creating Room...</h4>
                    <p className="text-muted small mb-0">Waking up game server...</p>
                </Modal.Body>
            </Modal>
        </div>
    );
}
