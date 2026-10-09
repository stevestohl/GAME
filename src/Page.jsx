import React from 'react'
import Contents from './Contents.jsx'
import './styles/cards.css'

// 🌌 New animated background + 🧭 glass nav bar
import AnimatedBackground from './features/Menu/AnimatedBackground.jsx'
import NavBar from './features/Menu/NavBar.jsx'

// 👈 Imports are perfect here!
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Page() {
    return (
        <div style={{ minHeight: '100vh', width: '100%' }}>
            <AnimatedBackground />
            <NavBar />
            <Contents />

            <ToastContainer />
        </div>
    )
}
