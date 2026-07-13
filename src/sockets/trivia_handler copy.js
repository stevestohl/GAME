/**
 * trivia_handler.js
 * Manages game state, answer validation, and score tracking.
 */

// This is the Default Export your server.js is looking for!
export default function registerTriviaNamespace(namespace) {
  namespace.on('connection', (socket) => {
    console.log(`Trivia User Connected: ${socket.id}`);

    // ==========================================
    // Room Creation & Joining
    // ==========================================
    socket.on('createRoom', () => {
      const { roomCode, players } = createRoomLogic(socket, activeRooms);
      socket.join(roomCode);
      socket.emit('roomCreated', { roomCode, players });
    });

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

class TriviaHandler {
    constructor(questions) {
        this.questions = questions; // Array of question objects
        this.resetGame();
    }

    /**
     * Resets the game state back to the beginning.
     */
    resetGame() {
        this.currentState = {
            currentQuestionIndex: 0,
            score: 0,
            isGameOver: false,
            history: [] // Tracks user answers: { questionIndex, selectedAnswer, isCorrect }
        };
        return this.currentState;
    }

    /**
     * Retrieves the current active question.
     */
    getCurrentQuestion() {
        if (this.currentState.isGameOver) return null;
        return this.questions[this.currentState.currentQuestionIndex];
    }

    /**
     * Validates the user's answer, updates the score, and logs history.
     * @param {string|number} answer - The user's selected option or text answer.
     * @returns {Object} Result of the answer check.
     */
    submitAnswer(answer) {
        if (this.currentState.isGameOver) {
            throw new Error("Game is already over. Please restart.");
        }

        const currentQuestion = this.getCurrentQuestion();
        const isCorrect = currentQuestion.correctAnswer === answer;

        if (isCorrect) {
            this.currentState.score += 1;
        }

        // Log this turn to history
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

        // Advance to the next question or trigger game over
        this.advanceTurn();

        return result;
    }

    /**
     * Internal method to progress the game index.
     */
    advanceTurn() {
        this.currentState.currentQuestionIndex += 1;
        
        if (this.currentState.currentQuestionIndex >= this.questions.length) {
            this.currentState.isGameOver = true;
        }
    }

    /**
     * Returns a summary of the game performance.
     */
    getGameSummary() {
        return {
            score: this.currentState.score,
            totalQuestions: this.questions.length,
            percentage: ((this.currentState.score / this.questions.length) * 100).toFixed(1) + '%',
            history: this.currentState.history
        };
    }
}

// Export the module for use in other files
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = TriviaHandler;
// } else {
//     window.TriviaHandler = TriviaHandler;
// }

export default TriviaHandler