const cardOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function getCardValue(card) {
    return cardOrder.indexOf(card.value);
}

function getHighestCard(cards) {
    return cards.reduce((highest, card) => {
        if (!highest || getCardValue(card) > getCardValue(highest)) {
            return card;
        }
        return highest;
    }, null);
}

function determineStartingPlayer(players, hands) {
    // Find the player with the Ace of Spades
    for (let player of players) {
        if (hands[player].some(card => card.value === 'ACE' && card.suit === 'SPADES')) {
            return player;
        }
    }
    return null;
}

function playRound(room, roundInfo) {
    let highestCard = null;
    let highestPlayer = null;
    let startingSuit = roundInfo[0].card.suit;
    let punishmentPlayer = null;
    let previousSuit = startingSuit;
    let allRoundCards = []; // Store all cards played in the round
    let punishmentCards = []; // Store cards played before the punishment

    for (let i = 0; i < roundInfo.length; i++) {
        const { player, card } = roundInfo[i];
        const hand = room.hands[player];
        hand.splice(hand.indexOf(card), 1); // Remove the card from the player's hand

        // Add card to the round cards list
        allRoundCards.push(card);

        // Check for punishment
        if (card.suit !== previousSuit && !punishmentPlayer) {
            punishmentPlayer = player;
        }

        // Store cards played before the punishment
        if (!punishmentPlayer) {
            punishmentCards.push(card);
        }

        // Determine the highest card
        if (!highestCard || getCardValue(card) > getCardValue(highestCard)) {
            highestCard = card;
            highestPlayer = player;
        }

        previousSuit = card.suit; // Update the suit for the next card in the round
    }

    // Distribute the cards based on whether there was punishment or not
    if (punishmentPlayer) {
        room.hands[highestPlayer].push(...allRoundCards); // Add all round cards to the highest player's hand
        return punishmentPlayer;
    } else {
        // Discard all round cards if no punishment
        // Here we assume that discarding means not needing to do anything further with `allRoundCards`
        return highestPlayer;
    }
}

function checkEndCondition(room) {
    const playersWithCards = Object.keys(room.hands).filter(player => room.hands[player].length > 0);
    if (playersWithCards.length === 1) {
        return playersWithCards[0]; // Return the loser
    }
    return null; // Game continues
}

module.exports = { determineStartingPlayer, playRound, checkEndCondition };
