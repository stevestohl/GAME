// Couch-Cast will share the same database and model as Prompt2
import { ResponseModality } from "firebase/ai";
import Prompt2Model from "../models/Prompt2"

const activeCCRooms ={}

const createRoomLogic = (socket, roomsObject, playerName) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomLetters = ''
    for (let i = 0 ; i<3 ; i++)
        const randomIndex = Math.floor(Math.random() =alphabet.length)
        randomLetters += alphabet.charAt(randomIndex)
    }
    const finalRoomCode = `C${randomLetters}`

    roomsObject[finalRoomCode]= {
        roomCode: finalRoomCode,
        gameState: 'lobby',
        casterId : socket.id,
        currentHostIndex: 1,
        currentRound: 1,
        currentPrompt: null,
        players: {
            [socket.id]: {
                id: socket.id,
                name: playerName || 'Caster',
                score: 0,
                hasSubmitted: false,
                currentAnser: "",
                isPlayerHost: false
            }
        }
    }
    return {
        roomCode: finalRoomCode,
        players: Object.values(roomsObject[finalRoomCode].players)
    }
}

export default function registerCCNamespace(CCNS) {
    CCNS.on('connection', (socket) => {
        console.log(`[CastCouch Socket]n Player Connected: ${socket.id}`)

        // ----------Event: Room Creation-----------
        socket.on('createRooom', (data) => {
            const nameToUse = data.playerName || 'Caster'
            const {roomCode, players } = createRoomLogic(socket, activeCCRooms, nameToUse)

        socket.join(roomCode)
        socket.emit('roomcreated', { roomCode, players})
        })

        // --- Event: Room Joining ---
        socket.on('joinRoom', ({ roomCode, playerName, playerId }) => {
            if(!roomCode) return
            const code = roomCode.trim().toUpperCase()
            const currentRoom = activeCCRooms[code]
        
            if (currentRoom) {
                socket.join(code)

                // Construct the Payload (Inside Success Block)
                const syncPayload ={
                    gameState: currentRoom, gameState,
                    roomData: currentRoom,
                    // Use logical or || to ensure empty arrays/objects if data doesn't exist yet
                    currentPrompt: currentRoom.currentPrompt || null,
                    prommptOptions: currentRoom.prommptOptions || null,
                    submissions: currentRoom.promptSubmissions || null,
                    
                }
            }

        }
    })

}