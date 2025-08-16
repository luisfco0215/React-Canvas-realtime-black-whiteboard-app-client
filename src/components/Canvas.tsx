import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface DrawData {
    px: number;
    py: number;
    x: number;
    y: number;
    room: string;
}

interface CanvasProps {
    name: string;
    room: string;
    setUsers: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
}

const socket: Socket = io("http://localhost:4000");

const Canvas: React.FC<CanvasProps> = ({ name, room, setUsers }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D & { lastX?: number; lastY?: number } | null>(null);
    const [drawing, setDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth - 256;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctxRef.current = ctx;

        // Unirse a la room
        socket.emit("join-room", { name, room });

        // Lista de usuarios activos
        socket.on("room-users", (users) => {
            setUsers(users);
        });

        // Dibujos remotos
        socket.on("draw", (data: DrawData) => {
            drawLine(data.px, data.py, data.x, data.y);
        });

        return () => {
            socket.off("room-users");
            socket.off("draw");
        };
    }, [name, room, setUsers]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setDrawing(true);
        const { offsetX, offsetY } = e.nativeEvent;
        if (!ctxRef.current) return;
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);
        ctxRef.current.lastX = offsetX;
        ctxRef.current.lastY = offsetY;
    };

    const finishDrawing = () => {
        setDrawing(false);
        ctxRef.current?.closePath();
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing || !ctxRef.current) return;
        const { offsetX, offsetY } = e.nativeEvent;
        if (ctxRef.current.lastX === undefined || ctxRef.current.lastY === undefined) return;

        drawLine(ctxRef.current.lastX, ctxRef.current.lastY, offsetX, offsetY);

        // Emitir a otros usuarios en la misma room
        socket.emit("draw", { px: ctxRef.current.lastX, py: ctxRef.current.lastY, x: offsetX, y: offsetY, room });

        ctxRef.current.lastX = offsetX;
        ctxRef.current.lastY = offsetY;
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
        if (!ctxRef.current) return;
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(x1, y1);
        ctxRef.current.lineTo(x2, y2);
        ctxRef.current.stroke();
        ctxRef.current.closePath();
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onMouseLeave={finishDrawing}
            className="border border-gray-300 flex-1"
        />
    );
};

export default Canvas;
