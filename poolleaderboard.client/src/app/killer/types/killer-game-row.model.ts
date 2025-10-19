export interface KillerGameRow {
    name: string;
    livesRemaining: number;
    missedInSuddenDeath?: boolean;
    eliminated?: boolean;
}