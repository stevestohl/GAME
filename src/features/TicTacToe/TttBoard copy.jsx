import React, { useState } from 'react'
import { Button, Card, Row, Col } from 'react-bootstrap'

export default function TttBoard( { board, isNext, roomCode, socket}) {
    // 1. Grab configuration details straight from the URL parameters
    const params = new URLSearchParams(window.location.search)
    const roomCode = params.get('room') || 'T-UNKNOWN'
    const isHost = params.get('role') === 'host'
    const screenName = params.get('name') || (isHost ? 'Host Player' : 'Guest Player')

    // 2. Core Game State
    // const [board, setBoard] = useState(Array(9).fill(null)) // Array of 9 squares
    // const [isXNext, setIsXNext] = useState(true) // X always goes first

    // Helper: Check for a winner
    const calculateWinner = (squares) => {
        const winningLines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ]
        for (let i = 0; i < winningLines.length; i++) {
            const [a, b, c] = winningLines[i]
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a] // Returns 'X' or 'O'
            }
        }
        // If no squares are empty and there's no winner, it's a draw
        if (squares.every(square => square !== null)) return 'Draw'
        return null
    }

    const winner = calculateWinner(board)

    // Action: Handle Grid Click
    const handleSquareClick = (index) => {
        // Guard clause: Prevent click if square is taken or game is over
        if (board[index] || winner) return

        const boardCopy = [...board]
        boardCopy[index] = isXNext ? 'X' : 'O'
        setBoard(boardCopy)
        setIsXNext(!isXNext)

        /* 🔮 FUTURE SERVER HOOK:
          socket.emit('player-move', { roomCode, index, player: screenName });
        */
    }

    // Action: Reset Board State
    const handleReset = () => {
        setBoard(Array(9).fill(null))
        setIsXNext(true)
    }

    // Action: Exit Room
    const handleLeaveRoom = () => {
        window.location.href = '/home'
    }

    // Dynamic Turn/Status Messaging
    const getStatusMessage = () => {
        if (winner === 'Draw') return "🤝 It's a Tie Game!"
        if (winner) return `🎉 Winner: Player ${winner}!`
        return `🎯 Current Turn: ${isXNext ? 'X' : 'O'}`
    }

    return (
        <Card.Body className='p-4'>
            
            {/* Player Info Dashboard */}
            <div className="mb-4 bg-light p-3 rounded shadow-sm text-start">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted small fw-bold">🏠 ROOM MATCH</span>
                    <span className="badge bg-primary text-uppercase px-2 py-1">{roomCode}</span>
                </div>
                <div className="small text-dark">
                    Playing As: <strong className="text-primary">{screenName}</strong> 
                    <span className="text-muted ms-1">({isHost ? "Host / X" : "Guest / O"})</span>
                </div>
            </div>

            {/* Live Game Status Banner */}
            <h5 className={`fw-bold text-center mb-4 p-2 rounded ${winner ? 'bg-success text-white' : 'text-secondary'}`}>
                {getStatusMessage()}
            </h5>

            {/* THE 3x3 GRID MATRIX */}
            <div className="mx-auto mb-4" style={{ maxWidth: '300px' }}>
                <Row className="g-2 mb-2">
                    {[0, 1, 2].map((index) => (
                        <Col xs={4} key={index}>
                            <Button 
                                variant={board[index] ? "dark" : "outline-secondary"}
                                className="w-100 fw-bold d-flex align-items-center justify-content-center border-2 fs-2"
                                style={{ height: '90px', transition: '0.1s' }}
                                onClick={() => handleSquareClick(index)}
                            >
                                <span className={board[index] === 'X' ? 'text-info' : 'text-warning'}>
                                    {board[index]}
                                </span>
                            </Button>
                        </Col>
                    ))}
                </Row>
                <Row className="g-2 mb-2">
                    {[3, 4, 5].map((index) => (
                        <Col xs={4} key={index}>
                            <Button 
                                variant={board[index] ? "dark" : "outline-secondary"}
                                className="w-100 fw-bold d-flex align-items-center justify-content-center border-2 fs-2"
                                style={{ height: '90px' }}
                                onClick={() => handleSquareClick(index)}
                            >
                                <span className={board[index] === 'X' ? 'text-info' : 'text-warning'}>
                                    {board[index]}
                                </span>
                            </Button>
                        </Col>
                    ))}
                </Row>
                <Row className="g-2">
                    {[6, 7, 8].map((index) => (
                        <Col xs={4} key={index}>
                            <Button 
                                variant={board[index] ? "dark" : "outline-secondary"}
                                className="w-100 fw-bold d-flex align-items-center justify-content-center border-2 fs-2"
                                style={{ height: '90px' }}
                                onClick={() => handleSquareClick(index)}
                            >
                                <span className={board[index] === 'X' ? 'text-info' : 'text-warning'}>
                                    {board[index]}
                                </span>
                            </Button>
                        </Col>
                    ))}
                </Row>
            </div>

            <hr className="my-4 text-muted" />

            {/* Control Panel Actions */}
            <Row className="g-2">
                <Col xs={winner ? 12 : 6} className="d-grid">
                    <Button variant={winner ? "success" : "outline-danger"} className="fw-semibold" onClick={handleReset}>
                        🔄 Reset Arena
                    </Button>
                </Col>
                {!winner && (
                    <Col xs={6} className="d-grid">
                        <Button variant="outline-secondary" className="fw-semibold" onClick={handleLeaveRoom}>
                            🏳️ Forfeit / Quit
                        </Button>
                    </Col>
                )}
            </Row>
        </Card.Body>
    )
}