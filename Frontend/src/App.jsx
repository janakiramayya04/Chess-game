import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { createGame, getBoard, makeMove } from "./services/gameApi";

function App() {
  const [game, setGame] = useState(new Chess());
  const [gameId, setGameId] = useState(null);

  // Initialize Game
  useEffect(() => {
    const initGame = async () => {
      try {
        const id = await createGame();
        setGameId(id);
        const initialFen = await getBoard(id);
        setGame(new Chess(initialFen));
        console.log("Game initialized:", id); 
      } catch (error) {
        console.error("Error init game:", error);
      }
    };
    initGame();
  }, []);

  function onDrop(sourceSquare, targetSquare) {
    // v5 COMPATIBILITY CHECK:
    // If the library passes an object as the first argument, extract values.
    if (typeof sourceSquare === 'object') {
        targetSquare = sourceSquare.targetSquare;
        sourceSquare = sourceSquare.sourceSquare;
    }

    console.log("Drop detected:", sourceSquare, targetSquare);

    if (!gameId) {
       console.warn("No Game ID");
       return false;
    }

    // 1. Optimistic Update (Local)
    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      
      if (!move) {
        console.log("Invalid move (rules)");
        return false;
      }
      
      setGame(gameCopy); // Update UI instantly
    } catch (error) {
      console.log("Invalid move (error):", error);
      return false;
    }

    // 2. Backend Sync
    const isPromotion = game.get(sourceSquare)?.type === "p" && 
                       (targetSquare[1] === "8" || targetSquare[1] === "1");
    const moveString = sourceSquare + targetSquare + (isPromotion ? "q" : "");

    makeMove(gameId, moveString)
      .then((response) => {
        if (response.fen !== gameCopy.fen()) {
          setGame(new Chess(response.fen));
        }
      })
      .catch((err) => {
        console.error("Backend failed:", err);
        setGame(new Chess(game.fen())); // Revert on failure
      });

    return true;
  }

  // CONFIGURATION FOR VERSION 5
  const boardOptions = {
    position: game.fen(),
    onPieceDrop: onDrop,
    boardWidth: 500,
    arePiecesDraggable: true,
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h2>Chess Game</h2>
      {/* Pass everything via the 'options' prop */}
      <Chessboard options={boardOptions} />
    </div>
  );
}

export default App;