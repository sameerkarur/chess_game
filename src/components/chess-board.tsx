import { Position, GameState, ChessPiece } from "@/types/chess"
import { cn } from "@/lib/utils"

interface ChessBoardProps {
  gameState: GameState
  onSquareClick: (position: Position) => void
}

export function ChessBoard({ gameState, onSquareClick }: ChessBoardProps) {
  const { pieces, selectedPiece, validMoves } = gameState

  function getPieceAtPosition(position: Position): ChessPiece | undefined {
    return pieces.find(
      (piece) =>
        piece.position.x === position.x && piece.position.y === position.y
    )
  }

  function isValidMove(position: Position): boolean {
    return validMoves.some(
      (move) => move.x === position.x && move.y === position.y
    )
  }

  function renderSquare(position: Position) {
    const isLightSquare = (position.x + position.y) % 2 === 0
    const piece = getPieceAtPosition(position)
    const isSelected = selectedPiece?.position === position
    const isValidMoveSquare = isValidMove(position)

    return (
      <div
        key={`${position.x}-${position.y}`}
        className={cn(
          "w-16 h-16 flex items-center justify-center relative",
          isLightSquare ? "bg-amber-100" : "bg-amber-800",
          isSelected && "ring-2 ring-blue-500",
          isValidMoveSquare && "ring-2 ring-green-500"
        )}
        onClick={() => onSquareClick(position)}
      >
        {piece && (
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              piece.color === "white" ? "text-white" : "text-black"
            )}
          >
            {getPieceEmoji(piece)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-8 gap-0 border-2 border-amber-900">
      {Array.from({ length: 8 }, (_, y) =>
        Array.from({ length: 8 }, (_, x) => renderSquare({ x, y }))
      )}
    </div>
  )
}

// Temporary emoji representation of pieces
function getPieceEmoji(piece: ChessPiece): string {
  const emojiMap = {
    white: {
      king: "♔",
      queen: "♕",
      rook: "♖",
      bishop: "♗",
      knight: "♘",
      pawn: "♙",
    },
    black: {
      king: "♚",
      queen: "♛",
      rook: "♜",
      bishop: "♝",
      knight: "♞",
      pawn: "♟",
    },
  }

  return emojiMap[piece.color][piece.type]
}
