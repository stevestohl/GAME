import React, { useEffect, useState } from 'react'
import { Card, Badge, Table } from 'react-bootstrap'

export default function FlashcardsList() {

    const [drinks, setDrinks] = useState([])

useEffect(() => {
    fetch('/api/drinks')
        .then(res => res.json())
        .then(data => {
            setDrinks(data.drinks)
        })
}, [])

    const drinkRows = drinks.map(drink => (
        <tr key={drink._id}>
            <td>{drink.drinkName}</td>
            <td>{drink.recipe}</td>
            <td>{drink.garnish}</td>
            <td>{drink.createdByAnon ? "Anonymous" : "User"}</td>
        </tr>
    ))

    return (
        <Card>
            <Card.Header as="h5">
                Flashcards List <Badge bg="secondary">{drinkRows.length}</Badge>
            </Card.Header>

            <Card.Body>
                <Card.Text>
                    <Table striped size="sm">
                        <thead>
                            <tr>
                                <th>Drink Name</th>
                                <th>Drink Recipe</th>
                                <th>Garnish</th>
                                <th>Created</th>
                            </tr>
                        </thead>

                        <tbody>
                            {drinkRows}
                        </tbody>
                    </Table>
                </Card.Text>
            </Card.Body>
        </Card>
    )
}
