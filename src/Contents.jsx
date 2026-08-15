import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import EmployeeList from './features/Employee/EmployeeList.jsx'
import EmployeeReport from './features/Employee/EmployeeReport.jsx'
import EmployeeEdit from './features/Employee/EmployeeEdit.jsx'
import Flashcards from './features/Flashcards/Flashcards.jsx'
import FlashcardsList from './features/Flashcards/FlashcardsList.jsx'
import FlashcardGame from './features/Flashcards/FlashcardGame.jsx'
import Home from './features/Menu/Home.jsx'
import BarHome from './features/Menu/BarHome.jsx'

import Prompt2GameManager from './features/Prompt2/Prompt2GameManager.jsx'
import CouchCastManager from './features/CouchCast/CouchCastManagerTV.jsx'

// --- Game Imports ---
import TicTacToe from './features/TicTacToe/TicTacToe.jsx'
import TriviaWaitingRoom from './features/Trivia/TriviaWaitingRoom.jsx'

// Import whatever component you want mobile players to land on when they scan the QR code
// import MobileJoinScreen from './features/CouchCast/MobileJoinScreen.jsx'

export default function Contents() {
    const NotFound = () => <h1>Page Not Found</h1>
    
    return (
        <Routes>
            {/* Core Game-Temple Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/barhome" element={<BarHome />} />
            
            {/* Direct routing to game board */}
            <Route path="/tictactoe" element={<TicTacToe />} />
            <Route path="/TriviaWaitingRoom" element={<TriviaWaitingRoom />} />
            
            {/* Flashcard & Tools Routes */}
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/flashcardsList" element={<FlashcardsList />} />
            <Route path="/flashcardGame" element={<FlashcardGame />} />

            {/* Manager Routes */}
            <Route path="/prompt2" element={<Prompt2GameManager />} />
            <Route path="/CouchCast" element={<CouchCastManager />} />

            {/* NEW: Mobile Player Join Route via QR Code */}
            {/* Replace CouchCastManager with your specific mobile join component if you have a separate one */}
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