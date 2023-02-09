import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import './navigation.css';
import notificationIcon from './notification.png';
import { Dropdown } from 'react-bootstrap';
import { audio } from '../../audio';
const FriendRequests = ({ socket }) => {

    const { user, friendRequests } = useStoreState(state => ({
        user: state.user,
        friendRequests: state.friendRequests
    }));

    const { setUnsortedFriends, setFriendRequests } = useStoreActions(actions => ({
        setUnsortedFriends: actions.setUnsortedFriends,
        setFriendRequests: actions.setFriendRequests
    }));

    useEffect(() => {
        updateRequests();

        socket.on('receive friend request', () => {
            updateRequests();
        })

        return () => {
            socket.off('receive friend request');
        }
    },[])

    const updateRequests = async () => {
        const navBar = document.querySelector('nav');
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/getFriendRequests?username=${user.username}`);
            if (!res.ok) {
                throw new Error('Could not get friend requests')
            }
            const requests = await res.json();
            if (requests !== null && requests !== '') {
                navBar.style.setProperty('--notification-color', 'rgba(255,0,0,0.8)');
                setFriendRequests(requests.split(','));
                audio.notificationSound.play();
            } else {
                navBar.style.setProperty('--notification-color', 'transparent');
                setFriendRequests(null);
            }
        } catch(err) {
            console.log(err)
        }
    }

    const removeRequest = async (friend) => {
        let newRequestList = '';
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/getFriendRequests?username=${user.username}`);
            if (!res.ok) {
                throw new Error('Could not get friend requests')
            }
            const requests = await res.json();
            if (requests !== null && requests !== '') {
                const newRequestListArray = requests.split(',');
                if (newRequestListArray.length <= 1) {
                    newRequestList = null;
                } else {
                    const index = newRequestListArray.indexOf(friend);
                    if (index > -1) {
                        newRequestListArray.splice(index, 1);
                        newRequestList = newRequestListArray.join(',');
                    }
                }
            }

            const res2 = await fetch(`${process.env.REACT_APP_API_URL}/updateFriendRequests`, {
                method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        requestlist: newRequestList,
                        username: user.username
                    })
            });
            if (!res2.ok) {
                throw new Error('Could not update friend requests');
            }
            const userRemoved = await res2.json();
            if (userRemoved) {
                updateRequests();
            }
        } catch(err) {
            console.log(err);
        }
    }

    const onRemoveRequest = (e) => {
        removeRequest(e.target.id);
    }

     const addFriend = async (friend) => {
        console.log('friend added');
        document.querySelector('.addFriendInput').value = '';
        let friendList = '';
        let friendArray = [];
        let friendlistOfFriends = '';
        let friendSocketId = '';
//-----------------------------------------------------------------------------------
        // Search the database to check if the name matches any users in the databse
//-----------------------------------------------------------------------------------
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/findFriend?username=${friend}`);
            if (!res.ok) {
                throw new Error('User does not exist')
            }
            const user1 = await res.json();
            if (user1.username === user.username) {
                throw new Error('Cannot add self as friend')
            } else if (user1.username) {
                let friendlistOfFriendsArray = [];
                friendSocketId = user1.socketid;
                if (user1?.friends?.length) {
                    friendlistOfFriendsArray = user1.friends.split(',');
                    if (friendlistOfFriendsArray.includes(user.username)) {
                        throw new Error('You are already a friend of the user');
                    }
                }
                friendlistOfFriendsArray.push(user.username);
                if (friendlistOfFriendsArray.length > 1) {
                    friendlistOfFriends = friendlistOfFriendsArray.join(',');
                } else {
                    friendlistOfFriends = friendlistOfFriendsArray[0];
                }
    //-----------------------------------------------------------------------------------
                // If friend exists, grab the user's friend list string
                // Make a temporary string and array with the new friend
    //-----------------------------------------------------------------------------------
                const res2 = await fetch(`${process.env.REACT_APP_API_URL}/getFriends?username=${user.username}`)
                if (!res2.ok) {throw new Error('Problem accessing friends list')}
                const friends = await res2.json();
                if (friends?.length) {
                    friends.forEach(f => {
                        friendArray.push(f.username);
                        if (f.username === friend) {
                            throw new Error('User already your friend');
                        }
                    })
                }
                friendArray.push(friend);
                friendList = friendArray.join(',');

    //-----------------------------------------------------------------------------------
                // Update the user's friend list with the new friends string
                // Pass the updated friends array to 'fetchFriendData'
    //-----------------------------------------------------------------------------------
                const res3 = await fetch(`${process.env.REACT_APP_API_URL}/addFriend`, {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        username: user.username,
                        friendlist: friendList
                    })
                })
                if (!res3.ok) {throw new Error('Problem adding friend')}
                const userAdded = await res3.json();
                if (userAdded) {
                    const allF = [];
                    for (let f of friendArray) {
                        try {
                            const response = await fetch(`${process.env.REACT_APP_API_URL}/findFriend?username=${f}`);
                            if (!response.ok) {throw new Error('User does not exist')}
                            const user1 = await response.json();
                            // if (opponentIsOnline(user1)) {
                            //     allF.push({name: user1.username, status: 'online'})
                            // } else {
                            //     allF.push({name: user1.username, status: 'offline'})
                            // }
                            allF.push(user1);
                        } catch(err) {
                            console.log(err);
                        }
                    }
                    setUnsortedFriends(allF);
                }
                const res4 = await fetch(`${process.env.REACT_APP_API_URL}/addSelfToFriend`, {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        friendlist: friendlistOfFriends,
                        friendname: friend
                    })
                })
                if (!res4.ok) {throw new Error('Problem adding self to friendlist of friend')}
                const selfAdded = await res4.json();
                if (selfAdded && friendSocketId !== null) {
                    socket.emit('update user status', friendSocketId);
                }
            }
        } catch(err) {
            console.log(err);
        }
    }

    const addFriendStart = async (e) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/findFriend?username=${e.target.id}`);
            if (!res.ok) {
                throw new Error('User does not exist')
            }
            const user1 = await res.json();
            if (user1.username) {
                removeRequest(e.target.id);
                // socket.emit('send add friend', {socketid: user.socketid, user: username})
                addFriend(e.target.id);
                // Can't add friend if their offline   FIX
            }
        } catch(err) {
            console.log(err)
        }
    }

    return (
        <>
            <Dropdown className='dropdown'>
              <Dropdown.Toggle variant="success" className='messageToggle' id="dropdown-basic"><img src={notificationIcon} alt='Message Icon' className='hasSound' /></Dropdown.Toggle>
              <Dropdown.Menu id='dropdowns'>
              {
                friendRequests !== null
                ?
                  friendRequests.map(request => {
                    return (
                        <div key={request} className='dropdownItem'>
                            <div className='text'>Friend request from <h3 className="requesterName">{request}</h3></div>
                            <div className='acceptReject'>
                                <button onClick={addFriendStart} id={request} className='acceptInvite'>Accept</button>
                                <button onClick={onRemoveRequest} id={request} className='rejectInvite'>Reject</button>
                            </div>
                        </div>
                    )
                  })
                  : (null)
              }
              </Dropdown.Menu>
            </Dropdown>
        </>
    )
}

export default FriendRequests;
