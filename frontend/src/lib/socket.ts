import { io, Socket } from 'socket.io-client';
import { TOKEN_KEY } from './api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

/**
 * Returns a singleton socket.io connection to the `/bids` namespace,
 * authenticated with the stored JWT.
 */
export function getBidsSocket(): Socket {
  if (!socket) {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

    socket = io(`${WS_URL}/bids`, {
      auth: { token },
      autoConnect: true,
      transports: ['websocket'],
    });
  }
  return socket;
}

export function disconnectBidsSocket(): void {
  socket?.disconnect();
  socket = null;
}
