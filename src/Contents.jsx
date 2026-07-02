import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import EmployeeList from './EmployeeList.jsx'
import EmployeeReport from './EmployeeReport.jsx'
import EmployeeEdit from './EmployeeEdit.jsx'
import Flashcards from './Flashcards.jsx'
import FlashcardsList from './FlashcardsList.jsx'
import FlashcardGame from './FlashcardGame.jsx'
import Home from './Home.jsx'
import TicTacToe from './TicTacToe.jsx'
import TriviaWaitingRoom from './TriviaWaitingRoom.jsx'
import BarHome from './BarHome.jsx'


export default function Contents() {

    const NotFound = () => <h1>Page Not Found</h1>
    
    return (
        <Routes>
            {/* Core Game-Temple Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/tictactoe" element={<TicTacToe />} />
            <Route path="/barhome" element={<BarHome />} />
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