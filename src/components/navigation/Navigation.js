import React from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import FriendRequests from './FriendRequests';
import soundIcon from './sound-icon.png';
import musicIcon from './music-icon.png';
import leaderboardIcon from './leaderboard.png';
import logOutIcon from './log-out.png';
import homeIcon from './home-icon.png';
import backArrow from './back-arrow.png';
import friendsIcon from './friends-icon.png';
import chatIcon from './chat-icon.png';
import './navigation.css';

const Navigation = ({ onRouteChange }) => {

    const { user, route, soundOn, musicOn, isMobile, showChatMobile, showFriendsMobile, playingWithAI, opponentName } = useStoreState(state => ({
        user: state.user,
        route: state.route,
        soundOn: state.stored.soundOn,
        musicOn: state.stored.musicOn,
        isMobile: state.stored.isMobile,
        showChatMobile: state.showChatMobile,
        showFriendsMobile: state.showFriendsMobile,
        playingWithAI: state.playingWithAI,
        opponentName: state.opponentName
    }));

    const { setSearch, setSoundOn, setMusicOn, setShowFriendsMobile, setShowChatMobile } = useStoreActions(actions => ({
        setSearch: actions.setSearch,
        setSoundOn: actions.setSoundOn,
        setMusicOn: actions.setMusicOn,
        setShowFriendsMobile: actions.setShowFriendsMobile,
        setShowChatMobile: actions.setShowChatMobile
    }));

    const handleExitClick = async (e) => {
        setSearch(false);
        onRouteChange(e);
        await fetch(`${process.env.REACT_APP_PUSHER_URL}/sendExitGame?channelName=${opponentName}`)
    }

    const setSoundClick = () => {
        if (!isMobile) {
            setSoundOn();
        }
    }

    const setSoundTouch = () => {
        if (isMobile) {
            setSoundOn();
        }
    }

    const setMusicClick = () => {
        if (!isMobile) {
            setMusicOn();
        }
    }

    const setMusicTouch = () => {
        if (isMobile) {
            setMusicOn();
        }
    }

    return (
        <nav className='nav'>
            <div className='leftNav'>
                <img alt='sound icon' src={soundIcon} onClick={setSoundClick} onTouchStart={setSoundTouch} className={`hasSound audioToggle soundToggle ${soundOn ? 'soundOn' : 'soundOff'}`} />
                <img alt='music icon' src={musicIcon} onClick={setMusicClick} onTouchStart={setMusicTouch} className={`hasSound audioToggle musicToggle ${musicOn ? 'musicOn' : 'musicOff'}`} />
            </div>
            <div className='rightNav'>
                {
                route === 'login' || route === 'register'
                ?
                <>
                    <img className='hasSound leaderboardIcon' src={leaderboardIcon} alt='leaderboard' value='goToLeaderboard' onClick={onRouteChange} />
                </>
                :
                route === 'loggedIn'
                ?
                    !isMobile
                    ?
                    <>
                        {/* <FriendRequests />
                        <button value='goToLeaderboard' onClick={onRouteChange}>Leaderboard</button>
                        <button value='logOut' onClick={onRouteChange}>Log Out</button> */}
                        <FriendRequests />
                        <img className='hasSound leaderboardIcon' src={leaderboardIcon} alt='leaderboard' value='goToLeaderboard' onClick={onRouteChange} />
                        <img className='hasSound logOutIcon' src={logOutIcon} alt='log out' value='logOut' onClick={onRouteChange} />
                    </>
                    :
                    <>
                        <img className='hasSound friendsIcon' src={friendsIcon} alt='friends' onClick={() => setShowFriendsMobile(!showFriendsMobile)} />
                        <FriendRequests />
                        <img className='hasSound leaderboardIcon' src={leaderboardIcon} alt='leaderboard' value='goToLeaderboard' onClick={onRouteChange} />
                        <img className='hasSound logOutIcon' src={logOutIcon} alt='log out' value='logOut' onClick={onRouteChange} />
                    </>
                :
                <>
                    {
                    route === 'leaderboard'
                    ?
                        user?.username
                        ?
                        <>
                            {/* <FriendRequests /> */}
                            <img className='hasSound goHomeIcon' src={homeIcon} alt='go home' value='goHome' onClick={onRouteChange} />
                            <img className='hasSound logOutIcon' src={logOutIcon} alt='log out' value='logOut' onClick={onRouteChange} />
                        </>
                        :
                        <>
                            <img className='hasSound goBackIcon' src={backArrow} alt='go back' value='goToLogin' onClick={onRouteChange} />
                        </>
                    : //route === 'game'
                        user?.hash === 'guest' || !user?.hash
                        ?
                        <>
                            {
                                isMobile && !playingWithAI
                                ? 
                                <div className='chatIconContainer'>
                                    <img className='hasSound chatIcon' src={chatIcon} alt='chat' onClick={() => setShowChatMobile(!showChatMobile)} />
                                </div>
                                : null
                            }
                            <img className='hasSound logOutIcon' src={logOutIcon} alt='log out' value='logOut' onClick={handleExitClick} />
                        </>
                        :
                        <>
                        {
                                isMobile && !playingWithAI
                                ? 
                                <div className='chatIconContainer'>
                                    <img className='hasSound chatIcon' src={chatIcon} alt='chat' onClick={() => setShowChatMobile(!showChatMobile)} />
                                </div>
                                : null
                            }
                            <img className='hasSound goHomeIcon' src={homeIcon} alt='go home' value='goHome' onClick={handleExitClick} />
                            <img className='hasSound logOutIcon' src={logOutIcon} alt='log out' value='logOut' onClick={handleExitClick} />
                        </>
                    }
                </>
                }
            </div>
        </nav>
    )
}

export default Navigation;
