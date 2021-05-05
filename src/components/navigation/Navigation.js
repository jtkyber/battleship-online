import React from 'react';
import './navigation.css';

const Navigation = ({onRouteChange, route}) => {
    return (
        <nav>
            {
            route === 'loggedIn'
            ?
            <>
                <button value='goToLogin' onClick={onRouteChange}>Log Out</button>
                <button value='game' onClick={onRouteChange}>Game</button>
            </>
            :
            <>
                <button value='goToLogin' onClick={onRouteChange}>Log Out</button>
                <button value='login' onClick={onRouteChange}>Home</button>
            </>
        }
        </nav>
    )
}

export default Navigation;
