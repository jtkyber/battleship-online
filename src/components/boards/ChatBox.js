import React, { useEffect, useState } from 'react';

const ChatBox = ({ opponentName, friendSocket, socket }) => {
    const [chatText, setChatText] = useState('');

    const chatBox = document.querySelector('.chatBox');

    useEffect(() => {
        document.addEventListener('keyup', handleEnterBtn);

        socket.on('receive msg', message => {
            handleReceivedMessage(message);
        })

        return () => {
            socket.off('receive msg');
            document.removeEventListener('keyup', handleEnterBtn);
        }
    },[chatText])

    const handleReceivedMessage = (message) => {
        const chatBox = document.querySelector('.chatBox');
        if (chatBox !== null) {
            const msgNode = document.createElement("DIV");
            msgNode.classList.add('message');
            const textNode = document.createElement("H4");
            textNode.classList.add('opponentText');
            const nameNode = document.createElement("H5");
            nameNode.classList.add('oppName');
            const text = document.createTextNode(message);
            const name = document.createTextNode(opponentName);
            nameNode.appendChild(name);
            textNode.appendChild(text);
            msgNode.appendChild(nameNode);
            msgNode.appendChild(textNode);
            chatBox.appendChild(msgNode);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    const handleEnterBtn = (e) => {
            if (e.keyCode === 13 && chatBox !== null && chatText !== '') {
                e.preventDefault();
                const msgNode = document.createElement("DIV");
                msgNode.classList.add('message');
                const textNode = document.createElement("H4");
                textNode.classList.add('userText');
                const nameNode = document.createElement("H5");
                nameNode.classList.add('userName');
                const text = document.createTextNode(chatText);
                const name = document.createTextNode("You");
                nameNode.appendChild(name);
                textNode.appendChild(text);
                msgNode.appendChild(nameNode);
                msgNode.appendChild(textNode);
                chatBox.appendChild(msgNode);
                setChatText('');
                socket.emit('send msg', {socketid: friendSocket, message: chatText});
                document.querySelector('.chatInput').value = '';
                chatBox.scrollTop = chatBox.scrollHeight;
            }
    }

    return (
        <div className='chatContainer'>
            <div className='chatBox'></div>
            <input onChange={(e) => setChatText(e.target.value)} type='text' className='chatInput' placeholder='Type Here...' />
        </div>
    )
}

export default ChatBox;
