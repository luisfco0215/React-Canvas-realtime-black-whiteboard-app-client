import React, { useRef, useEffect, useState } from "react";

const Whiteboard: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.lineCap = "round";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctxRef.current = ctx;

        const handleResize = () => {
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.putImageData(image, 0, 0);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getPos = (e: MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        if (e instanceof MouseEvent) {
            return { x: e.clientX, y: e.clientY };
        } else {
            const touch = e.touches[0];
            return { x: touch.clientX, y: touch.clientY };
        }
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const pos = getPos(e.nativeEvent);
        setIsDrawing(true);
        setLastPos(pos);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctxRef.current || !lastPos) return;
        e.preventDefault();

        const pos = getPos(e.nativeEvent);
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(lastPos.x, lastPos.y);
        ctxRef.current.lineTo(pos.x, pos.y);
        ctxRef.current.stroke();
        ctxRef.current.closePath();
        setLastPos(pos);
    };

    const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDrawing(false);
        setLastPos(null);
    };

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full bg-white cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />
    );
};

export default Whiteboard;
