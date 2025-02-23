import { ChessPiece, GameState, PieceType, PlayerColor, Position } from "@/types/chess"

function createPiece(
  type: PieceType,
  color: PlayerColor,
  position: Position
): ChessPiece {
  return {
    type,
    color,
    position,
    hasMoved: false,
  }
}

function createInitialPieces(): ChessPiece[] {
  const pieces: ChessPiece[] = []

  // Initialize pawns
  for (let i = 0; i < 8; i++) {
    pieces.push(createPiece(PieceType.PAWN, PlayerColor.WHITE, { x: i, y: 1 }))
    pieces.push(createPiece(PieceType.PAWN, PlayerColor.BLACK, { x: i, y: 6 }))
  }

  // Initialize back row pieces
  const backRowPieces: PieceType[] = [
    PieceType.ROOK,
    PieceType.KNIGHT,
    PieceType.BISHOP,
    PieceType.QUEEN,
    PieceType.KING,
    PieceType.BISHOP,
    PieceType.KNIGHT,
    PieceType.ROOK,
  ]

  backRowPieces.forEach((type, i) => {
    pieces.push(createPiece(type, PlayerColor.WHITE, { x: i, y: 0 }))
    pieces.push(createPiece(type, PlayerColor.BLACK, { x: i, y: 7 }))
  })

  return pieces
}

export function createInitialGameState(): GameState {
  return {
    pieces: createInitialPieces(),
    currentTurn: PlayerColor.WHITE,
    selectedPiece: null,
    validMoves: [],
    capturedPieces: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  }
}
