import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tictactoeSocket as socket } from '../../socket.js';

import TTTLobby from './TTTLobby.jsx';
import TictactoeGameScreen from './TictactoeGameScreen.jsx';

export default function TictactoeManager() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const roomCode = searchParams.get('room');
    const playerName = searchParams.get('name') || 'Anonymous';
    const playerRole = searchParams.get('role') || 'guest'; // 👈 Extracted playerRole

    const [roomStatus, setRoomStatus] = useState('loading');
    const [roomData, setRoomData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!roomCode) {
            setErrorMessage('No room code provided!');
            setRoomStatus('error');
            return;
        }

        const emitJoin = () => {
            console.log("Manager emitting joinRoom:", { roomCode, playerName, playerRole });
            // 👈 Included playerRole in socket payload
            socket.emit('joinRoom', { roomCode, playerName, playerRole });
        };

        if (!socket.connected) {
            socket.connect();
        }

        socket.on('connect', emitJoin);
        if (socket.connected) {
            emitJoin();
        }

        // Server-authoritative room state synchronization
        socket.on('roomUpdate', (data) => {
            if (data) {
                console.log("Room updated state:", data);
                setRoomData(data);
                setRoomStatus(data.status);
            }
        });

        socket.on('roomNotFound', () => {
            setErrorMessage('Room not found or expired.');
            setRoomStatus('error');
        });

        socket.on('errorMsg', (msg) => {
            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(''), 5000);
        });

        return () => {
            socket.off('connect', emitJoin);
            socket.off('roomUpdate');
            socket.off('roomNotFound');
            socket.off('errorMsg');
        };
    }, [roomCode, playerName, playerRole]);

    if (roomStatus === 'loading') {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (roomStatus === 'error') {
        return (
            <Container className="mt-5 text-center" style={{ maxWidth: '400px' }}>
                <Alert variant="danger">{errorMessage || 'An error occurred.'}</Alert>
                <button className="btn btn-primary" onClick={() => navigate('/join')}>
                    Back to Join
                </button>
            </Container>
        );
    }

    // Determine roles dynamically using socket ID vs server-stored IDs
    const isHost = roomData?.hostSocketId === socket.id || playerRole === 'host';
    const currentOpponentName = isHost ? (roomData?.guestName || 'Waiting...') : (roomData?.hostName || 'Host');

    return (
        <>
            {errorMessage && (
                <Alert variant="danger" className="text-center m-2 position-absolute w-100" style={{ zIndex: 999 }}>
                    {errorMessage}
                </Alert>
            )}

            {roomStatus === 'waiting' ? (
                <TTTLobby 
                    roomCode={roomCode} 
                    playerName={playerName} 
                />
            ) : (
                <TictactoeGameScreen 
                    roomCode={roomCode}
                    roomData={roomData}
                    playerRole={playerRole}
                    playerName={playerName}
                    opponentName={currentOpponentName}
                />
            )}
        </>
    );
}