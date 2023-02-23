import { useContext, useEffect, useState, useRef, CSSProperties } from 'react';
import cn from 'classnames';
import { Board, BoardItem, GameCoord, GameSound } from '../../util/types';
import { FILES, RANKS } from '../../util/constants';
import { coordToString } from '../../util/functions';
import { getLegalMoveOptions, isCheckmate, isStalemate, MoveOption, willBeCheck, willBeCheckmate, willBeStalemate } from '../../util/moves';

import { SessionContext } from '../../context/sessionContext';
import { useServer } from '../../hooks/useServer';

import ChessPiece from '../ChessPiece';
import DialogBox from '../DialogBox';

import classes from './ChessBoard.module.scss';

import whiteKnight from '../../assets/pieces/white-knight.svg';
import whiteBishop from '../../assets/pieces/white-bishop.svg';
import whiteRook   from '../../assets/pieces/white-rook.svg';
import whiteQueen  from '../../assets/pieces/white-queen.svg';

export type MoveOptionsMap = Map<BoardItem, MoveOption[]>;

type ChessBoardProps = {
    board?: Board;
    playable?: boolean;
    selectedItem?: BoardItem;
    onItemSelect?: (item: BoardItem) => void;
    setSound?: (sound: GameSound) => void;
    reRenderBoard?: () => void;
};

const ranks = [...RANKS].reverse();

const ChessBoard = ({ 
    board,
    playable,
    setSound,
    reRenderBoard
}: ChessBoardProps) => {

    const session = useContext(SessionContext);
    const { makeMove } = useServer(session);

    const memoizedMoveOptions = useRef<MoveOptionsMap>(new Map());

    const [ selectedPiece, setSelectedPiece ] = useState<BoardItem | null>(null);
    const [ pieceResetCounter, setPieceResetCounter ] = useState(0);
    const [ moveOptions, setMoveOptions ] = useState<MoveOption[]>([]);

    const [ promoteDialogOpen, setPromoteDialogOpen ] = useState(false);
    const [ promoteDialogClosing, setPromoteDialogClosing ] = useState(false);
    const promoteDialogResult = useRef<string|null>(null);

    const promoteDialog = (
        <DialogBox
            title="Promote pawn"
            buttons={[
                { onClick: () => promoteDialogResult.current = "Q", icon: whiteQueen,  size: 'small', variation: 'secondary', closeDialog: true },
                { onClick: () => promoteDialogResult.current = "N", icon: whiteKnight, size: 'small', variation: 'secondary', closeDialog: true },
                { onClick: () => promoteDialogResult.current = "R", icon: whiteRook,   size: 'small', variation: 'secondary', closeDialog: true },
                { onClick: () => promoteDialogResult.current = "B", icon: whiteBishop, size: 'small', variation: 'secondary', closeDialog: true },
            ]}
            onClose={() => {
                setPromoteDialogClosing(true);
                setTimeout(() => {
                    setPromoteDialogOpen(false);
                    setPromoteDialogClosing(false);
                }, 200);
            }}
            closing={promoteDialogClosing}
        />
    );

    // the function below is async and should return when the dialog result is set
    const openPromoteDialog = async () => {
        promoteDialogResult.current = null;
        setPromoteDialogOpen(true);

        return new Promise<string>(resolve => {
            const interval = setInterval(() => {
                if (promoteDialogResult.current) {
                    clearInterval(interval);
                    resolve(promoteDialogResult.current);
                }
            }, 100);
        });
    }

    useEffect(() => {
        if (playable) {
            setPieceResetCounter(p => p + 1);

            if (board) {
                if (isCheckmate(board, "white")) {
                    makeMove({
                        piece: 'king',
                        selfCheckmate: true,
                    } as any);
                } else if (isStalemate(board, "white")) {
                    makeMove({
                        piece: 'king',
                        stalemate: true,
                    } as any);
                }
            }
        }

        memoizedMoveOptions.current = new Map();
        setMoveOptions([]);
    }, [board, playable]);

    const getPieceAt = (x: number, y: number) => {
        return board?.items.find(item => item.coord.x === x && item.coord.y === y);
    };

    const getPiecesAt = (x: number, y: number) => {
        return board?.items.filter(item => item.coord.x === x && item.coord.y === y);
    };

    const getSquareCountData = (item: BoardItem) => {
        return getPiecesAt(item.coord.x, item.coord.y);
    }

    const renderBoard = () => {
        return ranks.map((rankName, rankIndex) => {
            const rank = 7 - rankIndex;

            return (
                <div key={rankName} className={classes.rank}>
                    {FILES.map((fileName, fileIndex) => {
                        const file = fileIndex;
                        return (
                            <div 
                                key={fileName} 
                                className={cn(classes.file, {
                                    [classes.white]: (rankIndex + fileIndex) % 2 === 0,
                                    [classes.black]: (rankIndex + fileIndex) % 2 === 1,
                                    [classes.selected]: false,
                                })}
                            >
                                { file === 0 && <span className={classes.rankText}>{rankName}</span> }
                                { rank === 0 && <span className={classes.fileText}>{fileName}</span> }
                            </div>
                        );
                    })}
                </div>
            );
        });
    };

    const handlePieceSelect = (item: BoardItem) => {
        setSelectedPiece(item);
        if (!memoizedMoveOptions.current.has(item)) {
            const options = getLegalMoveOptions(item, board!);
            memoizedMoveOptions.current.set(item, options);
            setMoveOptions(options);
        } else {
            setMoveOptions(memoizedMoveOptions.current.get(item)!);
        }
    }

    const handleMove = async (item: BoardItem, x: number, y: number) => {
        if (x === -1) return false;
        if (!board) return false;

        let sound: GameSound = 'moveSelf';

        const lastCoords = item.coord;
        const newCoords: GameCoord = { x, y };

        if (lastCoords.x === newCoords.x && lastCoords.y === newCoords.y) 
            return false;

        const targetMoveOption = moveOptions.find(option => option.to.x === x && option.to.y === y);
        if (!targetMoveOption) return false;

        // for capturing pieces
        const hasPieces = getPieceAt(x, y);
        let capturing = undefined;
        if (hasPieces) {
            capturing = hasPieces.piece;
            sound = 'capture';
        }    
        
        // for checking
        let check = false;
        if (willBeCheck(board, "black", targetMoveOption)) {
            check = true;
            sound = 'check';
        }

        let checkmate = false;
        if (willBeCheckmate(board, "black", targetMoveOption)) {
            checkmate = true;
            sound = 'end';
        }

        let stalemate = false;
        if (willBeStalemate(board, "black", targetMoveOption)) {
            stalemate = true;
            sound = 'end';
        }

        // for castling
        let castling: "kingSide" | "queenSide" | undefined = undefined;
        if (targetMoveOption.special === 'castleKingSide') {
            castling = 'kingSide';
            sound = 'castle';
        }
        else if (targetMoveOption.special === 'castleQueenSide') {
            castling = 'queenSide';
            sound = 'castle';
        }

        // for promotion
        let promoting: string|undefined;
        if (targetMoveOption.special === 'promote') {
            const promotingToPrompt = await openPromoteDialog();
            promoting = 'queen';
            if (promotingToPrompt === 'R') promoting = 'rook';
            else if (promotingToPrompt === 'B') promoting = 'bishop';
            else if (promotingToPrompt === 'N') promoting = 'knight';
            sound = 'promote';
        }

        setSound?.(sound);
        
        makeMove({
            piece: item.piece,
            from: lastCoords, 
            to: newCoords,
            capturing, castling, promoting,
            check, checkmate, stalemate
        });

        return true;
    }

    return (
        <>
        { promoteDialogOpen && promoteDialog }
        <div 
            className={classes.board}
            onPointerDown={() => {
                setSelectedPiece(null);
                setMoveOptions([]);
            }}
        >
            <div className={classes.boardCells}>
                {renderBoard()}
            </div>
            <div className={classes.boardMoveOptions}>
                { moveOptions.map(option => (
                    <div 
                        className={classes.moveOption} 
                        onPointerDown={e => {
                            e.stopPropagation();
                        }}
                        onClick={async () => {
                            if (!selectedPiece) return;

                            // copy board into prevBoardState
                            const prevBoard = structuredClone(board);
                            session.boardPrevState!.current = prevBoard;

                            await handleMove(selectedPiece, option.to.x, option.to.y);
                            setMoveOptions([]);

                            // remove black pieces on to coord
                            if (board) {
                                board.items = board.items.filter(item => {
                                    if (item.color === 'black' && item.coord.x === option.to.x && item.coord.y === option.to.y) return false;
                                    return true;
                                });
                            }

                            // update select item coords
                            selectedPiece.lastCoord = selectedPiece.coord;
                            selectedPiece.coord = option.to;

                            // remove animations for other items
                            board?.items.forEach(item => {
                                if (item === selectedPiece) return;
                                item.lastCoord = item.coord;
                            });

                            // re-render board
                            reRenderBoard?.();
                        }}

                        key={[option.to.x, option.to.y].join()} 
                        style={{
                            '--x': option.to.x,
                            '--y': option.to.y
                        } as CSSProperties} 
                    />
                )) }
            </div>
            <div className={classes.boardPieces}>
                {board?.items.map(item => (
                    <ChessPiece 
                        item={item} 
                        selectable={item.color === 'white' && playable} 
                        key={
                            item.color + 
                            item.piece + 
                            coordToString(item.coord) + 
                            pieceResetCounter
                        }
                        onSelect={() => {
                            handlePieceSelect(item);
                        }}
                        onDragEnd={async (x, y) => {
                            return await handleMove(item, x, y);
                        }}
                        countWhole={getSquareCountData(item)?.length ?? 1}
                        count={getSquareCountData(item)?.indexOf(item) ?? 0}
                        resetCounter={pieceResetCounter}
                    />
                ))}
            </div>
        </div>
        </>
    );
};

export default ChessBoard;