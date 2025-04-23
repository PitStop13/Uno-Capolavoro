const colors = ['red', 'green', 'blue', 'yellow'];
const actions = ['+2', 'skip', 'reverse'];
const wildActions = ['wild', '+4'];
let deck = [];
let players = [];
let currentPlayer = 0;
let currentCard = null;
let currentDirection = 1;
let gameOver = false;

function initGame(numPlayers) {
    createDeck();
    shuffleDeck();
    dealCards(numPlayers);
    currentCard = drawCard();
    while (currentCard.color === 'wild' && currentCard.value === '+4') {
        deck.unshift(currentCard);
        shuffleDeck();
        currentCard = drawCard();
    }
    updateCurrentColorDisplay();
    updateGameDisplay();
    if (currentPlayer === 1) setTimeout(cpuTurn, 1000);
}

function createDeck() {
    deck = [];
    for (let color of colors) {
        deck.push({ color, value: '0' });
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
    players = Array.from({ length: numPlayers }, () => []);
    for (let i = 0; i < 7; i++) {
        for (let player of players) {
            player.push(deck.pop());
        }
    }
}

function drawCard() {
    if (deck.length === 0) resetDeck();
    return deck.pop();
}

function resetDeck() {
    const lastCard = currentCard;
    deck = [];
    const discarded = document.querySelectorAll('.played-card');
    discarded.forEach(div => {
        const color = div.dataset.color;
        const value = div.dataset.value;
        if (!(color === lastCard.color && value === lastCard.value)) {
            deck.push({ color, value });
        }
    });
    shuffleDeck();
}

function canPlayCard(card) {
    return card.color === currentCard.color || card.value === currentCard.value || card.color === 'wild';
}

function getNextPlayer() {
    return (currentPlayer + currentDirection + players.length) % players.length;
}

function getPlayerName(i) {
    return i === 0 ? "Giocatore" : "CPU";
}

function handleActionCard(card) {
    if (card.value === '+2') {
        const next = getNextPlayer();
        players[next].push(drawCard(), drawCard());
        alert(`${getPlayerName(next)} pesca 2 carte!`);
    } else if (card.value === 'skip') {
        currentPlayer = getNextPlayer();
        alert(`${getPlayerName(currentPlayer)} è stato saltato!`);
    } else if (card.value === 'reverse') {
        currentDirection *= -1;
        alert('La direzione è invertita!');
    }

    if (card.value === '+4' || card.value === 'wild') {
        if (card.value === '+4') {
            const next = getNextPlayer();
            for (let i = 0; i < 4; i++) players[next].push(drawCard());
            alert(`${getPlayerName(next)} pesca 4 carte!`);
        }

        if (currentPlayer === 0) {
            let chosen = '';
            while (!colors.includes(chosen)) {
                chosen = prompt("Scegli un colore (red, green, blue, yellow):").toLowerCase();
            }
            currentCard.color = chosen;
        } else {
            const colorCounts = {};
            for (const c of players[currentPlayer]) {
                if (c.color !== 'wild') colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
            }
            currentCard.color = Object.entries(colorCounts).reduce((a, b) => b[1] > a[1] ? b : a, ['red', 0])[0];
            alert(`La CPU ha scelto: ${currentCard.color.toUpperCase()}`);
        }

        updateCurrentColorDisplay();
    }
}

function playCard(playerIndex, cardIndex) {
    if (gameOver || currentPlayer !== playerIndex) return;
    const card = players[playerIndex][cardIndex];
    if (!canPlayCard(card)) return alert("Carta non valida!");

    players[playerIndex].splice(cardIndex, 1);
    const cardEl = document.createElement('div');
    cardEl.classList.add('card', 'played-card');
    const img = document.createElement('img');
    img.src = `uno carte/${getCardImageName(card)}`;
    img.alt = `${card.color} ${card.value}`;
    cardEl.dataset.color = card.color;
    cardEl.dataset.value = card.value;
    cardEl.appendChild(img);

    const current = document.querySelector('#game-container > .card:first-child');
    if (current) current.remove();
    document.getElementById('game-container').prepend(cardEl);

    currentCard = { ...card };
    updateCurrentColorDisplay();
    checkWinCondition(playerIndex);
    if (!gameOver) {
        handleActionCard(card);
        currentPlayer = getNextPlayer();
        updateGameDisplay();
        if (currentPlayer === 1) setTimeout(cpuTurn, 1000);
    }
}

function drawCardForPlayer() {
    if (gameOver || currentPlayer !== 0) return;
    players[0].push(drawCard());
    currentPlayer = getNextPlayer();
    updateGameDisplay();
    if (currentPlayer === 1 && !gameOver) {
        setTimeout(cpuTurn, 1000);
    }
}

function passTurn() {
    if (gameOver || currentPlayer !== 0) return;
    alert("Hai passato il turno e pescato una carta.");
    players[0].push(drawCard());
    currentPlayer = getNextPlayer();
    updateGameDisplay();
    if (currentPlayer === 1 && !gameOver) {
        setTimeout(cpuTurn, 1000);
    }
}

function cpuTurn() {
    if (gameOver || currentPlayer !== 1) return;

    const hand = players[1];
    let index = hand.findIndex(c => canPlayCard(c) && (wildActions.includes(c.value) || actions.includes(c.value)));
    if (index === -1) index = hand.findIndex(canPlayCard);

    if (index !== -1) {
        const card = hand[index];
        hand.splice(index, 1);
        const cardEl = document.createElement('div');
        cardEl.classList.add('card', 'played-card');
        const img = document.createElement('img');
        img.src = `uno carte/${getCardImageName(card)}`;
        img.alt = `${card.color} ${card.value}`;
        cardEl.dataset.color = card.color;
        cardEl.dataset.value = card.value;
        cardEl.appendChild(img);
        const current = document.querySelector('#game-container > .card:first-child');
        if (current) current.remove();
        document.getElementById('game-container').prepend(cardEl);

        currentCard = { ...card };
        updateCurrentColorDisplay();
        checkWinCondition(1);
        if (!gameOver) {
            handleActionCard(card);
            currentPlayer = getNextPlayer();
            updateGameDisplay();
            if (currentPlayer === 1) setTimeout(cpuTurn, 1000);
        }
    } else {
        players[1].push(drawCard());
        currentPlayer = getNextPlayer();
        updateGameDisplay();
        if (currentPlayer === 1) setTimeout(cpuTurn, 1000);
    }
}

function checkWinCondition(i) {
    if (players[i].length === 0) {
        gameOver = true;
        alert(`${getPlayerName(i)} ha vinto!`);
    }
}

function updateGameDisplay() {
    const container = document.getElementById('game-container');
    const pDiv = document.querySelector('.player-hand');
    if (pDiv) pDiv.remove();
    const cpuDiv = document.querySelector('.cpu-hand');
    if (cpuDiv) cpuDiv.remove();

    const newPlayer = document.createElement('div');
    newPlayer.classList.add('player-hand');
    newPlayer.textContent = 'Le tue carte:';
    players[0].forEach((card, index) => {
        const div = document.createElement('div');
        div.classList.add('card');
        const img = document.createElement('img');
        img.src = `uno carte/${getCardImageName(card)}`;
        img.alt = `${card.color} ${card.value}`;
        img.onclick = () => playCard(0, index);
        div.appendChild(img);
        newPlayer.appendChild(div);
    });
    container.appendChild(newPlayer);

    if (!document.querySelector('.draw-card')) {
        const drawDiv = document.createElement('div');
        drawDiv.classList.add('card', 'draw-card');
        const img = document.createElement('img');
        img.src = `uno carte/VUOTO.png`;
        img.alt = "Pesca una carta";
        img.onclick = drawCardForPlayer;
        drawDiv.appendChild(img);
        container.appendChild(drawDiv);
    }

    const cpuHand = document.createElement('div');
    cpuHand.classList.add('cpu-hand');
    cpuHand.textContent = `Carte CPU: ${players[1].length}`;
    container.appendChild(cpuHand);
}

function updateCurrentColorDisplay() {
    let el = document.getElementById('current-color');
    if (!el) {
        el = document.createElement('div');
        el.id = 'current-color';
        el.style.marginTop = '10px';
        document.getElementById('game-container').appendChild(el);
    }
    el.textContent = `Colore attuale: ${currentCard.color.toUpperCase()}`;
    el.style.color = currentCard.color !== 'wild' ? currentCard.color : 'black';
}

function getCardImageName(card) {
    return card.color === 'wild' ? `${card.value}.PNG` : `${card.value}${card.color[0].toUpperCase()}.PNG`;
}

window.onload = () => {
    initGame(2);
    const passButton = document.getElementById('pass-button');
    passButton.onclick = passTurn;
};
