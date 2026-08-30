import React, { useEffect } from "react";
import { Card, Badge, ListGroup, ListGroupItem } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react'; 

export default function CouchCastLobby({ roomCode, players = [] }) {
  
  useEffect(() => {
    // Create the audio object inside the effect so it only happens once
    const bgMusic = new Audio('/audio/LobbyMusic.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.4; // 40% volume

    // Play it!
    bgMusic.play().catch(err => console.warn("Audio autoplay blocked:", err));

    // Cleanup: Stop the music when the game starts and this component unmounts
    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    };
  }, []); 

  // Filter out the Caster so they don't show up in the player list
  const activePlayers = players.filter(player => !player.isCaster);

  // Find the player designated as the host (the first person who joined)
  const hostPlayer = activePlayers.find(player => player.isPlayerHost);
  const hostName = hostPlayer ? hostPlayer.name : "the first player";

  // The URL players will navigate to when they scan the code
  const joinUrl = `${window.location.origin}/join?room=${roomCode || ''}`;

  return (
    <>
      <style>
        {`
          /* Fullscreen overlay to hide navbars and prevent scrolling */
          .fullscreen-lobby {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100dvh; 
            z-index: 9999;
            background-color: #f8f9fa; 
            overflow: hidden; 
          }
          @keyframes borderShine {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .shining-border-wrapper {
            background: linear-gradient(270deg, #014eb6, #4dd0e1, #014eb6, #f4f4f5);
            background-size: 400% 400%;
            animation: borderShine 6s ease infinite;
            /* Changed from 5px to 2px for a thinner border */
            padding: 2px;
            border-radius: 0.5rem;
            box-sizing: border-box; /* Forces padding to be calculated inward */
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #014eb6;
            border-radius: 4px;
          }
        `}
      </style>

      {/* Removed the p-2 class here to eliminate the white space gap on the screen edges */}
      <div className="fullscreen-lobby d-flex justify-content-center align-items-center">
        
        {/* Changed d-flex to d-flex flex-column so it handles internal height correctly */}
        <div className="shining-border-wrapper shadow-lg w-100 d-flex flex-column" style={{ maxWidth: '900px', maxHeight: '100%' }}>
          
          {/* Replaced h-100 with flex-grow-1, added overflow-hidden to prevent bottom spillover */}
          {/* Changed 5px to 2px in the calc() to match the thinner padding */}
          <Card className="border-0 w-100 flex-grow-1 d-flex flex-column m-0" style={{ borderRadius: 'calc(0.5rem - 2px)', overflow: 'hidden' }}>
            
            <Card.Header
              as='h5'
              className="d-flex align-items-center justify-content-center border-0 py-2 py-md-3 fw-bold text-uppercase fs-6 fs-md-5 m-0 text-center flex-shrink-0"
              style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em' }}>
              Couch Cast Room Created
            </Card.Header>

            <Card.Body className='p-2 p-md-4 d-flex flex-column' style={{ minHeight: 0 }}>
              <div className="row h-100 g-0" style={{ minHeight: 0 }}>
                
                {/* --- LEFT COLUMN: QR CODE SECTION --- */}
                <div className="col-6 d-flex flex-column align-items-center justify-content-center border-end pe-2 pe-md-4 h-100">
                  <Card.Title className="fs-6 fs-md-4 fw-bold text-dark mb-2 mb-md-4 text-center">Scan to join!</Card.Title>
                  
                  <div className="p-2 p-md-3 bg-white rounded shadow-sm d-inline-flex justify-content-center align-items-center border flex-shrink-1" style={{ maxWidth: '250px', maxHeight: '55%' }}>
                    <QRCodeSVG 
                      value={joinUrl} 
                      style={{ width: '100%', height: '100%', maxWidth: '220px', maxHeight: '100%' }}
                      fgColor="#014eb6" 
                      level="H" 
                      includeMargin={false}
                    />
                  </div>
                  
                  <div className="mt-2 mt-md-4 fs-3 fs-md-1 fw-bold flex-shrink-0" style={{ color: '#014eb6', letterSpacing: '0.15em' }}>
                    {roomCode}
                  </div>
                </div>

                {/* --- RIGHT COLUMN: PLAYERS SECTION --- */}
                <div className="col-6 d-flex flex-column ps-2 ps-md-4 h-100" style={{ minHeight: 0 }}>
                  <h5 className="text-start mb-2 mb-md-3 fw-semibold fs-6 fs-md-5 flex-shrink-0">Players ({activePlayers.length}):</h5>
                  
                  <ListGroup className="mb-2 mb-md-4 text-start flex-grow-1 custom-scrollbar overflow-auto" style={{ minHeight: 0 }}>
                    {activePlayers.map((player) => (
                      <ListGroupItem key={player.id} className="d-flex justify-content-between align-items-center border-0 border-bottom px-1 px-md-3 py-1 py-md-2">
                        <span className="fs-6 fs-md-5 text-truncate" style={{ maxWidth: '70%' }}>{player.name}</span>
                        {player.isPlayerHost && (
                          <Badge bg="primary" className="rounded-pill px-2 py-1 px-md-3 py-md-2" style={{ fontSize: '0.7em' }}>Host</Badge>
                        )}
                      </ListGroupItem>
                    ))}
                    {activePlayers.length === 0 && (
                      <div className="text-muted fst-italic mt-2 fs-6">No players yet...</div>
                    )}
                  </ListGroup>

                  <div className="text-muted fw-bold py-1 px-1 py-md-3 px-md-2 border border-2 border-dashed rounded bg-light fs-6 fs-md-5 text-center flex-shrink-0">
                    {activePlayers.length < 1 
                      ? "Waiting for players..." 
                      : `Waiting for ${hostName}...`}
                  </div>
                </div>
                
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
}