import { ChessPiece, PieceType, Position } from "@/types/chess"

interface PromotionDialogProps {
  pawn: ChessPiece
  position: Position
  onPromote: (type: PieceType) => void
}

const PROMOTION_PIECES = [
  PieceType.QUEEN,
  PieceType.ROOK,
  PieceType.BISHOP,
  PieceType.KNIGHT,
] as const

export function PromotionDialog({
  pawn,
  position,
  onPromote,
}: PromotionDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Choose Promotion Piece</h2>
        <div className="grid grid-cols-2 gap-4">
          {PROMOTION_PIECES.map((type) => (
            <button
              key={type}
              onClick={() => onPromote(type)}
              className="w-20 h-20 flex items-center justify-center text-4xl bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              {getPieceEmoji({ ...pawn, type })}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

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
