import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';

import Navigation from '../navigation/Navigation';

const Leaderboard = ({ onRouteChange, socket }) => {

    const { route, user, topFive } = useStoreState(state => ({
        route: state.route,
        user: state.user,
        topFive: state.topFive
    }));

    const { setUnsortedFriends, setTopFive } = useStoreActions(actions => ({
        setUnsortedFriends: actions.setUnsortedFriends,
        setTopFive: actions.setTopFive
    }));

    useEffect(() => {
        getTopPlayers();
    },[])

    const getTopPlayers = async () => {
        const tempArr = [];
        for (let i = 0; i < 5; i++) {
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/getTopFive?userNum=${i}`)
            if (!response.ok) {
                throw new Error('Error')
            }
            const user1 = await response.json();
            tempArr.push({name: user1.username, wins: user1.wins});
        }
        setTopFive(tempArr);
    }

    return (
        <>
            <Navigation route={route} onRouteChange={onRouteChange} setUnsortedFriends={setUnsortedFriends} socket={socket} username={user.username} />
            {
            topFive.length
            ?
            <div className='topFiveContainer'>
                <div className='topFive'>
                    {
                    topFive.map(player => {
                        return <h3 key={player.name} className='LBplayer'> {player.name} : <span className='wins'>{player.wins}</span> wins </h3>
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
