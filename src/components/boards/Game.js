import React, { useState, useEffect } from 'react';
import UserBoard from './UserBoard';
import OpponentBoard from './OpponentBoard';
import Navigation from '../navigation/Navigation';
import Footer from '../footer/Footer';
import ReadyButton from '../readyButton/ReadyButton';

const Game = ({ setUnsortedFriends, socket, username, onRouteChange, route, friendSocket }) => {
    const [gameRoute, setGameRoute] = useState('placeShips');

    return (
        <div className='gamePage'>
            <Navigation setUnsortedFriends={setUnsortedFriends} socket={socket} username={username} onRouteChange={onRouteChange} route={route} />
            <UserBoard socket={socket} friendSocket={friendSocket} route={route}/>
            <ReadyButton />
            <OpponentBoard socket={socket} friendSocket={friendSocket} route={route}/>
            <Footer />
        </div>
    )
}

export default Game;
