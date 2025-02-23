import { ChessPiece, PlayerColor, Position } from "@/types/chess"
import { getValidMoves } from "./move-validator"

function findKing(pieces: ChessPiece[], color: PlayerColor): ChessPiece | undefined {
  return pieces.find((piece) => piece.type === "king" && piece.color === color)
}

function isPositionUnderAttack(
  position: Position,
  pieces: ChessPiece[],
  attackingColor: PlayerColor
): boolean {
  return pieces
    .filter((piece) => piece.color === attackingColor)
    .some((piece) => {
      const moves = getValidMoves(piece, pieces)
      return moves.some((move) => move.x === position.x && move.y === position.y)
    })
}

export function isKingInCheck(
  pieces: ChessPiece[],
  color: PlayerColor
): boolean {
  const king = findKing(pieces, color)
  if (!king) return false

  const oppositeColor = color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE
  return isPositionUnderAttack(king.position, pieces, oppositeColor)
}

export function wouldMoveResultInCheck(
  piece: ChessPiece,
  targetPosition: Position,
  pieces: ChessPiece[]
): boolean {
  // Create a copy of the pieces array with the proposed move
  const simulatedPieces = pieces.map((p) => {
    if (p === piece) {
      return { ...p, position: targetPosition }
    }
    // Remove captured piece if any
    if (p.position.x === targetPosition.x && p.position.y === targetPosition.y) {
      return null
    }
    return p
  }).filter((p): p is ChessPiece => p !== null)

  // Check if the move would result in the king being in check
  return isKingInCheck(simulatedPieces, piece.color)
}

export function isCheckmate(pieces: ChessPiece[], color: PlayerColor): boolean {
  if (!isKingInCheck(pieces, color)) return false

  // Check if any piece can make a move that gets out of check
  return !pieces
    .filter((piece) => piece.color === color)
    .some((piece) => {
      const moves = getValidMoves(piece, pieces)
      return moves.some(
        (move) => !wouldMoveResultInCheck(piece, move, pieces)
      )
    })
}

export function isStalemate(pieces: ChessPiece[], color: PlayerColor): boolean {
  if (isKingInCheck(pieces, color)) return false

  // Check if any piece can make a legal move
  return !pieces
    .filter((piece) => piece.color === color)
    .some((piece) => {
      const moves = getValidMoves(piece, pieces)
      return moves.some(
        (move) => !wouldMoveResultInCheck(piece, move, pieces)
      )
    })
}
