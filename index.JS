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
    createDeck();
    shuffleDeck();
    dealCards(numPlayers);
    // Assicurati che la prima carta non sia un jolly +4
    while (currentCard === null || (currentCard.color === 'wild' && currentCard.value === '+4')) {
        if (currentCard) deck.unshift(currentCard); // Rimetti la carta in cima al mazzo
        currentCard = drawCard();
    }
    updateGameDisplay();
    if (currentPlayer === 1 && !gameOver) setTimeout(cpuTurn, 1500); // La CPU inizia se è il suo turno
}

// Crea il mazzo di carte Uno
function createDeck() {
    deck = [];
    for (let color of colors) {
        deck.push({ color: color, value: '0' }); // Uno 0 per colore
        for (let i = 1; i <= 9; i++) {
            deck.push({ color: color, value: i.toString() }); // Due copie delle carte numero 1-9
            deck.push({ color: color, value: i.toString() });
        }
        for (let action of actions) {
            deck.push({ color: color, value: action }); // Due copie delle carte azione per colore
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
    if (deck.length === 0) {
        resetDeck(); // Se il mazzo è vuoto, lo si rimescola (tranne l'ultima giocata)
    }
    return deck.pop();
}

// Resetta il mazzo usando le carte scartate (tranne l'ultima giocata)
function resetDeck() {
    const lastCard = currentCard;
    let discardedCards = [];
    const gameContainer = document.getElementById('game-container');
    const playedCardElement = gameContainer.querySelector('.played-card');
    if (playedCardElement) {
        // Simula la raccolta delle carte giocate (escluse l'ultima)
        const tempDeck = [];
        // Ricrea il mazzo dalle mani dei giocatori (esclusa la carta corrente)
        players.forEach(hand => {
            hand.forEach(card => {
                if (!(card.color === lastCard.color && card.value === lastCard.value)) {
                    tempDeck.push(card);
                }
            });
        });
        deck = tempDeck;
        shuffleDeck();
        // Riassegna la carta corrente (potrebbe essere gestito diversamente)
        currentCard = { ...lastCard };
        updateGameDisplay(); // Aggiorna la visualizzazione
    } else {
        createDeck(); // Se non c'è carta giocata, ricrea il mazzo (inizio partita)
        shuffleDeck();
        dealCards(players.length);
        currentCard = drawCard();
        updateGameDisplay();
    }
}

// Controlla se una carta può essere giocata
function canPlayCard(card) {
    if (!currentCard) return true; // All'inizio del gioco

    return (
        card.color === currentCard.color ||
        card.value === currentCard.value ||
        card.color === 'wild'
    );
}

// Gestisci l'effetto di una carta azione
function handleActionCard(card) {
    if (card.value === '+2') {
        const nextPlayer = getNextPlayer();
        players[nextPlayer].push(drawCard());
        players[nextPlayer].push(drawCard());
        updateGameDisplay();
        alert(`${getPlayerName(nextPlayer)} pesca 2 carte!`);
        // Il turno passa dopo aver pescato
    } else if (card.value === 'skip') {
        currentPlayer = getNextPlayer(); // Salta il prossimo giocatore
        alert(`${getPlayerName(currentPlayer)} è stato saltato!`);
    } else if (card.value === 'reverse') {
        currentDirection *= -1; // Inverti la direzione di gioco
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
        return; // Non passare subito il turno, aspetta la scelta del colore
    } else if (card.value === 'wild') {
        choosingColor = true;
        cardBeingPlayed = card;
        updateColorChoiceDisplay();
        return; // Non passare subito il turno, aspetta la scelta del colore
    }
    // Se non è un +4 o un jolly, il turno passa normalmente
    switchTurn();
}

function chooseColor(color) {
    if (choosingColor && cardBeingPlayed) {
        currentCard.color = color;
        choosingColor = false;
        cardBeingPlayed = null;
        updateColorChoiceDisplay(); // Nascondi la scelta del colore
        updateGameDisplay();
        switchTurn();
    }
}

function switchTurn() {
    if (!gameOver) {
        currentPlayer = getNextPlayer();
        updateGameDisplay();
        if (currentPlayer === 1) setTimeout(cpuTurn, 1500);
    }
}

// Ottieni l'indice del prossimo giocatore
function getNextPlayer() {
    return (currentPlayer + currentDirection + players.length) % players.length;
}

// Ottieni il nome del giocatore
function getPlayerName(playerIndex) {
    return playerIndex === 0 ? 'Giocatore' : 'CPU';
}

// Il giocatore gioca una carta
function playCard(playerIndex, cardIndex) {
    if (gameOver || currentPlayer !== 0 || choosingColor) return;

    const card = players[playerIndex][cardIndex];
    if (canPlayCard(card)) {
        players[playerIndex].splice(cardIndex, 1); // Rimuove la carta dalla mano

        currentCard = { ...card }; // Aggiorna la carta corrente
        updateGameDisplay();
        checkWinCondition(playerIndex);
        if (!gameOver) {
            handleActionCard(card);
        }
    } else {
        alert("Non puoi giocare questa carta!");
    }
}

// Il giocatore pesca una carta e passa il turno
function drawAndPass() {
    if (gameOver || currentPlayer !== 0 || choosingColor) return;
    players[0].push(drawCard());
    updateGameDisplay();
    switchTurn();
}

// Il giocatore pesca una carta
function drawCardForPlayer() {
    if (gameOver || currentPlayer !== 0 || choosingColor) return;
    players[0].push(drawCard());
    updateGameDisplay();
}

// Turno della CPU
function cpuTurn() {
    if (gameOver || currentPlayer !== 1 || choosingColor) return;

    const cpuHand = players[1];
    let bestCardIndex = -1;

    // Priorità alle carte azione e jolly giocabili
    for (let i = 0; i < cpuHand.length; i++) {
        if (canPlayCard(cpuHand[i]) && (actions.includes(cpuHand[i].value) || wildActions.includes(cpuHand[i].value))) {
            bestCardIndex = i;
            break;
        }
    }

    // Se non ci sono azioni o jolly giocabili, cerca una carta normale giocabile
    if (bestCardIndex === -1) {
        bestCardIndex = cpuHand.findIndex(canPlayCard);
    }

    if (bestCardIndex !== -1) {
        const playedCard = cpuHand[bestCardIndex];
        players[1].splice(bestCardIndex, 1); // Rimuove la carta dalla mano

        currentCard = { ...playedCard }; // Aggiorna la carta corrente
        updateGameDisplay();
        checkWinCondition(1);
        if (!gameOver) {
            handleActionCard(playedCard);
        }
        // Se la CPU ha giocato un jolly, scegli il colore
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
            }, 1000); // Piccolo ritardo per mostrare la carta prima del cambio colore
            return; // Non passare subito il turno, aspetta la scelta del colore della CPU
        }
    } else {
        // CPU pesca una carta e passa
        players[1].push(drawCard());
        updateGameDisplay();
        switchTurn();
    }
}

// Controlla se un giocatore ha vinto
function checkWinCondition(playerIndex) {
    if (players[playerIndex].length === 0) {
        gameOver = true;
        alert(`${getPlayerName(playerIndex)} ha vinto!`);
    }
}

// Aggiorna la visualizzazione del gioco
function updateGameDisplay() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = ''; // Pulisci il contenitore

    // Mostra la carta attuale
    const currentCardDiv = document.createElement('div');
    currentCardDiv.classList.add('card', 'played-card');
    const currentCardImg = document.createElement('img');
    currentCardImg.src = `uno carte/${getCardImageName(currentCard)}`;
    currentCardImg.alt = `${currentCard.color} ${currentCard.value}`;
    currentCardDiv.appendChild(currentCardImg);
    gameContainer.appendChild(currentCardDiv);

    // Mostra le carte del giocatore
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

    // Controlli del giocatore (Pesca e Passa)
    const playerControlsDiv = document.createElement('div');
    playerControlsDiv.classList.add('player-controls');
    playerControlsDiv.style.display = 'flex';
    playerControlsDiv.style.gap = '10px';
    playerControlsDiv.style.marginTop = '10px';

    const drawCardButton = document.createElement('div');
    drawCardButton.classList.add('card', 'draw-card');
    drawCardButton.textContent = 'Pesca Carta';
    drawCardButton.onclick = drawCardForPlayer;
    playerControlsDiv.appendChild(drawCardButton);

    const passButton = document.createElement('div');
    passButton.classList.add('card', 'pass-button');
    passButton.textContent = 'Passa Turno';
    passButton.onclick = drawAndPass;
    playerControlsDiv.appendChild(passButton);

    gameContainer.appendChild(playerControlsDiv);

    // Mostra il numero di carte della CPU
    const cpuHandDiv = document.createElement('div');
    cpuHandDiv.classList.add('cpu-hand');
    cpuHandDiv.textContent = `CPU: ${players[1].length} carte`;
    gameContainer.appendChild(cpuHandDiv);

    // Mostra la scelta del colore se necessario (solo per il giocatore)
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
        colorChoiceDiv.style.display = 'flex'; // Mostra come flex per allineare i bottoni
        colorChoiceDiv.style.gap = '10px'; // Spazio tra i bottoni
        colorChoiceDiv.style.marginTop = '10px';

        colors.forEach(color => {
            const colorButton = document.createElement('button');
            colorButton.classList.add('color-button');
            colorButton.style.backgroundColor = color;
            colorButton.style.width = '60px'; // Pulsanti più grandi
            colorButton.style.height = '60px';
            colorButton.style.borderRadius = '50%';
            colorButton.style.cursor = 'pointer';
            colorButton.onclick = () => chooseColor(color);
            colorChoiceDiv.appendChild(colorButton);
        });
        gameContainer.appendChild(colorChoiceDiv);
    }
}

// Funzione per ottenere il nome del file immagine della carta
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

// Assicurati che il gioco inizi dopo il caricamento del DOM
window.onload = () => {
    initGame(2); // Giocatore vs CPU
};

