import React from 'react';
import FriendRequests from './FriendRequests';
import './navigation.css';

const Navigation = ({ setSearch, friendSocket, setUnsortedFriends, socket, username, onRouteChange, route }) => {
    const handleExitClick = (e) => {
        setSearch(false);
        onRouteChange(e);
        socket.emit('send exit game', friendSocket);
    }

    return (
        <nav className='nav'>
            {
            // route === 'index'
            // ?
            // <>
            //     <button value='goToLeaderboard' onClick={onRouteChange}>Leaderboard</button>
            // </>
            // :
            route === 'login' || route === 'register'
            ?
            <>
                <button value='goToLeaderboard' onClick={onRouteChange}>Leaderboard</button>
                {/* <button value='homeNotLogged' onClick={onRouteChange}>Back</button> */}
            </>
            :
            route === 'loggedIn'
            ?
            <>
                <FriendRequests setUnsortedFriends={setUnsortedFriends} socket={socket} username={username} />
                <button value='goToLeaderboard' onClick={onRouteChange}>Leaderboard</button>
                <button value='logOut' onClick={onRouteChange}>Log Out</button>
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
                        <button value='goHome' onClick={onRouteChange}>Back</button>
                        <button value='logOut' onClick={onRouteChange}>Log Out</button>
                    </>
                    :
                    <>
                        <button value='goToLogin' onClick={onRouteChange}>Back</button>
                    </>
                : //route === 'game'
                <>
                    <FriendRequests setUnsortedFriends={setUnsortedFriends} socket={socket} username={username} />
                    <button value='goHome' onClick={handleExitClick}>Exit</button>
                    <button value='logOut' onClick={handleExitClick}>Log Out</button>
                </>
                }
            </>
            }
        </nav>
    )
}

export default Navigation;
