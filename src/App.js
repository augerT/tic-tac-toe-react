import { useState } from "react";

function Square({ value, onSquareClick, isWinning }) {
  return (
    <button
      className={`square ${isWinning ? "winning" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  const results = calculateWinner(squares);
  let status;
  if (results) {
    status = `Winner: ${results.winner}`;
  } else {
    status = `Next player: ${xIsNext ? "X" : "O"}`;
  }

  // Event handlers
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }

    const nextSquares = squares.slice();

    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }

    const position = {
      row: Math.floor(i / 3) + 1,
      col: (i % 3) + 1,
    };

    onPlay(nextSquares, position);
  }

  // UI Helper function
  function getBoardRows() {
    const rowElements = [];
    for (let row = 0; row < 3; row++) {
      const squaresInRow = [];
      for (let col = 0; col < 3; col++) {
        const squareIndex = row * 3 + col;
        squaresInRow.push(
          <Square
            key={squareIndex}
            value={squares[squareIndex]}
            onSquareClick={() => handleClick(squareIndex)}
            isWinning={results?.winningSquares?.includes(squareIndex)}
          />
        );
      }
      rowElements.push(
        <div key={row} className="board-row">
          {squaresInRow}
        </div>
      );
    }
    return rowElements;
  }

  return (
    <>
      <div className="status">{status}</div>
      {getBoardRows()}
    </>
  );
}

export default function Game() {
  // State declarations
  const [history, setHistory] = useState([
    {
      squares: Array(9).fill(null),
      lastMove: null,
    },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(false);

  // Derived State
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  // Event Handlers
  function handlePlay(nextSquares, position) {
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      {
        squares: nextSquares,
        lastMove: position,
      },
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function setMoveOrder() {
    setIsAscending(!isAscending);
  }

  // UI helper function
  function getMovesList() {
    const moveItems = history.map((historyItem, move) => {
      let content;

      // Skip position text for initial state
      if (move === 0) {
        content =
          currentMove === 0 ? (
            "You are at game start"
          ) : (
            <button onClick={() => jumpTo(move)}>Go to game start</button>
          );
        return <li key={move}>{content}</li>;
      }

      // Determine which player made the move (X on even moves, O on odd moves)
      const player = move % 2 === 0 ? "O" : "X";
      const position = historyItem.lastMove;
      const moveDescription = `${player} played at (${position.row}, ${position.col})`;

      if (move === currentMove) {
        content = moveDescription;
      } else {
        content = (
          <button onClick={() => jumpTo(move)}>{moveDescription}</button>
        );
      }

      return <li key={move}>{content}</li>;
    });

    return isAscending ? [...moveItems].reverse() : moveItems;
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <div className="swap-order">
          <button onClick={() => setMoveOrder()}>
            {isAscending ? "Set Descending Order" : "Set Ascending Order"}
          </button>
        </div>
        <ol reversed={isAscending}>{getMovesList()}</ol>
      </div>
    </div>
  );
}

// Utility
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  // First, check for a winner
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winningSquares: lines[i] };
    }
  }
  // If no winner and board is full, it's a draw
  if (squares.every((square) => square !== null)) {
    return { winner: "It's a draw!", winningSquares: [] };
  }

  // No winner and bord isn't full
  return null;
}
