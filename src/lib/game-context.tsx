import { createContext, useContext, useReducer, ReactNode } from "react"
import { GameState, Position, ChessPiece, PlayerColor } from "@/types/chess"
import { createInitialGameState } from "@/utils/game-state"
import { isKingInCheck, isCheckmate, isStalemate } from "@/utils/check-validator"

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
      const newState = {
        ...state,
        pieces: state.pieces.map((piece) =>
          piece.position === action.from
            ? { ...piece, position: action.to, hasMoved: true }
            : piece
        ),
        currentTurn: state.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE,
        selectedPiece: null,
        validMoves: [],
      }
      return updateGameStatus(newState)
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
