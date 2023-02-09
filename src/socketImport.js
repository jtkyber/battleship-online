import io from 'socket.io-client';
export const socket = io(`https://battleship-online-socket.vercel.app/`);       //,{autoConnect: false}
