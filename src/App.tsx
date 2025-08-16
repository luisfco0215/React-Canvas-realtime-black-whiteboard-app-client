import { useState } from "react";
import Canvas from "./components/Canvas";

interface User {
  id: string;
  name: string;
}

export default function App() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  return (
    <div className="h-screen w-screen flex flex-col">
      {!joined ? (
        <div className="m-auto p-4 border rounded shadow-md">
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded mb-2 w-full"
          />
          <input
            placeholder="Room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="border p-2 rounded mb-2 w-full"
          />
          <button
            className="w-full bg-blue-500 text-white p-2 rounded"
            onClick={() => setJoined(true)}
          >
            Unirse
          </button>
        </div>
      ) : (
        <div className="flex flex-1">
          <Canvas name={name} room={room} setUsers={setUsers} />
          <div className="w-64 border-l p-2">
            <h2 className="font-bold mb-2">Usuarios</h2>
            <ul>
              {users.map((u) => (
                <li key={u.id}>{u.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
