import React, { useState, useEffect } from "react";
import { Form, Modal, Spinner } from "react-bootstrap"; // Importing Form for React-Bootstrap radios

// 🌐 Your live Render backend base URL
const API_BASE_URL = 'https://game-temple-backend.onrender.com'

export default function Flashcards() {
  const [allDrinks, setAllDrinks] = useState([]); // Holds raw API array
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState("default"); // Options: "default" or "all"
  const [isLoading, setIsLoading] = useState(true)

  // Load drinks on mount
  useEffect(() => {
    async function loadDrinks() {
      try{ 
        const res = await fetch(`${API_BASE_URL}/api/drinks`);
        const data = await res.json();
        setAllDrinks(data.drinks || []);
    } catch (error){
      console.log("Failed to wake up server:", error)
  } finally {
      setIsLoading(false)
  }
  }
    loadDrinks();
  }, []);

  // COMPUTED ARRAY: Dynamically filters based on our radio button selection
  const visibleDrinks = allDrinks.filter((drink) => {
    if (filterMode === "default") {
      return drink.isDefault === true;
    }
    return true; // "all" mode returns everything
  });

  // Current drink pulled from the filtered array
  const drink = visibleDrinks[index];

  // Safely handle changing the radio filters
  const handleFilterChange = (mode) => {
    setFilterMode(mode);
    setIndex(0); // Reset index to prevent out-of-bounds errors
    setFlipped(false); // Reset flip state
  };

  const handleFlip = () => setFlipped(!flipped);

  const handleNext = () => {
    if (visibleDrinks.length === 0) return;
    setIndex((prev) => (prev + 1) % visibleDrinks.length);
    setFlipped(false);
  };

  const handlePrev = () => {
    if (visibleDrinks.length === 0) return;
    setIndex((prev) => (prev - 1 + visibleDrinks.length) % visibleDrinks.length);
    setFlipped(false);
  };

  return (
    <>
      <style>{`
        .flashcard-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: calc(100vh - 80px);
          color: rgb(203, 143, 252);
          font-family: Arial;
        }

        /* Radio Toggle Container Style */
        .filter-container {
          background: rgba(255, 255, 255, 0.9);
          padding: 10px 20px;
          border-radius: 30px;
          margin-bottom: 25px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          color: #333;
          display: flex;
          gap: 20px;
        }

        #card {
          position: relative;
          width: 400px;
          height: 250px;
          perspective: 1000px;
        }

        .front, .back {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          background: #3c89fd;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          backface-visibility: hidden;
          transition: transform 0.6s;
          padding: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .back {
          transform: rotateY(180deg);
          flex-direction: column; /* Changed to column to sit title above list nicely */
          justify-content: center;
          align-items: center;
          text-align: left;
          gap: 10px;
        }

        .recipe-list {
          margin: 0;
          padding-left: 20px;
        }

        #card.flipped .front {
          transform: rotateY(180deg);
        }

        #card.flipped .back {
          transform: rotateY(0deg);
        }

        .controls {
          margin-top: 20px;
          display: flex;
          gap: 20px;
        }

        button {
          padding: 10px 20px;
          border: none;
          background: white;
          color: #3c89fd;
          border-radius: 8px;
          font-size: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }
      `}</style>

      <div className="flashcard-wrapper">
        
        {/* RADIO BUTTON TOGGLES */}
        <div className="filter-container">
          <Form.Check
            type="radio"
            label="Default Cards"
            name="filterMode"
            id="filter-default"
            checked={filterMode === "default"}
            onChange={() => handleFilterChange("default")}
          />
          <Form.Check
            type="radio"
            label="All Cards"
            name="filterMode"
            id="filter-all"
            checked={filterMode === "all"}
            onChange={() => handleFilterChange("all")}
          />
        </div>

        <div id="card" className={flipped ? "flipped" : ""}>
          {/* FRONT SIDE */}
          <div className="front">
            {visibleDrinks.length === 0 ? "No cards found..." : (drink ? drink.drinkName : "Loading...")}
          </div>

          {/* BACK SIDE */}
          <div className="back">
            {drink && (
              <>
                <div className="recipe-title fw-bold border-bottom pb-1 mb-1">{drink.drinkName}</div>
                <ul className="recipe-list">
                  {drink.recipe ? drink.recipe.split(",").map((item, i) => (
                    <li key={i}>{item.trim()}</li>
                  )) : <li>No recipe found</li>}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="controls">
          <button onClick={handlePrev}>◀</button>
          <button onClick={handleFlip}>Flip</button>
          <button onClick={handleNext}>▶</button>
        </div>
      </div>
      <Modal
          show={isLoading}
          backdrop="static"
          keyboard={false}
          centered
          >
              <Modal.Body className='d-flex flex-column align-items-center justify-content-center p-4 text-center'>
                  <Spinner animation='border' variant='primary' className='mb-3'/>
                      <h4 className='fw-bold text-dark'>Creating Room...</h4>
                      <p className='text-muted small mb-0'>
                          Waking up server...
                      </p>
              </Modal.Body>
      </Modal>
    </>
  );
}