import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';

import Navigation from '../navigation/Navigation';

const Leaderboard = ({ onRouteChange, socket }) => {

    const { topFive, route } = useStoreState(state => ({
        topFive: state.topFive,
        route: state.route
    }));

    const { setTopFive } = useStoreActions(actions => ({
        setTopFive: actions.setTopFive
    }));

    useEffect(() => {
        if (route === 'leaderboard') {
            getTopPlayers();
        }
    },[route])

    const getTopPlayers = async () => {
        for (let i = 0; i < 5; i++) {
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/getTopFive?userNum=${i}`)
            if (!response.ok) {
                throw new Error('Error')
            }
            const data = await response.json();
            setTopFive(data);
        }
    }

    return (
        <>
            <Navigation onRouteChange={onRouteChange} socket={socket} />
            {
            topFive.length
            ?
            <div className='topFiveContainer'>
                <div className='topFive'>
                    {
                    topFive.map(player => {
                        return <h3 key={player.username} className='LBplayer'> {player.username} : <span className='score'>{player.score}</span> Score </h3>
                    })
                    }
                </div>
            </div>
            : null
            }
        </>
    )
}

export default Leaderboard;
