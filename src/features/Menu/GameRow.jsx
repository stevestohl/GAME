import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

/**
 * One game "row" on the Game-Cast and Game-Temple pages: a light card with a description
 * on one side and a square button on the other. `flip` swaps the sides so rows alternate down the page.
 */
export default function GameRow({ title, players, description, flip, children }) {
    const info = (
        <Col xs={7} className="d-flex flex-column justify-content-center text-start">
            <div className="fw-bold mb-1">
                {title}
                {players && <span className="text-muted fw-normal small ms-2">{players}</span>}
            </div>
            <div className="small text-secondary lh-sm">{description}</div>
        </Col>
    );

    const action = (
        <Col xs={5} className="d-flex position-relative overflow-visible">
            {children}
        </Col>
    );

    return (
        <Col xs={12}>
            <Card className="bg-light border-0 shadow-sm">
                <Card.Body className="p-1">
                    <Row className="g-1 align-items-stretch">
                        {flip ? <>{action}{info}</> : <>{info}{action}</>}
                    </Row>
                </Card.Body>
            </Card>
        </Col>
    );
}
