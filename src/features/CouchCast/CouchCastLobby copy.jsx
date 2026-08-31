import React, { useEffect } from "react";
import { Card, Badge, ListGroup, ListGroupItem } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react'; 
import CCBackground from '../../../public/CouchCastBackground.jpg'

export default function CouchCastLobby({ roomCode, players = [] }) {
  
  useEffect(() => {

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
    };
  }, []); 
  // Function to request fullscreen on the entire document
    // const toggleFullScreen = () => {
    //   if (!document.fullscreenElement) {
    //     document.documentElement.requestFullscreen().catch(err => {
    //       console.warn(`Error attempting to enable fullscreen: ${err.message}`);
    //     });
    //   } else {
    //     if (document.exitFullscreen) {
    //       document.exitFullscreen();
    //     }
    //   }
    // };
  const activePlayers = players.filter(player => !player.isCaster);
  const hostPlayer = activePlayers.find(player => player.isPlayerHost);
  const hostName = hostPlayer ? hostPlayer.name : "the first player";
  const joinUrl = `${window.location.origin}/join?room=${roomCode || ''}`;

  return (
    <div className="fullscreen-gameplay-container">
        {/* <Button 
          variant="outline-secondary" 
          size="sm" 
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}
          onClick={toggleFullScreen}
        >
          Toggle Fullscreen
        </Button> */}
            <div className="shining-border-wrapper">
        
        <Card className="fullscreen-gameplay-card">
          <Card.Header
            as='h5'
            className="fullscreen-gameplay-card-header">
            Couch Cast Room Created
          </Card.Header>

          <Card.Body className='p-4 d-flex flex-column flex-grow-1' style={{ minHeight: 0 }}>
            <div className="row h-100 g-0" style={{ minHeight: 0 }}>
              
              {/* --- LEFT COLUMN: QR CODE SECTION --- */}
              <div className="col-6 d-flex flex-column align-items-center justify-content-center border-end pe-4 h-100">
                <Card.Title className="fs-3 fw-bold text-dark mb-3 text-center">Scan to join!</Card.Title>
                
                {/* Removed maxWidth/maxHeight restrictions and let flexbox/CSS size the container */}
                <div className="p-3 bg-white rounded shadow-sm d-flex justify-content-center align-items-center border flex-grow-1 w-75" style={{ minHeight: 0 }}>
                  <QRCodeSVG 
                    value={joinUrl} 
                    style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    fgColor="#014eb6" 
                    level="H" 
                    includeMargin={false}
                  />
                </div>
                
                <div className="mt-3 display-4 fw-bold flex-shrink-0" style={{ color: '#014eb6', letterSpacing: '0.15em' }}>
                  {roomCode}
                </div>
              </div>

              {/* --- RIGHT COLUMN: PLAYERS SECTION --- */}
              <div className="col-6 d-flex flex-column ps-4 h-100" style={{ minHeight: 0 }}>
                <h5 className="text-start mb-3 fw-semibold fs-4 flex-shrink-0">Players ({activePlayers.length}):</h5>
                
                <ListGroup className="mb-3 text-start flex-grow-1 custom-scrollbar overflow-auto" style={{ minHeight: 0 }}>
                  {activePlayers.map((player) => (
                    <ListGroupItem key={player.id} className="d-flex justify-content-between align-items-center border-0 border-bottom px-3 py-2">
                      <span className="fs-4 text-truncate" style={{ maxWidth: '70%' }}>{player.name}</span>
                      {player.isPlayerHost && (
                        <Badge bg="primary" className="rounded-pill px-3 py-2 fs-6">Host</Badge>
                      )}
                    </ListGroupItem>
                  ))}
                  {activePlayers.length === 0 && (
                    <div className="text-muted fst-italic mt-2 fs-5">No players yet...</div>
                  )}
                </ListGroup>

                <div className="text-muted fw-bold p-3 border border-2 border-dashed rounded bg-light fs-5 text-center flex-shrink-0">
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
  );
}