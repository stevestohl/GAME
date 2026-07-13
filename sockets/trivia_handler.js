import Temple_Trivia from "../models/Temple_Trivia.js";
/**
 * trivia_handler.js
 * Manages game state, answer validation, and score tracking.
 */

// In-memory state storage for active Trivia rooms
const activeRooms = {};

const createRoomLogic = (socket, roomsObject) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
    let randomLetters = '';
    
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        randomLetters += alphabet.charAt(randomIndex);
    }
    
    const finalRoomCode = `R${randomLetters}`;
    
    roomsObject[finalRoomCode] = {
        roomCode: finalRoomCode,
        players: [{ id: socket.id, name: 'Host / Creator', score: 0 }]
    };
    
    return { 
        roomCode: finalRoomCode, 
        players: roomsObject[finalRoomCode].players 
    };
};

// ============================================================
// 1. Primary Real-Time Namespace Handler (Default Export)
// ============================================================
export default function registerTriviaNamespace(namespace) {
    namespace.on('connection', (socket) => {
        console.log(`Trivia User Connected: ${socket.id}`);

        // --- Event: Room Creation ---
        socket.on('createRoom', () => {
            const { roomCode, players } = createRoomLogic(socket, activeRooms);
            socket.join(roomCode);
            socket.emit('roomCreated', { roomCode, players });
        });

        // --- Event: Room Joining ---
        socket.on('joinRoom', ({ roomCode, playerName }) => {
            if (!roomCode) return socket.emit('errorMsg', 'Room code is missing.');
            
            const code = roomCode.trim().toUpperCase();
            const currentRoom = activeRooms[code];
            
            if (currentRoom) {
                socket.join(code);
                
                const playerExists = currentRoom.players.some(p => p.id === socket.id);
                
                if (!playerExists) {
                    currentRoom.players.push({ 
                        id: socket.id, 
                        name: playerName || 'Anonymous', 
                        score: 0 
                    });
                } else {
                    const index = currentRoom.players.findIndex(p => p.id === socket.id);
                    currentRoom.players[index].name = playerName || 'Anonymous';
                }
                
                namespace.to(code).emit('roomUpdated', { 
                    roomCode: code, 
                    players: currentRoom.players 
                });
            } else {
                socket.emit('errorMsg', 'Trivia room not found.');
            }
        });

        // --- Event: Start Game ---
        socket.on('startGame', async ({ roomCode }) => {
            if (!roomCode) return;
            const code = roomCode.trim().toUpperCase();
            const currentRoom = activeRooms[code];
            
            if (currentRoom) {
                try {
                    // Fetching data cleanly as pure JSON
                    const dbQuestions = await Temple_Trivia.find({}).limit(3).lean();

                    if (!dbQuestions || dbQuestions.length === 0) {
                        return socket.emit('errorMsg', 'No trivia questions found in the database.');
                    }
                    
                    currentRoom.phase = 'RULES'; 
                    currentRoom.currentRound = 0;
                    currentRoom.playerAnswers = {};
                    currentRoom.questions = dbQuestions;
                    
                    console.log(`🎰 Room ${code} initialized with ${dbQuestions.length} DB questions.`);
                
                    namespace.to(code).emit('roomStateUpdated', currentRoom);
                } catch (error) {
                    console.error("Database fetch error during startGame:", error.message);
                    socket.emit('errorMsg', 'Failed to fetch trivia questions from database.');
                }
            } else {
                socket.emit('errorMsg', 'Cannot start game. Room not found.');
            }
        });

        // --- Event: Next Round ---
        socket.on('nextRound', ({ roomCode }) => {
            console.log(`➡️ Received 'nextRound' event from client for room: ${roomCode}`);
            if (!roomCode) return;
            
            const code = roomCode.trim().toUpperCase();
            const currentRoom = activeRooms[code];

            if (currentRoom) {
                currentRoom.phase = 'QUESTION';
                console.log(`🔄 Broadcasting phase transition 'QUESTION' to room: ${code}`);
                namespace.to(code).emit('roomStateUpdated', currentRoom);
            } else {
                console.log(`❌ Failed 'nextRound': Room ${code} not found in activeRooms.`);
                socket.emit('errorMsg', 'Cannot start round. Room not found.');
            }
        });

        // --- Event: Player Answer Submissions ---
        socket.on('submitAnswer', ({ roomCode, answer }) => {
            if (!roomCode) return;
            const code = roomCode.trim().toUpperCase();
            const currentRoom = activeRooms[code];

            if (!currentRoom) return;

            // Record this player's answer text
            currentRoom.playerAnswers[socket.id] = answer;

            // Evaluate correctness using the current round's question
            const currentQuestion = currentRoom.questions[currentRoom.currentRound];
            if (currentQuestion && currentQuestion.correct_answer === answer) {
                // Find the player profile in the array and update score
                const player = currentRoom.players.find(p => p.id === socket.id);
                if (player) {
                    player.score = (player.score || 0) + 10; // Award 10 points
                }
            }

            // Game Logic Check: Have all players locked in an answer?
            const totalPlayers = currentRoom.players.length;
            const totalAnswers = Object.keys(currentRoom.playerAnswers).length;

            if (totalAnswers === totalPlayers) {
                console.log(`🏁 All players have answered in Room ${code}. Advancing to SCOREBOARD.`);
                currentRoom.phase = 'SCOREBOARD';
            }

            // Sync the fresh state back out to all clients in the room
            namespace.to(code).emit('roomStateUpdated', currentRoom);
        });

        // --- Event: Host Advancing from Scoreboard ---
        socket.on('advanceFromScoreboard', ({ roomCode }) => {
            if (!roomCode) return;
            const code = roomCode.trim().toUpperCase();
            const currentRoom = activeRooms[code];

            if (!currentRoom) return;

            // Clear the answers map out for the upcoming round
            currentRoom.playerAnswers = {};

            // Increment the round index counter
            currentRoom.currentRound += 1;

            // Check if we just ran out of DB questions
            if (currentRoom.currentRound >= currentRoom.questions.length) {
                console.log(`🏆 Trivia Game Over for Room ${code}.`);
                currentRoom.phase = 'GAMEOVER';
            } else {
                console.log(`🃏 Moving Room ${code} to Round #${currentRoom.currentRound + 1}`);
                currentRoom.phase = 'QUESTION';
            }

            // Sync state across everyone's devices
            namespace.to(code).emit('roomStateUpdated', currentRoom);
        });

        // --- Event: Disconnect Cleanup ---
        socket.on('disconnect', () => {
            console.log(`Trivia user disconnected: ${socket.id}`);
        });
    }); 
}

// ============================================================
// 2. Auxiliary Trivia Engine Class (Named Export)
// ============================================================
export class TriviaHandler {
    constructor(questions) {
        this.questions = questions; 
        this.resetGame();
    }

    resetGame() {
        this.currentState = {
            currentQuestionIndex: 0,
            score: 0,
            isGameOver: false,
            history: [] 
        };
        return this.currentState;
    }

    getCurrentQuestion() {
        if (this.currentState.isGameOver) return null;
        return this.questions[this.currentState.currentQuestionIndex];
    }

    submitAnswer(answer) {
        if (this.currentState.isGameOver) {
            throw new Error("Game is already over. Please restart.");
        }

        const currentQuestion = this.getCurrentQuestion();
        const isCorrect = currentQuestion.correctAnswer === answer;

        if (isCorrect) {
            this.currentState.score += 1;
        }

        this.currentState.history.push({
            questionIndex: this.currentState.currentQuestionIndex,
            selectedAnswer: answer,
            isCorrect: isCorrect
        });

        const result = {
            isCorrect,
            correctAnswer: currentQuestion.correctAnswer,
            explanation: currentQuestion.explanation || null
        };

        this.advanceTurn();
        return result;
    }

    advanceTurn() {
        this.currentState.currentQuestionIndex += 1;
        
        if (this.currentState.currentQuestionIndex >= this.questions.length) {
            this.currentState.isGameOver = true;
        }
    }

    getGameSummary() {
        return {
            score: this.currentState.score,
            totalQuestions: this.questions.length,
            percentage: ((this.currentState.score / this.questions.length) * 100).toFixed(1) + '%',
            history: this.currentState.history
        };
    }
}