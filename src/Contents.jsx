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

// --- Game Imports ---
import TicTacToe from './features/TicTacToe/TicTacToe.jsx'
import TriviaWaitingRoom from './features/Trivia/TriviaWaitingRoom.jsx'

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