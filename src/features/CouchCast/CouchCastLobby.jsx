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

  const bgImageSrc = typeof CCBackground === 'string' ? CCBackground : CCBackground?.src;

  return (
    <div 
      className="fullscreen-gameplay-container"
      style={{
        backgroundImage: `url('/CouchCastBackground.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw'
      }}
    >
      {/* --- LANDSCAPE REMINDER OVERLAY --- */}
      {isPortrait && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 15, 40, 0.95)', color: 'white', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px', textAlign: 'center', backdropFilter: 'blur(5px)'
        }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="white" style={{ marginBottom: '20px', transform: 'rotate(-90deg)', transition: 'transform 1s ease-in-out' }}>
            <path d="M16 1H8C6.9 1 6 1.9 6 3V21C6 22.1 6.9 23 8 23H16C17.1 23 18 22.1 18 21V3C18 1.9 17.1 1 16 1ZM16 19H8V5H16V19Z" />
          </svg>
          <h2 className="fw-bold mb-3">Rotate Your Device</h2>
          <p className="fs-5">Couch Cast is best experienced in landscape mode!</p>
        </div>
      )}

      {/* Added pb-5 and an explicit paddingBottom style to lift the cards higher off the floor */}
      <div className="d-flex flex-column h-100 p-4 pb-5 w-100" style={{ paddingBottom: '3rem' }}>
        
        <h2 className="text-center text-white fw-bold mb-4 flex-shrink-0" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)', letterSpacing: '2px' }}>
          Couch Cast Room Created
        </h2>

        {/* Changed from h-100 to flex-grow-1 so it respects the bottom padding perfectly */}
        <div className="row flex-grow-1 g-4" style={{ minHeight: 0 }}>
          
          {/* --- LEFT COLUMN: QR CODE FLOATING CARD --- */}
          <div className="col-6 d-flex flex-column h-100">
            <div className="shining-border-wrapper">
              <Card className="fullscreen-gameplay-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)' }}>
                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                  <Card.Title className="fs-3 fw-bold text-dark mb-4 text-center">Scan to join!</Card.Title>
                  
                  <div className="p-3 bg-white rounded shadow-sm d-flex justify-content-center align-items-center border flex-grow-1 w-75" style={{ minHeight: 0 }}>
                    <QRCodeSVG 
                      value={joinUrl} 
                      style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      fgColor="#014eb6" 
                      level="H" 
                      includeMargin={false}
                    />
                  </div>
                  
                  <div className="mt-4 display-4 fw-bold flex-shrink-0" style={{ color: '#014eb6', letterSpacing: '0.15em' }}>
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
                <Card.Body className="d-flex flex-column p-4">
                  <h5 className="text-start mb-3 fw-semibold fs-4 flex-shrink-0 text-dark">Players ({activePlayers.length}):</h5>
                  
                  <ListGroup className="mb-3 text-start flex-grow-1 custom-scrollbar overflow-auto bg-transparent border-0" style={{ minHeight: 0 }}>
                    {activePlayers.map((player) => (
                      <ListGroupItem key={player.id} className="d-flex justify-content-between align-items-center border-0 border-bottom border-secondary px-3 py-2 bg-transparent text-dark">
                        <span className="fs-4 text-truncate fw-bold" style={{ maxWidth: '70%' }}>{player.name}</span>
                        {player.isPlayerHost && (
                          <Badge bg="primary" className="rounded-pill px-3 py-2 fs-6 shadow-sm">Host</Badge>
                        )}
                      </ListGroupItem>
                    ))}
                    {activePlayers.length === 0 && (
                      <div className="text-secondary fst-italic mt-2 fs-5">No players yet...</div>
                    )}
                  </ListGroup>

                  <div className="text-dark fw-bold p-3 border border-2 border-primary border-dashed rounded fs-5 text-center flex-shrink-0 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
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