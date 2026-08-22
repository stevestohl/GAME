import React, { useState } from 'react';
import { Card, Button, Spinner, Badge } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react'; // or your existing QR code component

export default function TicTacToeLobby({ roomCode = 'TSSL', hostName = 'steve' }) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        const joinUrl = `${window.location.origin}/join?roomCode=${roomCode}`;
        navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="page-container">
            <Card className="main-card">
                <Card.Header className="main-card-header">
                    Tic-Tac-Toe Lobby
                </Card.Header>

                <Card.Body className="p-4 text-center">
                    {/* Host Badge */}
                    <div className="mb-3">
                        <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6 fw-normal">
                            Host: <span className="fw-bold">{hostName}</span>
                        </Badge>
                    </div>

                    {/* Borderless Inner Card Container */}
                    <div className="bg-light rounded-4 p-3 mb-3">
                        <div className="text-muted small fw-bold text-uppercase tracking-wider mb-1">
                            Room Code
                        </div>

                        {/* Room Code + Copy Link Button */}
                        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                            <h1 className="fw-black mb-0 text-dark" style={{ letterSpacing: '0.25em' }}>
                                {roomCode}
                            </h1>
                            <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                className="border-0 bg-white shadow-sm px-2"
                                onClick={handleCopyLink}
                                title="Copy Join Link"
                            >
                                {copied ? '✅' : '📋'}
                            </Button>
                        </div>

                        {/* QR Code Container */}
                        <div className="bg-white p-3 rounded-3 d-inline-block shadow-sm">
                            <QRCodeSVG 
                                value={`${window.location.origin}/join?roomCode=${roomCode}`} 
                                size={140} 
                            />
                            <p className="text-muted small fw-semibold mb-0 mt-2">
                                Scan to Join Match
                            </p>
                        </div>
                    </div>

                    {/* Non-Clickable Live Status Indicator */}
                    <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center gap-2">
                        <Spinner animation="grow" size="sm" variant="primary" />
                        <span>Waiting for opponent to join...</span>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}