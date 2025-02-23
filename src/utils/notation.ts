import { ChessPiece, PieceType, Position } from "@/types/chess"

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const

export interface MoveNotation {
  fullMove: string
  isCapture: boolean
  isCheck: boolean
  isCheckmate: boolean
  isCastling: boolean
  isPromotion: boolean
}

function getPieceSymbol(piece: ChessPiece): string {
  switch (piece.type) {
    case PieceType.KING:
      return "K"
    case PieceType.QUEEN:
      return "Q"
    case PieceType.ROOK:
      return "R"
    case PieceType.BISHOP:
      return "B"
    case PieceType.KNIGHT:
      return "N"
    case PieceType.PAWN:
      return ""
    default:
      return ""
  }
}

function positionToSquare(position: Position): string {
  return `${FILES[position.x]}${RANKS[position.y]}`
}

function isCastlingMove(piece: ChessPiece, from: Position, to: Position): boolean {
  return (
    piece.type === PieceType.KING &&
    Math.abs(to.x - from.x) === 2
  )
}

export function getMoveNotation(
  piece: ChessPiece,
  from: Position,
  to: Position,
  isCapture: boolean,
  isCheck: boolean,
  isCheckmate: boolean
): MoveNotation {
  const isCastling = isCastlingMove(piece, from, to)
  let moveText = ""

  if (isCastling) {
    moveText = to.x > from.x ? "O-O" : "O-O-O"
  } else {
    const pieceSymbol = getPieceSymbol(piece)
    const captureSymbol = isCapture ? "x" : ""
    const targetSquare = positionToSquare(to)
    
    if (piece.type === PieceType.PAWN && isCapture) {
      moveText = `${FILES[from.x]}${captureSymbol}${targetSquare}`
    } else {
      moveText = `${pieceSymbol}${captureSymbol}${targetSquare}`
    }
  }

  if (isCheckmate) {
    moveText += "#"
  } else if (isCheck) {
    moveText += "+"
  }

  return {
    fullMove: moveText,
    isCapture,
    isCheck,
    isCheckmate,
    isCastling,
    isPromotion: false, // TODO: Add promotion handling
  }
}

export function formatMoveHistory(moves: MoveNotation[]): string {
  return moves
    .reduce<string[]>((acc, move, index) => {
      if (index % 2 === 0) {
        acc.push(`${Math.floor(index / 2) + 1}. ${move.fullMove}`)
      } else {
        acc[acc.length - 1] += ` ${move.fullMove}`
      }
      return acc
    }, [])
    .join(" ")
