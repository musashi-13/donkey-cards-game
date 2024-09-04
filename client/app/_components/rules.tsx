// pages/rules.tsx

import Head from 'next/head';
import { FC } from 'react';

const Rules: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center py-10">
      <Head>
        <title>Donkey Cards - Rules and How to Play</title>
      </Head>

      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8">
          <h1 className="text-4xl font-extrabold text-center text-white">Donkey Cards</h1>
        </div>

        <div className="p-8 space-y-6">
          <section className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Donkey Cards is a strategic card game played with a standard deck of 52 cards. The game is best played with 2 to 8 players. The objective is to strategically play your cards to avoid being the last player holding any cards.
            </p>
          </section>

          <section className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Setup</h2>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>A standard 52-card deck is used.</li>
              <li>The game can be played with 2 to 8 players.</li>
              <li>
                The rank of cards of any suit in <span className="font-bold">ascending order</span> is <span className="font-bold">[2,3,4,5,6,7,8,9,10,J,Q,K,A]</span>.
              </li>
            </ul>
          </section>

          <section className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Gameplay</h2>
            <ol className="list-decimal list-inside text-gray-700 leading-relaxed space-y-2">
              <li>
                The player with the <span className="font-bold">Ace of Spades</span> starts the first round.
              </li>
              <li>
                Each player <span className="font-bold">must</span> play a card of the <span className="font-bold">same suit</span> as the card that started the round. If a player does not have a card of that suit, they must <span className="font-bold">punish</span> by playing any card of their choice.
              </li>
              <li>
                If a punishment occurs, all cards in that round are collected by the player who played the <span className="font-bold">highest-ranking card</span> of the starting suit, and the round ends there.
              </li>
              <li>
                If there is no punishment, all cards in that round are discarded.
              </li>
              <li>
                The <span className="font-bold">player</span> who played the <span className="font-bold">Highest ranking card</span> of the starting suit <span className="font-bold">starts the next round</span> considering there was no punishment, if there was punishment then the <span className="font-bold">person who punished</span> starts the next round.
              </li>
            </ol>
          </section>

          <section className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Winning and Losing</h2>
            <p className="text-gray-700 leading-relaxed">
              The game continues until only one player has cards left in their hand. This player is the <span className="font-bold">loser</span> of the game.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Rules;
