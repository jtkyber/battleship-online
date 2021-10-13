import React from 'react';
import './friends.css';

const FriendsHome = ({onRouteChange}) => {
    return (
    <div className='friendsContainer'>
        <div className='friendsContainerHeader'>
            <h2>Friends</h2>
        </div>
        <div className='logToSeeFriendsText'>
            <h3>Log in to see your friends here</h3>
        </div>
        {/*<div className='homeLeaderboard'>
            <button value='goToLeaderboard' onClick={onRouteChange}>Leaderboard</button>
        </div>*/}
    </div>
    )
}

export default FriendsHome;
