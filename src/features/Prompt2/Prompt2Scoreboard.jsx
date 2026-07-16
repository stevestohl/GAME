import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';

export default function Prompt2Scoreboard({ players = [], isHost }) {
  // Sort players by score descending (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="d-flex justify-content-center align-items-center p-3">
      <Card className="shadow-lg border-0" style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Header className="text-center bg-dark text-white py-3">
          <h3 className="mb-0">Final Scores</h3>
        </Card.Header>

        <Card.Body>
          <Table hover responsive className="mt-2">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th className="text-end">Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr key={player.id} className={index === 0 ? "table-warning fw-bold" : ""}>
                  <td>{index + 1}</td>
                  <td>
                    {player.name} {index === 0 ? "🏆" : ""}
                  </td>
                  <td className="text-end">{player.score}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>

        <Card.Footer className="text-center bg-white border-0 py-3">
          <p className="text-muted">Thanks for playing!</p>
          {isHost && (
            <Button variant="outline-primary" onClick={() => window.location.reload()}>
              Play Again
            </Button>
          )}
        </Card.Footer>
      </Card>
    </div>
  );
}