import React from "react";
import { Button, Card, Container, Row, Col, Alert } from 'react-bootstrap'

export default class EmployeeEdit extends React.Component {
    constructor() {
        super();
        this.state = { 
            employee: [],
            alertVisible: false,
            alertColor: 'success',
            alertMessage: '',
         };
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount() {
        this.loadData();
    }
    loadData() {
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[pathParts.length - 1]; 

        if (!id || id === "edit" || id === "") {
            console.error("Could not parse a valid ID from the URL pathname:", window.location.pathname);
            return;
        }

        fetch(`/api/employees/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const employee = data.employee || data; 

                if (employee && employee.dateHired) {
                    employee.dateHired = new Date(employee.dateHired);
                    this.setState({ employee });
                } else {
                    console.error("Employee data format received from API is invalid:", data);
                }
            })
            .catch(err => console.error("Error loading employee data:", err));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Grab the form directly from the event target instead of the global document object
        const form = e.target;
        
        const id = form.id.value;
        const name = form.name.value;
        const extension = form.extension.value;
        const email = form.email.value;
        const title = form.title.value;
        const currentlyEmployed = form.currentlyEmployed.checked;

        const url = `/api/employees/${id}`;
        
        fetch(url, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8', // Fixed typo here
            },
            body: JSON.stringify({
                name,
                extension,
                email,
                title,
                currentlyEmployed
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to update employee.");
            }
            return response.json();
        })
        .then(updatedData => {
        this.setState({
            alertVisible: true,
            alertColor: 'success',
            alertMessage: updatedData.message || "Employee updated successfully!",
        });

            // Optionally update state or redirect the user here
    })
        .catch(err => {
            console.error("Error updating employee:", err);
            alert("Error updating employee. Check console for details.");
        });
    }

    render() {
        const employee = this.state.employee;

        if (!employee) return <h2>Loading...</h2>;

        return (
        <Card>
            <Card.Header as="h5">Edit {this.state.employee.name}</Card.Header>
            <Card.Body>
                <Card.Text>
                    <Container fluid>
                        <form name="employeeUpdate" onSubmit={this.handleSubmit}>
                            <Row>
                                <Col md={2}>ID</Col>
                                <Col md="auto"><input type="text" name="id" value={employee._id} readOnly /></Col>
                            </Row>
                            <Row>
                                <Col md={2}>Name:</Col>
                                <Col md="auto"><input type="text" name="name" defaultValue={employee.name} /></Col>
                            </Row>
                            <Row>
                                <Col md={2}>Extension:</Col>
                                <Col md="auto"><input type="text" maxLength="4" name="extension" defaultValue={employee.extension} /></Col>
                            </Row>
                            <Row>
                                <Col md={2}>Email:</Col>
                                <Col md="auto"><input type="text" name="email" defaultValue={employee.email} /></Col>
                            </Row>
                            <Row>
                                <Col md={2}>Title:</Col>
                                <Col md="auto"><input type="text" name="title" defaultValue={employee.title} /></Col>
                            </Row>
                            <Row>
                                <Col md={2}>Date Hired:</Col>
                                <Col md="auto"><input type="text" name="dateHired" value={employee.dateHired ? employee.dateHired.toDateString() : ''} readOnly /></Col>
                            </Row>
                            <Row>
                                <Col md={2}>Currently Employed:</Col>
                                <Col md="auto"><input type="checkbox" name="currentlyEmployed" defaultChecked={employee.currentlyEmployed} /></Col>
                            </Row>
                            <Row>
                                <Col md={2}><Button type="submit" variant="primary" size="sm" value="Update" className="mt-3">Update Employee</Button></Col>
                            </Row>
                            <Row className="mt-3">
                                <Col>
                                    <Alert
                                        variant={this.state.alertColor}
                                        show={this.state.alertVisible}
                                        onClose={() => this.setState({ alertVisible: false })}
                                        dismissible
                                    >
                                        {this.state.alertMessage}
                                    </Alert>
                                </Col>
                            </Row>
                        </form>
                    </Container>
                </Card.Text>
            </Card.Body>
        </Card>



        );
    }
}