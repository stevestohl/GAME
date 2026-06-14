import React from 'react'
import { Card, Badge, Table } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'

function FlashcardsList(props) {

    const { search } = useLocation() //Gets URL
    const query = new URLSearchParams(search) //Get filter parameters form URL
    const q = query.get('CreatedByAnon') // Get Created by paramter specifically

    const drinkRows = props.drinks
    .filter(drink => {
        if(createdByAnon===null) return true
        return String(drink.createdByAnon) === createdByAnon
    })
    .map(drink => (
        <tr key={drink._id}>
            <td>{drink.drinkName}</td>
            <td>{drink.recipe}</td>
            <td>{drink.garnish}</td>
            <td>{drink.createdByAnon}</td>
        </tr>


    )


    )
}


export default function FlashcardsList()    {

    return(
        <Card>
            <Card.Header as="h5">Flashcards List<Badge bg="secondary">{drinkRows.length}</Badge></Card.Header>
            <Card.Body>
                <Card.Text>
                    <Table striped size="sm">
                        <thead>
                            <tr>
                                <th>Drink Name</th>
                                <th>Drink Recipe</th>
                                <th>Created</th>
                                <th></th>
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