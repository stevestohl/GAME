import React from 'react'
import { Navbar, Nav } from 'react-bootstrap'
import Contents from './Contents.jsx'

function NavBar() {

    return (
        <Navbar bg="dark" variant="dark" className='px-3'>
            <Navbar.Brand href="/home">Game-Temple</Navbar.Brand>
            <Nav>
                <Nav.Link end href="/flashcards">Flashcards</Nav.Link>
                <Nav.Link end href="/flashcardsList">Flascard List</Nav.Link>
                <Nav.Link end href="/flashcardGame">Flashcard Game</Nav.Link>
                <Nav.Link end href="/tictactoe">Tic-Tac-Toe</Nav.Link>
                <Nav.Link end href="/report">Reports</Nav.Link>
                {/* <Nav.Link end href="/employees">All Employees</Nav.Link> */}
            </Nav>
        </Navbar>
    )
}

export default function Page() {
    return (
        <div>
            <NavBar />
            <Contents />
        </div>
    )
}
