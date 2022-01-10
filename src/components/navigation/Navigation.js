import React from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import FriendRequests from './FriendRequests';
import soundIcon from './sound-icon.png';
import musicIcon from './music-icon.png';
import './navigation.css';

const Navigation = ({ socket, onRouteChange }) => {

    const { friendSocket, user, route, soundOn, musicOn} = useStoreState(state => ({
        friendSocket: state.friendSocket,
        user: state.user,
        route: state.route,
        soundOn: state.stored.soundOn,
        musicOn: state.stored.musicOn
    }));

    const { setSearch, setSoundOn, setMusicOn } = useStoreActions(actions => ({
        setSearch: actions.setSearch,
        setSoundOn: actions.setSoundOn,
        setMusicOn: actions.setMusicOn
    }));

    const handleExitClick = (e) => {
        setSearch(false);
        onRouteChange(e);
        socket.emit('send exit game', friendSocket);
    }

    return (
        <nav className='nav'>
            <div className='leftNav'>
                <img alt='sound icon' src={soundIcon} onClick={() => setSoundOn(!soundOn)} className={`audioToggle ${soundOn ? 'soundOn' : 'soundOff'}`} />
                <img alt='music icon' src={musicIcon} onClick={() => setMusicOn(!musicOn)} className={`audioToggle ${musicOn ? 'musicOn' : 'musicOff'}`} />
            </div>
            <div className='rightNav'>
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
            </div>
        </nav>
    )
}

export default Navigation;
