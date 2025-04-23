// Variabili di gioco
const colors = ['red', 'green', 'blue', 'yellow'];
const actions = ['+2', 'skip', 'reverse'];
let deck = [];
let players = [];
let currentPlayer = 0; // 0 = Player, 1 = CPU
let currentCard = null;
let gameOver = false;

// Inizializza il gioco
function initGame(numPlayers) {
    createDeck();
    shuffleDeck();
    dealCards(numPlayers);
    currentCard = drawCard();
    updateGameDisplay();
    if (currentPlayer === 1) cpuTurn(); // La CPU inizia se è il suo turno
}

// Crea il mazzo di carte Uno
function createDeck() {
    for (let color of colors) {
        for (let i = 0; i <= 9; i++) {
            deck.push({ color: color, value: i.toString() });
        }
        for (let action of actions) {
            deck.push({ color: color, value: action });
        }
    }
    // Aggiungi carte jolly
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: '+4' });
        deck.push({ color: 'wild', value: 'wild' });
    }
}

// Mescola il mazzo
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Distribuisci le carte ai giocatori
function dealCards(numPlayers) {
    players = Array.from({ length: numPlayers }, () => []);
    for (let i = 0; i < 7; i++) {
        for (let player of players) {
            player.push(deck.pop());
        }
    }
}

// Pesca una carta dal mazzo
function drawCard() {
    return deck.pop();
}

// Controlla se una carta può essere giocata
function canPlayCard(card) {
    return (
        card.color === currentCard.color ||
        card.value === currentCard.value ||
        card.color === 'wild'
    );
}

// Il giocatore gioca una carta
function playCard(playerIndex, cardIndex) {
    if (gameOver || currentPlayer !== 0) return;

    const card = players[playerIndex][cardIndex];
    if (canPlayCard(card)) {
        currentCard = card;
        players[playerIndex].splice(cardIndex, 1); // Rimuove la carta dalla mano
        checkWinCondition(playerIndex);
        currentPlayer = 1; // Passa il turno alla CPU
        updateGameDisplay();
        setTimeout(cpuTurn, 1000); // Ritardo per il turno della CPU
    } else {
        alert("Non puoi giocare questa carta!");
    }
}

// Il giocatore pesca una carta
function drawCardForPlayer() {
    if (gameOver || currentPlayer !== 0) return;

    players[0].push(drawCard()); // Il giocatore pesca una carta
    currentPlayer = 1; // Passa il turno alla CPU
    updateGameDisplay();
    setTimeout(cpuTurn, 1000); // Ritardo per il turno della CPU
}

// Turno della CPU
function cpuTurn() {
    if (gameOver || currentPlayer !== 1) return;

    const cpuHand = players[1];
    const playableCardIndex = cpuHand.findIndex(canPlayCard);

    if (playableCardIndex !== -1) {
        currentCard = cpuHand[playableCardIndex];
        cpuHand.splice(playableCardIndex, 1); // Rimuove la carta dalla mano
        checkWinCondition(1);
    } else {
        cpuHand.push(drawCard()); // La CPU pesca una carta
    }

    currentPlayer = 0; // Passa il turno al giocatore
    updateGameDisplay();
}

// Controlla se un giocatore ha vinto
function checkWinCondition(playerIndex) {
    if (players[playerIndex].length === 0) {
        gameOver = true;
        alert(playerIndex === 0 ? 'Hai vinto!' : 'La CPU ha vinto!');
    }
}

// Aggiorna la visualizzazione del gioco
function updateGameDisplay() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = ''; // Pulisce il contenitore

    // Mostra la carta attuale
    const currentCardDiv = document.createElement('div');
    currentCardDiv.classList.add('card');
    const currentCardImg = document.createElement('img');
    currentCardImg.src = `uno carte/${getCardImageName(currentCard)}`;
    currentCardImg.alt = `${currentCard.color} ${currentCard.value}`;
    currentCardDiv.appendChild(currentCardImg);
    gameContainer.appendChild(currentCardDiv);

    // Mostra le carte del giocatore
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player');
    playerDiv.textContent = 'Le tue carte:';
    players[0].forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        const cardImg = document.createElement('img');
        cardImg.src = `uno carte/${getCardImageName(card)}`;
        cardImg.alt = `${card.color} ${card.value}`;
        cardImg.onclick = () => playCard(0, index); // Aggiunge l'evento di click
        cardDiv.appendChild(cardImg);
        playerDiv.appendChild(cardDiv);
    });
    gameContainer.appendChild(playerDiv);

    // Carta per pescare una carta (usa VUOTO.png)
    const drawCardDiv = document.createElement('div');
    drawCardDiv.classList.add('card');
    const drawCardImg = document.createElement('img');
    drawCardImg.src = `uno carte/VUOTO.png`; // Immagine della carta per pescare
    drawCardImg.alt = "Pesca una carta";
    drawCardImg.onclick = drawCardForPlayer; // Evento per pescare la carta
    drawCardDiv.appendChild(drawCardImg);
    gameContainer.appendChild(drawCardDiv);

    // Mostra il numero di carte della CPU (nascoste)
    const cpuDiv = document.createElement('div');
    cpuDiv.classList.add('player');
    cpuDiv.textContent = `Carte CPU: ${players[1].length}`;
    gameContainer.appendChild(cpuDiv);
}

// Funzione per ottenere il nome del file immagine della carta
function getCardImageName(card) {
    if (card.color === 'wild') {
        return `${card.value}.PNG`; // Per carte jolly come "+4" o "wild"
    }
    const colorInitial = card.color[0].toUpperCase(); // Ottieni l'iniziale maiuscola del colore
    return `${card.value}${colorInitial}.PNG`; // Ad esempio, "2B.PNG" per 2 blu
}

// Assicurati che il gioco inizi dopo il caricamento del DOM
window.onload = () => {
    initGame(2); // Giocatore vs CPU
};
