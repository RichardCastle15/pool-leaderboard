import { KillerGameRow } from "./killer-game-row.model";

export interface KillerGame {
    currentPlayerIndex: number;
    playerRows: KillerGameRow[];
}