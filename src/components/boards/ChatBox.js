import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { audio } from '../../audio';

const ChatBox = () => {
    const { opponentName, chatText, showChatMobile, isMobile, playingWithAI, channel } = useStoreState(state => ({
        opponentName: state.opponentName,
        chatText: state.chatText,
        showChatMobile: state.showChatMobile,
        isMobile: state.stored.isMobile,
        playingWithAI: state.playingWithAI,
        channel: state.channel
    }));

    const { setChatText } = useStoreActions(actions => ({
        setChatText: actions.setChatText
    }));

    const chatBox = document.querySelector('.chatBox');
    const root = document.querySelector(':root');

    useEffect(() => {
        if (playingWithAI && !isMobile) document.querySelector('.chatContainer').style.display = 'none';
    }, [])

    useEffect(() => {
        if (!chatBox || !channel) return
        channel.bind('receive-msg', data => {
            handleReceivedMessage(data.message);
            return data
        })

        return () => {
            if (channel) channel.unbind('receive-msg')
        }
    }, [chatBox, channel])

    useEffect(() => {
        if (showChatMobile) root.style.setProperty("--chatNotificationDisplay", 'none')

        document.addEventListener('keyup', handleEnterBtn);

        return () => {
            document.removeEventListener('keyup', handleEnterBtn);
        }
    },[chatBox, showChatMobile, chatText])

    const handleReceivedMessage = (message) => {
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

        if (!showChatMobile) {
            root.style.setProperty("--chatNotificationDisplay", 'block');
            audio.notificationSound.play();
        }
    }

    const handleEnterBtn = async (e) => {
            if (e.key === 'Enter' && chatText !== '') {
                e.preventDefault();
                audio.buttonClick.play();
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
                await fetch(`${process.env.REACT_APP_PUSHER_URL}/sendMessage?channelName=${opponentName}&message=${chatText}`)
                document.querySelector('.chatInput').value = '';
                chatBox.scrollTop = chatBox.scrollHeight;
            }
    }

    return (
        <div className={`${!showChatMobile && isMobile ? 'hide' : null} ${isMobile ? 'chatContainerMobile' : 'chatContainer'}`}>
            <div className='chatBox'></div>
            <input onChange={(e) => setChatText(e.target.value)} type='text' className='chatInput' placeholder='Type Here...' />
        </div>
    )
}

export default ChatBox;
