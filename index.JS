// index.js

// Variabili di gioco
const colors = ['red', 'green', 'blue', 'yellow'];
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const actions = ['+2', 'skip', 'reverse'];
const wildActions = ['wild', '+4'];
let deck = [];
let players = [];
let currentPlayer = 0; // 0 = Player, 1 = CPU
let currentCard = null;
let currentDirection = 1; // 1 = avanti, -1 = indietro
let gameOver = false;
let choosingColor = false;
let cardBeingPlayed = null;
let hasDrawnCard = false; // 👈 Nuova variabile per evitare doppia pesca

// Inizializza il gioco
function initGame(numPlayers) {
    deck = [];
    players = Array(numPlayers).fill(null).map(() => []);
    currentPlayer = 0;
    currentCard = null;
    currentDirection = 1;
    gameOver = false;
    choosingColor = false;
    cardBeingPlayed = null;
    hasDrawnCard = false;
    createDeck();
    shuffleDeck();
    dealCards(numPlayers);
    while (currentCard === null || (currentCard.color === 'wild' && currentCard.value === '+4')) {
        if (currentCard) deck.unshift(currentCard);
        currentCard = drawCard();
    }
    updateGameDisplay();
    if (currentPlayer === 1 && !gameOver) setTimeout(cpuTurn, 1500);
}

function createDeck() {
    deck = [];
    for (let color of colors) {
        deck.push({ color: color, value: '0' });
        for (let i = 1; i <= 9; i++) {
            deck.push({ color: color, value: i.toString() });
            deck.push({ color: color, value: i.toString() });
        }
        for (let action of actions) {
            deck.push({ color: color, value: action });
            deck.push({ color: color, value: action });
        }
    }
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: '+4' });
        deck.push({ color: 'wild', value: 'wild' });
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCards(numPlayers) {
    players = Array.from({ length: numPlayers }, () => []);
    for (let i = 0; i < 7; i++) {
        for (let player of players) {
            player.push(deck.pop());
        }
    }
}

function drawCard() {
    if (deck.length === 0) {
        resetDeck();
    }
    return deck.pop();
}

function resetDeck() {
    const lastCard = currentCard;
    let discardedCards = [];
    const gameContainer = document.getElementById('game-container');
    const playedCardElement = gameContainer.querySelector('.played-card');
    if (playedCardElement) {
        const tempDeck = [];
        players.forEach(hand => {
            hand.forEach(card => {
                if (!(card.color === lastCard.color && card.value === lastCard.value)) {
                    tempDeck.push(card);
                }
            });
        });
        deck = tempDeck;
        shuffleDeck();
        currentCard = { ...lastCard };
        updateGameDisplay();
    } else {
        createDeck();
        shuffleDeck();
        dealCards(players.length);
        currentCard = drawCard();
        updateGameDisplay();
    }
}

function canPlayCard(card) {
    if (!currentCard) return true;
    return (
        card.color === currentCard.color ||
        card.value === currentCard.value ||
        card.color === 'wild'
    );
}

function handleActionCard(card) {
    if (card.value === '+2') {
        const nextPlayer = getNextPlayer();
        players[nextPlayer].push(drawCard());
        players[nextPlayer].push(drawCard());
        updateGameDisplay();
        alert(`${getPlayerName(nextPlayer)} pesca 2 carte!`);
    } else if (card.value === 'skip') {
        currentPlayer = getNextPlayer();
        alert(`${getPlayerName(currentPlayer)} è stato saltato!`);
    } else if (card.value === 'reverse') {
        currentDirection *= -1;
        alert('La direzione di gioco è stata invertita!');
    } else if (card.value === '+4') {
        const nextPlayer = getNextPlayer();
        for (let i = 0; i < 4; i++) {
            players[nextPlayer].push(drawCard());
        }
        updateGameDisplay();
        alert(`${getPlayerName(nextPlayer)} pesca 4 carte!`);
        choosingColor = true;
        cardBeingPlayed = card;
        updateColorChoiceDisplay();
        return;
    } else if (card.value === 'wild') {
        choosingColor = true;
        cardBeingPlayed = card;
        updateColorChoiceDisplay();
        return;
    }
    switchTurn();
}

function chooseColor(color) {
    if (choosingColor && cardBeingPlayed) {
        currentCard.color = color;
        choosingColor = false;
        cardBeingPlayed = null;
        updateColorChoiceDisplay();
        updateGameDisplay();
        switchTurn();
    }
}

function switchTurn() {
    if (!gameOver) {
        hasDrawnCard = false; // 👈 Reset pesca all'inizio del turno
        currentPlayer = getNextPlayer();
        updateGameDisplay();
        if (currentPlayer === 1) setTimeout(cpuTurn, 1500);
    }
}

function getNextPlayer() {
    return (currentPlayer + currentDirection + players.length) % players.length;
}

function getPlayerName(playerIndex) {
    return playerIndex === 0 ? 'Giocatore' : 'CPU';
}

function playCard(playerIndex, cardIndex) {
    if (gameOver || currentPlayer !== 0 || choosingColor) return;
    const card = players[playerIndex][cardIndex];
    if (canPlayCard(card)) {
        players[playerIndex].splice(cardIndex, 1);
        currentCard = { ...card };
        updateGameDisplay();
        checkWinCondition(playerIndex);
        if (!gameOver) {
            handleActionCard(card);
        }
    } else {
        alert("Non puoi giocare questa carta!");
    }
}

// 👇 Modificata: Passa solo se ha pescato prima
function drawAndPass() {
    if (gameOver || currentPlayer !== 0 || choosingColor) return;
    if (!hasDrawnCard) {
        alert("Devi prima pescare una carta prima di passare il turno.");
        return;
    }
    hasDrawnCard = false;
    switchTurn();
}

// 👇 Modificata: Permette pesca solo una volta per turno
function drawCardForPlayer() {
    if (gameOver || currentPlayer !== 0 || choosingColor || hasDrawnCard) return;
    players[0].push(drawCard());
    hasDrawnCard = true;
    updateGameDisplay();
}

function cpuTurn() {
    if (gameOver || currentPlayer !== 1 || choosingColor) return;
    const cpuHand = players[1];
    let bestCardIndex = -1;
    for (let i = 0; i < cpuHand.length; i++) {
        if (canPlayCard(cpuHand[i]) && (actions.includes(cpuHand[i].value) || wildActions.includes(cpuHand[i].value))) {
            bestCardIndex = i;
            break;
        }
    }
    if (bestCardIndex === -1) {
        bestCardIndex = cpuHand.findIndex(canPlayCard);
    }
    if (bestCardIndex !== -1) {
        const playedCard = cpuHand[bestCardIndex];
        players[1].splice(bestCardIndex, 1);
        currentCard = { ...playedCard };
        updateGameDisplay();
        checkWinCondition(1);
        if (!gameOver) {
            handleActionCard(playedCard);
        }
        if (playedCard.color === 'wild') {
            setTimeout(() => {
                const colorCounts = {};
                players[1].forEach(card => {
                    if (card.color !== 'wild') {
                        colorCounts[card.color] = (colorCounts[card.color] || 0) + 1;
                    }
                });
                let bestColor = 'red';
                let maxCount = 0;
                for (const color in colorCounts) {
                    if (colorCounts[color] > maxCount) {
                        maxCount = colorCounts[color];
                        bestColor = color;
                    }
                }
                currentCard.color = bestColor;
                updateGameDisplay();
                switchTurn();
            }, 1000);
            return;
        }
    } else {
        players[1].push(drawCard());
        updateGameDisplay();
        switchTurn();
    }
}

function checkWinCondition(playerIndex) {
    if (players[playerIndex].length === 0) {
        gameOver = true;
        alert(`${getPlayerName(playerIndex)} ha vinto!`);
    }
}

function updateGameDisplay() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = '';
    const currentCardDiv = document.createElement('div');
    currentCardDiv.classList.add('card', 'played-card');
    const currentCardImg = document.createElement('img');
    currentCardImg.src = `uno carte/${getCardImageName(currentCard)}`;
    currentCardImg.alt = `${currentCard.color} ${currentCard.value}`;
    currentCardDiv.appendChild(currentCardImg);
    gameContainer.appendChild(currentCardDiv);

    const playerHandDiv = document.createElement('div');
    playerHandDiv.classList.add('player-hand');
    players[0].forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        const cardImg = document.createElement('img');
        cardImg.src = `uno carte/${getCardImageName(card)}`;
        cardImg.alt = `${card.color} ${card.value}`;
        cardDiv.onclick = () => playCard(0, index);
        cardDiv.appendChild(cardImg);
        playerHandDiv.appendChild(cardDiv);
    });
    gameContainer.appendChild(playerHandDiv);

    const playerControlsDiv = document.createElement('div');
    playerControlsDiv.classList.add('player-controls');
    playerControlsDiv.style.display = 'flex';
    playerControlsDiv.style.gap = '10px';
    playerControlsDiv.style.marginTop = '10px';

    const drawCardButton = document.createElement('div');
    drawCardButton.classList.add('card', 'draw-card');
    const drawCardImg = document.createElement('img'); // Aggiungi immagine
    drawCardImg.src = `uno carte/VUOTO.png`;
    drawCardImg.alt = 'Pesca Carta';
    drawCardImg.style.width = '100%'; // Occupa tutta la larghezza del contenitore
    drawCardImg.style.height = '100%'; // Occupa tutta l'altezza del contenitore
    drawCardImg.style.objectFit = 'cover'; // Adatta l'immagine senza distorsioni
    drawCardButton.appendChild(drawCardImg);
    drawCardButton.onclick = drawCardForPlayer;
    playerControlsDiv.appendChild(drawCardButton);

    const passButton = document.createElement('div');
    passButton.classList.add('card', 'pass-button');
    passButton.textContent = 'Passa Turno';
    passButton.onclick = drawAndPass;
    playerControlsDiv.appendChild(passButton);

    gameContainer.appendChild(playerControlsDiv);

    const cpuHandDiv = document.createElement('div');
    cpuHandDiv.classList.add('cpu-hand');
    cpuHandDiv.textContent = `CPU: ${players[1].length} carte`;
    gameContainer.appendChild(cpuHandDiv);

    updateColorChoiceDisplay();
}

function updateColorChoiceDisplay() {
    const gameContainer = document.getElementById('game-container');
    const existingColorChoice = document.getElementById('color-choice');
    if (existingColorChoice) {
        existingColorChoice.remove();
    }

    if (choosingColor && currentPlayer === 0) {
        const colorChoiceDiv = document.createElement('div');
        colorChoiceDiv.id = 'color-choice';
        colorChoiceDiv.textContent = 'Scegli un colore:';
        colorChoiceDiv.style.display = 'flex';
        colorChoiceDiv.style.gap = '10px';
        colorChoiceDiv.style.marginTop = '10px';

        colors.forEach(color => {
            const colorButton = document.createElement('button');
            colorButton.classList.add('color-button');
            colorButton.style.backgroundColor = color;
            colorButton.style.width = '60px';
            colorButton.style.height = '60px';
            colorButton.style.borderRadius = '50%';
            colorButton.style.cursor = 'pointer';
            colorButton.onclick = () => chooseColor(color);
            colorChoiceDiv.appendChild(colorButton);
        });
        gameContainer.appendChild(colorChoiceDiv);
    }
}

function getCardImageName(card) {
    if (!card) return 'VUOTO.png';

    let name = '';
    if (card.color === 'wild') {
        name = card.value;
    } else {
        name = card.value;
        switch (card.color) {
            case 'red': name += 'R'; break;
            case 'green': name += 'G'; break;
            case 'blue': name += 'B'; break;
            case 'yellow': name += 'Y'; break;
        }
    }
    return `${name}.PNG`;
}

window.onload = () => {
    initGame(2);
};
