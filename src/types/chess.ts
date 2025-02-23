import { MoveNotation } from "@/utils/notation"

export const PieceType = {
  KING: "king",
  QUEEN: "queen",
  BISHOP: "bishop",
  KNIGHT: "knight",
  ROOK: "rook",
  PAWN: "pawn",
} as const

export type PieceType = typeof PieceType[keyof typeof PieceType]

export const PlayerColor = {
  WHITE: "white",
  BLACK: "black",
} as const

export type PlayerColor = typeof PlayerColor[keyof typeof PlayerColor]

export interface Position {
  x: number
  y: number
}

export interface ChessPiece {
  type: PieceType
  color: PlayerColor
  position: Position
  hasMoved: boolean
}

export interface PromotionState {
  pawn: ChessPiece
  position: Position
  isOpen: boolean
}

export interface GameState {
  pieces: ChessPiece[]
  currentTurn: PlayerColor
  selectedPiece: ChessPiece | null
  validMoves: Position[]
  capturedPieces: ChessPiece[]
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  lastMove: {
    piece: ChessPiece
    from: Position
    to: Position
  } | null
  enPassantTarget: Position | null
  moveHistory: MoveNotation[]
  promotionState: PromotionState | null
}
