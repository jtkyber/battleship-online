import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import Board from './Board';
import { Howl, Howler } from 'howler';
import hitSound from './audioclips/hit-sound.mp3';
import missSound from './audioclips/miss-sound.mp3';
import './board.css';

const OpponentBoard = ({ socket }) => {

    const audioClips = [
        {sound: hitSound, label: 'hit'},
        {sound: missSound, label: 'miss'}
    ]

    const soundPlay = (src) => {
        const sound = new Howl({
            src,
            volume: 0.5
        })
        sound.play();
    }

    const { gameRoute, friendSocket, route, yourTurn } = useStoreState(state => ({
        gameRoute: state.gameRoute,
        friendSocket: state.friendSocket,
        route: state.route,
        yourTurn: state.yourTurn
    }));

    const { setYourTurn } = useStoreActions(actions => ({
        setYourTurn: actions.setYourTurn
        
    }));

    // useEffect(() => {
    //     console.log(shotSoundEffect);
    //     audioClips.forEach(clip => {
    //         if (clip.label === shotSoundEffect) {
    //             soundPlay(clip.sound);
    //         }
    //     })
    // }, [yourTurn])

    const playShotSound = (soundEffect) => {
        audioClips.forEach(clip => {
            if (clip.label === soundEffect ) {
                soundPlay(clip.sound);
            }
        })
    }
    
    const hitSquares = [];
    const countHitsOnShip = (ship) => {
        let count = 0;
        for (let hit of hitSquares) {
            if (hit === ship) {
                count += 1;
            }
        }
        return count;
    }

    useEffect(() => {
        socket.on('show result on opponent board', data => {
            const clickedSquare = document.querySelector(`.opponentBoard [id='${data.shotSquare}']`);
            if (data.result === 'hit' && clickedSquare.classList !== undefined) {
                clickedSquare.classList.add('hit');
                playShotSound('hit');
                hitSquares.push(data.shipHit);
                clickedSquare.classList.add(`_${data.shipHit}`)
                if (countHitsOnShip(data.shipHit) === parseInt(document.querySelector(`.${data.shipHit}`).id)) {
                    const squares = document.querySelectorAll('.singleSquare');
                    for (let square of squares) {
                        if (square.classList.contains(`_${data.shipHit}`)) {
                            square.classList.add('shipSunk');
                        }
                    }
                }
            } else if (data.result === 'miss' && clickedSquare.classList !== undefined) {
                clickedSquare.classList.add('miss');
                playShotSound('miss');
            }
        })

        return () => {
            socket.off('show result on opponent board');
        }
    },[])

    const onSquareClicked = (e) => {
        if (yourTurn && !e.target.classList.contains('hit') && !e.target.classList.contains('miss')) {
            // setSquareClicked(e.target);
            socket.emit('send shot to opponent', {target: e.target.id, socketid: friendSocket});
            setYourTurn(false);
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

export default OpponentBoard;

