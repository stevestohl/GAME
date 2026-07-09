import React, { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

export default function FlashcardAdd({ show, onHide, onDrinkAdded }) {

    const [form, setForm] = useState({
        drinkName: "",
        recipe: "",
        garnish: "",
        createdByAnon: true
    })

    function handleChange(e) {
        const { name, value, type, checked } = e.target
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    async function handleSubmit() {
        const res = await fetch("/api/drinks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        })

        const data = await res.json()

        // Notify parent
        onDrinkAdded(data.drink, data.msg)

        // Reset form + close modal
        setForm({
            drinkName: "",
            recipe: "",
            garnish: "",
            createdByAnon: false
        })

        onHide()
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add New Drink</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Drink Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="drinkName"
                            value={form.drinkName}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Recipe</Form.Label>
                        <Form.Control
                            type="text"
                            name="recipe"
                            value={form.recipe}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Garnish</Form.Label>
                        <Form.Control
                            type="text"
                            name="garnish"
                            value={form.garnish}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Anonymous?"
                            name="createdByAnon"
                            checked={form.createdByAnon}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="success" size="sm" onClick={handleSubmit}>
                    Add Drink
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
