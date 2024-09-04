'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import socket from '../socket';

const generateRoomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

const isValidRoomId = (roomId: string) => {
    const regex = /^[A-Z0-9]{4}$/;
    return regex.test(roomId);
}

export default function Lobby() {
    const [roomId, setRoomId] = useState<string>('');
    const [errMsg, setErrMsg] = useState<string>('');
    const router = useRouter();

    const handleCreateRoom = () => {
        const newRoomId = generateRoomId();
        setRoomId(newRoomId);
        socket.emit('joinRoom', roomId);
        router.push(`/room/${newRoomId}`);
    }

    const handleJoinRoom = () => {
         if(roomId==='') {
            setErrMsg('Enter Room ID')
        } else if (!isValidRoomId(roomId)){
            setErrMsg('Invalid Room ID')
        } else {
            router.push(`/room/${roomId}`);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
    }
    return (
        <div className='flex flex-col justify-center'>
            <Image src='/logo.png' alt='donkey' height={360} width={360}/>
            <form onSubmit={handleSubmit} className='flex font-handwriting font-bold flex-col gap-2 ring-4 ring-white bg-yellow-50 w-96 h-64 p-4 items-center rounded-lg border-4 border-black'>
                <div>
                    <h1 className='text-3xl m-1'>Play Donkey Cards</h1>
                    <p className='h-5 text-center text-red-700'>{errMsg}</p>
                </div>
                <div className='mt-2 text-xl flex gap-4'>
                    <label className='w-20 h-6'>Room ID:</label>
                    <input value={roomId} onChange={(e) => setRoomId(e.target.value)} className='h-6 px-1 w-40 tracking-widest outline-none border-b-2 bg-yellow-50 border-black'/>
                </div>
                <div className='w-full px-8 mt-6 flex justify-around'>
                    <button onClick={handleJoinRoom} type='submit' className='border-2 bg-white border-black w-28 pt-1.5 pb-1 rounded-lg'>
                        Join Room
                    </button>
                    <button onClick={handleCreateRoom} type='button' className='border-2 text-center bg-white border-black w-28 pt-1.5 pb-1 rounded-lg'>
                        Create Room
                    </button>
                </div>
            </form>
        </div>
    )
}