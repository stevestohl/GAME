import React from 'react'
import { Navbar, Nav } from 'react-bootstrap'
import Contents from './Contents.jsx'
import backgroundImage from './assets/logos/background.jpg'
import logo from './assets/logos/temple.jpg'
import martini from './assets/logos/MartiniLogo.jpg'
import './styles/cards.css'

// 👈 Imports are perfect here!
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function NavBar() {
    return (
        <Navbar 
            variant="light" 
            className='justify-content-center py-0 position-relative'
            style={{ backgroundColor:"#e3f2fd" }}>
                <Navbar.Brand href="/home">
                    <img
                        src={logo}
                        alt="Game-temple Logo"
                        style={{ maxWidth: "40px", height: "auto", mixBlendMode:"multiply"}}
                    />
                </Navbar.Brand>
            <Nav>
                <Nav.Link href="/barhome" className='py-0'>
                        <img
                            src={martini}
                            alt="Martini Logo"
                            style={{ maxWidth: "30px", height: "auto", mixBlendMode: "multiply" }}
                        />
                </Nav.Link>
            </Nav>
        </Navbar>
    )
}

export default function Page() {

    const pageStyle = {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",        
        backgroundPosition: "center",    
        backgroundRepeat: "no-repeat",   
        backgroundAttachment: "fixed",  
        minHeight: "100vh",             
        width: "100%",
        mixBlendMode:"multiply",
    }

    return (
        <div style={pageStyle}>
            <NavBar />
            <Contents />
            
            <ToastContainer />
        </div>
    )
}