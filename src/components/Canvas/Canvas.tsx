import { useState, useEffect, useRef, MouseEvent } from 'react';

import classes from './Canvas.module.scss';

type CanvasProps = {
    width: number;
    height: number;
    paintColor?: string;
    paintSize?: number;
    paintOpacity?: number;
}

const Canvas = ({
    width,
    height,
    paintColor = '#ff0000',
    paintSize = 10,
    paintOpacity = 0.8,
}: CanvasProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ isPainting, setIsPainting ] = useState(false);
    const [ lastPosition, setLastPosition ] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = width;
        canvas.height = height;

        context.strokeStyle = paintColor;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.lineWidth = paintSize;
    }, [width, height, paintColor, paintSize]);

    const startPaint = (event: MouseEvent) => {
        const coordinates = getCoordinates(event);
        if (!coordinates) return;
        setIsPainting(true);
        setLastPosition({ ...coordinates });
    }

    const paint = (event: MouseEvent) => {
        if (isPainting) {
            const coordinates = getCoordinates(event);
            if (!coordinates) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext('2d');
            if (!context) return;
            const multiplier = getSizeMultiplier();

            context.beginPath();
            context.moveTo(lastPosition.x * multiplier, lastPosition.y * multiplier);
            context.lineTo(coordinates.x * multiplier, coordinates.y * multiplier);
            context.closePath();
            context.stroke();

            setLastPosition({ ...coordinates });
        }
    }

    const exitPaint = () => {
        setIsPainting(false);
    }

    const getCoordinates = (event: MouseEvent) => {
        if (!canvasRef.current) return null;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }

    const getSizeMultiplier = () => {
        if (!canvasRef.current) return 1;
        const canvas = canvasRef.current;
        return canvas.width / canvas.clientWidth;
    }

    return (
        <canvas 
            className={classes.canvas}
            ref={canvasRef}
            onMouseDown={startPaint}
            onMouseMove={paint}
            onMouseUp={exitPaint}
            onMouseLeave={exitPaint}
            style={{
                opacity: paintOpacity,
            }}
        />
    );
}

export default Canvas;