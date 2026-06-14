import React, { useState, useEffect } from "react";

export default function Flashcards() {
  const [drinks, setDrinks] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Load drinks on mount
  useEffect(() => {
    async function loadDrinks() {
      const res = await fetch("/api/drinks");
      const data = await res.json();
      setDrinks(data.drinks);
    }
    loadDrinks();
  }, []);

  // Current drink
  const drink = drinks[index];

  const handleFlip = () => setFlipped(!flipped);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % drinks.length);
    setFlipped(false);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + drinks.length) % drinks.length);
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
          background: #636363;
          color: rgb(141, 132, 132);
          font-family: Arial;
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
          border-radius: 12px;
          background: #252525;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          backface-visibility: hidden;
          transition: transform 0.6s;
          padding: 20px;
          text-align: center;
        }

        .back {
          transform: rotateY(180deg);
          flex-direction: row;
          justify-content:center;
          align-items: center;
          text-align: left;
          gap: 20px
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
          background: #555;
          color: white;
          border-radius: 8px;
          font-size: 1rem;
        }
      `}</style>

      <div className="flashcard-wrapper">
        <div id="card" className={flipped ? "flipped" : ""}>
          {/* FRONT SIDE */}
          <div className="front">
            {drink ? drink.drinkName : "Loading..."}
          </div>

          {/* BACK SIDE */}
          <div className="back">
            {drink && (
              <>
                <div className="recipe-title">{drink.drinkName}</div>
                <ul className="recipe-list">
                  {drink.recipe.split(",").map((item, i) => (
                    <li key={i}>{item.trim()}</li>
                  ))}
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
    </>
  );
}
