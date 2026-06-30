import React from 'react';
import { Button, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ref, set } from 'firebase/database';
import { db } from './firebaseConfig.js';

export default function TttCreateButton() {
    const navigate = useNavigate();

    const handleHostTicTacToe = async () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let randomChars = ''; 

        for (let i = 0; i < 3; i++) {
            randomChars += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        const generatedCode = `T${randomChars}`;

        // Provision the room in Firebase
        await set(ref(db, `rooms/${generatedCode}`), {
            status: 'waiting',
            hostName: 'Player 1',
            guestName: '',
            board: Array(9).fill(null),
            isNext: true
        });

        // Route to the room
        navigate(`/tictactoe?room=${generatedCode}&role=host&name=Player 1`);
    };

    return (
        <Col xs={6} className='d-grid'>
            <Button 
                type="button" 
                variant='primary' 
                size="sm" 
                onClick={handleHostTicTacToe} 
                className="fw-semibold d-flex align-items-center justify-content-center h-100 py-0"
            >
                Tic-Tac-Toe
                ❎🅾️
            </Button>
        </Col>
    );
}