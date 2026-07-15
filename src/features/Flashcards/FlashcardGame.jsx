import React, { useEffect, useState } from "react"
import { Button, Card, Form, Modal, Spinner } from "react-bootstrap"

const API_BASE_URL = 'https://game-temple-backend.onrender.com'

export default function FlashcardGame() {
    const [allDrinks, setAllDrinks] = useState([]) // Raw pool from API
    const [round, setRound] = useState(1)
    const [score, setScore] = useState(0)
    const [options, setOptions] = useState([])
    const [correctDrink, setCorrectDrink] = useState(null)
    const [filterMode, setFilterMode] = useState("default") // "default" or "all"
    const [isLoading, setIsLoading] = useState(true)
    const TOTAL_ROUNDS = 10

    useEffect(() => {
        // 🔄 Added catch and finally blocks to control the modal state
        fetch(`${API_BASE_URL}/api/drinks`)
            .then(res => res.json())
            .then(data => setAllDrinks(data.drinks || []))
            .catch(err => console.error("Error catching drinks:", err))
            .finally(() => setIsLoading(false)) // Turns off modal when server responds
    }, [])

    // COMPUTED ARRAY: Dynamic pool based on selected deck mode
    const visibleDrinks = allDrinks.filter(drink => {
        if (filterMode === "default") {
            return drink.isDefault === true
        }
        return true
    })

    // Restarts or updates round when pool changes or round increments
    useEffect(() => {
        if (visibleDrinks.length > 0) {
            startRound()
        }
    }, [allDrinks, filterMode, round]) // Added filterMode to dependencies to trigger reload on switch

    function startRound() {
        if (visibleDrinks.length === 0) return

        // Shuffle current active pool
        const shuffled = [...visibleDrinks].sort(() => Math.random() - 0.5)
        
        // Dynamically slice depending on pool availability (max 6 options)
        const count = Math.min(6, shuffled.length)
        const gameChoices = shuffled.slice(0, count)

        // Choose 1 correct target answer from the selection pool
        const correct = gameChoices[Math.floor(Math.random() * gameChoices.length)]

        setOptions(gameChoices)
        setCorrectDrink(correct)
    }

    function handleFilterChange(mode) {
        setFilterMode(mode)
        setRound(1) // Reset game state
        setScore(0)
    }

    function handleGuess(drink) {
        let currentScore = score
        if (drink._id === correctDrink._id) {
            setScore(prev => prev + 1)
            currentScore += 1
        }

        if (round < TOTAL_ROUNDS) {
            setRound(prev => prev + 1)
        } else {
            alert(`Game over! You scored ${currentScore} out of ${TOTAL_ROUNDS}`)
            setRound(1) // Automatically reset the loop
            setScore(0)
        }
    }

    // 1. FIRST GUARD: Show the waking up modal if we are still fetching data
    if (isLoading) {
        return (
            <Modal
                show={isLoading}
                backdrop="static"
                keyboard={false}
                centered
            >
                {/* Fixed visual alignment class typo here */}
                <Modal.Body className="d-flex flex-column align-items-center justify-content-center p-4 text-center">
                    <Spinner animation='border' variant="primary" className="mb-3"/>
                    <h4 className="fw-bold text-dark">Loading Quiz...</h4>
                    <p className="text-muted small mb-0">
                        Waking up server...
                    </p>
                </Modal.Body>
            </Modal>
        )
    }

    // 2. SECOND GUARD: Show empty pool warning only after loading is complete
    if (visibleDrinks.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center p-3">
                <Card className="text-center p-4 shadow-lg border-0" style={{ maxWidth: "450px", width: "100%" }}>
                    <p className="mb-2 fw-semibold text-muted">No items found in this deck.</p>
                    <Button variant="primary" onClick={() => handleFilterChange("all")}>Switch to All Decks</Button>
                </Card>
            </div>
        )
    }

    // 3. THIRD GUARD: Prevent crashes if the game state loop hasn't generated choices yet
    if (!correctDrink) return <div className="text-center mt-5 text-white">Loading game...</div>

    // MAIN GAME INTERFACE
    return (
        <div className="d-flex justify-content-center align-items-center p-3">
            <Card 
                className="text-center shadow-lg border-0"
                style={{ maxWidth: "450px", width: "100%" }}
            >
                {/* HEADER ROW WITH INTEGRATED RADIO TOGGLES */}
                <Card.Header as='h5' className="bg-primary text-white py-3 fw-bold tracking-wide d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
                    <div>FLASHCARD QUIZ</div>
                    <div className="d-flex gap-3 fs-6 fw-normal text-start">
                        <Form.Check
                            type="radio"
                            label="Default Cards"
                            name="gameFilter"
                            id="game-default"
                            checked={filterMode === "default"}
                            onChange={() => handleFilterChange("default")}
                            className="text-white custom-game-radio"
                        />
                        <Form.Check
                            type="radio"
                            label="All Cards"
                            name="gameFilter"
                            id="game-all"
                            checked={filterMode === "all"}
                            onChange={() => handleFilterChange("all")}
                            className="text-white custom-game-radio"
                        />
                    </div>
                </Card.Header>

                <h4 className="mt-3">Round {round} / {TOTAL_ROUNDS}</h4>
                <h5>Score: {score}</h5>

                <div className="d-flex flex-wrap justify-content-center gap-2 px-2 my-2">
                    {options.map(drink => (
                        <Button 
                            key={drink._id}
                            variant="outline-primary"
                            style={{ width: "45%" }}
                            onClick={() => handleGuess(drink)}
                        >
                            {drink.drinkName}
                        </Button>
                    ))}
                </div>

                <Card className="m-3 p-2 bg-body-secondary border-0 shadow-sm rounded-3">
                    <Card.Header className="bg-transparent border-0 py-1">
                        <h6 className="fw-bold mb-0 text-secondary text-start">Recipe:</h6>
                    </Card.Header>
                    <Card.Body className="py-2">
                        <p style={{ whiteSpace: "pre-line" }} className="ps-2 mb-0 text-muted text-start fs-6">
                            {correctDrink.recipe ? correctDrink.recipe.replaceAll(',', ',\n') : "No details listed."}
                        </p>
                    </Card.Body>
                </Card>
            </Card>
        </div>
    )
}