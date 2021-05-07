import React, { useState, useEffect } from 'react';
import './navigation.css';
import msgIcon from './msg-icon.png';
import { Dropdown } from 'react-bootstrap';
import { socket } from '../../socket/socketImport';

const FriendRequests = ({username}) => {
    const [friendRequests, setFriendRequests] = useState([]);

    useEffect(() => {
        updateRequests();
    },[])

    const updateRequests = async () => {
        const navBar = document.querySelector('nav');
        try {
            const res = await fetch(`http://localhost:8000/getFriendRequests?username=${username}`);
            if (!res.ok) {
                throw new Error('Could not get friend requests')
            }
            const requests = await res.json();
            if (requests !== null && requests !== '') {
                setFriendRequests(requests.split(','));
                navBar.style.setProperty('--notification-color', 'rgba(255,0,0,0.8)');
            } else {
                navBar.style.setProperty('--notification-color', 'transparent');
            }
        } catch(err) {
            console.log(err)
        }
    }

    socket.on('receive friend request', () => {
        updateRequests();
    })

    return (
        <>
            <Dropdown className='dropdown'>
              <Dropdown.Toggle variant="success" className='messageToggle' id="dropdown-basic"><img src={msgIcon} alt='Message Icon' /></Dropdown.Toggle>
              <Dropdown.Menu id='dropdowns'>
              {
                  friendRequests.map(request => {
                    return (
                        <div key={request} className='dropdownItem'>
                            <div className='text'>Friend request from <h3 className="requesterName">{request}</h3></div>
                            <div>
                                <button id={request} className='acceptInvite'>Accept</button>
                                <button className='rejectInvite'>Reject</button>
                            </div>
                        </div>
                    )
                  })
              }
              </Dropdown.Menu>
            </Dropdown>
        </>
    )
}

export default FriendRequests;
