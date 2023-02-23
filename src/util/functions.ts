import { FILES, RANKS } from './constants';
import { GameCoord, GameMove } from './types';

export const coordToString = (coord: GameCoord) => {
    return `${FILES[coord.x] ?? 'a'}${RANKS[coord.y] ?? '1'}`;
}

export const stringToCoord = (coordString: string): GameCoord|null => {
    if (coordString.length !== 2) return null;
    const file = coordString[0];
    const rank = coordString[1];
    if (!FILES.includes(file) || !RANKS.includes(rank)) return null;

    return {
        x: FILES.indexOf(file),
        y: RANKS.indexOf(rank),
    };
}

export const generateMoveString = (move: GameMove): string => {
    const moveAny = move as any;
    if (moveAny.resign) return "resign";
    if (moveAny.castling) {
        if (moveAny.castling === "kingSide")
            return `castle king side`;
        else if (moveAny.castling === "queenSide")
            return `castle queen side`;
    }

    let moveString = `${moveAny.piece} from ${coordToString(moveAny.from)} to ${coordToString(moveAny.to)}`;
    if (moveAny.capturing)
        moveString += ` capturing ${moveAny.capturing}`;
    if (moveAny.promoting)
        moveString += ` promoting to ${moveAny.promoting}`;

    if (moveAny.checkmate)
        moveString += ` checkmate`;
    else if (moveAny.stalemate)
        moveString += ` stalemate`;
    else if (moveAny.check)
        moveString += ` check`;

    return moveString;
}