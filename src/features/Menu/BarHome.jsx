import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap'; 
// import gameLogo from "../src/assets/logos/Logo_Temple_Table.jpg";
// import martini from '../src/assets/logos/MartiniLogo.jpg'
import burglarEmpty from '../../assets/logos/Burglar_Alone.png'; 
import burglarWithButton from '../../assets/logos/Burglar_with_Button.png';

export default function BarHome() {
    // 1. Hooks must be declared inside the component function
    // 2. Fixed typo from setBurlarActive to setBurglarActive
    const [burglarActive, setBurglarActive] = useState(false);
    // 3. Removed the stray '*' in useState
    const [isStolen, setIsStolen] = useState(false);

    useEffect(() => {
        const initialTimer = setTimeout(() => {
            setBurglarActive(true);
            setTimeout(() => {
                setIsStolen(true);
            }, 1200); 
        }, 2000); // Sets burglar delay = 2 seconds
        
        // 4. Fixed missing closing parenthesis on the cleanup function
        return () => clearTimeout(initialTimer);
    }, []);

    return (
        <div className="page-container">
            <Card className='main-card'>
                <Card.Header className="main-card-header">
                    BAR-TEMPLE
                </Card.Header>
                
                <Card.Body className='p-1'>
                    {/* Logo wrapper */}
                    <div className="my-1 bg-white p-2 rounded-3 d-inline-block shadow-lg">
                        <img 
                            src="https://game-temple.org/MartiniLogo.gif"
                            alt="Animated Game-Temple Logo"
                            style={{ maxWidth: "130px", height: "auto" }}
                        />
                    </div>

                    <Card className="border p-1 bg-body-secondary shadow-sm rounded-3">
                        <Card.Title className='text-muted text-center fw-bold small mb-1 tracking-wider'>
                            Bartending
                        </Card.Title>

                        {/* Single Player / Reference Links */}
                        <Row className='g-2'>
                            <Col xs={6}>
                                <Button 
                                    variant='primary' 
                                    href='/FlashcardGame' 
                                    className="fw-bold w-100 h-100 py-2 shadow-sm text-white">
                                    Drink Quiz <br/>🍹🍹
                                </Button>
                            </Col>
                            
                            <Col xs={6}>
                                <Button 
                                    variant='primary' 
                                    href='/FlashcardsList' 
                                    className="fw-bold w-100 h-100 py-2 shadow-sm text-white">
                                    Drink List<br/>
                                    📃📃
                                </Button>
                            </Col>

                            <Col xs={6}>
                                <Button 
                                    variant='primary' 
                                    href='/Flashcards' 
                                    className="fw-bold w-100 h-100 py-2 shadow-sm text-white">
                                    Flashcards<br/>
                                    🎴🎴
                                </Button>
                            </Col>
                            
                            {/* 🥷 THE BURGLAR ZONE */}
                            <Col xs={6} className="position-relative overflow-visible">
                                {/* The Burglar Character */}
                                <div className={`burglar-rtl ${burglarActive ? 'active' : ''}`}>
                                    <img 
                                        src={isStolen ? burglarWithButton : burglarEmpty} 
                                        alt="Button Burglar"
                                        style={{ width: '60px', height: 'auto', mixBlendMode: 'multiply' }} 
                                    />
                                </div>

                                {/* The Button (Swaps to a dashed outline when stolen) */}
                                {!isStolen ? (
                                    <Button 
                                        variant="primary" 
                                        className="fw-bold w-100 h-100 py-2 shadow-sm"
                                    >
                                        Button<br/>
                                        🔘🔘
                                    </Button>
                                ) : (
                                    <div className="w-100 h-100 py-2 rounded d-flex flex-column justify-content-center align-items-center stolen-slot fw-bold small">
                                        <span>Stolen!</span>
                                        <span className="fs-5">💨</span>
                                    </div>
                                )}
                            </Col> {/* 5. Added missing closing Col tag here */}
                        </Row>
                    </Card>
                </Card.Body>
            </Card>
        </div>
    );
}