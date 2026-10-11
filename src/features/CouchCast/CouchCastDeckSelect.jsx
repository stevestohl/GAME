import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import couchCastImg from '../../assets/logos/Couch_Cast_Button.jpg';
import { handleCreateCouchCast } from './CouchCastCreate.jsx';
import { preloadLobbyMusic } from './lobbyMusic.js';
import { CARD_DECKS } from '../../cardDecks.js';
import DeckCard from '../Menu/DeckCard.jsx';

/**
 * 🛋️ Couch Cast deck selection.
 * Sits between the home page button and the game: shows what Couch Cast is,
 * then lets the caster pick which card deck (expansion) the room will use.
 */
export default function CouchCastDeckSelect() {
    const navigate = useNavigate();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

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
                    Couch Cast
                </Card.Header>

                <Card.Body className='p-2'>
                    {/* Game icon + description */}
                    <Card className="bg-light border-0 shadow-sm m-0">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <img
                                        src={couchCastImg}
                                        alt="Couch Cast"
                                        className="w-100 rounded shadow-sm"
                                        style={{ aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                                    />
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        Couch Cast
                                        <span className="text-muted fw-normal small ms-2">3+ players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        An Apples to Apples–style party game. A rotating judge reads a prompt and everyone secretly plays their best card from their phone. Cast one extra device to the TV as the main screen.
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <div className="d-flex align-items-center my-2">
                        <hr className="flex-grow-1 my-0 opacity-25" />
                        <span className="mx-2 small fw-bold text-muted text-uppercase">Choose Your Deck</span>
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
                                    onClick={() => handleCreateCouchCast(null, navigate, setIsCreatingRoom, deck.id)}
                                    ariaLabel={`Create a Couch Cast room with the ${deck.title} deck`}
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
