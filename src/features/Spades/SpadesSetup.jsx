import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SpadesTile from './SpadesTile.jsx';
import { createSpadesRoom } from './spadesCreate.js';
import PickerPill, { numberOptions } from '../Menu/PickerPill.jsx';
import { preloadLobbyMusic } from '../CouchCast/lobbyMusic.js';
import { useSetBackgroundTheme } from '../Menu/backgroundTheme.js';

export const SPADES_TARGETS = [100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000];
// About how long a game takes: a hand is ~4 minutes, and the winning team scores ~60 a hand (bots playing
// thousands of games: about 5 hands to reach 300)
const minutesFor = (target) => Math.max(5, Math.round(((target / 60) * 4) / 5) * 5);

/**
 * ♠️ Spades setup: what the game is and how many points win it, then start.
 */
export default function SpadesSetup() {
    const navigate = useNavigate();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [target, setTarget] = useState(300);
    useSetBackgroundTheme('spades');

    useEffect(() => {
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, []);

    useEffect(() => { preloadLobbyMusic('default'); }, []);

    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">Spades</Card.Header>

                <Card.Body className="p-2">
                    <Card className="bg-light border-0 shadow-sm m-0">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <SpadesTile className="w-100 rounded shadow-sm" />
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        Spades
                                        <span className="text-muted fw-normal small ms-2">1–4 players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        The classic card game, two teams of two. Bid how many tricks you'll take, then make it.
                                        Your cards are on your phone; bots fill any empty seats.
                                        Cast one extra device to the TV as the table.
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <div className="d-flex align-items-center my-2">
                        <hr className="flex-grow-1 my-0 opacity-25" />
                        <span className="mx-2 small fw-bold text-muted text-uppercase">Play To</span>
                        <hr className="flex-grow-1 my-0 opacity-25" />
                    </div>

                    <div className="gt-picker-row is-single">
                        <PickerPill label="Points" value={target} options={numberOptions(SPADES_TARGETS)} onChange={setTarget} disabled={isCreatingRoom} />
                    </div>
                    <p className="small text-muted text-center mt-2 mb-3">
                        About {minutesFor(target)} minutes. First team to {target} points wins.
                    </p>

                    <Button
                        variant="primary"
                        size="lg"
                        className="w-100 fw-bold"
                        disabled={isCreatingRoom}
                        onClick={() => createSpadesRoom(navigate, setIsCreatingRoom, { target })}
                    >
                        Start Spades
                    </Button>

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
