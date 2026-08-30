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
      {/* Inline styles for the shining border animation. Move to your CSS file if preferred! */}
      <style>
        {`
          @keyframes borderShine {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .shining-border-wrapper {
            background: linear-gradient(270deg, #014eb6, #4dd0e1, #014eb6, #f4f4f5);
            background-size: 400% 400%;
            animation: borderShine 6s ease infinite;
            padding: 5px; /* Adjust this to make the border thicker or thinner */
            border-radius: 0.5rem; /* Matches Bootstrap card rounding */
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #014eb6;
            border-radius: 4px;
          }
        `}
      </style>

      <div className="d-flex justify-content-center align-items-center p-3" style={{ minHeight: '80vh' }}>
        
        {/* The wrapper that handles the animated background border */}
        <div className="shining-border-wrapper shadow-lg w-100 d-flex" style={{ maxWidth: '900px' }}>
          
          <Card className="border-0 w-100 h-100" style={{ borderRadius: 'calc(0.5rem - 5px)' }}>
            <Card.Header
              as='h5'
              className="d-flex align-items-center justify-content-center border-0 py-3 fw-bold text-uppercase fs-5 m-0"
              style={{ backgroundColor: '#014eb6', color: '#f1f2f5', letterSpacing: '0.2em', borderTopLeftRadius: 'calc(0.5rem - 5px)', borderTopRightRadius: 'calc(0.5rem - 5px)' }}>
              Couch Cast Room Created
            </Card.Header>

            <Card.Body className='p-4'>
              <div className="row h-100">
                
                {/* --- LEFT COLUMN: QR CODE SECTION --- */}
                <div className="col-md-6 d-flex flex-column align-items-center justify-content-center mb-4 mb-md-0 border-md-end">
                  <Card.Title className="fs-4 fw-bold text-dark mb-4">Scan to join the game!</Card.Title>
                  
                  <div className="p-3 bg-white rounded shadow-sm d-inline-block border">
                    <QRCodeSVG 
                      value={joinUrl} 
                      size={220} 
                      fgColor="#014eb6" 
                      level="H" 
                      includeMargin={false}
                    />
                  </div>
                  
                  <div className="mt-4 fs-1 fw-bold" style={{ color: '#014eb6', letterSpacing: '0.15em' }}>
                    {roomCode}
                  </div>
                </div>

                {/* --- RIGHT COLUMN: PLAYERS SECTION --- */}
                <div className="col-md-6 d-flex flex-column px-md-4">
                  <h5 className="text-start mb-3 fw-semibold">Players Joined ({activePlayers.length}):</h5>
                  
                  {/* Added a max height and overflow so a massive lobby doesn't break the layout */}
                  <ListGroup className="mb-4 text-start flex-grow-1 custom-scrollbar overflow-auto" style={{ maxHeight: '300px' }}>
                    {activePlayers.map((player) => (
                      <ListGroupItem key={player.id} className="d-flex justify-content-between align-items-center border-0 border-bottom">
                        <span className="fs-5">{player.name}</span>
                        {player.isPlayerHost && (
                          <Badge bg="primary" className="rounded-pill px-3 py-2">Host</Badge>
                        )}
                      </ListGroupItem>
                    ))}
                    {activePlayers.length === 0 && (
                      <div className="text-muted fst-italic mt-2">No players yet...</div>
                    )}
                  </ListGroup>

                  {/* The Caster screen just waits. No buttons here! */}
                  <div className="text-muted fw-bold py-3 px-2 border border-2 border-dashed rounded bg-light fs-5 text-center mt-auto">
                    {activePlayers.length < 1 
                      ? "Waiting for players to join..." 
                      : `Waiting for ${hostName} to start the game...`}
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