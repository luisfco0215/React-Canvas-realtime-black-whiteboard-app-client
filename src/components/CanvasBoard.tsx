import React, { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

type Point = { x: number; y: number };

const CanvasBoard: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [drawing, setDrawing] = useState(false);

    const { sendMessage } = useWebSocket("ws://localhost:3001", (data) => {
        if (data.type === "draw") {
            drawLine(data.from, data.to, false);
        }
    });

    const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    };

    const drawLine = (from: Point, to: Point, broadcast = true) => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        if (broadcast) {
            sendMessage({ type: "draw", from, to });
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setDrawing(true);
        lastPoint.current = getCoordinates(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing) return;
        const newPoint = getCoordinates(e);
        if (lastPoint.current) {
            drawLine(lastPoint.current, newPoint, true);
        }
        lastPoint.current = newPoint;
    };

    const handleMouseUp = () => setDrawing(false);

    const lastPoint = useRef<Point | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ border: "1px solid black" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    );
};

export default CanvasBoard;
