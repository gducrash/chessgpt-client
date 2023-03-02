export type GameSessionData = { 
    turn: 'white' | 'black';
    move: GameMove;
    board: Board;
    response?: string; 
    date?: Date;
    gameEnd?: boolean; 
    sound?: GameSound;
};

export type GameMove = {
    piece: string;
    from: GameCoord;
    to: GameCoord;
    capturing?: string;
    promoting?: string;
    castling?: 'kingSide' | 'queenSide';
    check?: boolean;
    checkmate?: boolean;
    selfCheckmate?: boolean;
    stalemate?: boolean;
}

export type GameMoveResign = {
    resign: true;
}

export type GameCoord = {
    x: number;
    y: number;
};

export type GameSound =
    | "normal"
    | "moveSelf"
    | "capture"
    | "spawn"
    | "castle"
    | "promote"
    | "check"
    | "end"
    | "error";

export type BoardItem = {
    piece: string;
    color: 'white' | 'black';
    castle?: 'kingSide' | 'queenSide';
    coord: GameCoord;
    lastCoord?: GameCoord;
};

export type Board = {
    items: BoardItem[];
    white: BoardSide;
    black: BoardSide;
};

type BoardSide = {
    check: boolean;
    checkmate: boolean;
    stalemate: boolean;
    castling: {
        kingSide: boolean;
        queenSide: boolean;
    };
    enPassant: GameCoord | null;
};
