import React from 'react';
import FriendRequests from './FriendRequests';
import './navigation.css';

const Navigation = ({ setUnsortedFriends, socket, username, onRouteChange, route }) => {
    return (
        <nav className='nav'>
            {
            route === 'loggedIn'
            ?
            <>
            <FriendRequests setUnsortedFriends={setUnsortedFriends} socket={socket} username={username} />
            <button value='goToLogin' onClick={onRouteChange}>Log Out</button>
            </>
            :
            <>
            <FriendRequests setUnsortedFriends={setUnsortedFriends} socket={socket} username={username} />
            <button value='goToLogin' onClick={onRouteChange}>Log Out</button>
            </>
            }
        </nav>
    )
}

export default Navigation;
