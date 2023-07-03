import { useStoreActions, useStoreState } from 'easy-peasy'
import React, { useEffect } from 'react'
import { audio } from '../../audio'
import Board from './Board'
import './board.css'

let hitSquares = []
let score = 0

const OpponentBoard = () => {
	const { yourTurn, playingWithAI, aiShipLayout, user, channel, opponentName } = useStoreState(state => ({
		yourTurn: state.yourTurn,
		playingWithAI: state.playingWithAI,
		aiShipLayout: state.aiShipLayout,
		user: state.user,
		channel: state.channel,
		opponentName: state.opponentName,
	}))

	const { setYourTurn, setSkippedTurns, setAiShipLayout, setAIturn, setRoute, setUser } = useStoreActions(
		actions => ({
			setYourTurn: actions.setYourTurn,
			setSkippedTurns: actions.setSkippedTurns,
			setAiShipLayout: actions.setAiShipLayout,
			setAIturn: actions.setAIturn,
			setRoute: actions.setRoute,
			setUser: actions.setUser,
		})
	)

	let aiShipLocations = {
		destroyer: [],
		submarine: [],
		cruiser: [],
		battleship: [],
		carrier: [],
	}

	const countHitsOnShip = ship => {
		let count = 0
		for (let hit of hitSquares) {
			if (hit === ship) {
				count += 1
			}
		}
		return count
	}

	useEffect(() => {
		if (playingWithAI) setAIships()

		return () => {
			setAiShipLayout({})
			setAIturn(false)
			setSkippedTurns(0)
			score = 0
			hitSquares = []
		}
	}, [])

	useEffect(() => {
		if (channel) {
			channel.bind('show-result-on-opponent-board', data => {
				const clickedSquare = document.querySelector(`.opponentBoard [id='${data.shotSquare}']`)
				document.querySelector('.preResultDiv').remove()
				if (data.result === 'hit' && clickedSquare.classList !== undefined) {
					clickedSquare.classList.add('hitMarker')
					hitSquares.push(data.shipHit)
					clickedSquare.classList.add(`_${data.shipHit}`)
					if (countHitsOnShip(data.shipHit) === parseInt(document.querySelector(`.${data.shipHit}`).id)) {
						const squares = document.querySelectorAll('.singleSquare')
						audio.shipSunkSound.play()
						for (let square of squares) {
							if (square.classList.contains(`_${data.shipHit}`)) {
								square.classList.add('shipSunk')
							}
						}
					} else {
						audio.hitSound.play()
					}
				} else if (data.result === 'miss' && clickedSquare.classList !== undefined) {
					clickedSquare.classList.add('missMarker')
					audio.missSound.play()
				}
				return data
			})
		}

		return () => {
			if (channel) channel.unbind('show-result-on-opponent-board')
		}
	}, [channel])

	const aiSpotClear = newSpot => {
		for (let ship in aiShipLocations) {
			for (let spot of aiShipLocations[ship]) {
				if (spot === newSpot) {
					return false
				}
			}
		}
		return true
	}

	const pickRandomBoardLocation = () => {
		let newSpot
		let counter = 0
		while (counter < 100) {
			counter++
			newSpot = `${Math.round(Math.random() * (10 - 1) + 1)}-${Math.round(Math.random() * (10 - 1) + 1)}`
			if (aiSpotClear(newSpot)) {
				return newSpot
			}
		}
	}

	const shuffleArray = arr => {
		let currentIndex = arr.length,
			randomIndex

		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex--

			;[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
		}

		return arr
	}

	const colString = str => {
		return str.split('-')[0]
	}

	const rowString = str => {
		return str.split('-')[1]
	}

	const lowestAndHighest = (i, colRowIndex, shipName) => {
		const firstSpot = aiShipLocations[shipName][0]
		const secondSpot = aiShipLocations[shipName][i - 1]

		if (!firstSpot || !secondSpot) return

		if (
			Math.min(parseInt(firstSpot.split('-')[colRowIndex]), parseInt(secondSpot.split('-')[colRowIndex])) ===
			parseInt(firstSpot.split('-')[colRowIndex])
		) {
			return {
				lowest: firstSpot,
				highest: secondSpot,
			}
		} else {
			return {
				lowest: secondSpot,
				highest: firstSpot,
			}
		}
	}

	const setSingleAIship = (shipLength, shipName) => {
		while (aiShipLocations[shipName].length !== shipLength) {
			aiShipLocations[shipName] = []

			for (let i = 0; i < shipLength; i++) {
				if (i === 0) {
					aiShipLocations[shipName][0] = pickRandomBoardLocation()
				} else if (i === 1) {
					const firstSpot = aiShipLocations[shipName][0]
					const possibleChoices = [
						colString(firstSpot) > 1
							? `${parseInt(colString(firstSpot)) - 1}-${parseInt(rowString(firstSpot))}`
							: null,
						colString(firstSpot) < 10
							? `${parseInt(colString(firstSpot)) + 1}-${parseInt(rowString(firstSpot))}`
							: null,
						rowString(firstSpot) > 1
							? `${parseInt(colString(firstSpot))}-${parseInt(rowString(firstSpot)) - 1}`
							: null,
						rowString(firstSpot) < 10
							? `${parseInt(colString(firstSpot))}-${parseInt(rowString(firstSpot)) + 1}`
							: null,
					]
					shuffleArray(possibleChoices)
					possibleChoices.every(choice => {
						if (choice && aiSpotClear(choice)) {
							aiShipLocations[shipName][1] = choice
							return false
						}
						return true
					})
				} else {
					const firstSpot = aiShipLocations[shipName][0]
					if (colString(firstSpot) !== colString(aiShipLocations[shipName][1])) {
						const lowest = lowestAndHighest(i, 0, shipName)?.lowest
						const highest = lowestAndHighest(i, 0, shipName)?.highest
						const possibleChoices = [
							lowest && parseInt(colString(lowest)) > 1
								? `${parseInt(colString(lowest)) - 1}-${rowString(lowest)}`
								: null,
							highest && parseInt(colString(highest)) < 10
								? `${parseInt(colString(highest)) + 1}-${rowString(highest)}`
								: null,
						]
						shuffleArray(possibleChoices)
						possibleChoices.every(choice => {
							if (
								choice &&
								colString(choice) > 0 &&
								colString(choice) < 11 &&
								rowString(choice) > 0 &&
								rowString(choice) < 11 &&
								aiSpotClear(choice)
							) {
								aiShipLocations[shipName][i] = choice
								return false
							}
							return true
						})
					} else {
						const lowest = lowestAndHighest(i, 1, shipName)?.lowest
						const highest = lowestAndHighest(i, 1, shipName)?.highest
						const possibleChoices = [
							lowest && parseInt(rowString(lowest)) > 1
								? `${colString(lowest)}-${parseInt(rowString(lowest)) - 1}`
								: null,
							highest && parseInt(rowString(lowest)) < 10
								? `${colString(highest)}-${parseInt(rowString(highest)) + 1}`
								: null,
						]
						shuffleArray(possibleChoices)
						possibleChoices.every(choice => {
							if (
								choice &&
								colString(choice) > 0 &&
								colString(choice) < 11 &&
								rowString(choice) > 0 &&
								rowString(choice) < 11 &&
								aiSpotClear(choice)
							) {
								aiShipLocations[shipName][i] = choice
								return false
							}
							return true
						})
					}
				}
			}
		}
	}

	const setAIships = () => {
		//Destroyer
		setSingleAIship(2, 'destroyer')
		//submarine
		setSingleAIship(3, 'submarine')
		//cruiser
		setSingleAIship(3, 'cruiser')
		//battleship
		setSingleAIship(4, 'battleship')
		//carrier
		setSingleAIship(5, 'carrier')

		// let colVal = 0;
		// const tempArr = [];
		// const sameSpots = [];
		// for (let ship in aiShipLocations) {
		//     for (let spot of aiShipLocations[ship]) {
		//         const spotBlock = document.querySelector(`.opponentBoard [id="${spot}"]`);
		//         const aiShipSpot = document.createElement('div');
		//         aiShipSpot.classList.add('aiShipSpotTest');
		//         aiShipSpot.style.backgroundColor = `rgba(${colVal}, ${colVal}, ${colVal}, 0.5)`;
		//         spotBlock?.appendChild(aiShipSpot);
		//         if (tempArr.includes(spot)) {
		//             sameSpots.push(spot);
		//         } else tempArr.push(spot);
		//     }
		//     colVal += 50;
		// }

		setAiShipLayout(aiShipLocations)
	}

	const updateScore = async scoreIncrement => {
		try {
			const res = await fetch(`${process.env.REACT_APP_API_URL}/updateScore`, {
				method: 'put',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: user.username,
					scoreIncrement: scoreIncrement,
				}),
			})
			const scoreUpdated = await res.json()
			if (!scoreUpdated) {
				throw new Error('Could not increment score')
			} else {
				setUser({ ...user, score: scoreUpdated })
			}
		} catch (err) {
			console.log(err)
		}
	}

	const handlePlayerWonAgainstAI = scoreIncrement => {
		if (user?.username && user?.hash !== 'guest') {
			updateScore(scoreIncrement)
		}
		setTimeout(() => {
			window.alert('You Won!!!')
			user?.hash === 'guest' || !user?.username ? setRoute('login') : setRoute('loggedIn')
		}, 300)
	}

	const applyAIhitOrMiss = clickedSquare => {
		document.querySelector('.preResultDiv').remove()
		const clickedSquareID = clickedSquare.id
		let hit = false
		let shipHit = ''

		for (let ship in aiShipLayout) {
			for (let spot of aiShipLayout[ship]) {
				if (spot === clickedSquareID) {
					hit = true
					shipHit = ship
				}
			}
		}

		if (hit && clickedSquare.classList !== undefined) {
			hitSquares.push(shipHit)
			clickedSquare.classList.add('hitMarker')
			clickedSquare.classList.add(`_${shipHit}`)
			if (countHitsOnShip(shipHit) === parseInt(document.querySelector(`.${shipHit}`).id)) {
				const squares = document.querySelectorAll('.singleSquare')
				audio.shipSunkSound.play()
				score += 1
				for (let square of squares) {
					if (square.classList.contains(`_${shipHit}`)) {
						square.classList.add('shipSunk')
					}
				}
			} else {
				audio.hitSound.play()
			}

			if (score >= 5) {
				handlePlayerWonAgainstAI(5)
				return
			}
		} else if (!hit && clickedSquare.classList !== undefined) {
			clickedSquare.classList.add('missMarker')
			audio.missSound.play()
		}

		setAIturn(true)
	}

	const onSquareClicked = async e => {
		if (yourTurn && !e.target.classList.contains('hitMarker') && !e.target.classList.contains('missMarker')) {
			// setSquareClicked(e.target);
			setSkippedTurns(0)
			setYourTurn(false)
			const preResultDiv = document.createElement('div')
			preResultDiv.classList.add('preResultDiv')
			e.target.appendChild(preResultDiv)

			audio.missileLaunch.play()
			if (playingWithAI) {
				const shot = e.target
				const missileLaunchDuration = audio.missileLaunch.duration() * 1000 - 100
				setTimeout(() => {
					applyAIhitOrMiss(shot)
				}, missileLaunchDuration)
			} else {
				await fetch(
					`${process.env.REACT_APP_PUSHER_URL}/sendShotToOpponent?channelName=${opponentName}&target=${e.target.id}`
				)
			}
		}
	}

	return (
		<div className='board opponentBoard'>
			<div className='rows'>
				<h3>A</h3>
				<h3>B</h3>
				<h3>C</h3>
				<h3>D</h3>
				<h3>E</h3>
				<h3>F</h3>
				<h3>G</h3>
				<h3>H</h3>
				<h3>I</h3>
				<h3>J</h3>
			</div>

			<div className='cols'>
				<h3>1</h3>
				<h3>2</h3>
				<h3>3</h3>
				<h3>4</h3>
				<h3>5</h3>
				<h3>6</h3>
				<h3>7</h3>
				<h3>8</h3>
				<h3>9</h3>
				<h3>10</h3>
			</div>

			<div className='grid'>
				<div className='allSqaures'>
					<Board onSquareClicked={onSquareClicked} />
				</div>
			</div>
		</div>
	)
}

export default OpponentBoard
