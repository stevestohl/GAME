import React from "react";
import { Card, Badge, ListGroup, ListGroupItem } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react'; 

// Removed `isHost` from props, as the TV is never the player-host
export default function CouchCastLobby({ roomCode, players = [] }) {

    // Filter out the Caster so they don't show up in the player list
    const activePlayers = players.filter(player => !player.isCaster);
    
    // Find the player designated as the host (the first person who joined)
    const hostPlayer = activePlayers.find(player => player.isPlayerHost);
    const hostName = hostPlayer ? hostPlayer.name : "the first player";

    // The URL players will navigate to when they scan the code
    const joinUrl = `https://game-temple.org/couchcast-setup?roomCode=${roomCode}`;

    return(
        <div className="d-flex justify-content-center align-items-center p-1" style={{ minHeight: '80vh'}}>
            <Card className='shadow-sm w-100' style={{ maxWidth: '450px'}}>
                <Card.Header
                    as='h5'
                    className="d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-wideset text-uppercase fs-6"
                    style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
                    COUCH CAST ROOM CREATED
                </Card.Header>
                
                <Card.Body className='text-center'>
                    <Card.Title className="fs-4 fw-bold text-dark mb-3">Scan to join the game!</Card.Title>

                    {/* --- QR CODE SECTION --- */}
                    <div className="my-4 d-flex flex-column align-items-center">
                        <div className="p-3 bg-white rounded shadow-sm d-inline-block border">
                            <QRCodeSVG 
                                value={joinUrl} 
                                size={180} 
                                fgColor="#014eb6" 
                                level="H"         
                                includeMargin={false}
                            />
                        </div>
                        <div className="mt-3 fs-2 fw-bold" style={{ color: '#014eb6', letterSpacing: '0.15em' }}>
                            {roomCode}
                        </div>
                    </div>
                    {/* ----------------------- */}

                    <h5 className="text-start mb-2 fw-semibold">Players Joined:</h5>
                    <ListGroup className="mb-4 text-start">
                        {activePlayers.map((player) => (
                            <ListGroupItem key={player.id} className="d-flex justify-content-between align-items-center">
                                <span>{player.name}</span>
                                {player.isPlayerHost && (
                                    <Badge bg="primary" className="rounded-pill">Host</Badge>
                                )}
                            </ListGroupItem>
                        ))}
                    </ListGroup>

                    {/* The Caster screen just waits. No buttons here! */}
                    <div className="text-muted fw-bold py-3 border border-dashed rounded bg-light fs-5">
                        {activePlayers.length < 1 
                            ? "Waiting for players to join..." 
                            : `Waiting for ${hostName} to start the game...`}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}