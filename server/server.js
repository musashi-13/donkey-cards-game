const axios = require('axios');
const io = require('socket.io')(3000, {
    cors: {
        origin: 'http://localhost:3001',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const { determineStartingPlayer, playRound, checkEndCondition } = require('./gameLogic');
const rooms = {};

//Room related rules to add
//Admin can kick player
//Admin can start game
//Others have to give ready


io.on('connection', (socket) => {
    console.log('a user connected');
    //First, the user sends a request to create a room. The server will create a room with the given name and store it in the rooms object.
    //It sends the roomCreated event back to the client with the room name.
    //If room exists, it sends an errorRoomExists event back to the client.
    //Basically client connects to the server in the lobby itself. Then actually joins the room on loading /room/[roomName] page.
    socket.on('createRoom', (roomName) => {
        console.log('createRoom: ' + roomName);
        if (rooms[roomName]) {
            console.log(`Room ${roomName} already exists`);
            socket.emit('errorRoomExists');
            return;
        }
        socket.emit('roomCreated', roomName);
        rooms[roomName] = { players: [], admin: null, deckId: null, game: 1, currentSuit: null, roundCards: {}};
    }); 

    //After the room is created, the user enters the room and sends joinRoom request. Including the admin.
    //The lobby page will redirect to room/[roomName] and the room page will be displayed.
    //First player who joined will be admin. Since the user who creates room immediately starts room, he will be the admin.
    //JoinRoom only after user enters username.
    //If someone joins the room by copying link and enters username before the room creator, then that user would be admin with this logic. Flaw? Or room creator retarded?
    // ^ Kaushik
    socket.on('joinRoom', async (roomName, userName) => {
        //Making sure we first check if roomName exists
        if (!rooms[roomName]) {
            console.log(`Room ${roomName} does not exist`);
            socket.emit('errorRoomNotFound');
            return
        }

        console.log('joinRoom: ' + roomName + ' ' + userName);
        socket.username = userName;

        const room = rooms[roomName];

        //Check if the name already exists
        if (room.players.some(player => player.userName === userName)) {
            console.log(`${userName} tried joining ${roomName} but username is taken`);
            socket.emit('errorNameTaken');
            return;
        }
        //Check if room is full (fixed >= 8 not only ==8)
        if (room.players.length >= 8) {
            console.log(`Room ${roomName} is full`);
            socket.emit('errorRoomFull');
            return;
        }
        //position of the new player calc, then pushing it 
        const position = room.players.length;
        room.players.push({ pos: position, id: socket.id, userName: userName, totalCards: 0, hand: {} });
        socket.join(roomName);

        console.log(room.players);
        //This is to notify others that new player has joined
        io.to(roomName).emit('updatePlayers', room.players);
        // Inform the new player who the current admin is(Karan you can ignore remove this if you feel it isnt necessary)
        socket.emit('adminStatus', room.admin === socket.id);
        console.log(`${userName} joined room ${roomName}`);
    });

    socket.on('startGame', async (roomName) => {
        
        
        const room = rooms[roomName];

        //This is to make sure only admin can start the game
        if (!room || socket.id !== room.admin) {
            socket.emit('errorNotAdmin');
            console.log(`User with socket ID ${socket.id} tried to start the game but is not the admin.`);
            return;
        }

        //If there are no players in room or if only 1 player then game shouldn't start
        if (!room || room.players.length <= 1) {
            socket.emit('errorNoPlayers');  
            console.log(`Not enough players in room ${roomName}.`);
            return;
        }

            // Create a new deck if not already created
            if (!room.deckId) {
                const deckResponse = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
                room.deckId = deckResponse.data.deck_id;
            } else {
                // Shuffle the deck if it has already been created
                await axios.get(`https://deckofcardsapi.com/api/deck/${room.deckId}/shuffle/`);
            }
            const deckId = room.deckId;
            const players = room.players;
            const cardsPerPlayer = Math.floor(52 / players.length);
            const extraCards = 52 % players.length;
            
            // Deal cards to each player and add it to the player's hand
            for (let i = 0; i < players.length; i++) {
                const numCards = i < extraCards ? cardsPerPlayer + 1 : cardsPerPlayer;
                const drawResponse = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${numCards}`);
                // Add the cards to the player's hand
                players[i].hand = drawResponse.data.cards;
                // Send the cards to the client
                io.to(players[i].id).emit('dealCards', drawResponse.data.cards);
            }
            console.log("game started for " + roomName);

            const startingPlayer = determineStartingPlayer(players, room.hands);
            if (startingPlayer) {
                //Start with Spacdes
                room.currentSuit = 'SPADES';
                //Announce who has to start
                console.log(`Starting player for ${roomName} for ${roomName.game}: ` + startingPlayer);
                io.to(roomName).emit('roundStart', startingPlayer, room.currentSuit);
            }
            
        
    });

    //Kicking players logic
    socket.on('kickPlayer', (roomName, playerId) => {
        const room = rooms[roomName];
        if (!room || socket.id !== room.admin) {
            socket.emit('errorNotAdmin');
            return;
        }

        room.players = room.players.filter(player => player.id !== playerId);
        io.to(playerId).emit('kicked');
        io.to(roomName).emit('updatePlayers', room.players);
        console.log(`Player ${playerId} kicked from room ${roomName}`);
    });

    socket.on('playCard', (roomName, player, card) => {
        const room = rooms[roomName];
        const players = room.players;
        if (room && players.includes(player)) {
            const nextPlayer = playRound(room, room.currentSuit, players);
            const loser = checkEndCondition(room);
            if (loser) {
                io.to(roomName).emit('gameEnd', loser);
            } else {
                room.currentSuit = card.suit; // Set the current suit for the next round
                io.to(roomName).emit('roundStart', nextPlayer, room.currentSuit);
            }
        }
    });

    /*
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    This was earlier thing
    Now lot of things to handle
    */
    socket.on('disconnect', () => {
        let roomName;
        let isAdminLeaving = false;

        // Find the room and remove the player
        for (let [name, room] of Object.entries(rooms)) {
            const index = room.players.findIndex(player => player.id === socket.id);
            if (index !== -1) {
                roomName = name;
                room.players.splice(index, 1);
                io.to(roomName).emit('updatePlayers', room.players);

                // If the admin is leaving, transfer admin rights
                if (room.admin === socket.id) {
                    isAdminLeaving = true;
                    if (room.players.length > 0) {
                        room.admin = room.players[0].id;  // Transfer admin to the next player in the queue
                        io.to(roomName).emit('adminTransferred', room.admin);
                        console.log(`Admin left, new admin is ${room.players[0].userName}`);
                    } else {
                        // No players left, delete the room
                        delete rooms[roomName];
                        console.log(`Room ${roomName} deleted as no players left.`);
                    }
                }
                break;
            }
        }

        if (!isAdminLeaving) {
            console.log('user disconnected');
        }
    });
});

console.log('Server-side code running');