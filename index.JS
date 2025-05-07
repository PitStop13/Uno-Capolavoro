// index.js

const colors = ['red', 'green', 'blue', 'yellow'];
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const actions = ['+2', 'skip', 'reverse'];
const wildActions = ['wild', '+4'];

let deck = [];
let players = [];
let currentPlayer = 0;
let currentCard = null;
let currentDirection = 1;
let gameOver = false;
let choosingColor = false;
let cardBeingPlayed = null;
let hasDrawnCard = false;

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
    for (let color of colors) {
        deck.push({ color: color, value: '0' });
        for (let i = 1; i <= 9; i++) {
            deck.push({ color, value: i.toString() });
            deck.push({ color, value: i.toString() });
        }
        for (let action of actions) {
            deck.push({ color, value: action });
            deck.push({ color, value: action });
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
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < numPlayers; j++) {
            players[j].push(deck.pop());
        }
    }
}

function drawCard() {
    if (deck.length === 0) resetDeck();
    return deck.pop();
}

function resetDeck() {
    const lastCard = currentCard;
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
}

function canPlayCard(card) {
    return (
        !currentCard ||
        card.color === currentCard.color ||
        card.value === currentCard.value ||
        card.color === 'wild'
    );
}

function handleActionCard(card) {
    const nextPlayer = getNextPlayer();

    if (card.value === '+2') {
        players[nextPlayer].push(drawCard(), drawCard());
        updateGameDisplay();
        alert(`${getPlayerName(nextPlayer)} pesca 2 carte!`);
    } else if (card.value === 'skip') {
        currentPlayer = getNextPlayer();
        alert(`${getPlayerName(currentPlayer)} è stato saltato!`);
    } else if (card.value === 'reverse') {
        currentDirection *= -1;
        alert('La direzione di gioco è stata invertita!');
    } else if (card.value === '+4' || card.value === 'wild') {
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
        hasDrawnCard = false;
        currentPlayer = getNextPlayer();
        updateGameDisplay();
        if (currentPlayer === 1) setTimeout(cpuTurn, 1500);
    }
}

function getNextPlayer() {
    return (currentPlayer + currentDirection + players.length) % players.length;
}

function getPlayerName(i) {
    return i === 0 ? 'Giocatore' : 'CPU';
}

function playCard(playerIndex, cardIndex) {
    if (gameOver || currentPlayer !== 0 || choosingColor) return;

    const card = players[playerIndex][cardIndex];
    if (canPlayCard(card)) {
        players[playerIndex].splice(cardIndex, 1);
        currentCard = { ...card };
        updateGameDisplay();
        checkWinCondition(playerIndex);
        if (!gameOver) handleActionCard(card);
    } else {
        alert("Non puoi giocare questa carta!");
    }
}

function drawAndPass() {
    if (gameOver || currentPlayer !== 0 || choosingColor) return;
    if (!hasDrawnCard) {
        alert("Devi prima pescare una carta.");
        return;
    }
    hasDrawnCard = false;
    switchTurn();
}

function drawCardForPlayer() {
    if (gameOver || currentPlayer !== 0 || choosingColor || hasDrawnCard) return;
    players[0].push(drawCard());
    hasDrawnCard = true;
    updateGameDisplay();
}

function cpuTurn() {
    if (gameOver || currentPlayer !== 1 || choosingColor) return;
    const hand = players[1];
    let index = hand.findIndex(c => canPlayCard(c) && (actions.includes(c.value) || wildActions.includes(c.value)));
    if (index === -1) index = hand.findIndex(canPlayCard);

    if (index !== -1) {
        const card = hand[index];
        players[1].splice(index, 1);
        currentCard = { ...card };
        updateGameDisplay();
        checkWinCondition(1);
        if (!gameOver) handleActionCard(card);
        if (card.color === 'wild') {
            setTimeout(() => {
                const counts = {};
                players[1].forEach(c => {
                    if (c.color !== 'wild') counts[c.color] = (counts[c.color] || 0) + 1;
                });
                const bestColor = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'red');
                currentCard.color = bestColor;
                updateGameDisplay();
                switchTurn();
            }, 1000);
        }
    } else {
        players[1].push(drawCard());
        updateGameDisplay();
        switchTurn();
    }
}

function checkWinCondition(index) {
    if (players[index].length === 0) {
        gameOver = true;
        alert(`${getPlayerName(index)} ha vinto!`);
    }
}

function updateGameDisplay() {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

    const currentCardDiv = document.createElement('div');
    currentCardDiv.className = 'card played-card';
    const cardImg = document.createElement('img');
    cardImg.src = `uno carte/${getCardImageName(currentCard)}`;
    cardImg.alt = `${currentCard.color} ${currentCard.value}`;
    currentCardDiv.appendChild(cardImg);
    container.appendChild(currentCardDiv);

    const handDiv = document.createElement('div');
    handDiv.className = 'player-hand';
    players[0].forEach((card, i) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        const img = document.createElement('img');
        img.src = `uno carte/${getCardImageName(card)}`;
        img.alt = `${card.color} ${card.value}`;
        cardDiv.onclick = () => playCard(0, i);
        cardDiv.appendChild(img);
        handDiv.appendChild(cardDiv);
    });
    container.appendChild(handDiv);

    const controls = document.createElement('div');
    controls.className = 'player-controls';
    controls.style.display = 'flex';
    controls.style.gap = '10px';
    controls.style.marginTop = '10px';

    const drawBtn = document.createElement('div');
    drawBtn.className = 'card draw-card';
    const drawImg = document.createElement('img');
    drawImg.src = 'uno carte/VUOTO.png';
    drawImg.alt = 'Pesca Carta';
    drawImg.style.width = '100%';
    drawImg.style.height = '100%';
    drawImg.style.objectFit = 'cover';
    drawBtn.appendChild(drawImg);
    drawBtn.onclick = drawCardForPlayer;
    controls.appendChild(drawBtn);

    const passBtn = document.createElement('div');
    passBtn.className = 'card pass-button';
    passBtn.textContent = 'Passa Turno';
    passBtn.onclick = drawAndPass;

    if (!hasDrawnCard) {
        passBtn.style.opacity = '0.5';
        passBtn.style.pointerEvents = 'none';
    } else {
        passBtn.style.opacity = '1';
        passBtn.style.pointerEvents = 'auto';
    }

    controls.appendChild(passBtn);
    container.appendChild(controls);

    const cpuHand = document.createElement('div');
    cpuHand.className = 'cpu-hand';
    cpuHand.textContent = `CPU: ${players[1].length} carte`;
    container.appendChild(cpuHand);

    updateColorChoiceDisplay();
}

function updateColorChoiceDisplay() {
    const container = document.getElementById('game-container');
    const old = document.getElementById('color-choice');
    if (old) old.remove();

    if (choosingColor && currentPlayer === 0) {
        const choiceDiv = document.createElement('div');
        choiceDiv.id = 'color-choice';
        choiceDiv.textContent = 'Scegli un colore:';
        choiceDiv.style.display = 'flex';
        choiceDiv.style.gap = '10px';
        choiceDiv.style.marginTop = '10px';

        colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'color-button';
            btn.style.backgroundColor = color;
            btn.style.width = '60px';
            btn.style.height = '60px';
            btn.style.borderRadius = '50%';
            btn.style.cursor = 'pointer';
            btn.onclick = () => chooseColor(color);
            choiceDiv.appendChild(btn);
        });

        container.appendChild(choiceDiv);
    }
}

function getCardImageName(card) {
    if (!card) return 'VUOTO.png';

    if (card.color === 'wild') {
        return card.value === 'wild' ? 'wild.png' : '+4.png';
    }

    const suffix = {
        red: 'R',
        green: 'G',
        blue: 'B',
        yellow: 'Y'
    }[card.color];

    return `${card.value}${suffix}.PNG`;
}

window.onload = () => initGame(2);
