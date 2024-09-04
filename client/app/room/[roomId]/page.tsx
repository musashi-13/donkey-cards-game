"use client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faCopy } from "@fortawesome/free-regular-svg-icons";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import socket from "@/app/socket";
import { CSSProperties } from "react";
import tempCards from "@/app/_components/tempcards";
import OtherPlayerList from "@/app/_components/otherPlayerList";

interface Players {
    id: string;
    userName: string;
    totalCards: number;
}

interface Cards {
    code: string,
    image: string,
    images: {
        svg: string,
        png: string
    },
    suit: string,
    value: string,
}

interface CustomCSSProperties extends CSSProperties {
    '--index'?: number;
    '--totalCards'?: number;
}

const getCardValue = (value: string): number => {
    const faceCardValues: { [key: string]: number } = {
        "ACE": 1,
        "KING": 13,
        "QUEEN": 12,
        "JACK": 11
    };
    return faceCardValues[value] || parseInt(value);
};

const getSuitOrder = (suit: string): number => {
    const suitOrder: { [key: string]: number } = {
        "SPADES": 1,
        "CLUBS": 2,
        "HEARTS": 3,
        "DIAMONDS": 4
    };
    return suitOrder[suit];
};

const sortCards = (cards: { code: string, image: string, images: { svg: string, png: string }, value: string, suit: string }[]): { code: string, image: string, images: { svg: string, png: string }, value: string, suit: string }[] => {
    return cards.sort((a, b) => {
        const suitOrderA = getSuitOrder(a.suit);
        const suitOrderB = getSuitOrder(b.suit);
        if (suitOrderA === suitOrderB) {
            const valueA = getCardValue(a.value);
            const valueB = getCardValue(b.value);
            return valueA - valueB;
        }
        return suitOrderA - suitOrderB;
    });
};


export default function RoomPage() {
    const [userName, setUserName] = useState<string>('');
    const [errMsg, setErrMsg] = useState<string>('');
    const [gameStarted, setGameStarted] = useState<Boolean>(false);
    const [isOpen, setIsOpen] = useState<Boolean>(true);
    const [isCopied, setIsCopied] = useState<Boolean>(false);
    const [players, setPlayers] = useState<Players[]>([]);
    const [cards, setCards] = useState<Cards[]>([]);


    useEffect(() => {
        setCards(sortCards(tempCards));
      }, [tempCards]);

    const [selectedCards, setSelectedCards] = useState<Cards[]>([]);
    const [roundCards, setRoundCards] = useState<Cards[]>([]);

    const handleAddBack = () => {
        if(selectedCards.length == 0) {
            return;
        }
        const removedSelectedCard = selectedCards.splice(0, 1)[0];
        const updatedCards = [...cards];
        updatedCards.push(removedSelectedCard);
        setCards(sortCards(updatedCards));
    }
    
    const handleCardClick = (card: Cards, index: number) => {
        if(selectedCards.length == 0) {
            const updatedCards = [...cards];
            const removedCard = updatedCards.splice(index, 1)[0]; // Capture the removed card
            setCards(updatedCards);
            setSelectedCards((prevSelectedCards) => [...prevSelectedCards, removedCard]); // Append the removed card to selectedCards
        } else {
            const removedSelectedCard = selectedCards.splice(0, 1)[0];
            const updatedCards = [...cards];
            const removedCard = updatedCards.splice(index, 1)[0];
            updatedCards.splice(index, 0, removedSelectedCard);
            setSelectedCards((prevSelectedCards) => [...prevSelectedCards, removedCard]);
            setCards(sortCards(updatedCards));
        }
    }

    const handleAddToRound = () => {
        if(selectedCards.length == 0) {
            return;
        }
        const updatedRoundCards = [...roundCards];
        const updatedSelectedCards = [...selectedCards];
        updatedRoundCards.push(updatedSelectedCards[0]);
        setSelectedCards([]);
        setRoundCards(updatedRoundCards);
    }

    const params = useParams();
    const roomId = params.roomId.toString();

    useEffect(() => {
        const handleLoad = () => {
            socket.on('connect', () => {
                console.log(`Connected to the server with ID: ${socket.id}`);
            });

            socket.on('connect_error', (err) => {
                console.error('Connection error:', err);
            });
        };
        window.addEventListener('load', handleLoad);
        return () => {
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    const handlePlay = () => {
        if (userName.trim() === '') {
            setErrMsg('Enter a username');
            console.error('No username provided');
            return;
        }
        setIsOpen(false);
        console.log(`Attempting to join room ${roomId} as ${userName.trim()}`);
        socket.emit('joinRoom', roomId, userName.trim());
    };

    useEffect(() => {
        socket.on('updatePlayers', (updatedPlayers: Players[]) => {
            console.log('Player list updated:', updatedPlayers);
            setPlayers(updatedPlayers);
            console.log('Players:', updatedPlayers);
        });

        return () => {
            console.log('Cleaning up updatePlayers listener');
            socket.off('updatePlayers');
        };
    }, []);

    useEffect(() => {
        const handleDealCards = (cards: any) => {
            console.log('Received cards:', cards);
            setCards(cards);
        };

        console.log('Setting up dealCards listener');
        socket.on('dealCards', handleDealCards);

        return () => {
            console.log('Cleaning up dealCards listener');
            socket.off('dealCards', handleDealCards);
        };
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            console.log(`Ending game for room ${roomId}`);
            socket.emit('endGame', roomId);
        };

        console.log('Setting up beforeunload listener');
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            console.log('Cleaning up beforeunload listener');
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [roomId]);

    const getCopyLink = () => {
        if (roomId) {
            navigator.clipboard.writeText(`http://localhost:3000/room/${roomId}`)
            .then(() => {
                console.log('Room ID copied to clipboard');
                setIsCopied(true);
            })
            .catch(err => {
                console.error('Failed to copy room ID:', err);
            });
        }
    };

    const handleStartGame = () => {
        console.log(`Starting game in room ${roomId}`);
        socket.emit("startGame", roomId);
        setGameStarted(true);
    };

    useEffect(() => {
        console.log(`Current socket ID: ${socket.id}`);
        console.log(`Players in room: ${players.join(', ')}`);
    }, [players]);

    return (
        <div className="font-handwriting relative w-full font-bold h-screen flex flex-col">
            {isOpen &&
                <form onSubmit={handlePlay} className="absolute z-50 top-0 left-0 bg-zinc-900/20 backdrop-blur-sm w-screen h-screen flex items-center justify-center">
                    <div className="flex flex-col gap-6 bg-yellow-50 rounded-lg border-4 p-4 items-center border-black ring-4 ring-white">
                        <h1 className="text-3xl ">Enter Username</h1>
                        <input value={userName} onChange={(e) => setUserName(e.target.value)} className="h-6 px-1 w-40 text-xl tracking-wider outline-none border-b-2 bg-yellow-50 border-black"/>
                        <button type="submit" className="border-2 text-lg tracking-wider bg-white border-black w-28 pt-1.5 pb-1 rounded-lg">Play!</button>
                    </div>
                </form>
            }
            <div className="relative h-1/2 flex m-4 font-bold">
                <div className="flex flex-col gap-2 w-64 h-full bg-yellow-50 rounded-lg border-4 p-2 items-center border-black ring-4 ring-white">
                    <h1 className="text-2xl">Your Room</h1>
                    <p className="text-3xl tracking-widest">{roomId}</p>
                    <button className="text-md" onClick={getCopyLink}><u>Share the link</u> {!isCopied ? <FontAwesomeIcon icon={faCopy} size="sm"/> : <FontAwesomeIcon icon={faClipboard} size="sm"/>}</button>
                    <button onClick={handleStartGame} type="submit" className="border active:scale-90 duration-150 bg-white border-black w-28 pt-1.5 pb-1 rounded-lg">
                        Start Game
                    </button>
                    <p className="mt-4 text-lg font-bold mb-2 ">Players: {players.length}</p>
                    <ul className="text-center h-80 w-full overflow-scroll">
                        {players.map((player, index) => (
                            <li key={index}>{player.userName}</li>
                        ))}
                    </ul>
                </div>
                <div className="relative flex flex-grow">
                    <div className="relative w-72 flex flex-col items-end justify-center">
                        <div className="relative w-48 h-64 bg-blue-950/30 border-2 border-dashed border-yellow-100">
                            <p className="text-yellow-100 text-lg absolute w-2/3 text-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            The card you want to play:</p>
                            {selectedCards.map((card, index) => (
                                <img
                                    className={`w-36 absolute pop-in top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:scale-110 duration-200 shadow-xl shadow-gray-800/50`}
                                    key={index}
                                    src={card.images.png}
                                    alt={card.code}
                                />
                            ))}
                        </div>
                        <div className="relative top-2 flex justify-around w-48 font-bold">
                            <button onClick={handleAddToRound} className="relative active:scale-90 duration-150 border-2 bg-white border-black w-28 pt-1.5 pb-1 rounded-lg">Play Card</button>
                            <button onClick={handleAddBack} className="relative active:scale-90 duration-150 border-2 bg-white border-black w-12 pt-1.5 pb-1 rounded-lg">X</button>
                        </div>                 
                    </div>
                    <div className="relative flex-grow -rotate-12">
                        {cards.map((card, index) => (
                            <img
                                id={`card-${index}`}
                                className={`w-36 absolute slide-in top-20 left-1/2 -translate-y-8 hover:scale-110 duration-200 custom-cards shadow-xl shadow-gray-800/50`}
                                style={{
                                    '--index': index,   
                                    '--totalCards': cards.length,
                                } as CustomCSSProperties}
                                key={index}
                                src={card.images.png}
                                alt={card.code}
                                onClick={() => handleCardClick(card, index)}
                            />
                        ))}
                    </div>
                </div>
                
            </div>
            <div className="flex items-center justify-around">
            {gameStarted && <OtherPlayerList players={players} filterEven={true}/>}
                <div className="relative w-[480px] h-72 bg-green-700 shadow-inner shadow-black/50 border-8 border-yellow-100 rounded-full">
                    <p className="text-yellow-100 text-lg absolute w-2/3 text-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    Start the round!</p>
                    {roundCards.map((card, index) => (
                        <img
                            className={`w-36 absolute round-cards top-1/2 left-1/2 shadow-lg shadow-gray-800/50`}
                            style={{
                                '--index': index,   
                                '--totalCards': 18,
                            } as CustomCSSProperties}
                            key={index}
                            src={card.images.png}
                            alt={card.code}
                        />
                    ))}
                </div>
                {gameStarted && <OtherPlayerList players={players} filterEven={false}/>}
            </div>
        </div>
    )
}
