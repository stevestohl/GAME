import React, { useEffect, useState } from 'react'
import { Card, Badge, Table, Button, Toast, Modal, Spinner } from 'react-bootstrap'
import FlashcardAdd from './FlashcardAdd.jsx'
import FlashcardEdit from './FlashcardEdit.jsx'

// 🌐 Your live Render backend base URL
const API_BASE_URL = 'https://game-temple-backend.onrender.com'

export default function FlashcardsList() {

    const [toastMessage, setToastMessage] = useState("")
    const [showToast, setShowToast] = useState(false)
    const [drinks, setDrinks] = useState([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [currentEditingDrink, setCurrentEditingDrink] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadDrinks() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/drinks`)
                const data = await res.json()
                // Fixed 1: Changed setAllDrinks to setDrinks to match state declaration
                setDrinks(data.drinks || [])
            } catch (err) {
                // Fixed 2: Changed error to err to match catch parameter
                console.log("Failed to wake up server:", err)
            } finally {
                setIsLoading(false)
            }
        }
        loadDrinks(); // Don't forget to invoke it inside useEffect!
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
        
        // 🔄 Updated to route the DELETE request to Render
        fetch(`${API_BASE_URL}/api/drinks/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => console.log("Delete confirmation:", data))
            .catch(err => console.error("Error deleting drink:", err))
    }

    // Fixed 4: Handled early loading return here to keep background clean
    if (isLoading) {
        return (
            <Modal
                show={isLoading}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Body className='d-flex flex-column align-items-center justify-content-center p-4 text-center'>
                    <Spinner animation='border' variant='primary' className='mb-3'/>
                    {/* Fixed 3: Updated contextual copy text */}
                    <h4 className='fw-bold text-dark'>Loading Drinks...</h4>
                    <p className='text-muted small mb-0'>
                        Waking up server...
                    </p>
                </Modal.Body>
            </Modal>
        )
    }

    const drinkRows = drinks.map(drink => (
        <tr key={drink._id}>
            <td className="align-middle">
                {/* 1. CONDITIONAL EDIT LINK */}
                {drink.isDefault ? (
                    <span className="fw-semibold text-dark">{drink.drinkName}</span>
                ) : (
                    <Button
                        variant='link'
                        className='p-0 text-decoration-none fw-semibold text-start'
                        onClick={() => setCurrentEditingDrink(drink)}
                    >
                        {drink.drinkName}                
                    </Button>
                )}
            </td>    
            <td className="align-middle">{drink.recipe}</td>
            <td className="align-middle">{drink.garnish}</td>
            <td className="align-middle">
                {drink.isDefault ? "Default" : (drink.createdByAnon ? "Anonymous" : "User")}
            </td>
            <td className='text-center align-middle'>
                {/* 2. CONDITIONAL DELETE BUTTON */}
                <Button 
                    variant={drink.isDefault ? 'secondary' : 'danger'} 
                    size="sm" 
                    disabled={drink.isDefault} 
                    onClick={() => handleDeleteDrink(drink._id)}
                >
                    X
                </Button>
            </td>
        </tr>
    ))
    
    return (
        <>
            <Card className='shadow-lg border-0'>
                <Card.Header as='h5' className="d-flex justify-content-between align-items-center">
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