import { Board, BoardItem, GameCoord } from "./types";

export type MoveOption = {
    item: BoardItem;
    to: GameCoord;
    special?: MoveOptionSpecial;
}

type MoveOptionSpecial = 
        | "castleKingSide"
        | "castleQueenSide"
        | "clearCastle"
        | "clearCastleKingSide"
        | "clearCastleQueenSide"
        | "enPassant"
        | "registerEnPassant"
        | "promote";


export const getLegalMoveOptions = (item: BoardItem, board: Board): MoveOption[] => {
    const moves = getMoveOptions(item, board, true);
    const legalMoves = moves.filter(move => !willBeCheck(board, item.color, move));
    return legalMoves;
}


const getMoveOptions = (item: BoardItem, board: Board, checkCastle: boolean = false): MoveOption[] => {

    const moves: MoveOption[] = [];
    const oppositeColor = getOppositeColor(item.color);

    switch (item.piece) {
        case "pawn": {
            if (item.color === "white") {

                // if on rank 7, this move is a promotion
                let special: MoveOptionSpecial | undefined;
                if (item.coord.y === 6) special = "promote";

                // forward moves
                if (!isPieceOnCoord(board, item.coord.x, item.coord.y + 1)) {

                    moves.push(relativeMove(item, 0, 1, special));

                    // if on rank 2
                    if (item.coord.y === 1 && !isPieceOnCoord(board, item.coord.x, item.coord.y + 2))
                        moves.push(relativeMove(item, 0, 2, "registerEnPassant"));

                }

                // capture moves
                if (isPieceOnCoord(board, item.coord.x + 1, item.coord.y + 1, "black"))
                    moves.push(relativeMove(item, 1, 1, special));
                if (isPieceOnCoord(board, item.coord.x - 1, item.coord.y + 1, "black"))
                    moves.push(relativeMove(item, -1, 1, special));

            } else {

                // if on rank 2, this move is a promotion
                let special: MoveOptionSpecial | undefined;
                if (item.coord.y === 1) special = "promote";

                // forward moves
                if (!isPieceOnCoord(board, item.coord.x, item.coord.y - 1)) {

                    moves.push(relativeMove(item, 0, -1, special));

                    // if on rank 7
                    if (item.coord.y === 6 && !isPieceOnCoord(board, item.coord.x, item.coord.y - 2))
                        moves.push(relativeMove(item, 0, -2, "registerEnPassant"));

                }

                // capture moves
                if (isPieceOnCoord(board, item.coord.x + 1, item.coord.y - 1, "white"))
                    moves.push(relativeMove(item, 1, -1, special));
                if (isPieceOnCoord(board, item.coord.x - 1, item.coord.y - 1, "white"))
                    moves.push(relativeMove(item, -1, -1, special));

            }

            // en passant
            const enPassantPawn = board[oppositeColor].enPassant;
            if (enPassantPawn) {
                if (enPassantPawn.y === item.coord.y) {
                    if (enPassantPawn.x === item.coord.x + 1) moves.push(relativeMove(item, 1, 0, "enPassant"));
                    if (enPassantPawn.x === item.coord.x - 1) moves.push(relativeMove(item, -1, 0, "enPassant"));
                }
            }

            break;
        }
        case "knight": {
            const offsets = [
                { x: 1, y: 2 },
                { x: 2, y: 1 },
                { x: 2, y: -1 },
                { x: 1, y: -2 },
                { x: -1, y: -2 },
                { x: -2, y: -1 },
                { x: -2, y: 1 },
                { x: -1, y: 2 },
            ];

            for (const { x, y } of offsets) {
                const absoluteX = item.coord.x + x;
                const absoluteY = item.coord.y + y;
                if (isOutOfBounds(absoluteX, absoluteY)) continue;
                if (isPieceOnCoord(board, absoluteX, absoluteY, item.color)) continue;
                moves.push(relativeMove(item, x, y));
            }

            break;
        }
        case "bishop": {
            const directions = [
                { x: 1, y: 1 },
                { x: 1, y: -1 },
                { x: -1, y: -1 },
                { x: -1, y: 1 },
            ];

            const newMoves = progressInDirections(item, board, directions);
            moves.push(...newMoves);

            break;
        }
        case "rook": {
            let special: MoveOptionSpecial | undefined;

            if (item.castle === 'kingSide')
                special = 'clearCastleKingSide';
            else if (item.castle === 'queenSide')
                special = 'clearCastleQueenSide';
            
            const directions = [
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
                { x: 0, y: -1 },
            ];

            const newMoves = progressInDirections(item, board, directions, special);
            moves.push(...newMoves);

            break;
        }
        case "queen": {
            const directions = [
                { x: 1, y: 1 },
                { x: 1, y: -1 },
                { x: -1, y: -1 },
                { x: -1, y: 1 },
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
                { x: 0, y: -1 },
            ];

            const newMoves = progressInDirections(item, board, directions);
            moves.push(...newMoves);

            break;
        }
        case "king": {
            const offsets = [
                { x: 1, y: 1 },
                { x: 1, y: -1 },
                { x: -1, y: -1 },
                { x: -1, y: 1 },
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
                { x: 0, y: -1 },
            ];

            for (const { x, y } of offsets) {
                const absoluteX = item.coord.x + x;
                const absoluteY = item.coord.y + y;
                if (isOutOfBounds(absoluteX, absoluteY)) continue;
                if (isPieceOnCoord(board, absoluteX, absoluteY, item.color)) continue;
                moves.push(relativeMove(item, x, y, "clearCastle"));
            }

            // if not castled
            const color = item.color;
            if (board[color].castling.kingSide) {
                // if moves y,x+1; y,x+2 are not blocked
                // add move for castling king side
                if (!isPieceOnCoord(board, item.coord.x + 1, item.coord.y) &&
                    !isPieceOnCoord(board, item.coord.x + 2, item.coord.y)) {

                    if (!checkCastle || !isPositionUnderAttack(board, item.coord.x + 1, item.coord.y, color)) 
                        moves.push(relativeMove(item, 2, 0, "castleKingSide"));
                } 
            }
            if (board[color].castling.queenSide) {
                // if moves y,x-1; y,x-2; y,x-3 are not blocked
                // add move for castling queen side
                if (!isPieceOnCoord(board, item.coord.x - 1, item.coord.y) &&
                    !isPieceOnCoord(board, item.coord.x - 2, item.coord.y) &&
                    !isPieceOnCoord(board, item.coord.x - 3, item.coord.y)) {

                    if (!checkCastle || !isPositionUnderAttack(board, item.coord.x - 1, item.coord.y, color)) 
                        moves.push(relativeMove(item, -2, 0, "castleQueenSide"));
                }
            }

        }

    }

    return moves;

}

const isPositionUnderAttack = (board: Board, x: number, y: number, color: "white" | "black") => {

    const oppositeColor = getOppositeColor(color);
    const opoositeItems = board.items.filter(item => item.color === oppositeColor);

    for (const item of opoositeItems) {
        const moves = getMoveOptions(item, board);
        if (moves.find(move => move.to.x === x && move.to.y === y)) return true;
    }

    return false;

}

export const isCheck = (board: Board, color: "white" | "black") => {
    
    const king = board.items.find(item => item.piece === "king" && item.color === color);
    if (!king) return false;

    return isPositionUnderAttack(board, king.coord.x, king.coord.y, color);
    
}

export const isCheckmate = (board: Board, color: "white" | "black") => {

    const check = isCheck(board, color);
    if (!check) return false;

    const items = board.items.filter(item => item.color === color);

    for (const item of items) {
        const moves = getMoveOptions(item, board);
        for (const move of moves) {
            if (!willBeCheck(board, color, move)) return false;
        }
    }

    return true;

}

export const isStalemate = (board: Board, color: "white" | "black") => {

    const check = isCheck(board, color);
    if (check) return false;

    const items = board.items.filter(item => item.color === color);

    for (const item of items) {
        const moves = getMoveOptions(item, board);
        for (const move of moves) {
            if (!willBeCheck(board, color, move)) return false;
        }
    }

    return true;

}

export const willBeCheck = (board: Board, color: "white" | "black", move: MoveOption) => {

    const newBoard = simulateMove(board, move);
    return isCheck(newBoard, color);

}

export const willBeCheckmate = (board: Board, color: "white" | "black", move: MoveOption) => {

    const check = willBeCheck(board, color, move);
    if (!check) return false;

    const newBoard = simulateMove(board, move);
    return isCheckmate(newBoard, color);

}

export const willBeStalemate = (board: Board, color: "white" | "black", move: MoveOption) => {

    const check = willBeCheck(board, color, move);
    if (check) return false;

    const newBoard = simulateMove(board, move);
    return isStalemate(newBoard, color);

}

const simulateMove = (board: Board, move: MoveOption): Board => {

    const newBoard: Board = structuredClone(board);
    let newItem: BoardItem|undefined = newBoard.items.find(item => (
        item.coord.x === move.item.coord.x &&
        item.coord.y === move.item.coord.y &&
        item.color === move.item.color &&
        item.piece === move.item.piece
    ));

    if (!newItem) return newBoard;

    // capture pieces on target move coord
    if (isPieceOnCoord(newBoard, move.to.x, move.to.y)) {
        newBoard.items = newBoard.items.filter(item => (
            item.coord.x !== move.to.x ||
            item.coord.y !== move.to.y
        ));
    }

    // move piece
    newItem.coord = move.to;

    // castling
    if (move.special === "castleKingSide") {
        const rook = newBoard.items.find(item => (
            item.piece === "rook" &&
            item.color === newItem!.color &&
            item.castle === "kingSide"
        ));
        if (rook)
            rook.coord = { x: newItem!.coord.x - 1, y: newItem!.coord.y };
    } else if (move.special === "castleQueenSide") {
        const rook = newBoard.items.find(item => (
            item.piece === "rook" &&
            item.color === newItem!.color &&
            item.castle === "queenSide"
        ));
        if (rook)
            rook.coord = { x: newItem!.coord.x + 1, y: newItem!.coord.y };
    }

    // en passant
    if (move.special === "enPassant") {
        const yOffset = newItem!.color === "white" ? -1 : 1;
        const capturedPawn = newBoard.items.find(item => (
            item.piece === "pawn" &&
            item.color === getOppositeColor(newItem!.color) &&
            item.coord.x === newItem!.coord.x &&
            item.coord.y === newItem!.coord.y + yOffset
        ));
        if (capturedPawn)
            newBoard.items = newBoard.items.filter(item => item !== capturedPawn);
    }

    return newBoard;

}



const relativeMove = (item: BoardItem, x: number, y: number, special?: MoveOptionSpecial): MoveOption => ({
    item, special,
    to: { x: item.coord.x + x, y: item.coord.y + y },
});

const isOutOfBounds = (x: number, y: number) => x < 0 || x > 7 || y < 0 || y > 7;

const isPieceOnCoord = (board: Board, x: number, y: number, color?: "white" | "black") => {
    const piece = board.items.find(item => item.coord.x === x && item.coord.y === y);
    if (!piece) return false;
    if (color) return piece.color === color;
    return true;
}

const getOppositeColor = (color: "white" | "black") => color === "white" ? "black" : "white";

const progressInDirections = (item: BoardItem, board: Board, directions: { x: number, y: number }[], special?: MoveOptionSpecial) => {
    let moves: MoveOption[] = [];
    const oppositeColor = getOppositeColor(item.color);

    for (const direction of directions) {
        let x = item.coord.x + direction.x;
        let y = item.coord.y + direction.y;
        
        // put moves until reached the end of the board or a piece
        const rule = () => !isOutOfBounds(x, y) && !isPieceOnCoord(board, x, y);
        let iter = 0;
        while (rule() && iter < 16) {
            iter++;
            moves.push({ item, to: { x, y }, special });
            x += direction.x;
            y += direction.y;
        }

        // if the piece reached is of the opposite color, add it as a move (capture)
        if (isPieceOnCoord(board, x, y, oppositeColor) && !isPieceOnCoord(board, x, y, item.color))
            moves.push({ item, to: { x, y }, special });
    }

    return moves;
}