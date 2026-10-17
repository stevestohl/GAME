import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ReshuffledTile from './ReshuffledTile.jsx';
import { handleCreateReshuffled } from './ReshuffledCreate.jsx';
import { preloadLobbyMusic } from '../CouchCast/lobbyMusic.js';
import { CARD_DECKS, ROUND_OPTIONS } from '../../cardDecks.js';
import RoundsPicker from '../Menu/RoundsPicker.jsx';
import DeckCard from '../Menu/DeckCard.jsx';

/**
 * 🛋️ Couch Cast Re-Shuffled deck selection.
 * Sits between the home page button and the game: shows what Couch Cast Re-Shuffled is,
 * then lets the caster pick which card deck (expansion) the room will use.
 */
export default function ReshuffledDeckSelect() {
    const navigate = useNavigate();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [totalRounds, setTotalRounds] = useState(ROUND_OPTIONS[0]);

    // Global Scroll Unlock Safety Net (same as Home)
    useEffect(() => {
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, []);

    // Start downloading the lobby music now, so it plays the moment a deck is tapped
    useEffect(() => {
        preloadLobbyMusic();
    }, []);

    return (
        <div className="page-container">
            <Card className='main-card'>
                <Card.Header className="main-card-header">
                    Couch Cast Re-Shuffled
                </Card.Header>

                <Card.Body className='p-2'>
                    {/* Game icon + description */}
                    <Card className="bg-light border-0 shadow-sm m-0">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <div className="w-100 rounded shadow-sm overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                                        <ReshuffledTile />
                                    </div>
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        Couch Cast Re-Shuffled
                                        <span className="text-muted fw-normal small ms-2">3+ players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        Our new take on Couch Cast, still in testing. Your hand always has cards that fit the prompt, and each card rewords itself to read right in the blank. Cast one extra device to the TV as the main screen.
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <div className="d-flex align-items-center my-2">
                        <hr className="flex-grow-1 my-0 opacity-25" />
                        <span className="mx-2 small fw-bold text-muted text-uppercase">How Many Rounds?</span>
                        <hr className="flex-grow-1 my-0 opacity-25" />
                    </div>

                    <RoundsPicker
                        options={ROUND_OPTIONS}
                        value={totalRounds}
                        onChange={setTotalRounds}
                        disabled={isCreatingRoom}
                    />

                    <div className="d-flex align-items-center mt-3 mb-2">
                        <hr className="flex-grow-1 my-0 opacity-25" />
                        <span className="mx-2 small fw-bold text-muted text-uppercase">Then Tap a Deck to Start</span>
                        <hr className="flex-grow-1 my-0 opacity-25" />
                    </div>

                    {/* 🃏 Card decks (expansions) */}
                    <Row className="g-2">
                        {CARD_DECKS.map((deck, i) => (
                            <Col xs={6} key={deck.id}>
                                <DeckCard
                                    deck={deck}
                                    index={i}
                                    disabled={isCreatingRoom}
                                    onClick={() => handleCreateReshuffled(null, navigate, setIsCreatingRoom, deck.id, totalRounds)}
                                    ariaLabel={`Create a Couch Cast Re-Shuffled room with the ${deck.title} deck`}
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
