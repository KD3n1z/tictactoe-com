export type MoveRating = "great" | "blunder" | "book" | "best" | "mistake" | "compelled" | "engine-error" | "missed-win";

export type Move = {
    column: number,
    row: number
}

export type MoveAndRating = {
    move: Move
    rating: MoveRating
}

export type GameState = ("-" | "x" | "o")[][];