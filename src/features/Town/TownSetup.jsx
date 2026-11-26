import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import TownTile from './TownTile.jsx';
import { createTownRoom } from './townCreate.js';
import PickerPill, { numberOptions } from '../Menu/PickerPill.jsx';
import { preloadLobbyMusic } from '../CouchCast/lobbyMusic.js';
import { useSetBackgroundTheme } from '../Menu/backgroundTheme.js';

// 3 to 20 rounds (the land is usually all sold within about 8; later rounds skip the land grab)
export const TOWN_ROUND_OPTIONS = Array.from({ length: 18 }, (_, i) => i + 3);

/**
 * 🏙️ Temple Town setup: what the game is and how many rounds, then start.
 */
export default function TownSetup() {
    const navigate = useNavigate();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [totalRounds, setTotalRounds] = useState(8);
    useSetBackgroundTheme('town');

    useEffect(() => {
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
    }, []);

    useEffect(() => { preloadLobbyMusic('default'); }, []);

    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">Temple Town</Card.Header>

                <Card.Body className="p-2">
                    <Card className="bg-light border-0 shadow-sm m-0">
                        <Card.Body className="p-2">
                            <Row className="g-2 align-items-center">
                                <Col xs={4}>
                                    <TownTile className="w-100 rounded shadow-sm" />
                                </Col>
                                <Col xs={8} className="text-start">
                                    <div className="fw-bold mb-1">
                                        Temple Town
                                        <span className="text-muted fw-normal small ms-2">3–8 players</span>
                                    </div>
                                    <div className="small text-secondary lh-sm">
                                        Bid on lots in secret, put up Shops and Towers, then pick where to go out each night.
                                        Visitors pay rent to whoever owns the neighborhood. Highest net worth wins.
                                        Cast one extra device to the TV as the main screen.
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

                    <div className="gt-picker-row is-single">
                        <PickerPill label="Rounds" value={totalRounds} options={numberOptions(TOWN_ROUND_OPTIONS)} onChange={setTotalRounds} disabled={isCreatingRoom} />
                    </div>
                    <p className="small text-muted text-center mt-2 mb-3">
                        About {Math.round(totalRounds * 1.75)} minutes. Each round: a headline, a land grab, building, then a night out.
                    </p>

                    <Button
                        variant="primary"
                        size="lg"
                        className="w-100 fw-bold"
                        disabled={isCreatingRoom}
                        onClick={() => createTownRoom(navigate, setIsCreatingRoom, { totalRounds })}
                    >
                        Start Temple Town
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
