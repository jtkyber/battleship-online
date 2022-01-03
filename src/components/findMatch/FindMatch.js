import React, { useState, useEffect } from 'react';
import './findMatch.css';

const FindMatch = ({ currentSocket, setSearch, search, findMatchInterval, setFindMatchInterval, socket, setOpponentName, username, setFriendSocket, setRoute }) => {
    

    useEffect(() => {
        socket.on('receive go to game', data => {
            setOpponentName(data.senderName);
            setFriendSocket(data.senderSocket);
            setRoute('game');
        })

        return () => {
            socket.off('receive go to game');
        }
    }, [])

    useEffect(() => {
        if (search) {
            setFindMatchInterval(setInterval(searchForMatch, 1000));
        }
    }, [search])

    const stopSearching = async () => {
         try {
            clearInterval(findMatchInterval);
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
                await setFriendSocket(match.socketid);
                await setOpponentName(match.username);
                await stopSearching();
                await socket.emit('send go to game',  {receiverSocket: match.socketid, senderSocket: currentSocket, senderName: username});
                await setSearch(false);
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
