"use client"
import ky from "ky";
import Image from "next/image";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Lobby from "./_components/lobby";

interface Deck {
  success: boolean,
  deck_id: string,
  remaining: number,
  shuffled: boolean,
}

interface Card {
  code: string;
  image: string;
  images: {
    svg: string;
    png: string;
  };
  value: string;
  suit: string;
}

interface PlayerHand {
  success: boolean;
  deck_id: string;
  cards: Card[];
  remaining: number;
}
// async function GetSessionDeck() {
//     try {
//     const res = await ky.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1").json<Deck>();
//     console.log(res)
//     setDeckId(res.deck_id);
//     console.log(deckId)
//     const deckOfPlayers: Card[][] = Array.from({ length: playerCount }, () => []);
//     console.log(deckOfPlayers)
//     const totalCards = 52;
//     const cardsPerPlayer = Math.floor(totalCards / playerCount);
//     const extraCards = totalCards % playerCount;
    
//     for (let i = 0; i < playerCount; i++) {
//         const numCards = cardsPerPlayer + (i < extraCards ? 1 : 0);
//         console.log(numCards)
//         const res = await ky.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${numCards}`).json<PlayerHand>();
//         console.log(res);
//         deckOfPlayers[i] = res.cards;
//     }
    
//     console.log(deckOfPlayers);
//     } catch (error) {
//     console.error(error);
//     }
// }
export default function Home() {
    const [deckId, setDeckId] = useState<string>('');
    const [playerCount, setPlayerCount] = useState<number>(4);
    const [socket , setSocket] = useState<any>(null);
    const [userName, setUserName] = useState<string>('');
    const [roomName, setRoomName] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    // useEffect(() => {
    //     const socket = io("http://localhost:3000");
        
    //     socket.on("connect", () => {
    //         console.log("Connected to the server");
    //     });
    //     setSocket(socket);
        
    //     socket.on("message", (msg: string) => {
    //         setMessage(msg);
    //     });

    // }, []);

    
    return (
        <main className="flex justify-center">
            <Lobby/>
        </main>
    );
}
