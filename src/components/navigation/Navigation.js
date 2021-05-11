import React from 'react';
import FriendRequests from './FriendRequests';
import './navigation.css';

const Navigation = ({ friendSocket, setUnsortedFriends, socket, username, onRouteChange, route }) => {
    const handleExitClick = (e) => {
        onRouteChange(e);
        socket.emit('send exit game', friendSocket);
    }

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
                <button value='goHome' onClick={handleExitClick}>Exit</button>
            </>
            }
        </nav>
    )
}

export default Navigation;
