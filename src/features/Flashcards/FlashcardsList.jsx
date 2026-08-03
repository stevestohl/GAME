import React, { useEffect, useState } from 'react'
import { Card, Badge, Table, Button, Toast, Modal, Spinner, Form, Row, Col } from 'react-bootstrap'
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

    // 🔍 Filter States
    const [nameFilter, setNameFilter] = useState("")
    const [recipeFilter, setRecipeFilter] = useState("")

    // 🔃 Sort State: tracks column key and direction ('asc' or 'desc')
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

    useEffect(() => {
        async function loadDrinks() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/drinks`)
                const data = await res.json()
                setDrinks(data.drinks || [])
            } catch (err) {
                console.log("Failed to wake up server:", err)
            } finally {
                setIsLoading(false)
            }
        }
        loadDrinks(); 
    }, [])

    function handleDrinkAdded(newDrink, msg) {
        setDrinks(prev => [...prev, newDrink])
        setToastMessage(msg)
        setShowToast(true)
    }

    const handleDeleteDrink = (id) => {
        setDrinks(prev => prev.filter(drink => drink._id !== id))
        setToastMessage("Drink removed successfully!")
        setShowToast(true)
        
        fetch(`${API_BASE_URL}/api/drinks/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => console.log("Delete confirmation:", data))
            .catch(err => console.error("Error deleting drink:", err))
    }

    // 🔃 Sort Handler: Updates sort config when a header is clicked
    const requestSort = (key) => {
        let direction = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

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
                    <h4 className='fw-bold text-dark'>Loading Drinks...</h4>
                    <p className='text-muted small mb-0'>
                        Waking up server...
                    </p>
                </Modal.Body>
            </Modal>
        )
    }

    // 1. First, apply filters
    const filteredDrinks = drinks.filter(drink => {
        const matchesName = (drink.drinkName || "").toLowerCase().includes(nameFilter.toLowerCase())
        const matchesRecipe = (drink.recipe || "").toLowerCase().includes(recipeFilter.toLowerCase())
        return matchesName && matchesRecipe
    })

    // 2. Then, apply sorting to the filtered results
    const sortedDrinks = [...filteredDrinks].sort((a, b) => {
        if (!sortConfig.key) return 0; // If no sort key is set, keep original order

        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle the unique 'Created' column logic to sort by the rendered text
        if (sortConfig.key === 'created') {
            valA = a.isDefault ? "Default" : (a.createdByAnon ? "Anonymous" : "User");
            valB = b.isDefault ? "Default" : (b.createdByAnon ? "Anonymous" : "User");
        }

        // Fallback to empty string to prevent errors if a field is null/undefined
        valA = valA ? String(valA).toLowerCase() : "";
        valB = valB ? String(valB).toLowerCase() : "";

        if (valA < valB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    })

    // Helper to render the up/down arrows in the table headers
    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) return null;
        return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }

    // 3. Map over the sorted & filtered drinks
    const drinkRows = sortedDrinks.map(drink => (
        <tr key={drink._id}>
            <td className="align-middle">
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
            <Card className='shadow-sm border-0 mb-4'>
                <Card.Body>
                    <Row>
                        <Col md={6} className="mb-3 mb-md-0">
                            <Form.Group controlId="filterName">
                                <Form.Label className="fw-semibold text-muted small">Filter by Name</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder='e.g. "marg"' 
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="filterRecipe">
                                <Form.Label className="fw-semibold text-muted small">Filter by Recipe</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder='e.g. "tequila"' 
                                    value={recipeFilter}
                                    onChange={(e) => setRecipeFilter(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

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
                    <Table striped size="sm" responsive hover>
                        <thead>
                            <tr>
                                {/* Added inline styles so the cursor changes to a pointer, indicating it's clickable */}
                                <th onClick={() => requestSort('drinkName')} style={{ cursor: 'pointer' }}>
                                    Drink Name {getSortIcon('drinkName')}
                                </th>
                                <th onClick={() => requestSort('recipe')} style={{ cursor: 'pointer' }}>
                                    Drink Recipe {getSortIcon('recipe')}
                                </th>
                                <th onClick={() => requestSort('garnish')} style={{ cursor: 'pointer' }}>
                                    Garnish {getSortIcon('garnish')}
                                </th>
                                <th onClick={() => requestSort('created')} style={{ cursor: 'pointer' }}>
                                    Created {getSortIcon('created')}
                                </th>
                                <th className="text-center">Delete</th>
                            </tr>
                        </thead>
                        <tbody>{drinkRows}</tbody>
                    </Table>
                </Card.Body>
            </Card>

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