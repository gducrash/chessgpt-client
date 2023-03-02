import { stringToCoord } from "./functions";
import { Board } from "./types";

export const IS_SERVER_OFF = import.meta.env.VITE_IS_SERVER_OFF 
    ? import.meta.env.VITE_IS_SERVER_OFF === "true" 
    : false;

export const IS_SERVER_LOADED = import.meta.env.VITE_IS_SERVER_LOADED 
    ? import.meta.env.VITE_IS_SERVER_LOADED === "true" 
    : false;

export const IS_CHATGPT_AT_CAPACITY = import.meta.env.VITE_IS_CHATGPT_AT_CAPACITY 
    ? import.meta.env.VITE_IS_CHATGPT_AT_CAPACITY === "true" 
    : false;

export const SERVER = {
    url: import.meta.env.VITE_SERVER_URL,
    endpoints: {
        session: {
            create: () => '/session/create' as const,
            move: (id: string) => `/session/${id}/move` as const,
            latestMove: (id: string) => `/session/${id}/latestMove` as const,
        }
    },
}

export const PIECES = {
    pawn: 'pawn',
    rook: 'rook',
    knight: 'knight',
    bishop: 'bishop',
    queen: 'queen',
    king: 'king',
};

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const DEFAULT_BOARD = (): Board => ({
    items: [
        { piece: PIECES.rook,   color: 'white', coord: stringToCoord('a1')!, castle: 'queenSide' },
        { piece: PIECES.knight, color: 'white', coord: stringToCoord('b1')! },
        { piece: PIECES.bishop, color: 'white', coord: stringToCoord('c1')! },
        { piece: PIECES.queen,  color: 'white', coord: stringToCoord('d1')! },
        { piece: PIECES.king,   color: 'white', coord: stringToCoord('e1')! },
        { piece: PIECES.bishop, color: 'white', coord: stringToCoord('f1')! },
        { piece: PIECES.knight, color: 'white', coord: stringToCoord('g1')! },
        { piece: PIECES.rook,   color: 'white', coord: stringToCoord('h1')!, castle: 'kingSide' },

        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('a2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('b2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('c2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('d2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('e2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('f2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('g2')! },
        { piece: PIECES.pawn, color: 'white', coord: stringToCoord('h2')! },

        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('a7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('b7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('c7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('d7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('e7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('f7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('g7')! },
        { piece: PIECES.pawn, color: 'black', coord: stringToCoord('h7')! },

        { piece: PIECES.rook,   color: 'black', coord: stringToCoord('a8')!, castle: 'queenSide' },
        { piece: PIECES.knight, color: 'black', coord: stringToCoord('b8')! },
        { piece: PIECES.bishop, color: 'black', coord: stringToCoord('c8')! },
        { piece: PIECES.queen,  color: 'black', coord: stringToCoord('d8')! },
        { piece: PIECES.king,   color: 'black', coord: stringToCoord('e8')! },
        { piece: PIECES.bishop, color: 'black', coord: stringToCoord('f8')! },
        { piece: PIECES.knight, color: 'black', coord: stringToCoord('g8')! },
        { piece: PIECES.rook,   color: 'black', coord: stringToCoord('h8')!, castle: 'kingSide' },
    ],
    white: {
        check: false,
        checkmate: false,
        stalemate: false,
        castling: {
            kingSide: true,
            queenSide: true,
        },
        enPassant: null,
    },
    black: {
        check: false,
        checkmate: false,
        stalemate: false,
        castling: {
            kingSide: true,
            queenSide: true,
        },
        enPassant: null,
    },
});