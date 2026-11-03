import { useGameVisibility } from '../../gameVisibility.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, InputGroup, Modal, Spinner, Row, Col } from 'react-bootstrap';
import { getRandomFunnyName } from '../../funnyNames.js';
import { LIST_DECKS, LIST_ROUND_OPTIONS } from '../../cardDecks.js';
import RoundsPicker from '../Menu/RoundsPicker.jsx';
import DeckCard from '../Menu/DeckCard.jsx';
import { ListopiaTile } from './ListTiles.jsx';
import { createListRoom } from './listsCreate.js';

/**
 * 📱📝 Listopia setup: pick your name and how many rounds, then tap a deck to make the room.
 * Whoever makes the room plays too (no TV needed).
 */
export default function ListopiaCreate() {
    const { visibleDecks } = useGameVisibility();
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState('');
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [totalRounds, setTotalRounds] = useState(LIST_ROUND_OPTIONS[0]);

    useEffect(() => {
        const savedName = localStorage.getItem('templePlayerName');
        setPlayerName(savedName || getRandomFunnyName());
    }, []);

    // Tapping a deck goes straight in
    const startWithDeck = (expansion) => {
        const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
        localStorage.setItem('templePlayerName', cleanName);
        createListRoom(navigate, setIsCreatingRoom, { mode: 'phones', expansion, totalRounds, playerName: cleanName });
    };

    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">Host Listopia</Card.Header>
                <Card.Body className="p-3">
                    <Card className="bg-light border-0 shadow-sm mb-3">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <ListopiaTile className="w-100 rounded shadow-sm" />
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        Listopia
                                        <span className="text-muted fw-normal small ms-2">3+ players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        All the fun of List Cast, no TV required. Write a list, watch the matches get crossed out, then vote on the rest, all on your phones.
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Form onSubmit={(e) => e.preventDefault()}>
                        <Form.Group className="mb-3 text-start">
                            <Form.Label className="fw-bold text-secondary small">Your Name</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    size="lg"
                                    type="text"
                                    placeholder="Enter your nickname"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    maxLength={12}
                                    className="text-center fw-bold"
                                    required
                                    disabled={isCreatingRoom}
                                />
                                <Button
                                    variant="outline-primary"
                                    type="button"
                                    onClick={() => setPlayerName(getRandomFunnyName())}
                                    title="Generate Random Name"
                                    className="px-3 fs-5"
                                    disabled={isCreatingRoom}
                                >
                                    🎲
                                </Button>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3 text-start">
                            <Form.Label className="fw-bold text-secondary small">Rounds</Form.Label>
                            <RoundsPicker options={LIST_ROUND_OPTIONS} value={totalRounds} onChange={setTotalRounds} disabled={isCreatingRoom} />
                        </Form.Group>

                        <Form.Group className="mb-4 text-start">
                            <Form.Label className="fw-bold text-secondary small">Tap a Deck to Start</Form.Label>
                            <Row className="g-2">
                                {visibleDecks('listopia', LIST_DECKS).map((deck, i) => (
                                    <Col xs={6} key={deck.id}>
                                        <DeckCard
                                            deck={deck}
                                            index={i}
                                            disabled={isCreatingRoom}
                                            onClick={() => startWithDeck(deck.id)}
                                            ariaLabel={`Start a Listopia game with the ${deck.title} deck`}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Form.Group>

                        <Button variant="outline-secondary" size="sm" className="w-100 mt-2" onClick={() => navigate('/temple')} disabled={isCreatingRoom}>
                            Back to Game-Temple
                        </Button>
                    </Form>
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
