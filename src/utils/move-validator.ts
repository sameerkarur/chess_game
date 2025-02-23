import { ChessPiece, PieceType, Position, GameState } from "@/types/chess"
import { isKingInCheck } from "./check-validator"

function isWithinBoard(position: Position): boolean {
  return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8
}

function isOccupiedByFriendly(
  position: Position,
  pieces: ChessPiece[],
  color: string
): boolean {
  return pieces.some(
    (p) =>
      p.position.x === position.x &&
      p.position.y === position.y &&
      p.color === color
  )
}

function getPieceAt(
  position: Position,
  pieces: ChessPiece[]
): ChessPiece | undefined {
  return pieces.find(
    (p) => p.position.x === position.x && p.position.y === position.y
  )
}

function addMove(
  moves: Position[],
  position: Position,
  pieces: ChessPiece[],
  color: string
): boolean {
  if (!isWithinBoard(position)) return false
  if (isOccupiedByFriendly(position, pieces, color)) return false
  moves.push(position)
  // Return true if the path is not blocked (no piece at this position)
  return !getPieceAt(position, pieces)
}

function getCastlingMoves(king: ChessPiece, gameState: GameState): Position[] {
  const moves: Position[] = []
  if (king.hasMoved || isKingInCheck(gameState.pieces, king.color)) return moves

  const y = king.color === "white" ? 0 : 7
  const rooks = gameState.pieces.filter(
    (p) =>
      p.type === PieceType.ROOK &&
      p.color === king.color &&
      !p.hasMoved &&
      p.position.y === y
  )

  // Check kingside castling
  const kingsideRook = rooks.find((r) => r.position.x === 7)
  if (kingsideRook) {
    const path = [{ x: 5, y }, { x: 6, y }]
    if (
      path.every((pos) => !getPieceAt(pos, gameState.pieces)) &&
      path.every(
        (pos) =>
          !isKingInCheck(
            [
              ...gameState.pieces.filter((p) => p !== king),
              { ...king, position: pos },
            ],
            king.color
          )
      )
    ) {
      moves.push({ x: 6, y })
    }
  }

  // Check queenside castling
  const queensideRook = rooks.find((r) => r.position.x === 0)
  if (queensideRook) {
    const path = [{ x: 3, y }, { x: 2, y }, { x: 1, y }]
    if (
      path.every((pos) => !getPieceAt(pos, gameState.pieces)) &&
      path.slice(0, 2).every(
        (pos) =>
          !isKingInCheck(
            [
              ...gameState.pieces.filter((p) => p !== king),
              { ...king, position: pos },
            ],
            king.color
          )
      )
    ) {
      moves.push({ x: 2, y })
    }
  }

  return moves
}

function getPawnMoves(piece: ChessPiece, gameState: GameState): Position[] {
  const moves: Position[] = []
  const direction = piece.color === "white" ? 1 : -1
  const startRow = piece.color === "white" ? 1 : 6

  // Forward move
  const forwardOne = { x: piece.position.x, y: piece.position.y + direction }
  if (
    isWithinBoard(forwardOne) &&
    !getPieceAt(forwardOne, gameState.pieces)
  ) {
    moves.push(forwardOne)
    // Initial two-square move
    if (piece.position.y === startRow) {
      const forwardTwo = { x: piece.position.x, y: piece.position.y + 2 * direction }
      if (!getPieceAt(forwardTwo, gameState.pieces)) {
        moves.push(forwardTwo)
      }
    }
  }

  // Diagonal captures
  const diagonals = [
    { x: piece.position.x - 1, y: piece.position.y + direction },
    { x: piece.position.x + 1, y: piece.position.y + direction },
  ]

  diagonals.forEach((pos) => {
    if (isWithinBoard(pos)) {
      const pieceAtPos = getPieceAt(pos, gameState.pieces)
      if (pieceAtPos && pieceAtPos.color !== piece.color) {
        moves.push(pos)
      }
      // En passant
      else if (
        gameState.enPassantTarget &&
        pos.x === gameState.enPassantTarget.x &&
        pos.y === gameState.enPassantTarget.y
      ) {
        moves.push(pos)
      }
    }
  })

  return moves
}

function getRookMoves(piece: ChessPiece, pieces: ChessPiece[]): Position[] {
  const moves: Position[] = []
  const directions = [
    { x: 0, y: 1 },  // up
    { x: 0, y: -1 }, // down
    { x: 1, y: 0 },  // right
    { x: -1, y: 0 }, // left
  ]

  directions.forEach((dir) => {
    let multiplier = 1
    while (true) {
      const newPos = {
        x: piece.position.x + dir.x * multiplier,
        y: piece.position.y + dir.y * multiplier,
      }
      if (!addMove(moves, newPos, pieces, piece.color)) break
      multiplier++
    }
  })

  return moves
}

function getBishopMoves(piece: ChessPiece, pieces: ChessPiece[]): Position[] {
  const moves: Position[] = []
  const directions = [
    { x: 1, y: 1 },   // up-right
    { x: 1, y: -1 },  // down-right
    { x: -1, y: 1 },  // up-left
    { x: -1, y: -1 }, // down-left
  ]

  directions.forEach((dir) => {
    let multiplier = 1
    while (true) {
      const newPos = {
        x: piece.position.x + dir.x * multiplier,
        y: piece.position.y + dir.y * multiplier,
      }
      if (!addMove(moves, newPos, pieces, piece.color)) break
      multiplier++
    }
  })

  return moves
}

function getKnightMoves(piece: ChessPiece, pieces: ChessPiece[]): Position[] {
  const moves: Position[] = []
  const offsets = [
    { x: 2, y: 1 },
    { x: 2, y: -1 },
    { x: -2, y: 1 },
    { x: -2, y: -1 },
    { x: 1, y: 2 },
    { x: 1, y: -2 },
    { x: -1, y: 2 },
    { x: -1, y: -2 },
  ]

  offsets.forEach((offset) => {
    const newPos = {
      x: piece.position.x + offset.x,
      y: piece.position.y + offset.y,
    }
    addMove(moves, newPos, pieces, piece.color)
  })

  return moves
}

function getQueenMoves(piece: ChessPiece, pieces: ChessPiece[]): Position[] {
  return [
    ...getRookMoves(piece, pieces),
    ...getBishopMoves(piece, pieces),
  ]
}

function getKingMoves(piece: ChessPiece, gameState: GameState): Position[] {
  const moves: Position[] = []
  const offsets = [
    { x: -1, y: -1 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ]

  offsets.forEach((offset) => {
    const newPos = {
      x: piece.position.x + offset.x,
      y: piece.position.y + offset.y,
    }
    addMove(moves, newPos, gameState.pieces, piece.color)
  })

  // Add castling moves
  moves.push(...getCastlingMoves(piece, gameState))

  return moves
}

export function getValidMoves(piece: ChessPiece, gameState: GameState): Position[] {
  switch (piece.type) {
    case PieceType.PAWN:
      return getPawnMoves(piece, gameState)
    case PieceType.ROOK:
      return getRookMoves(piece, gameState.pieces)
    case PieceType.KNIGHT:
      return getKnightMoves(piece, gameState.pieces)
    case PieceType.BISHOP:
      return getBishopMoves(piece, gameState.pieces)
    case PieceType.QUEEN:
      return getQueenMoves(piece, gameState.pieces)
    case PieceType.KING:
      return getKingMoves(piece, gameState)
    default:
      return []
  }
}
