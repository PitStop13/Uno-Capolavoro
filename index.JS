// filepath: uno-game/src/index.js

// Game variables
const colors = ['red', 'green', 'blue', 'yellow'];
const actions = ['+2', '+4', 'skip', 'reverse'];
let deck = [];
let players = [];
let currentPlayer = 0;
let currentCard = null;

// Initialize the game
function initGame(numPlayers) {
    createDeck();
    shuffleDeck();
    dealCards(numPlayers);
    currentCard = drawCard();
    updateGameDisplay();
}

// Create a deck of Uno cards
function createDeck() {
    for (let color of colors) {
        for (let i = 0; i <= 9; i++) {
            deck.push({ color: color, value: i.toString() });
        }
        for (let action of actions) {
            deck.push({ color: color, value: action });
        }
    }
    deck.push({ color: 'wild', value: '+4' });
    deck.push({ color: 'wild', value: 'wild' });
}

// Shuffle the deck
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Deal cards to players
function dealCards(numPlayers) {
    players = Array.from({ length: numPlayers }, () => []);
    for (let i = 0; i < 7; i++) {
        for (let player of players) {
            player.push(deck.pop());
        }
    }
}

// Draw a card from the deck
function drawCard() {
    return deck.pop();
}

// Update the game display
function updateGameDisplay() {
    // Logic to update the game UI goes here
}

// Start the game with 4 players
initGame(4);