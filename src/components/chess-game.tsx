import { useGame } from "@/lib/game-context"
import { ChessBoard } from "./chess-board"
import { Position } from "@/types/chess"
import { getValidMoves } from "@/utils/move-validator"
import { wouldMoveResultInCheck } from "@/utils/check-validator"
import { cn } from "classnames"

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
      // Calculate valid moves and filter out moves that would result in check
      const validMoves = getValidMoves(clickedPiece, state.pieces).filter(
        (move) => !wouldMoveResultInCheck(clickedPiece, move, state.pieces)
      )
      dispatch({ type: "SET_VALID_MOVES", moves: validMoves })
    }
  }

  function getGameStatus() {
    if (state.isCheckmate) {
      const winner = state.currentTurn === "white" ? "Black" : "White"
      return `Checkmate! ${winner} wins!`
    }
    if (state.isStalemate) {
      return "Stalemate! The game is a draw."
    }
    if (state.isCheck) {
      return "Check!"
    }
    return `${state.currentTurn === "white" ? "White" : "Black"}'s Turn`
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className={cn(
        "text-2xl font-bold",
        state.isCheck && "text-red-600",
        state.isCheckmate && "text-purple-600",
        state.isStalemate && "text-gray-600"
      )}>
        {getGameStatus()}
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
