import { GameProvider } from "@/lib/game-context"
import { ChessGame } from "@/components/chess-game"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <GameProvider>
        <ChessGame />
      </GameProvider>
    </main>
  )
}
