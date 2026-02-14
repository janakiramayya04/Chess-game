import { useState, useEffect, useRef } from "react";
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
        
        // Sync local chess engine with backend data
        const newGame = new Chess(initialFen);
        setGame(newGame);
      } catch (error) {
        console.error("Error init game:", error);
      }
    };
    initGame();
  }, []);

  // Sync Logic: Local -> Backend
  function onDrop(sourceSquare, targetSquare) {
    // 1. Create a temporary game instance to check if move is valid locally
    const gameCopy = new Chess(game.fen());
    
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to queen for simplicity
      });

      // If move is invalid, gameCopy.move() returns null
      if (!move) return false; 

      // 2. VALID MOVE: Update UI State IMMEDIATELY
      setGame(gameCopy); 

      // 3. Send to Backend (Background process)
      // We do not await this, so the UI doesn't freeze
      makeMove(gameId, sourceSquare + targetSquare).then((response) => {
        // Optional: If backend returns a different FEN, correct it here
        if (response.fen !== gameCopy.fen()) {
           setGame(new Chess(response.fen));
        }
      }).catch((err) => {
        console.error("Backend refused move", err);
        // Rollback on error
        game.undo();
        setGame(new Chess(game.fen())); 
      });

      return true; // Return true implies "Drop successful"
      
    } catch (error) {
      return false; // Snap back if local validation fails
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h2>Chess Game</h2>
      <Chessboard 
        position={game.fen()} 
        onPieceDrop={onDrop} 
      />
    </div>
  );
}

export default App;