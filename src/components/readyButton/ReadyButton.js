import React from 'react';

const ReadyButton = ({handleReadyButton}) => {
    return (
        <div className='readyBtn'>
            <button onClick={handleReadyButton} className='btn'><h3>Ready!</h3></button>
        </div>
    )
}

export default ReadyButton;
