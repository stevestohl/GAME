import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';

export default function CouchCastJudgingTV({ currentPrompt, submissions, judgeName }) {
    return (
        <Container className="mt-5 d-flex flex-column align-items-center pb-5">
            {/* The Prompt Header */}
            <h1 className="display-4 fw-bold text-white text-center bg-dark p-4 rounded shadow mb-4 w-100" style={{ maxWidth: '900px' }}>
                "{currentPrompt}"
            </h1>

            <h3 className="text-warning fw-bold mb-4">
                {judgeName} is deciding the winner! Read them aloud:
            </h3>

            {/* The Grid of Anonymous Answers */}
            <Row className="w-100 justify-content-center" style={{ maxWidth: '1000px' }}>
                {submissions && submissions.length > 0 ? (
                    submissions.map((sub, index) => (
                        <Col md={6} lg={4} key={index} className="mb-4">
                            <Card className="shadow-lg h-100 border-0" style={{ minHeight: '150px' }}>
                                <Card.Body className="d-flex align-items-center justify-content-center p-4">
                                    <h3 className="text-center fw-bold text-primary m-0">
                                        {sub.answer}
                                    </h3>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <h2 className="text-danger">No one submitted anything! How embarrassing.</h2>
                )}
            </Row>
        </Container>
    );
}