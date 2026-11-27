import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import EmployeeList from './features/Employee/EmployeeList.jsx'
import EmployeeReport from './features/Employee/EmployeeReport.jsx'
import EmployeeEdit from './features/Employee/EmployeeEdit.jsx'
import Flashcards from './features/Flashcards/Flashcards.jsx'
import FlashcardsList from './features/Flashcards/FlashcardsList.jsx'
import FlashcardGame from './features/Flashcards/FlashcardGame.jsx'

// --- Menu Imports ---
import GameCastHome from './features/Menu/GameCastHome.jsx'
import BarHome from './features/Menu/BarHome.jsx'

// --- Game Imports ---
import Prompt2GameManager from './features/Prompt2/Prompt2GameManager.jsx'
import CouchCastManager from './features/CouchCast/CouchCastManagerTV.jsx'
import CouchCastDeckSelect from './features/CouchCast/CouchCastDeckSelect.jsx'
import MixupManager from './features/Mixup/MixupManager.jsx'
import MixupSetup from './features/Mixup/MixupSetup.jsx'
import TownManager from './features/Town/TownManager.jsx'
import TownSetup from './features/Town/TownSetup.jsx'
import SpadesManager from './features/Spades/SpadesManager.jsx'
import SpadesSetup from './features/Spades/SpadesSetup.jsx'
import WordWeaveManager from './features/WordWeave/WordWeaveManager.jsx'
import WordWeaveSetup from './features/WordWeave/WordWeaveSetup.jsx'
import AdminApp from './features/Admin/AdminApp.jsx'
import { useGameVisibility } from './gameVisibility.js'
import TicTacToe from './features/TicTacToe/TictactoeManager.jsx'
import TicTacToeCreateScreen from './features/TicTacToe/TicTacToeCreateScreen.jsx'
// import TriviaWaitingRoom from './features/Trivia/TriviaWaitingRoom.jsx'
import TriviaManager from './features/Trivia/TriviaManager.jsx'
import TriviaCastManager from './features/TriviaCast/TriviaCastManager.jsx'
import TriviaCastDeckSelect from './features/TriviaCast/TriviaCastDeckSelect.jsx'
import ListCastManager from './features/Lists/ListCastManager.jsx'
import ListCastSetup from './features/Lists/ListCastSetup.jsx'
import ListopiaManager from './features/Lists/ListopiaManager.jsx'
import UniversalJoinScreen from './features/Menu/UniversalJoinForm.jsx'
import PrivacyPolicy from './features/Menu/PrivacyPolicy.jsx'
import Credits from './features/Menu/Credits.jsx'

// 🙈 The page that starts a game: visitors who can't see that game go back to the menu (joining a room stays open)
// `game`: one game's id, or a list (a setup screen that starts either version of a game: open if either is)
function GameGate({ game, children }) {
    const { confirmed, canSeeGame } = useGameVisibility();
    if (confirmed && ![].concat(game).some(canSeeGame)) return <Navigate replace to="/home" state={{ toastMessage: "That game isn't available right now." }} />;
    return children;
}

export default function Contents() {
    const NotFound = () => <h1>Page Not Found</h1>
    
    return (
        <Routes>
            {/* Core Game-Temple Routes */}
            <Route path="/home" element={<GameCastHome />} />
            {/* The old Game-Temple page: its games are on the one menu now (the phone versions start from their setup screens) */}
            <Route path="/temple" element={<Navigate replace to="/home" />} />
            <Route path="/barhome" element={<BarHome />} />
            <Route path="/join" element={<UniversalJoinScreen />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/credits" element={<Credits />} />
            
            {/* Direct routing to game board */}
            <Route path="/tictactoe" element={<TicTacToe />} />
            <Route path="/tictactoe-create" element={<GameGate game="tictactoe"><TicTacToeCreateScreen /></GameGate>} /> 
            <Route path="/trivia" element={<TriviaManager />} />
            <Route path="/trivia-create" element={<Navigate replace to="/triviacast-decks?play=phones" />} />
            
            {/* Flashcard & Tools Routes */}
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/flashcardsList" element={<FlashcardsList />} />
            <Route path="/flashcardGame" element={<FlashcardGame />} />

            {/* Manager Routes */}
            <Route path="/prompt2" element={<Prompt2GameManager />} />
            <Route path="/prompt2-create" element={<Navigate replace to="/couchcast-decks?play=phones" />} />
            <Route path="/couchcast" element={<CouchCastManager />} />
            <Route path="/couchcast-setup" element={<CouchCastManager />} />
            <Route path="/couchcast-decks" element={<GameGate game={['couchcast', 'prompt2']}><CouchCastDeckSelect /></GameGate>} />
            {/* 🎪 Temple Mix Up */}
            <Route path="/mixup" element={<MixupManager />} />
            <Route path="/mixup-setup" element={<GameGate game="mixup"><MixupSetup /></GameGate>} />
            {/* 🏙️ Temple Town */}
            <Route path="/town" element={<TownManager />} />
            <Route path="/town-setup" element={<GameGate game="town"><TownSetup /></GameGate>} />
            {/* ♠️ Spades */}
            <Route path="/spades" element={<SpadesManager />} />
            <Route path="/spades-setup" element={<GameGate game="spades"><SpadesSetup /></GameGate>} />
            {/* 🧶 Word Weave (on a TV or just phones: the TV is role=caster, every phone role=guest) */}
            <Route path="/wordweave" element={<WordWeaveManager />} />
            <Route path="/wordweave-setup" element={<GameGate game={['wordweave', 'wordweavephones']}><WordWeaveSetup /></GameGate>} />
            {/* 🔐 Admin site (sign-in required; the server checks every request) */}
            <Route path="/admin" element={<AdminApp />} />
            <Route path="/triviacast" element={<TriviaCastManager />} />
            <Route path="/triviacast-decks" element={<GameGate game={['triviacast', 'trivia']}><TriviaCastDeckSelect /></GameGate>} />
            <Route path="/listcast" element={<ListCastManager />} />
            <Route path="/listcast-setup" element={<GameGate game={['listcast', 'listopia']}><ListCastSetup /></GameGate>} />
            <Route path="/listopia" element={<ListopiaManager />} />
            <Route path="/listopia-create" element={<Navigate replace to="/listcast-setup?play=phones" />} />

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