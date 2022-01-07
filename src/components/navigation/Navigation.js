import React from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import FriendRequests from './FriendRequests';
import './navigation.css';

const Navigation = ({ socket, onRouteChange }) => {

    const { friendSocket, user, route} = useStoreState(state => ({
        friendSocket: state.friendSocket,
        user: state.user,
        route: state.route
    }));

    const { setSearch } = useStoreActions(actions => ({
        setSearch: actions.setSearch
    }));

    const handleExitClick = (e) => {
        setSearch(false);
        onRouteChange(e);
        socket.emit('send exit game', friendSocket);
    }

    return (
        <nav className='nav'>
            {
            route === 'login' || route === 'register'
            ?
            <>
                <button value='goToLeaderboard' onClick={onRouteChange}>Leaderboard</button>
            </>
            :
            route === 'loggedIn'
            ?
            <>
                <FriendRequests socket={socket} />
                <button value='goToLeaderboard' onClick={onRouteChange}>Leaderboard</button>
                <button value='logOut' onClick={onRouteChange}>Log Out</button>
            </>
            :
            <>
                {
                route === 'leaderboard'
                ?
                    user?.username
                    ?
                    <>
                        <FriendRequests socket={socket} />
                        <button value='goHome' onClick={onRouteChange}>Back</button>
                        <button value='logOut' onClick={onRouteChange}>Log Out</button>
                    </>
                    :
                    <>
                        <button value='goToLogin' onClick={onRouteChange}>Back</button>
                    </>
                : //route === 'game'
                    user.hash === 'guest'
                    ?
                    <>
                        <button value='logOut' onClick={handleExitClick}>Exit</button>
                    </>
                    :
                    <>
                        <FriendRequests socket={socket} />
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
