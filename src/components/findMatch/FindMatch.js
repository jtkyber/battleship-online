import React, { useState, useEffect, useRef } from 'react';
import './findMatch.css';

const FindMatch = ({ setOpponentName, opponentName, username, setFriendSocket, setRoute }) => {
    const [search, setSearch] = useState(false);
    const [intervalID, setIntervalID] = useState(0);
    const prevIntID = useRef();

    useEffect(() => {
        prevIntID.current = intervalID;
    }, [intervalID])

    useEffect(() => {
        return () => {
            clearInterval(prevIntID.current);
            setTimeout(() => {
                stopSearching();
            }, 1000)
        }
    }, [])

    const stopSearching = async () => {
         try {
            const response = await fetch('https://calm-ridge-60009.herokuapp.com/updateSearching', {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: username,
                    search: false
                })
            })
            if (!response.ok) {throw new Error('Problem updating searching status')}
        } catch(err) {
            console.log(err);
        }
    }

    const updateSearching = async () => {
        try {
            const response = await fetch('https://calm-ridge-60009.herokuapp.com/updateSearching', {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: username,
                    search: !search
                })
            })
            if (!response.ok) {throw new Error('Problem updating searching status')}
            const searchChanged = await response.json();
            if (searchChanged) {
                if (!search) {
                    setIntervalID(setInterval(searchForMatch, 1000));
                } else {
                    clearInterval(intervalID);
                }
                setSearch(!search);
            }
        } catch(err) {
            console.log(err);
        }
    }

    const searchForMatch = async () => {
        try {
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/findMatch?username=${username}`)
            if (!response.ok) {throw new Error('Could not find match')}
            const match = await response.json();
            if (match) {
                setFriendSocket(match.socketid);
                setOpponentName(match.username);
                setRoute('game');
            }
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <button onClick={updateSearching} className='findMatch'>{search === false ? 'Find Match' : 'Searching...'}</button>
    )
}

export default FindMatch;
