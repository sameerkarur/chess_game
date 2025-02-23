import { MoveNotation } from "@/utils/notation"
import { cn } from "@/lib/utils"

interface MoveHistoryProps {
  moves: MoveNotation[]
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  return (
    <div className="w-64 h-96 overflow-y-auto bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Move History</h3>
      <div className="space-y-2">
        {moves.reduce<JSX.Element[]>((acc, move, index) => {
          if (index % 2 === 0) {
            acc.push(
              <div
                key={Math.floor(index / 2)}
                className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded"
              >
                <span className="w-8 text-gray-500">
                  {Math.floor(index / 2) + 1}.
                </span>
                <span
                  className={cn(
                    "flex-1",
                    move.isCapture && "text-red-600",
                    move.isCheck && "text-blue-600",
                    move.isCheckmate && "text-purple-600",
                    move.isCastling && "text-green-600"
                  )}
                >
                  {move.fullMove}
                </span>
                {index + 1 < moves.length && (
                  <span
                    className={cn(
                      "flex-1",
                      moves[index + 1].isCapture && "text-red-600",
                      moves[index + 1].isCheck && "text-blue-600",
                      moves[index + 1].isCheckmate && "text-purple-600",
                      moves[index + 1].isCastling && "text-green-600"
                    )}
                  >
                    {moves[index + 1].fullMove}
                  </span>
                )}
              </div>
            )
          }
          return acc
        }, [])}
      </div>
    </div>
  )
}
