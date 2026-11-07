import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import EmployeeList from './features/Employee/EmployeeList.jsx'
import EmployeeReport from './features/Employee/EmployeeReport.jsx'
import EmployeeEdit from './features/Employee/EmployeeEdit.jsx'
import Flashcards from './features/Flashcards/Flashcards.jsx'
import FlashcardsList from './features/Flashcards/FlashcardsList.jsx'
import FlashcardGame from './features/Flashcards/FlashcardGame.jsx'

// --- Menu Imports ---
import Home from './features/Menu/Home.jsx'
import GameCastHome from './features/Menu/GameCastHome.jsx'
import BarHome from './features/Menu/BarHome.jsx'

// --- Game Imports ---
import Prompt2GameManager from './features/Prompt2/Prompt2GameManager.jsx'
import Prompt2CreateScreen from './features/Prompt2/Prompt2CreateButton.jsx'
import CouchCastManager from './features/CouchCast/CouchCastManagerTV.jsx'
import CouchCastDeckSelect from './features/CouchCast/CouchCastDeckSelect.jsx'
import ReshuffledManager from './features/Reshuffled/ReshuffledManagerTV.jsx'
import ReshuffledDeckSelect from './features/Reshuffled/ReshuffledDeckSelect.jsx'
import MixupManager from './features/Mixup/MixupManager.jsx'
import MixupSetup from './features/Mixup/MixupSetup.jsx'
import AdminApp from './features/Admin/AdminApp.jsx'
import { useGameVisibility } from './gameVisibility.js'
import TicTacToe from './features/TicTacToe/TictactoeManager.jsx'
import TicTacToeCreateScreen from './features/TicTacToe/TicTacToeCreateScreen.jsx'
// import TriviaWaitingRoom from './features/Trivia/TriviaWaitingRoom.jsx'
import TriviaCreateScreen from './features/Trivia/TriviaCreateButton.jsx'
import TriviaManager from './features/Trivia/TriviaManager.jsx'
import TriviaCastManager from './features/TriviaCast/TriviaCastManager.jsx'
import TriviaCastDeckSelect from './features/TriviaCast/TriviaCastDeckSelect.jsx'
import ListCastManager from './features/Lists/ListCastManager.jsx'
import ListCastSetup from './features/Lists/ListCastSetup.jsx'
import ListopiaManager from './features/Lists/ListopiaManager.jsx'
import ListopiaCreate from './features/Lists/ListopiaCreate.jsx'
import UniversalJoinScreen from './features/Menu/UniversalJoinForm.jsx'
import PrivacyPolicy from './features/Menu/PrivacyPolicy.jsx'

// 🙈 The page that starts a game: visitors who can't see that game go back to the menu (joining a room stays open)
function GameGate({ game, children }) {
    const { confirmed, canSeeGame } = useGameVisibility();
    if (confirmed && !canSeeGame(game)) return <Navigate replace to="/home" state={{ toastMessage: "That game isn't available right now." }} />;
    return children;
}

export default function Contents() {
    const NotFound = () => <h1>Page Not Found</h1>
    
    return (
        <Routes>
            {/* Core Game-Temple Routes */}
            <Route path="/home" element={<GameCastHome />} />
            <Route path="/temple" element={<Home />} />
            <Route path="/barhome" element={<BarHome />} />
            <Route path="/join" element={<UniversalJoinScreen />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            {/* Direct routing to game board */}
            <Route path="/tictactoe" element={<TicTacToe />} />
            <Route path="/tictactoe-create" element={<GameGate game="tictactoe"><TicTacToeCreateScreen /></GameGate>} /> 
            <Route path="/trivia" element={<TriviaManager />} />
            <Route path="/trivia-create" element={<GameGate game="trivia"><TriviaCreateScreen /></GameGate>} />
            
            {/* Flashcard & Tools Routes */}
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/flashcardsList" element={<FlashcardsList />} />
            <Route path="/flashcardGame" element={<FlashcardGame />} />

            {/* Manager Routes */}
            <Route path="/prompt2" element={<Prompt2GameManager />} />
            <Route path="/prompt2-create" element={<GameGate game="prompt2"><Prompt2CreateScreen /></GameGate>} />
            <Route path="/couchcast" element={<CouchCastManager />} />
            <Route path="/couchcast-setup" element={<CouchCastManager />} />
            <Route path="/couchcast-decks" element={<GameGate game="couchcast"><CouchCastDeckSelect /></GameGate>} />
            {/* 🔀 Couch Cast Re-Shuffled: experimental, not linked from any menu yet */}
            <Route path="/reshuffled" element={<ReshuffledManager />} />
            <Route path="/reshuffled-decks" element={<GameGate game="reshuffled"><ReshuffledDeckSelect /></GameGate>} />
            {/* 🎪 Temple Mix Up */}
            <Route path="/mixup" element={<MixupManager />} />
            <Route path="/mixup-setup" element={<GameGate game="mixup"><MixupSetup /></GameGate>} />
            {/* 🔐 Admin site (sign-in required; the server checks every request) */}
            <Route path="/admin" element={<AdminApp />} />
            <Route path="/triviacast" element={<TriviaCastManager />} />
            <Route path="/triviacast-decks" element={<GameGate game="triviacast"><TriviaCastDeckSelect /></GameGate>} />
            <Route path="/listcast" element={<ListCastManager />} />
            <Route path="/listcast-setup" element={<GameGate game="listcast"><ListCastSetup /></GameGate>} />
            <Route path="/listopia" element={<ListopiaManager />} />
            <Route path="/listopia-create" element={<GameGate game="listopia"><ListopiaCreate /></GameGate>} />

            {/* NEW: Mobile Player Join Route via QR Code */}
            <Route path="/play" element={<CouchCastManager />} />

            {/* Employee Management Routes */}
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/edit/:id" element={<EmployeeEdit />} />
            <Route path="/report" element={<EmployeeReport />} />
            
            <Route path="/" element={<Navigate replace to="/home" />} />
            
            {/* Catch-All 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}