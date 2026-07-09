import React, { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

export default function FlashcardEdit({ show, drinkData, onHide, onDrinkUpdated }) {

    // 1. Initialize local form state (Using correct boolean defaults)
    const [drinkName, setDrinkName] = useState("")
    const [recipe, setRecipe] = useState("")
    const [garnish, setGarnish] = useState("")
    const [createdByAnon, setCreatedByAnon] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 2. Watch for changes to drinkData
    useEffect(() => {
        if (drinkData) {
            setDrinkName(drinkData.drinkName || "")
            setRecipe(drinkData.recipe || "")
            setGarnish(drinkData.garnish || "")
            setCreatedByAnon(drinkData.createdByAnon || false)
        }
    }, [drinkData]) // Fixed typo: dirnkData -> drinkData

    // 3. Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const updatePayload = {
            drinkName: drinkName.trim(),
            recipe: recipe.trim(),
            garnish: garnish.trim(),
            createdByAnon
        }

        fetch(`/api/drinks/${drinkData._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(updatePayload),
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to update the drink.")
            return res.json()
        })
        .then(data => {
            // If backend returns whole updated object, return that
            const finalUpdatedDrink = data.drink || { ...drinkData, ...updatePayload } 
            onDrinkUpdated(finalUpdatedDrink) 
        })
        .catch(err => {
            console.error("Error updating drink:", err)
            alert("Something went wrong updating the drink. Check the console.")
        })
        .finally(() => {
            setIsSubmitting(false)
        })
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title className='fw-bold text-secondary'>
                    Edit: {drinkData?.drinkName}
                </Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                
                    {/* DrinkName Update */}
                    <Form.Group className='mb-3' controlId="editDrinkName">
                        <Form.Label className='fw-semibold'>Drink Name</Form.Label>
                        <Form.Control
                            type='text'
                            required
                            value={drinkName}
                            onChange={(e) => setDrinkName(e.target.value)}
                        />
                    </Form.Group>

                    {/* DrinkRecipe Update */}
                    <Form.Group className='mb-3' controlId="editDrinkRecipe">
                        <Form.Label className='fw-semibold'>Drink Recipe</Form.Label>
                        <Form.Control
                            as='textarea'
                            rows={3}
                            required
                            value={recipe}
                            onChange={(e) => setRecipe(e.target.value)}
                        />
                    </Form.Group>

                    {/* Garnish Update */}
                    <Form.Group className='mb-3' controlId="editDrinkGarnish">
                        <Form.Label className='fw-semibold'>Garnish</Form.Label>
                        <Form.Control
                            type='text'
                            value={garnish}
                            onChange={(e) => setGarnish(e.target.value)}
                        />
                    </Form.Group>

                    {/* Update User */}
                    <Form.Group className='mb-3' controlId='editCreatedByAnon'> 
                        <Form.Check
                            type='checkbox'
                            label='Post as Anonymous User'
                            checked={createdByAnon}
                            onChange={(e) => setCreatedByAnon(e.target.checked)} 
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer className='bg-light'> 
                    <Button variant='outline-secondary' onClick={onHide} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant='primary' type='submit' disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}