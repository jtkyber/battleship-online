import React, { useState, useEffect } from 'react';
import SingleFriend from './SingleFriend';
import { socket } from '../../socket/socketImport';
import './friends.css';

const Friends = ({ route, setFriendSocket, currentSocket, username, showOnlineStatusToFriends, setRoute }) => {
    const [allFriends, setAllFriends] = useState([]);
    const [unsortedFriends, setUnsortedFriends] = useState([]);
    const [friendFilter, setFriendFilter] = useState('');
    const [friendSearch, setFriendSearch] = useState('');

    // Start fetching friends on component mount
// -----------------------------------------------------------------------------------
    useEffect(() => {
        // setTimeout(() => {

        // }, 300)
        fetchFriends();
        showOnlineStatusToFriends();
    }, [])
//-----------------------------------------------------------------------------------
    // Sort the friends when fetching has finished/unsortedFriends has updated
//-----------------------------------------------------------------------------------
    useEffect(() => {
        sortFriends();
    },[unsortedFriends])
//-----------------------------------------------------------------------------------
    // Sort friends. Online at top
//-----------------------------------------------------------------------------------
    const sortFriends = () => {
        const onlineFriends = [];
        const offlineFriends = [];
        const justAdded = [];
        unsortedFriends.forEach(f => {
            if (f.name === friendSearch) {
                if (f.status === 'online') {
                    justAdded.push(f)
                } else {
                    justAdded.push(f)
                }
            } else {
                if (f.status === 'online') {
                    onlineFriends.push(f)
                } else {
                    offlineFriends.push(f)
                }
            }
        })
        if (justAdded.length) {
            setAllFriends(justAdded.concat(onlineFriends).concat(offlineFriends));
        } else {
            setAllFriends(onlineFriends.concat(offlineFriends));
        }
    }
//-----------------------------------------------------------------------------------
    // If a friend goes online while the user is also online,
    // update their status
//-----------------------------------------------------------------------------------
    socket.on('update friend status', () => {
        fetchFriends();
    });
//-----------------------------------------------------------------------------------
    // Get the string of friends that is stored in the database for the user
    // Convert to array of friends
    // Pass the array to 'fetchFriendData()'
// -----------------------------------------------------------------------------------
    const fetchFriends = async () => {
        let allFriendNames = [];
        try {
            const response = await fetch(`http://localhost:8000/getFriends?username=${username}`)
            if (!response.ok) {throw new Error('Problem accessing friends list')}
            const friends = await response.json();
            if (friends !== null && friends !== '') {
                allFriendNames = friends.split(',');
                fetchFriendData(allFriendNames);
            }
        } catch {

        }
    }
//-----------------------------------------------------------------------------------
    // Search the database for each of the user's friends
    // Return those users, and add their username & online status to a temporary array
    // Assign that array to the unsortedFriends useState hook
//-----------------------------------------------------------------------------------
    const fetchFriendData = async (allFriendNames) => {
        let allF = [];
        for (let friend of allFriendNames) {
            try {
                const response = await fetch(`http://localhost:8000/findFriend?username=${friend}`);
                if (!response.ok) {throw new Error('User does not exist')}
                const user = await response.json();
                if (user.socketid) {
                    allF.push({name: user.username, status: 'online'})
                } else {
                    allF.push({name: user.username, status: 'offline'})
                }
            } catch(err) {
                console.log(err);
            }
        }
        setUnsortedFriends(allF);
    }
//-----------------------------------------------------------------------------------
    // Called on button press to add friend
//-----------------------------------------------------------------------------------
    const addFriend = async () => {
        document.querySelector('.addFriendInput').value = '';
        const friendAlert = document.querySelector('.friendsContainer');
        let friendList = '';
        let friendArray = [];
//-----------------------------------------------------------------------------------
        // Search the database to check if the name that was
        // entered matches any users in the databse
//-----------------------------------------------------------------------------------
        try {
            const res = await fetch(`http://localhost:8000/findFriend?username=${friendSearch}`);
            if (!res.ok) {
                friendAlert.style.setProperty('--add-friend-alert', '"User does not exist"');
                throw new Error('User does not exist')
            }
            const user = await res.json();
            if (user.username === username) {
                friendAlert.style.setProperty('--add-friend-alert', '"Cannot add self as friend"');
                throw new Error('Cannot add self as friend')
            } else if (user.username) {
    //-----------------------------------------------------------------------------------
                // If friend exists, grab the user's friend list string
                // Make a temporary string and array with the new friend
    //-----------------------------------------------------------------------------------
                const res2 = await fetch(`http://localhost:8000/getFriends?username=${username}`)
                if (!res2.ok) {throw new Error('Problem accessing friends list')}
                const friends = await res2.json();
                if (friends !== null && friends !== '') {
                    friendArray = friends.split(',');
                    if (friendArray.includes(friendSearch)) {
                        friendAlert.style.setProperty('--add-friend-alert', '"User already your friend"');
                        throw new Error('User already your friend');
                    } else {
                        friendArray.push(friendSearch);
                        friendList = friends.concat(`,${friendSearch}`);
                    }
                } else {
                    friendList = friendSearch;
                    friendArray = [friendSearch];
                }
    //-----------------------------------------------------------------------------------
                // Update the user's friend list with the new friends string
                // Pass the updated friends array to 'fetchFriendData'
    //-----------------------------------------------------------------------------------
                const res3 = await fetch('http://localhost:8000/addFriend', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        username: username,
                        friendlist: friendList
                    })
                })
                if (!res3.ok) {throw new Error('Problem adding friend')}
                const userAdded = await res3.json();
                if (userAdded) {
                    fetchFriendData(friendArray);
                    friendAlert.style.setProperty('--add-friend-alert', '""');
                }
            }
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <div className='friendsContainer'>
            <div className='friendsSection'>
                <h2>Friends</h2>
                <input onChange={(e) => setFriendFilter(e.target.value)} type='text' placeholder='Enter a username'/>
                <div className='friendsListContainer'>
                {
                    allFriends.length
                    ?
                    <div className='friendsList'>
                    {
//-----------------------------------------------------------------------------------
                        // Map through the user's friends
                        // Return a single friend div w/ their username and status
//-----------------------------------------------------------------------------------
                        allFriends.map(f => {
                            if (f.name.toLowerCase().includes(friendFilter.toLowerCase())) {
                                return <SingleFriend route={route} setFriendSocket={setFriendSocket} currentSocket={currentSocket} username={username} fetchFriends={fetchFriends} key={f.name} name={f.name} status={f.status} setRoute={setRoute} />
                            } else return null
                        })
                    }
                    </div>
                    : <h4 className='noFriends'>No friends have been added</h4>
                }
                </div>
                <div className='addFriend'>
                    <h3 className='addFriendText' >Add a friend</h3>
                    <input className='addFriendInput' onChange={(e) => setFriendSearch(e.target.value)} type='text' placeholder='Enter a username'/>
                    <button onClick={addFriend} >Add</button>
                </div>
            </div>
        </div>
    )
}

export default Friends;
