import React from 'react'
import { Navbar, Nav } from 'react-bootstrap'
import Contents from './Contents.jsx'
import backgroundImage from './assets/logos/background.jpg'
import logo from './assets/logos/temple.jpg'
import martini from './assets/logos/MartiniLogo.jpg'


function NavBar() {

    return (
            <Navbar 
                variant="light" 
                className='justify-content-center'
                style={{ backgroundColor:"#e3f2fd" }}>
                <Navbar.Brand href="/home">
                    <img
                        src={logo}
                        alt="Game-temple Logo"
                        style={{ maxWidth: "40px", height: "auto", mixBlendMode:"multiply"}}
                    />
                    </Navbar.Brand>
                <Nav>
                    <Nav.Link href="/barhome">
                            <img
                                src={martini}
                                alt="Martini Logo"
                                style={{ maxWidth: "30px", height: "auto", mixBlendMode: "multiply" }}
                            />
                        </Nav.Link>
                    {/* <Nav.Link end href="/flashcards">Flashcards</Nav.Link>
                    <Nav.Link end href="/flashcardsList">Flascard List</Nav.Link>
                    <Nav.Link end href="/flashcardGame">Flashcard Game</Nav.Link> */}
                    {/* <Nav.Link end href="/tictactoe">Tic-Tac-Toe</Nav.Link> */}
                    {/* <Nav.Link end href="/report">Reports</Nav.Link> */}
                    {/* <Nav.Link end href="/employees">All Employees</Nav.Link> */}
                </Nav>
            </Navbar>
    )
}

export default function Page() {

    const pageStyle = {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",        // Forces image to fill the screen without stretching out of proportion
        backgroundPosition: "center",    // Centers the image horizontally and vertically
        backgroundRepeat: "no-repeat",   // Prevents the image from repeating like a tile grid
        backgroundAttachment: "fixed",  // Keeps the image pinned in place while content scrolls past
        minHeight: "100vh",             // Ensures the background covers at least 100% of the screen height
        width: "100%",
        mixBlendMode:"multiply",
    }

    return (
        <div style={pageStyle}>
            <NavBar />
            <Contents />
        </div>
    )
}
