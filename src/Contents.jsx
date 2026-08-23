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
import BarHome from './features/Menu/BarHome.jsx'

// --- Game Imports ---
import Prompt2GameManager from './features/Prompt2/Prompt2GameManager.jsx'
import CouchCastManager from './features/CouchCast/CouchCastManagerTV.jsx'
import TicTacToe from './features/TicTacToe/TictactoeManager.jsx'
import TicTacToeCreateScreen from './features/TicTacToe/TicTacToeCreateScreen.jsx'
import TriviaWaitingRoom from './features/Trivia/TriviaWaitingRoom.jsx'
import TriviaCreateScreen from './features/Trivia/TriviaCreateButton.jsx'
import TriviaManager from './features/Trivia/TriviaMananger.jsx'
import UniversalJoinScreen from './features/Menu/UniversalJoinForm.jsx'

export default function Contents() {
    const NotFound = () => <h1>Page Not Found</h1>
    
    return (
        <Routes>
            {/* Core Game-Temple Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/barhome" element={<BarHome />} />
            <Route path="/join" element={<UniversalJoinScreen />} />
            
            {/* Direct routing to game board */}
            <Route path="/tictactoe" element={<TicTacToe />} />
            <Route path="/tictactoe-create" element={<TicTacToeCreateScreen />} /> 
            <Route path="/TriviaWaitingRoom" element={<TriviaManager />} />
            <Route path="/trivia" element={<TriviaManager />} />
            <Route path="/trivia-create" element={<TriviaCreateScreen />} />
            
            {/* Flashcard & Tools Routes */}
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/flashcardsList" element={<FlashcardsList />} />
            <Route path="/flashcardGame" element={<FlashcardGame />} />

            {/* Manager Routes */}
            <Route path="/prompt2" element={<Prompt2GameManager />} />
            <Route path="/CouchCast" element={<CouchCastManager />} />

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