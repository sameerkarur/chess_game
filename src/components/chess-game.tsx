import { useGame } from "@/lib/game-context"
import { ChessBoard } from "./chess-board"
import { Position } from "@/types/chess"

export function ChessGame() {
  const { state, dispatch } = useGame()

  function handleSquareClick(position: Position) {
    const clickedPiece = state.pieces.find(
      (p) => p.position.x === position.x && p.position.y === position.y
    )

    // If a piece is already selected
    if (state.selectedPiece) {
      // If clicking on a valid move position
      if (
        state.validMoves.some(
          (move) => move.x === position.x && move.y === position.y
        )
      ) {
        // If there's a piece at the target position, capture it
        if (clickedPiece) {
          dispatch({ type: "CAPTURE_PIECE", piece: clickedPiece })
        }
        // Move the selected piece
        dispatch({
          type: "MOVE_PIECE",
          from: state.selectedPiece.position,
          to: position,
        })
      } else {
        // If clicking on an invalid position, clear selection
        dispatch({ type: "CLEAR_SELECTION" })
      }
    }
    // If no piece is selected and clicking on a piece of the current player's color
    else if (clickedPiece && clickedPiece.color === state.currentTurn) {
      dispatch({ type: "SELECT_PIECE", piece: clickedPiece })
      // TODO: Calculate and dispatch valid moves
      dispatch({ type: "SET_VALID_MOVES", moves: [] })
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="text-2xl font-bold">
        {state.currentTurn === "white" ? "White" : "Black"}'s Turn
      </div>
      <ChessBoard gameState={state} onSquareClick={handleSquareClick} />
      <div className="flex gap-8">
        <div>
          <h3 className="text-lg font-semibold">Captured White Pieces</h3>
          <div className="flex gap-2">
            {state.capturedPieces
              .filter((p) => p.color === "white")
              .map((piece, i) => (
                <div key={i} className="text-2xl">
                  {piece.type}
                </div>
              ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Captured Black Pieces</h3>
          <div className="flex gap-2">
            {state.capturedPieces
              .filter((p) => p.color === "black")
              .map((piece, i) => (
                <div key={i} className="text-2xl">
                  {piece.type}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
