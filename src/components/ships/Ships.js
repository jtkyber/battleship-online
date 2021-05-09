// import react from 'react';
import $ from 'jquery';
import './ships.css';
import '../boards/board.css';

const Ships = ({gameRoute, route}) => {
    let rotating = false;
    let orientation = 'hor';
    let selectedShip = '';
    let selectedShipName = '';
    let shipIsSelected = false;
    let setManualGridLocation = false;

    // Decide what happens when a ship is selected to move

    const onShipSelect = (e) => {
        if (!shipIsSelected && gameRoute === 'placeShips') {
            const userBoard = document.querySelector('.userBoard');
            shipIsSelected = true;
            selectedShip = e.target.parentElement;
            userBoard.style.cursor = 'pointer';
            selectedShip.style.zIndex = '-2';
            // selectedShip.style.backgroundColor = 'rgba(0,0,0,0.2)';
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

        const colliding = !(d1Top <= d2Offset.top || d1Offset.top >= d2Top || d1Left <= d2Offset.left || d1Offset.left >= d2Left);

        return colliding;
    }

    // Place a ship down that is currently selected

    document.addEventListener('click', e => {
        if (shipIsSelected && e.target.classList.contains('singleSquare') && rotating === false && areaIsClear()) {
            selectedShip.style.zIndex = '3';
            document.querySelector('.userBoard').style.cursor = 'default';
            // selectedShip.style.backgroundColor = null;
            selectedShip.style.border = null;
            shipIsSelected = false;
        }
    })

    // Locate opponents shot on user board

    // const matchOppShotToBoard = () => {
    //     if
    // }

    // Check to see if player is placing the ship in an open space

    const areaIsClear = () => {
        const ships = document.querySelectorAll('.ship');
         for (let ship of ships) {
            if (!ship.classList.contains(selectedShipName) && collisionDetection(selectedShip, ship)) {
                console.log(ship.className);
                return false;
            }
        }
        return true;
    }

    // Rotate the selected ship by right-clicking

    window.oncontextmenu = (e) => {
         if (shipIsSelected) {
            if (orientation === 'hor') {
                selectedShip.style.transform = 'rotate(-90deg)';
                orientation = 'vert';
            } else if (orientation === 'vert') {
                selectedShip.style.transform = 'rotate(0deg)';
                orientation = 'hor';
            }
            setManualGridLocation = true;
            rotating = true;
        }
        return false;
    }

    // Decide what happens on various key-press events

    document.addEventListener('keydown', (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
        // Rotate the selected ship by pressing the 'space' key

        if (e.keyCode === 32 && selectedShip.style !== undefined && shipIsSelected) {
            if (orientation === 'hor') {
                selectedShip.style.transform = 'rotate(-90deg)';
                orientation = 'vert';
            } else if (orientation === 'vert') {
                selectedShip.style.transform = 'rotate(0deg)';
                orientation = 'hor';
            }
            setManualGridLocation = true;
            rotating = true;
        }
    })

    // Change the grid-row and grid-column of the selected ship mouse is over the user's board

    window.onmouseover = (e) => {
        if (shipIsSelected) {
            rotating = false;
            selectedShip.style.transform = null;
            const userGrid = document.querySelector('.userBoard');
            const childShip = document.querySelector(`.${selectedShipName}Icon`);
            const targetId = e.target.id;
            const colStart = targetId.substring(0, targetId.indexOf('-'));
            const rowStart = targetId.substring((targetId.indexOf('-') + 1), targetId.length);

            if (userGrid.contains(e.target)
            && (e.target.classList.contains('singleSquare') || e.target.classList.contains('singleSquare'))
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
    };

    return (
        <>
            <div id='5' className='ship carrier'><div onClick={onShipSelect} className='carrierIcon'></div></div>

            <div id='4' className='ship battleship'><div onClick={onShipSelect} className='battleshipIcon'></div></div>

            <div id='3' className='ship cruiser'><div onClick={onShipSelect} className='cruiserIcon'></div></div>

            <div id='3' className='ship submarine'><div onClick={onShipSelect} className='submarineIcon'></div></div>

            <div id='2' className='ship destroyer'><div onClick={onShipSelect} className='destroyerIcon'></div></div>
        </>
    )
}

export default Ships;
