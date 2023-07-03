import { useStoreState } from 'easy-peasy'
import $ from 'jquery'
import { useEffect } from 'react'
import { audio } from '../../audio'
import '../boards/board.css'
import './ships.css'

let moving = false
let rotating = false
let orientation = 'hor'
let selectedShip = ''
let selectedShipName = ''
let shipIsSelected = false
let setManualGridLocation = false
let mouseX
let mouseY

const Ships = () => {
	const { gameRoute, isMobile, showGameInstructions, gameTimer } = useStoreState(state => ({
		gameRoute: state.gameRoute,
		isMobile: state.stored.isMobile,
		showGameInstructions: state.stored.showGameInstructions,
		gameTimer: state.gameTimer,
	}))

	const userBoard = document.querySelector('.userBoard')
	const squares = document.querySelectorAll('.userBoard .singleSquare')
	const ships = document.querySelectorAll('.ship')

	useEffect(() => {
		if (gameTimer <= 0) removeShipIfSelected()
	}, [gameTimer])

	// Decide what happens when a ship is selected to move

	const onShipSelect = e => {
		if (!shipIsSelected && gameRoute === 'placeShips') {
			audio.pickUpShip.play()
			shipIsSelected = true
			selectedShip = e.target.parentElement
			userBoard.style.cursor = 'pointer'
			selectedShip.style.pointerEvents = 'none'
			selectedShip.style.border = '2px solid rgba(0, 250, 0, 0.5)'

			if (parseInt(e.target.parentElement.offsetWidth) > parseInt(e.target.parentElement.offsetHeight)) {
				orientation = 'hor'
			} else if (
				parseInt(e.target.parentElement.offsetHeight) > parseInt(e.target.parentElement.offsetWidth)
			) {
				orientation = 'vert'
			}

			if (selectedShip.classList.contains('carrier')) {
				selectedShipName = 'carrier'
			} else if (selectedShip.classList.contains('battleship')) {
				selectedShipName = 'battleship'
			} else if (selectedShip.classList.contains('cruiser')) {
				selectedShipName = 'cruiser'
			} else if (selectedShip.classList.contains('submarine')) {
				selectedShipName = 'submarine'
			} else if (selectedShip.classList.contains('destroyer')) {
				selectedShipName = 'destroyer'
			}
		}
	}

	// Delete ship if still picked up after timer

	const removeShipIfSelected = () => {
		if (shipIsSelected) {
			selectedShip.remove()
			shipIsSelected = false
		}
	}

	// collision detection

	const collisionDetection = (item1, item2) => {
		let d1Offset = $(item1).offset()
		let d1Height = $(item1).outerHeight(true)
		let d1Width = $(item1).outerWidth(true)
		let d1Top = d1Offset.top + d1Height
		let d1Left = d1Offset.left + d1Width
		let d2Offset = $(item2).offset()
		let d2Height = $(item2).outerHeight(true)
		let d2Width = $(item2).outerWidth(true)
		let d2Top = d2Offset.top + d2Height
		let d2Left = d2Offset.left + d2Width

		const colliding = !(
			d1Top <= d2Offset.top + 2 ||
			d1Offset.top >= d2Top - 2 ||
			d1Left <= d2Offset.left + 2 ||
			d1Offset.left >= d2Left - 2
		)

		return colliding
	}

	// Place a ship down that is currently selected

	window.onclick = e => {
		if (!shipIsSelected && !isMobile && e.target?.parentElement?.classList?.contains('ship')) {
			onShipSelect(e)
		} else if (
			!isMobile &&
			shipIsSelected &&
			e.target.classList.contains('singleSquare') &&
			rotating === false &&
			areaIsClear()
		) {
			audio.dropShip.play()
			selectedShip.style.pointerEvents = 'auto'
			document.querySelector('.userBoard').style.cursor = 'default'
			selectedShip.style.border = null
			shipIsSelected = false
		}
	}

	const wasShipTouched = (x, y) => {
		const shipLeft = selectedShip.getBoundingClientRect().left
		const shipRight = selectedShip.getBoundingClientRect().right
		const shipTop = selectedShip.getBoundingClientRect().top
		const shipBottom = selectedShip.getBoundingClientRect().bottom

		if (x > shipLeft && x < shipRight && y > shipTop && y < shipBottom) {
			return true
		}
		return false
	}

	window.ontouchend = e => {
		if (!showGameInstructions) {
			if (
				shipIsSelected &&
				!moving &&
				areaIsClear() &&
				!wasShipTouched(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
			) {
				audio.dropShip.play()
				selectedShip.style.pointerEvents = 'auto'
				userBoard.style.cursor = 'default'
				selectedShip.style.border = null
				shipIsSelected = false
			} else if (shipIsSelected && !moving) {
				if (orientation === 'hor') {
					orientation = 'vert'
					positionShipOnGrid(e)
				} else if (orientation === 'vert') {
					orientation = 'hor'
					positionShipOnGrid(e)
				}
				audio.rotateShip.play()
				setManualGridLocation = true
				rotating = true
			} else if (shipIsSelected && moving) {
				if (isMobile && shipIsSelected && rotating === false && areaIsClear()) {
					audio.dropShip.play()
					selectedShip.style.pointerEvents = 'auto'
					userBoard.style.cursor = 'default'
					selectedShip.style.border = null
					shipIsSelected = false
				}
			} else if (!shipIsSelected && e.target.parentElement.classList.contains('ship')) {
				onShipSelect(e)
			}
			moving = false
		}
	}

	// Check to see if player is placing the ship in an open space

	const areaIsClear = () => {
		for (let ship of ships) {
			if (!ship.classList.contains(selectedShipName) && collisionDetection(selectedShip, ship)) {
				return false
			}
		}
		return true
	}

	// Rotate the selected ship by right-clicking

	window.oncontextmenu = e => {
		if (!isMobile && shipIsSelected) {
			audio.rotateShip.play()
			if (orientation === 'hor') {
				// selectedShip.style.transform = 'rotate(-90deg)';
				orientation = 'vert'
			} else if (orientation === 'vert') {
				// selectedShip.style.transform = 'rotate(0deg)';
				orientation = 'hor'
			}
			positionShipOnGrid(e)
			setManualGridLocation = true
			rotating = true
		}
		return false
	}

	// Decide what happens on various key-press events

	window.onkeydown = e => {
		if (e.code === 'Enter') {
			e.preventDefault()
		}
		// Rotate the selected ship by pressing the 'space' key

		if (e.code === 'Space' && selectedShip.style !== undefined && shipIsSelected) {
			audio.rotateShip.play()
			if (orientation === 'hor') {
				// selectedShip.style.transform = 'rotate(-90deg)';
				orientation = 'vert'
			} else if (orientation === 'vert') {
				// selectedShip.style.transform = 'rotate(0deg)';
				orientation = 'hor'
			}
			positionShipOnGrid(e)
			setManualGridLocation = true
			rotating = true
		}
	}

	const matchTouchToSquares = (x, y) => {
		let selectedSquare = null
		for (let i = 0; i < squares.length; i++) {
			const squareLeft = squares[i].getBoundingClientRect().left
			const squareRight = squares[i].getBoundingClientRect().right
			const squareTop = squares[i].getBoundingClientRect().top
			const squareBottom = squares[i].getBoundingClientRect().bottom

			if (x > squareLeft && x < squareRight && y > squareTop && y < squareBottom) {
				selectedSquare = squares[i]
				return
			}
		}

		return selectedSquare
	}

	const positionShipOnGrid = e => {
		let square
		if (e.type === 'touchmove') {
			square = matchTouchToSquares(e.touches[0].clientX, e.touches[0].clientY)
		} else if (e.type === 'touchend') {
			square = matchTouchToSquares(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
		} else if (e.code === 'Space' || e.type === 'contextmenu') {
			square = matchTouchToSquares(mouseX, mouseY)
		} else {
			square = e.target
		}

		rotating = false
		selectedShip.style.transform = null
		const childShip = document.querySelector(`.${selectedShipName}Icon`)
		const targetId = square?.id
		const colStart = targetId?.substring(0, targetId.indexOf('-'))
		const rowStart = targetId?.substring(targetId.indexOf('-') + 1, targetId?.length)

		if (
			(userBoard.contains(e.target) || userBoard.contains(square)) &&
			square?.classList?.contains('singleSquare') &&
			shipIsSelected === true
		) {
			if (orientation === 'hor') {
				childShip.classList.remove(`rotate-${selectedShipName}`)
				if (colStart < 11 - parseInt(selectedShip.id) + 1) {
					selectedShip.style.gridColumn = `${colStart} / ${parseInt(colStart) + parseInt(selectedShip.id)}`
				} else if (colStart >= 11 - parseInt(selectedShip.id) + 1 && setManualGridLocation === true) {
					selectedShip.style.gridColumn = `11 / ${11 - parseInt(selectedShip.id)}`
				} else setManualGridLocation = false
				selectedShip.style.gridRow = `${rowStart} / ${parseInt(rowStart) + 1}`
			} else if (orientation === 'vert') {
				childShip.classList.add(`rotate-${selectedShipName}`)
				if (rowStart > parseInt(selectedShip.id) - 1) {
					selectedShip.style.gridRow = `${parseInt(rowStart) + 1} / ${
						parseInt(rowStart) - parseInt(selectedShip.id) + 1
					}`
				} else if (rowStart <= parseInt(selectedShip.id) - 1 && setManualGridLocation === true) {
					selectedShip.style.gridRow = `${parseInt(selectedShip.id) + 1} / 1`
				} else setManualGridLocation = false
				selectedShip.style.gridColumn = `${colStart} / ${parseInt(colStart) + 1}`
			}
		}
	}

	// Change the grid-row and grid-column of the selected ship mouse is over the user's board

	window.onmouseover = e => {
		mouseX = e.clientX
		mouseY = e.clientY
		if (shipIsSelected && !isMobile) {
			positionShipOnGrid(e)
		}
	}

	window.ontouchmove = e => {
		moving = true
		if (shipIsSelected && isMobile) {
			positionShipOnGrid(e)
		}
	}

	return (
		<>
			<div id='5' className='ship carrier'>
				<div className='carrierIcon'></div>
			</div>

			<div id='4' className='ship battleship'>
				<div className='battleshipIcon'></div>
			</div>

			<div id='3' className='ship cruiser'>
				<div className='cruiserIcon'></div>
			</div>

			<div id='3' className='ship submarine'>
				<div className='submarineIcon'></div>
			</div>

			<div id='2' className='ship destroyer'>
				<div className='destroyerIcon'></div>
			</div>
		</>
	)
}

export default Ships
