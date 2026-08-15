import React from "react";
import { Card, Badge, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { couchCastSocket as socket } from "../../socket";
import { QRCodeSVG } from 'qrcode.react'; // Import the SVG renderer

export default function CouchCastLobby({ roomCode, players = [], isHost }) {

    const handleShowRules = () => {
        console.log("[Lobby] Clicked 'All in!' - Emitting showRules event for room:", roomCode);
        socket.emit('showRules', { roomCode });
    };

    // Filter out the Caster so they don't show up in the player list
    const activePlayers = players.filter(player => !player.isCaster);
    
    // Find the player designated as the host to display their name
    const hostPlayer = activePlayers.find(player => player.isPlayerHost);
    const hostName = hostPlayer ? hostPlayer.name : "the host";

    // The URL players will navigate to when they scan the code
    const joinUrl = `https://game-temple.org/play?roomCode=${roomCode}`;

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
                                fgColor="#014eb6" // Your custom hex color!
                                level="H"         // High error correction so it scans easily
                                includeMargin={false}
                            />
                        </div>
                        {/* Display the room code for players who can't scan */}
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

                    {isHost ? (
                        <Button
                            variant="primary"
                            className="w-100 fw-bold py-2"
                            disabled={activePlayers.length < 1}
                            onClick={handleShowRules}
                        >
                            {activePlayers.length < 1 ? 'Waiting for Players' : 'All In'}
                        </Button>
                    ) : (
                        <div className="text-muted small py-2 border border-dashed rounded bg-light">
                            Waiting for {hostName} to show the rules...
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}