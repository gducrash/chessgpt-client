import { useState, useEffect, useLayoutEffect, useRef, useCallback, CSSProperties } from 'react';
import cn from 'classnames';
import { BoardItem } from '../../util/types';

import classes from './ChessPiece.module.scss';

import whitePawn   from '../../assets/pieces/white-pawn.svg';
import whiteKnight from '../../assets/pieces/white-knight.svg';
import whiteBishop from '../../assets/pieces/white-bishop.svg';
import whiteRook   from '../../assets/pieces/white-rook.svg';
import whiteQueen  from '../../assets/pieces/white-queen.svg';
import whiteKing   from '../../assets/pieces/white-king.svg';
import blackPawn   from '../../assets/pieces/black-pawn.svg';
import blackKnight from '../../assets/pieces/black-knight.svg';
import blackBishop from '../../assets/pieces/black-bishop.svg';
import blackRook   from '../../assets/pieces/black-rook.svg';
import blackQueen  from '../../assets/pieces/black-queen.svg';
import blackKing   from '../../assets/pieces/black-king.svg';

type ChessPieceProps = {
    item: BoardItem;
    selectable?: boolean;
    onSelect?: () => void;
    onDragEnd?: (x: number, y: number) => Promise<boolean>;
    countWhole?: number;
    count?: number;
    resetCounter?: number;
    animating?: boolean;
};

const PIECE_X_OFFSET = 0.4;

const ChessPiece = ({ 
    item, selectable,
    onSelect, onDragEnd,
    count = 0, countWhole = 1,
    resetCounter = 0, 
    animating = false,
}: ChessPieceProps) => {

    const [ pos, setPos ] = useState({ x: 0, y: 0 });
    const [ dragging, setDragging ] = useState(false);
    
    const pieceRef = useRef<HTMLDivElement>(null);

    const calcXOffset = () => {
        if (countWhole < 2) return 0;
        const step = 1/(countWhole-1);
        return (step*count)-0.5;
    }

    const getPieceImage = () => {
        switch (item.piece) {
            case 'pawn':
                return item.color === 'white' ? whitePawn : blackPawn;
            case 'knight':
                return item.color === 'white' ? whiteKnight : blackKnight;
            case 'bishop':
                return item.color === 'white' ? whiteBishop : blackBishop;
            case 'rook':
                return item.color === 'white' ? whiteRook : blackRook;
            case 'queen':
                return item.color === 'white' ? whiteQueen : blackQueen;
            case 'king':
                return item.color === 'white' ? whiteKing : blackKing;
        }
    };

    useLayoutEffect(() => {
        setPos({ x: item.coord.x, y: item.coord.y });
        if (item.lastCoord && animating) {
            if (item.lastCoord.x === item.coord.x && item.lastCoord.y === item.coord.y)
                return;

            const pieceElem = pieceRef.current;
            if (!pieceElem) return;

            const pieceSize = pieceElem.getBoundingClientRect().width;
            const diffX = item.lastCoord.x - item.coord.x;
            const diffY = item.lastCoord.y - item.coord.y;
            pieceRef.current?.animate([
                { transform: `translate(${diffX*pieceSize}px, ${diffY*pieceSize*-1}px)` },
                { transform: 'translate(0px, 0px)' }
            ], {
                duration: 200,
                easing: 'ease-out',
                iterations: 1,
            });
        }
    }, [item, resetCounter]);

    const handleDragStart = useCallback((e: React.PointerEvent) => {
        onSelect?.();
        setDragging(true);
        handleDragMove(e as any, true);
    }, []);

    const handleDragEnd = useCallback(async () => {

        // calculate piece position relative to the board
        const boardElem = pieceRef.current?.parentElement?.parentElement;
        const pieceBounds = pieceRef.current?.getBoundingClientRect();
        const boardBounds = boardElem?.getBoundingClientRect();
        const xRel = (pieceBounds!.left - boardBounds!.left + pieceBounds!.width / 2) / boardBounds!.width;
        const yRel = (pieceBounds!.top - boardBounds!.top + pieceBounds!.height / 2) / boardBounds!.height;

        // if not out of bounds, calculate file and rank
        // and submit new position
        if (xRel > 0 && xRel < 1 && yRel > 0 && yRel < 1) {
            const file = Math.floor(xRel * 8);
            const rank = 7 - Math.floor(yRel * 8);
            const valid = await onDragEnd?.(file, rank);
            if (valid) setPos({ x: file, y: rank });
        } else {
            // otherwise, just cancel the drag
            await onDragEnd?.(-1, -1);
        }

        setDragging(false);
        pieceRef.current!.style.top = '';
        pieceRef.current!.style.left = '';

    }, [onDragEnd]);

    const handleDragMove = (e: PointerEvent, forceDrag?: boolean) => {
        if (dragging || forceDrag) {
            const { pageX, pageY } = e;
            const { width, height } = pieceRef.current?.getBoundingClientRect() || { width: 0, height: 0 };
            const x = pageX - width/2 - document.documentElement.scrollLeft;
            const y = pageY - height/2 - document.documentElement.scrollTop;
            pieceRef.current!.style.top = `${y}px`;
            pieceRef.current!.style.left = `${x}px`;
        }
    }

    useEffect(() => {
        if (dragging) {
            document.addEventListener('pointermove',  handleDragMove);
            document.addEventListener('pointerup',    handleDragEnd);
            document.addEventListener('pointerleave', handleDragEnd);
        } else {
            document.removeEventListener('pointermove',  handleDragMove);
            document.removeEventListener('pointerup',    handleDragEnd);
            document.removeEventListener('pointerleave', handleDragEnd);
        }

        return () => {
            document.removeEventListener('pointermove',  handleDragMove);
            document.removeEventListener('pointerup',    handleDragEnd);
            document.removeEventListener('pointerleave', handleDragEnd);
        }
    }, [dragging, handleDragMove, handleDragEnd]);

    return (
        <div ref={pieceRef} className={cn(classes.piece, {
            [classes.selectable]: selectable,
            [classes.dragging]: dragging,
            [classes.white]: item.color === 'white',
        })} style={{
            '--x': pos.x,
            '--y': pos.y,
            transform: `translateX(calc(var(--cell-size) * ${calcXOffset() * PIECE_X_OFFSET}))`
        } as CSSProperties}
            onPointerDown={e => {
                e.stopPropagation();
                selectable && handleDragStart(e);
            }}
        >
            <img src={getPieceImage()} alt={`${item.color} ${item.piece}`} draggable={false} />
        </div>
    );
};

export default ChessPiece;