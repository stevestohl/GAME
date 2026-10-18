import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import TriviaCastTile from './TriviaCastTile.jsx';
import { handleCreateTriviaCast } from './TriviaCastCreate.js';
import { preloadLobbyMusic } from '../CouchCast/lobbyMusic.js';
import { TRIVIA_DECKS, QUESTION_OPTIONS } from '../../cardDecks.js';
import DeckCard from '../Menu/DeckCard.jsx';
import RoundsPicker from '../Menu/RoundsPicker.jsx';

/**
 * 📺❔ Trivia Cast setup.
 * Sits between the home page button and the game: says what Trivia Cast is,
 * then the caster picks how many questions and which deck.
 */
export default function TriviaCastDeckSelect() {
    const navigate = useNavigate();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [totalRounds, setTotalRounds] = useState(QUESTION_OPTIONS[0]);

    // Global Scroll Unlock Safety Net (same as Home)
    useEffect(() => {
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, []);

    // Start downloading the lobby music now, so it plays the moment a deck is tapped
    useEffect(() => {
        preloadLobbyMusic('triviaCast');
        preloadLobbyMusic('halloween');
    }, []);

    return (
        <div className="page-container">
            <Card className='main-card'>
                <Card.Header className="main-card-header">
                    Trivia Cast
                </Card.Header>

                <Card.Body className='p-2'>
                    {/* Game icon + description */}
                    <Card className="bg-light border-0 shadow-sm m-0">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <TriviaCastTile className="w-100 rounded shadow-sm" />
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        Trivia Cast
                                        <span className="text-muted fw-normal small ms-2">2+ players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        Trivia night on the big screen. Questions show on the TV and everyone answers on their phone. Cast one extra device to the TV as the main screen.
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <div className="d-flex align-items-center my-2">
                        <hr className="flex-grow-1 my-0 opacity-25" />
                        <span className="mx-2 small fw-bold text-muted text-uppercase">How Many Questions?</span>
                        <hr className="flex-grow-1 my-0 opacity-25" />
                    </div>

                    <RoundsPicker
                        label="Questions"
                        options={QUESTION_OPTIONS}
                        value={totalRounds}
                        onChange={setTotalRounds}
                        disabled={isCreatingRoom}
                    />

                    <div className="d-flex align-items-center mt-3 mb-2">
                        <hr className="flex-grow-1 my-0 opacity-25" />
                        <span className="mx-2 small fw-bold text-muted text-uppercase">Then Tap a Deck to Start</span>
                        <hr className="flex-grow-1 my-0 opacity-25" />
                    </div>

                    {/* 🃏 Question decks (expansions) */}
                    <Row className="g-2">
                        {TRIVIA_DECKS.map((deck, i) => (
                            <Col xs={4} key={deck.id}>
                                <DeckCard
                                    compact
                                    deck={deck}
                                    index={i}
                                    disabled={isCreatingRoom}
                                    onClick={() => handleCreateTriviaCast(navigate, setIsCreatingRoom, deck.id, totalRounds)}
                                    ariaLabel={`Create a Trivia Cast room with the ${deck.title} questions`}
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
                <Modal.Body className='d-flex flex-column align-items-center justify-content-center p-4'>
                    <Spinner animation='border' variant="primary" className='mb-3' />
                    <h4 className='fw-bold text-dark'>Creating Room...</h4>
                    <p className='text-muted small mb-0'>
                        Waking up game server...
                    </p>
                </Modal.Body>
            </Modal>
        </div>
    );
}
