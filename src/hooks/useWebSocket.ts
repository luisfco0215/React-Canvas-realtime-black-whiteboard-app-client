import { useEffect, useRef } from "react";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
type MessageHandler = (data: any) => void;

export function useWebSocket(
  url: string,
  onMessage: MessageHandler
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected:", url);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, [url, onMessage]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendMessage = (msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  return { sendMessage };
}
