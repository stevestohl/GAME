import React, { useEffect, useState } from "react"
import { Button, Card } from "react-bootstrap"

export default function FlashcardGame() {
    const [drinks, setDrinks] = useState([])
    const [round, setRound] = useState(1)
    const [score, setScore] = useState(0)
    const [options, setOptions] = useState([])
    const [correctDrink, setCorrectDrink] = useState(null)
    const TOTAL_ROUNDS = 10

    useEffect(() => {
        fetch("/api/drinks")
            .then(res => res.json())
            .then(data => setDrinks(data.drinks))
    }, [])

    useEffect(() => {
        if (drinks.length > 0) {
            startRound()
        }
    }, [drinks, round])

    function startRound() {
        // pick 6 random drinks
        const shuffled = [...drinks].sort(() => Math.random() - 0.5)
        const six = shuffled.slice(0, 6)

        // pick 1 correct drink from those 6
        const correct = six[Math.floor(Math.random() * six.length)]

        setOptions(six)
        setCorrectDrink(correct)
    }

    function handleGuess(drink) {
        if (drink._id === correctDrink._id) {
            setScore(prev => prev + 1)
        }

        if (round < TOTAL_ROUNDS) {
            setRound(prev => prev + 1)
        } else {
            alert(`Game over! You scored ${score + 1} out of ${TOTAL_ROUNDS}`)
        }
    }

    if (!correctDrink) return <div>Loading game...</div>

    return (
        <Card className="p-1">
            <h4>Round {round} / {TOTAL_ROUNDS}</h4>
            <h5>Score: {score}</h5>

            <div className="d-flex flex-wrap justify-content-center gap-2">
                {options.map(drink => (
                    <Button 
                        key={drink._id}
                        variant="outline-primary"
                        className="m-1"
                        style={{ width: "45%" }}
                        onClick={() => handleGuess(drink)}
                    >
                        {drink.drinkName}
                    </Button>
                ))}
            </div>

            <Card className="mt-2 p-2 bg-light">
                <Card.Header>
                    <h5>Recipe:</h5>
                </Card.Header>
                <Card.Body>
                    <p style={{ whiteSpace: "pre-line" }} 
                    className="ps-2 mb-0 text-muted">
                        {correctDrink.recipe.replaceAll(',', ',\n')}
                    </p>
                </Card.Body>
            </Card>
        </Card>
    )
}
