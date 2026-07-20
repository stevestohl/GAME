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
    const [roundHistory, setRoundHistory] = useState(Array(TOTAL_ROUNDS).fill(null))
    const [feedbackModal, setFeedbackModal] = useState({ show: false, isCorrect: false, drinkData: null })
    const [gameOverModal, setGameOverModal] = useState(false) // Fixed: Added missing state

    useEffect(() => {
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
    }, [allDrinks, filterMode, round])

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
        setRoundHistory(Array(TOTAL_ROUNDS).fill(null))
        setGameOverModal(false)
    }

    function handleGuess(drink) {
        const isCorrect = drink._id === correctDrink._id
        let newScore = score

        if (isCorrect) {
            newScore += 1
            setScore(newScore)
        }

        // Update the 10-square round history tracker
        const updateHistory = [...roundHistory]
        updateHistory[round - 1] = isCorrect
        setRoundHistory(updateHistory)

        // Show feedback modal with the correct drink details
        setFeedbackModal({
            show: true,
            isCorrect,
            drinkData: correctDrink
        })
    }

    function handleNextRound() {
        setFeedbackModal({ show: false, isCorrect: false, drinkData: null }) // Fixed: changed drink to drinkData
        if (round < TOTAL_ROUNDS) {
            setRound(prev => prev + 1)
        } else {
            setGameOverModal(true)
        }
    }

    function handleRestartGame() {
        setGameOverModal(false)
        setRound(1)
        setScore(0)
        setRoundHistory(Array(TOTAL_ROUNDS).fill(null))
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

                {/* MODERN 10-SQUARE SCORE TRACKER */}
                <div className="d-flex justify-content-center gap-1 my-2 px-3">
                    {roundHistory.map((status, index) => {
                        let bgClass = "bg-light border text-muted" // unplayed
                        if (status === true) bgClass = "bg-primary text-white border-primary" // correct (blue)
                        if (status === false) bgClass = "bg-danger text-white border-danger" // incorrect (red)
                        
                        return (
                            <div 
                                key={index}
                                className={`d-flex align-items-center justify-content-center rounded-2 fw-bold small ${bgClass}`}
                                style={{ width: "32px", height: "32px", transition: "all 0.2s" }}
                            >
                                {index + 1}
                            </div>
                        )
                    })}
                </div>

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

            {/* FEEDBACK MODAL (CORRECT / INCORRECT) */}
            <Modal show={feedbackModal.show} backdrop="static" keyboard={false} centered>
                <Modal.Header className={`text-white ${feedbackModal.isCorrect ? 'bg-primary' : 'bg-danger'}`}>
                    <Modal.Title className="fw-bold">
                        {feedbackModal.isCorrect ? '🎉 Correct!' : '❌ Oops! Incorrect'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-start py-4">
                    <h5 className="fw-bold text-dark mb-1">
                        {feedbackModal.isCorrect ? 'You nailed it!' : 'The correct drink was:'}
                    </h5>
                    <h4 className="text-primary fw-bold mb-3">
                        {feedbackModal.drinkData?.drinkName}
                    </h4>
                    <div className="bg-body-secondary p-3 rounded-3">
                        <h6 className="fw-bold text-secondary mb-1">Recipe:</h6>
                        <p style={{ whiteSpace: "pre-line" }} className="mb-0 text-muted fs-6">
                            {feedbackModal.drinkData?.recipe ? feedbackModal.drinkData.recipe.replaceAll(',', ',\n') : "No details listed."}
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={feedbackModal.isCorrect ? 'primary' : 'danger'} onClick={handleNextRound} className="w-100 fw-bold">
                        {round < TOTAL_ROUNDS ? 'Next Round ➔' : 'View Final Score 🏆'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* GAME OVER SUMMARY MODAL */}
            <Modal show={gameOverModal} backdrop="static" keyboard={false} centered>
                <Modal.Header className="bg-primary text-white">
                    <Modal.Title className="fw-bold">🏆 Game Complete!</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <h4 className="fw-bold mb-2">Great job playing!</h4>
                    <p className="fs-5 text-muted mb-3">
                        You scored <strong className="text-primary">{score}</strong> out of <strong className="text-dark">{TOTAL_ROUNDS}</strong>
                    </p>
                    <div className="d-flex justify-content-center gap-1 my-3">
                        {roundHistory.map((status, index) => {
                            let bgClass = "bg-light text-muted"
                            if (status === true) bgClass = "bg-primary text-white"
                            if (status === false) bgClass = "bg-danger text-white"
                            return (
                                <div key={index} className={`d-flex align-items-center justify-content-center rounded-1 small ${bgClass}`} style={{ width: "24px", height: "24px" }}>
                                    {index + 1}
                                </div>
                            )
                        })}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleRestartGame} className="w-100 fw-bold">
                        Play Again 🔄
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}