import { createContext, useContext, useReducer, ReactNode } from "react"
import { GameState, Position, ChessPiece, PlayerColor, PieceType } from "@/types/chess"
import { createInitialGameState } from "@/utils/game-state"
import { isKingInCheck, isCheckmate, isStalemate } from "@/utils/check-validator"
import { getMoveNotation } from "@/utils/notation"

type GameAction =
  | { type: "SELECT_PIECE"; piece: ChessPiece }
  | { type: "MOVE_PIECE"; from: Position; to: Position }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_VALID_MOVES"; moves: Position[] }
  | { type: "CAPTURE_PIECE"; piece: ChessPiece }
  | { type: "CHECK_GAME_STATUS" }

interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<GameAction>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

function handleCastling(
  state: GameState,
  piece: ChessPiece,
  to: Position
): ChessPiece[] {
  if (piece.type !== PieceType.KING || piece.hasMoved) return state.pieces

  const y = piece.color === PlayerColor.WHITE ? 0 : 7
  const isKingsideCastle = to.x === 6
  const isQueensideCastle = to.x === 2

  if (!isKingsideCastle && !isQueensideCastle) return state.pieces

  const rookX = isKingsideCastle ? 7 : 0
  const newRookX = isKingsideCastle ? 5 : 3

  return state.pieces.map((p) => {
    if (p === piece) {
      return { ...p, position: to, hasMoved: true }
    }
    if (
      p.type === PieceType.ROOK &&
      p.color === piece.color &&
      p.position.x === rookX &&
      p.position.y === y
    ) {
      return { ...p, position: { x: newRookX, y }, hasMoved: true }
    }
    return p
  })
}

function handleEnPassant(
  state: GameState,
  piece: ChessPiece,
  to: Position
): ChessPiece[] {
  if (
    piece.type === PieceType.PAWN &&
    state.enPassantTarget &&
    to.x === state.enPassantTarget.x &&
    to.y === state.enPassantTarget.y
  ) {
    // Remove the captured pawn
    return state.pieces.filter(
      (p) =>
        !(
          p.type === PieceType.PAWN &&
          p.position.x === to.x &&
          p.position.y === piece.position.y
        )
    )
  }
  return state.pieces
}

function getEnPassantTarget(
  piece: ChessPiece,
  from: Position,
  to: Position
): Position | null {
  if (
    piece.type === PieceType.PAWN &&
    Math.abs(to.y - from.y) === 2
  ) {
    return {
      x: to.x,
      y: (from.y + to.y) / 2,
    }
  }
  return null
}

function updateGameStatus(state: GameState): GameState {
  const currentColor = state.currentTurn
  const isInCheck = isKingInCheck(state.pieces, currentColor)
  const isInCheckmate = isCheckmate(state.pieces, currentColor)
  const isInStalemate = isStalemate(state.pieces, currentColor)

  return {
    ...state,
    isCheck: isInCheck,
    isCheckmate: isInCheckmate,
    isStalemate: isInStalemate,
  }
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_PIECE":
      return {
        ...state,
        selectedPiece: action.piece,
      }

    case "MOVE_PIECE": {
      const piece = state.pieces.find(
        (p) =>
          p.position.x === action.from.x && p.position.y === action.from.y
      )
      if (!piece) return state

      // Handle special moves
      let newPieces = handleCastling(state, piece, action.to)
      const isCastling = newPieces !== state.pieces
      let isCapture = false

      if (!isCastling) {
        newPieces = handleEnPassant(state, piece, action.to)
        if (newPieces === state.pieces) {
          // Check for regular capture
          const capturedPiece = state.pieces.find(
            (p) =>
              p.position.x === action.to.x &&
              p.position.y === action.to.y &&
              p.color !== piece.color
          )
          isCapture = !!capturedPiece
          newPieces = state.pieces.map((p) =>
            p === piece ? { ...p, position: action.to, hasMoved: true } : p
          )
        } else {
          isCapture = true
        }
      }

      const newState = {
        ...state,
        pieces: newPieces,
        currentTurn:
          state.currentTurn === PlayerColor.WHITE
            ? PlayerColor.BLACK
            : PlayerColor.WHITE,
        selectedPiece: null,
        validMoves: [],
        lastMove: {
          piece,
          from: action.from,
          to: action.to,
        },
        enPassantTarget: getEnPassantTarget(piece, action.from, action.to),
      }

      const updatedState = updateGameStatus(newState)
      
      // Record move in history
      const moveNotation = getMoveNotation(
        piece,
        action.from,
        action.to,
        isCapture,
        updatedState.isCheck,
        updatedState.isCheckmate
      )

      return {
        ...updatedState,
        moveHistory: [...state.moveHistory, moveNotation],
      }
    }

    case "CLEAR_SELECTION":
      return {
        ...state,
        selectedPiece: null,
        validMoves: [],
      }

    case "SET_VALID_MOVES":
      return {
        ...state,
        validMoves: action.moves,
      }

    case "CAPTURE_PIECE": {
      const newState = {
        ...state,
        pieces: state.pieces.filter((p) => p !== action.piece),
        capturedPieces: [...state.capturedPieces, action.piece],
      }
      return updateGameStatus(newState)
    }

    case "CHECK_GAME_STATUS":
      return updateGameStatus(state)

    default:
      return state
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialGameState())

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
