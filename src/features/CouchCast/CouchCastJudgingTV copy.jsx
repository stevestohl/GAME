import React from 'react';
import { Container, Card, Row, Col, Badge } from 'react-bootstrap';

export default function CouchCastJudgingTV({ 
    currentPrompt, 
    submissions, 
    judgeName, 
    winningSubmission // <-- NEW PROP: null if still deciding, contains the winning object when decided
}) {
    return (
        <Container className="mt-5 d-flex flex-column align-items-center pb-5">
            {/* The Prompt Header */}
            <h1 className="display-4 fw-bold text-white text-center bg-dark p-4 rounded shadow mb-4 w-100" style={{ maxWidth: '900px' }}>
                "{currentPrompt?.text || currentPrompt}"
            </h1>
            {/* CONDITIONAL RENDER: Are we deciding, or revealing? */}
            {!winningSubmission ? (
                /* --- STATE 1: WAITING FOR JUDGE --- */
                <>
                    <h3 className="text-warning fw-bold mb-4">
                        {judgeName} is deciding the winner! Read them aloud:
                    </h3>

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
                </>
            ) : (
                /* --- STATE 2: THE WINNER REVEAL --- */
                <div className="text-center mt-4 w-100" style={{ maxWidth: '800px' }}>
                    <h2 className="text-success fw-bold mb-4">WINNER!</h2>
                    <Card className="shadow-lg border-0 border-success border-5" style={{ minHeight: '200px' }}>
                        <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5 bg-light">
                            <h2 className="text-center fw-bold text-dark mb-4 display-5">
                                "{winningSubmission.answer}"
                            </h2>
                            {/* Assuming your submission object has a playerName property! */}
                            <Badge bg="success" className="fs-3 p-3 shadow">
                                Submitted by: {winningSubmission.playerName}
                            </Badge>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </Container>
    );
}