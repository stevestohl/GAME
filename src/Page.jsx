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
    // 100dvh, not 100vh: on an iPhone 100vh is taller than the screen while Safari's toolbar shows, which made short pages scroll
    return (
        <div style={{ minHeight: '100dvh', width: '100%' }}>
            <AnimatedBackground />
            <NavBar />
            <Contents />

            <ToastContainer />
        </div>
    )
}
