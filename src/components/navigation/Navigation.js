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
                <button value='goToLeaderboard' onClick={onRouteChange}>Leaderboard</button>
                <button value='goToLogin' onClick={onRouteChange}>Log Out</button>
            </>
            :
            <>
                {
                route === 'leaderboard'
                ?
                    username
                    ?
                    <>
                        <FriendRequests setUnsortedFriends={setUnsortedFriends} socket={socket} username={username} />
                        <button value='goHome' onClick={onRouteChange}>Home</button>
                        <button value='goToLogin' onClick={onRouteChange}>Log Out</button>
                    </>
                    :
                    <>
                        <button value='goToLogin' onClick={onRouteChange}>Back</button>
                    </>
                :
                <>
                    <FriendRequests setUnsortedFriends={setUnsortedFriends} socket={socket} username={username} />
                    <button value='goHome' onClick={handleExitClick}>Exit</button>
                    <button value='goToLogin' onClick={onRouteChange}>Log Out</button>
                </>
                }
            </>
            }
        </nav>
    )
}

export default Navigation;
