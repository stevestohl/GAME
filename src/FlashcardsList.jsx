import React, { useEffect, useState } from 'react'
import { Card, Badge, Table, Button, Toast } from 'react-bootstrap'
import FlashcardAdd from './FlashcardAdd.jsx'
import FlashcardEdit from './FlashcardEdit.jsx'

export default function FlashcardsList() {

    const [toastMessage, setToastMessage] = useState("")
    const [showToast, setShowToast] = useState(false)
    const [drinks, setDrinks] = useState([])
    const [showAddModal, setShowAddModal] = useState(false)
    

    const [currentEditingDrink, setCurrentEditingDrink] = useState(null)

    useEffect(() => {
        fetch('/api/drinks')
            .then(res => res.json())
            .then(data => setDrinks(data.drinks || []))
            .catch(err => console.error("Error fetching drinks:", err))
    }, [])

    // Called by FlashcardAdd.jsx after successful POST
    function handleDrinkAdded(newDrink, msg) {
        setDrinks(prev => [...prev, newDrink])
        setToastMessage(msg)
        setShowToast(true)
    }

    const handleDeleteDrink = (id) => {

        setDrinks(prev => prev.filter(drink => drink._id !== id))

        setToastMessage("Drink removed successfully!")
        setShowToast(true)
        
        // Database Hook
        fetch(`/api/drinks/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .catch(err => console.error("Error deleting drink:", err))
    }

    const drinkRows = drinks.map(drink => (
        <tr key={drink._id}>
            <td className="align-middle">
                {/* Edit Link */}
                <Button
                    variant='link'
                    className='p-0 text-decoration-none fw-semibold text-start'
                    onClick={() => setCurrentEditingDrink(drink)}
                >
                    {drink.drinkName}                
                </Button>
            </td>    
            <td className="align-middle">{drink.recipe}</td>
            <td className="align-middle">{drink.garnish}</td>
            <td className="align-middle">{drink.createdByAnon ? "Anonymous" : "User"}</td>
            <td className='text-center align-middle'>
                <Button 
                    variant='danger' 
                    size="sm" 
                    onClick={() => handleDeleteDrink(drink._id)}
                >
                    X
                </Button>
            </td>
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
                    <Table striped size="sm" responsive>
                        <thead>
                            <tr>
                                <th>Drink Name</th>
                                <th>Drink Recipe</th>
                                <th>Garnish</th>
                                <th>Created</th>
                                <th className="text-center">Delete</th>
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

            {currentEditingDrink && ( 
                <FlashcardEdit
                    show={Boolean(currentEditingDrink)}
                    drinkData={currentEditingDrink}
                    onHide={() => setCurrentEditingDrink(null)}
                    onDrinkUpdated={(updatedDrink) => {
                        // Updates the specific drink item in array state instantly
                        setDrinks(prev => prev.map(d => d._id === updatedDrink._id ? updatedDrink : d))
                        setToastMessage("Drink updated successfully!")
                        setShowToast(true)
                        setCurrentEditingDrink(null)
                    }}
                />
            )}

            {/* Notification Toast */}
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