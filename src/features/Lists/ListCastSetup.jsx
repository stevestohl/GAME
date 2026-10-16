import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ListCastTile } from './ListTiles.jsx';
import { createListRoom } from './listsCreate.js';
import { preloadLobbyMusic } from '../CouchCast/lobbyMusic.js';
import { LIST_DECKS, LIST_ROUND_OPTIONS } from '../../cardDecks.js';
import DeckCard from '../Menu/DeckCard.jsx';
import RoundsPicker from '../Menu/RoundsPicker.jsx';

/**
 * 📺📝 List Cast setup.
 * Sits between the home page button and the game: says what List Cast is,
 * then the caster picks how many rounds and which deck.
 */
export default function ListCastSetup() {
    const navigate = useNavigate();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [totalRounds, setTotalRounds] = useState(LIST_ROUND_OPTIONS[0]);

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
            <Card className="main-card">
                <Card.Header className="main-card-header">List Cast</Card.Header>

                <Card.Body className="p-2">
                    <Card className="bg-light border-0 shadow-sm m-0">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <ListCastTile className="w-100 rounded shadow-sm" />
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        List Cast
                                        <span className="text-muted fw-normal small ms-2">3+ players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        Everyone writes a list on their phone. Matching answers get crossed out on the TV, then you vote on the rest. Cast one extra device to the TV as the main screen.
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
                        label="Rounds"
                        options={LIST_ROUND_OPTIONS}
                        value={totalRounds}
                        onChange={setTotalRounds}
                        disabled={isCreatingRoom}
                    />

                    <div className="d-flex align-items-center mt-3 mb-2">
                        <hr className="flex-grow-1 my-0 opacity-25" />
                        <span className="mx-2 small fw-bold text-muted text-uppercase">Then Tap a Deck to Start</span>
                        <hr className="flex-grow-1 my-0 opacity-25" />
                    </div>

                    <Row className="g-2">
                        {LIST_DECKS.map((deck, i) => (
                            <Col xs={6} key={deck.id}>
                                <DeckCard
                                    deck={deck}
                                    index={i}
                                    disabled={isCreatingRoom}
                                    onClick={() => createListRoom(navigate, setIsCreatingRoom, { mode: 'cast', expansion: deck.id, totalRounds })}
                                    ariaLabel={`Create a List Cast room with the ${deck.title} lists`}
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
