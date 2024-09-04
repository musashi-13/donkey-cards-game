import React from 'react';

interface Player {
    id: string;
    userName: string;
    totalCards: number;
}

interface PlayerListProps {
    players: Player[];
    filterEven: boolean;
}

const OtherPlayerList: React.FC<PlayerListProps> = ({ players, filterEven }) => {
    return (
        <div className="relative">
            {players
                .filter((_, index) => (filterEven ? index % 2 === 0 : index % 2 !== 0))
                .map((player, index) => (
                    <div key={index} className="relative flex flex-col items-center">
                        <div className="relative h-16 w-16">
                            {Array.from({ length: player.totalCards }).map((_, cardIndex) => (
                                <div
                                    key={cardIndex}
                                    className="absolute left-1/4 top-3 translate-y-1 hand-cards card-bg w-10 h-16 border-4 
                                    rounded-sm border-white ring-2 ring-zinc-600"
                                    style={{
                                        '--index': cardIndex,
                                        '--totalCards': player.totalCards,
                                    } as React.CSSProperties}
                                >
                                </div>
                            ))}
                        </div>
                        <div className="relative flex items-center gap-2 text-xl">
                            {index === 0 && <p>👑</p>}
                            <p>{player.userName}</p>
                            <p>({player.totalCards})</p>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default OtherPlayerList;