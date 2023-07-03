import React from 'react'
import './friends.css'

const FriendsHome = ({ onRouteChange }) => {
	return (
		<div className='friendsContainer'>
			<div className='friendsContainerHeader'>
				<h2>Friends</h2>
			</div>
			<div className='logToSeeFriendsText'>
				<h3>Log in to add and view friends here</h3>
			</div>
		</div>
	)
}

export default FriendsHome
