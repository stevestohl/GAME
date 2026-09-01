import React, { useEffect, useState } from "react";
import { Card, Badge, ListGroup, ListGroupItem } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react'; 

export default function CouchCastLobby({ roomCode, players = [] }) {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    // Check orientation on load and resize
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    // Wait a brief moment for rendering, then scroll down by 1 pixel
    const timer = setTimeout(() => {
      window.scrollTo(0, 1);
    }, 100);
    
    const bgMusic = new Audio('/audio/LobbyMusic.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.4; 

    bgMusic.play().catch(err => console.warn("Audio autoplay blocked:", err));

    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      window.removeEventListener('resize', checkOrientation);
      clearTimeout(timer);
    };
  }, []); 

  const activePlayers = players.filter(player => !player.isCaster);
  const hostPlayer = activePlayers.find(player => player.isPlayerHost);
  const hostName = hostPlayer ? hostPlayer.name : "the first player";
  const joinUrl = `${window.location.origin}/join?room=${roomCode || ''}`;


  return (
 <div className="fullscreen-gameplay-container">
  
  {/* --- LANDSCAPE REMINDER OVERLAY --- */}
  {isPortrait && (
    <div className="landscape-overlay">
      <svg viewBox="0 0 24 24" className="rotate-device-icon">
        <path d="M16 1H8C6.9 1 6 1.9 6 3V21C6 22.1 6.9 23 8 23H16C17.1 23 18 22.1 18 21V3C18 1.9 17.1 1 16 1ZM16 19H8V5H16V19Z" />
      </svg>
      <h2 className="fw-bold mb-3">Rotate Your Device</h2>
      <p className="fs-5">Couch Cast is best experienced in landscape mode!</p>
    </div>
  )}

  {/* Tightened overall padding. Removed the conflicting inline paddingBottom */}
  <div className="d-flex flex-column h-100 p-3 pb-4 w-100">
    
    {/* Main title uses clamp() to shrink gracefully on short viewports */}
    <h2 className="fullscreen-gameplay-header">
      Couch Cast Room Created
    </h2>
        <div className="row flex-grow-1 g-3" style={{ minHeight: 0 }}>
          
          {/* --- LEFT COLUMN: QR CODE FLOATING CARD --- */}
          <div className="col-6 d-flex flex-column h-100">
            <div className="shining-border-wrapper">
              <Card className="fullscreen-gameplay-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)' }}>
                <Card.Body className="d-flex flex-column align-items-center justify-content-between p-2 p-md-3 overflow-hidden">
                  
                  {/* Flexible title */}
                  <Card.Title 
                    className="fw-bold text-dark mb-1 text-center flex-shrink-0"
                    style={{ fontSize: 'clamp(0.9rem, 2.2vh, 1.4rem)' }}
                  >
                    Scan to join!
                  </Card.Title>
                  
                  {/* QR code container bound dynamically by available height */}
                  <div className="bg-white rounded shadow-sm d-flex justify-content-center align-items-center border flex-grow-1 p-2" style={{ minHeight: 0, aspectRatio: '1/1', maxHeight: '60vh' }}>
                    <QRCodeSVG 
                      value={joinUrl} 
                      style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      fgColor="#014eb6" 
                      level="H" 
                      includeMargin={false}
                    />
                  </div>
                  
                  {/* Room code font scales dynamically so it never breaks layout */}
                  <div 
                    className="fw-bold flex-shrink-0 mt-1" 
                    style={{ 
                      color: '#ffffff', 
                      letterSpacing: '0.15em',
                      fontSize: 'clamp(1.2rem, 3.2vh, 2.2rem)' 
                    }}
                  >
                    {roomCode}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* --- RIGHT COLUMN: PLAYERS FLOATING CARD --- */}
          <div className="col-6 d-flex flex-column h-100">
            <div className="shining-border-wrapper">
              <Card className="fullscreen-gameplay-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)' }}>
                <Card.Body className="d-flex flex-column p-3 p-md-4">
                  <h5 
                    className="text-start mb-2 fw-semibold flex-shrink-0 text-dark"
                    style={{ fontSize: 'clamp(0.9rem, 2.2vh, 1.3rem)' }}
                  >
                    Players ({activePlayers.length}):
                  </h5>
                  
                  <ListGroup className="mb-2 text-start flex-grow-1 custom-scrollbar overflow-auto bg-transparent border-0" style={{ minHeight: 0 }}>
                    {activePlayers.map((player) => (
                      <ListGroupItem key={player.id} className="d-flex justify-content-between align-items-center border-0 border-bottom border-secondary px-2 py-1 bg-transparent text-dark">
                        <span className="text-truncate fw-bold" style={{ maxWidth: '70%', fontSize: 'clamp(0.85rem, 2vh, 1.2rem)' }}>{player.name}</span>
                        {player.isPlayerHost && (
                          <Badge bg="primary" className="rounded-pill px-2 py-1 shadow-sm" style={{ fontSize: 'clamp(0.65rem, 1.5vh, 0.9rem)' }}>Host</Badge>
                        )}
                      </ListGroupItem>
                    ))}
                    {activePlayers.length === 0 && (
                      <div className="text-secondary fst-italic mt-1" style={{ fontSize: 'clamp(0.8rem, 1.8vh, 1.1rem)' }}>No players yet...</div>
                    )}
                  </ListGroup>

                  <div 
                    className="text-dark fw-bold p-2 border border-2 border-primary border-dashed rounded text-center flex-shrink-0 shadow-sm" 
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      fontSize: 'clamp(0.75rem, 1.8vh, 1.1rem)' 
                    }}
                  >
                    {activePlayers.length < 1 
                      ? "Waiting for players..." 
                      : `Waiting for ${hostName}...`}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}