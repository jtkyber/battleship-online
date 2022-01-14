import { useStoreState } from 'easy-peasy';
import { audio } from '../../audio';
import $ from 'jquery';
import './ships.css';
import '../boards/board.css';

const Ships = () => {

    const { gameRoute, isMobile, showGameInstructions } = useStoreState(state => ({
        gameRoute: state.gameRoute,
        isMobile: state.stored.isMobile,
        showGameInstructions: state.showGameInstructions
    }));

    let moving = false;
    let rotating = false;
    let orientation = 'hor';
    let selectedShip = '';
    let selectedShipName = '';
    let shipIsSelected = false;
    let setManualGridLocation = false;

    // Decide what happens when a ship is selected to move

    const onShipSelect = (e) => {
        if (!shipIsSelected && (gameRoute === 'placeShips')) {
            audio.buttonClick.play();
            const userBoard = document.querySelector('.userBoard');
            shipIsSelected = true;
            selectedShip = e.target.parentElement;
            userBoard.style.cursor = 'pointer';
            selectedShip.style.zIndex = '-2';
            selectedShip.style.border = '2px solid rgba(0, 250, 0, 0.5)';

            if (parseInt(e.target.parentElement.offsetWidth) > parseInt(e.target.parentElement.offsetHeight)) {
                orientation = 'hor';
            } else if (parseInt(e.target.parentElement.offsetHeight) > parseInt(e.target.parentElement.offsetWidth)) {
                orientation = 'vert';
            }

            if (selectedShip.classList.contains('carrier')) {
                selectedShipName = 'carrier';
            } else if (selectedShip.classList.contains('battleship')) {
                selectedShipName = 'battleship';
            } else if (selectedShip.classList.contains('cruiser')) {
                selectedShipName = 'cruiser';
            } else if (selectedShip.classList.contains('submarine')) {
                selectedShipName = 'submarine';
            } else if (selectedShip.classList.contains('destroyer')) {
                selectedShipName = 'destroyer';
            }
        }
    }

    // collision detection

    const collisionDetection = (item1, item2) => {
        let d1Offset = $(item1).offset();
        let d1Height = $(item1).outerHeight(true);
        let d1Width = $(item1).outerWidth(true);
        let d1Top = d1Offset.top + d1Height;
        let d1Left = d1Offset.left + d1Width;
        let d2Offset = $(item2).offset();
        let d2Height = $(item2).outerHeight(true);
        let d2Width = $(item2).outerWidth(true);
        let d2Top = d2Offset.top + d2Height;
        let d2Left = d2Offset.left + d2Width;

        const colliding = !(d1Top <= d2Offset.top + 2 || d1Offset.top >= d2Top - 2 || d1Left <= d2Offset.left + 2 || d1Offset.left >= d2Left - 2);
        
        return colliding;
    }

    // Place a ship down that is currently selected

    window.onclick = (e) => {
        if (!shipIsSelected && !isMobile && e.target.parentElement.classList.contains('ship')) {
            onShipSelect(e);
        } else if (!isMobile && shipIsSelected && e.target.classList.contains('singleSquare') && rotating === false && areaIsClear()) {
            audio.buttonClick.play();
            selectedShip.style.zIndex = '3';
            document.querySelector('.userBoard').style.cursor = 'default';
            selectedShip.style.border = null;
            shipIsSelected = false;
        }
    }

    window.ontouchend = (e) => {
        if (shipIsSelected && !moving && !showGameInstructions) {
            if (orientation === 'hor') {
                // selectedShip.style.transform = 'rotate(-90deg)';
                orientation = 'vert';
                positionShipOnGrid(e);
            } else if (orientation === 'vert') {
                // selectedShip.style.transform = 'rotate(0deg)';
                orientation = 'hor';
                positionShipOnGrid(e);
            }
            setManualGridLocation = true;
            rotating = true;
        } else if (shipIsSelected && moving) {
            if (isMobile && shipIsSelected && rotating === false && areaIsClear()) {
                audio.buttonClick.play();
                selectedShip.style.zIndex = '3';
                document.querySelector('.userBoard').style.cursor = 'default';
                selectedShip.style.border = null;
                shipIsSelected = false;
            }
        } else if (!shipIsSelected && e.target.parentElement.classList.contains('ship')) {
            onShipSelect(e);
        }
        moving = false;
    }
    
    // Check to see if player is placing the ship in an open space

    const areaIsClear = () => {
        const ships = document.querySelectorAll('.ship');
         for (let ship of ships) {
            if (!ship.classList.contains(selectedShipName) && collisionDetection(selectedShip, ship)) {
                return false;
            }
        }
        return true;
    }

    // Rotate the selected ship by right-clicking

    window.oncontextmenu = (e) => {
         if (!isMobile && shipIsSelected) {
            audio.hoverSound.play();
            if (orientation === 'hor') {
                // selectedShip.style.transform = 'rotate(-90deg)';
                orientation = 'vert';
                positionShipOnGrid(e);
            } else if (orientation === 'vert') {
                // selectedShip.style.transform = 'rotate(0deg)';
                orientation = 'hor';
                positionShipOnGrid(e);
            }
            setManualGridLocation = true;
            rotating = true;
        }
        return false;
    }

    // Decide what happens on various key-press events

    window.onkeydown = (e) => {
        if (e.code === 'Enter') {
            e.preventDefault();
        }
        // Rotate the selected ship by pressing the 'space' key

        if (e.code === 'Space' && selectedShip.style !== undefined && shipIsSelected) {
            audio.hoverSound.play();
            if (orientation === 'hor') {
                // selectedShip.style.transform = 'rotate(-90deg)';
                orientation = 'vert';
                positionShipOnGrid(e);
            } else if (orientation === 'vert') {
                // selectedShip.style.transform = 'rotate(0deg)';
                orientation = 'hor';
                positionShipOnGrid(e);
            }
            setManualGridLocation = true;
            rotating = true;
        }
    }

    const matchTouchToSquares = (x, y) => {
        const squares = document.querySelectorAll('.userBoard .singleSquare');
        let selectedSquare = null;
        squares.forEach(square => {
            const squareLeft = square.getBoundingClientRect().left;
            const squareRight = square.getBoundingClientRect().right;
            const squareTop = square.getBoundingClientRect().top;
            const squareBottom = square.getBoundingClientRect().bottom;

            if ((x > squareLeft) && (x < squareRight) && (y > squareTop) && (y < squareBottom)) {
                selectedSquare = square;
                return;
            }
        })
        return selectedSquare;
    }

    const positionShipOnGrid = (e) => {
        let square;
        if (e.type === 'touchmove') {
            square = matchTouchToSquares(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.type === 'touchend') {
            square = matchTouchToSquares(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        } else {
            square = e.target;
        }

        rotating = false;
        selectedShip.style.transform = null;
        const userGrid = document.querySelector('.userBoard');
        const childShip = document.querySelector(`.${selectedShipName}Icon`);
        const targetId = square?.id;
        const colStart = targetId?.substring(0, targetId.indexOf('-'));
        const rowStart = targetId?.substring((targetId.indexOf('-') + 1), targetId?.length);

        if (userGrid.contains(e.target)
        && (square?.classList?.contains('singleSquare'))
        && shipIsSelected === true) {
            if (orientation === 'hor') {
                childShip.classList.remove(`rotate-${selectedShipName}`);
                if (colStart < (11 - parseInt(selectedShip.id) + 1)) {
                    selectedShip.style.gridColumn = `${colStart} / ${parseInt(colStart) + parseInt(selectedShip.id)}`;
                } else if (colStart >= (11 - parseInt(selectedShip.id) + 1) && setManualGridLocation === true) {
                    selectedShip.style.gridColumn = `11 / ${11 - parseInt(selectedShip.id)}`;
                } else setManualGridLocation = false;
                selectedShip.style.gridRow = `${rowStart} / ${parseInt(rowStart) + 1}`;
            } else if (orientation === 'vert') {
                childShip.classList.add(`rotate-${selectedShipName}`);
                if (rowStart > (parseInt(selectedShip.id) - 1)) {
                    selectedShip.style.gridRow = `${parseInt(rowStart) + 1} / ${parseInt(rowStart) - parseInt(selectedShip.id) + 1}`;
                } else if (rowStart <= (parseInt(selectedShip.id) - 1) && setManualGridLocation === true) {
                    selectedShip.style.gridRow = `${parseInt(selectedShip.id) + 1} / 1`;
                } else setManualGridLocation = false;
                selectedShip.style.gridColumn = `${colStart} / ${parseInt(colStart) + 1}`;
            }
        }
    }

    // Change the grid-row and grid-column of the selected ship mouse is over the user's board

    window.onmouseover = (e) => {
        if (shipIsSelected && !isMobile) {
            positionShipOnGrid(e);
        }
    };

    window.ontouchmove = (e) => {
        moving = true;
        if (shipIsSelected && isMobile) {
            positionShipOnGrid(e);
        }
    };

    return (
        <>
            <div id='5' className='ship carrier'><div className='carrierIcon'></div></div>

            <div id='4' className='ship battleship'><div className='battleshipIcon'></div></div>

            <div id='3' className='ship cruiser'><div className='cruiserIcon'></div></div>

            <div id='3' className='ship submarine'><div className='submarineIcon'></div></div>

            <div id='2' className='ship destroyer'><div className='destroyerIcon'></div></div>
        </>
    )
}

export default Ships;
