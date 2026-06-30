import React, { useEffect } from 'react';
import { Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import socket from './socket.js';


// Connect to your backend environment

export default function TriviaCreateButton({ playerName }) {
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for the server to successfully generate the room object
        socket.on('roomCreated', ({ roomCode }) => {
            console.log(`Trivia room ready: ${roomCode}`);
            // Route the creator directly to the lobby as the host
            navigate(`/TriviaWaitingRoom?room=${roomCode}&role=host&name=Host`);
        });

        // Clean up listeners on unmount
        return () => {
            socket.off('roomCreated');
        };
    }, [navigate]);

    const handleCreateRoom = () => {
        console.log("Emitting createRoom event for Trivia...");
        socket.emit('createRoom');
    };

    return (
        <Col xs={6} className='d-grid'>
            <Button 
                variant='primary' 
                size="sm" 
                onClick={handleCreateRoom} 
                className="fw-semibold align-items-center justify-content-center"
            >
                ⛪Temple-Trivia
            </Button>
        </Col>
    );
}