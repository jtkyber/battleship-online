import React, { useState, useEffect } from 'react';
import Navigation from '../navigation/Navigation';

const Leaderboard = ({ route, onRouteChange, setUnsortedFriends, socket, username }) => {
    const [topFive, setTopFive] = useState([]);

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
            const user = await response.json();
            tempArr.push({name: user.username, wins: user.wins});
        }
        setTopFive(tempArr);
    }

    return (
        <>
            <Navigation route={route} onRouteChange={onRouteChange} setUnsortedFriends={setUnsortedFriends} socket={socket} username={username} />
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
