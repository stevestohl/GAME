import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
import HourGlass from '../../assets/logos/HourGlass.gif';

export default function TTTLobby({ roomCode, playerName }) {
    return (
        <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: "80vh" }}>
            <Card className="text-center shadow-lg border-0" style={{ maxWidth: "420px", width: "100%" }}>
                <Card.Header 
                    as="h5" 
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
                    Tic-Tac-Toe Lobby
                </Card.Header>
                
                <Card.Body className="p-4 text-center">
                    {/* Host Identity Badge */}
                    <div className="mb-2 text-muted small fw-semibold">
                        Host: <span className="text-primary fw-bold">{playerName}</span>
                    </div>

                    {/* Hourglass Visual */}
                    <div className="my-1 bg-white p-2 rounded-3 d-inline-block shadow-sm">
                        <img
                            src={HourGlass}
                            alt="Waiting Hourglass"
                            className="img-fluid"
                            style={{ maxWidth: "100px", height: "auto" }}
                        />
                    </div>

                    {/* Hero Box: Room Code + QR Code */}
                    <div className="my-3 bg-light border border-secondary rounded p-3 text-center">                            
                        <span className="text-uppercase tracking-wider small fw-bold text-muted d-block mb-1">
                            Room Code
                        </span>                            
                        <span className="fs-2 fw-black text-dark tracking-widest mb-3 d-block">{roomCode}</span>
                        
                        <div className="bg-white p-2 rounded border d-inline-block shadow-sm">
                            <QRCodeCanvas 
                                value={`https://game-temple.org/join?roomCode=${roomCode}`} 
                                size={130}
                                level={"M"}
                                includeMargin={true}
                            />
                            <span className="text-muted small d-block mt-1 fw-semibold" style={{ fontSize: '0.75rem' }}>
                                Scan to Join Match
                            </span>
                        </div>
                    </div>

                    {/* Status Indicator */}
                    <Badge bg="warning" text="dark" className="p-2 w-100 fs-6">
                        Waiting for opponent to join...
                    </Badge>
                </Card.Body>
            </Card>
        </div>
    );
}