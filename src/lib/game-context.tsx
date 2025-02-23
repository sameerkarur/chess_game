import { createContext, useContext, useReducer, ReactNode } from "react"
import { GameState, Position, ChessPiece } from "@/types/chess"
import { createInitialGameState } from "@/utils/game-state"

type GameAction =
  | { type: "SELECT_PIECE"; piece: ChessPiece }
  | { type: "MOVE_PIECE"; from: Position; to: Position }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_VALID_MOVES"; moves: Position[] }
  | { type: "CAPTURE_PIECE"; piece: ChessPiece }

interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<GameAction>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_PIECE":
      return {
        ...state,
        selectedPiece: action.piece,
      }

    case "MOVE_PIECE":
      return {
        ...state,
        pieces: state.pieces.map((piece) =>
          piece.position === action.from
            ? { ...piece, position: action.to, hasMoved: true }
            : piece
        ),
        currentTurn: state.currentTurn === "white" ? "black" : "white",
        selectedPiece: null,
        validMoves: [],
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

    case "CAPTURE_PIECE":
      return {
        ...state,
        pieces: state.pieces.filter((p) => p !== action.piece),
        capturedPieces: [...state.capturedPieces, action.piece],
      }

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
