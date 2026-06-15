import React, { useEffect, useState } from 'react'
import { Card, Badge, Table, Button, Toast } from 'react-bootstrap'
import FlashcardAdd from './FlashcardAdd.jsx'

export default function FlashcardsList() {

    const [toastMessage, setToastMessage] = useState("")
    const [showToast, setShowToast] = useState(false)
    const [drinks, setDrinks] = useState([])
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        fetch('/api/drinks')
            .then(res => res.json())
            .then(data => setDrinks(data.drinks))
    }, [])

    // Called by FlashcardAdd.jsx after successful POST
    function handleDrinkAdded(newDrink, msg) {
        setDrinks(prev => [...prev, newDrink])
        setToastMessage(msg)
        setShowToast(true)
    }

    const drinkRows = drinks.map(drink => (
        <tr key={drink._id}>
            <td>{drink.drinkName}</td>
            <td>{drink.recipe}</td>
            <td>{drink.garnish}</td>
            <td>{drink.createdByAnon ? "Anonymous" : "User"}</td>
        </tr>
    ))

    return (
        <>
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <div>
                        Flashcards List <Badge bg="secondary">{drinkRows.length}</Badge>
                    </div>

                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => setShowAddModal(true)}
                    >
                        Add Drink
                    </Button>
                </Card.Header>

                <Card.Body>
                    <Table striped size="sm">
                        <thead>
                            <tr>
                                <th>Drink Name</th>
                                <th>Drink Recipe</th>
                                <th>Garnish</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>{drinkRows}</tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Add Drink Modal */}
            <FlashcardAdd 
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onDrinkAdded={handleDrinkAdded}
            />
            <Toast 
                onClose={() => setShowToast(false)} 
                show={showToast} 
                delay={3000} 
                autohide
                bg="success"
                style={{
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    zIndex: 9999
                }}
            >
                <Toast.Header>
                    <strong className="me-auto">Success</strong>
                </Toast.Header>
                <Toast.Body className="text-white">
                    {toastMessage}
                </Toast.Body>
            </Toast>
        </>
    )
}
