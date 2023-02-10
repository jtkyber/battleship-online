import io from 'socket.io-client';
export const socket = io(`http://localhost:3001`);       //,{autoConnect: false} 
// http://localhost:3001