import React from 'react';
import FriendRequests from './FriendRequests';
import './navigation.css';

const Navigation = ({username, onRouteChange, route}) => {
    return (
        <nav className='nav'>
            {
            route === 'loggedIn'
            ?
            <>
            <FriendRequests username={username} />
            <button value='goToLogin' onClick={onRouteChange}>Log Out</button>
            <button value='game' onClick={onRouteChange}>Game</button>
            </>
            :
            <>
                <FriendRequests username={username} />
                <button value='goToLogin' onClick={onRouteChange}>Log Out</button>
                <button value='login' onClick={onRouteChange}>Home</button>
            </>
        }
        </nav>
    )
}

export default Navigation;
