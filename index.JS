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

// Inizializza il gioco
function initGame(numPlayers) {
    createDeck();
    shuffleDeck();
    dealCards(numPlayers);
    currentCard = drawCard();
    // Assicurati che la prima carta non sia un jolly +4
    while (currentCard.color === 'wild' && currentCard.value === '+4') {
        deck.unshift(currentCard); // Rimetti la carta in cima al mazzo
        shuffleDeck();
        currentCard = drawCard();
    }
    updateGameDisplay();
    if (currentPlayer === 1) setTimeout(cpuTurn, 1000); // La CPU inizia se è il suo turno
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
        resetDeck(); // Se il mazzo è vuoto, lo si rimescola (tranne l'ultima carta giocata)
    }
    return deck.pop();
}

// Resetta il mazzo usando le carte scartate (tranne l'ultima giocata)
function resetDeck() {
    const lastCard = currentCard;
    deck = [];
    const gameContainer = document.getElementById('game-container');
    const discardedCards = gameContainer.querySelectorAll('.played-card');
    discardedCards.forEach(cardDiv => {
        const color = cardDiv.dataset.color;
        const value = cardDiv.dataset.value;
        if (color && value && !(color === lastCard.color && value === lastCard.value)) {
            deck.push({ color: color, value: value });
        }
    });
    shuffleDeck();
    // La carta corrente rimane sul tavolo
}

// Controlla se una carta può essere giocata
function canPlayCard(card) {
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
        alert(`${getPlayerName(nextPlayer)} pesca 2 carte!`);
    } else if (card.value === 'skip') {
        currentPlayer = getNextPlayer(); // Salta il prossimo giocatore
        alert(`${getPlayerName(currentPlayer)} è stato saltato!`);
    } else if (card.value === 'reverse') {
        currentDirection *= -1; // Inverti la direzione di gioco
        alert('La direzione di gioco è stata invertita!');
    } else if (card.value === '+4') {
        const nextPlayer = getNextPlayer();
        players[nextPlayer].push(drawCard());
        players[nextPlayer].push(drawCard());
        players[nextPlayer].push(drawCard());
        players[nextPlayer].push(drawCard());
        alert(`${getPlayerName(nextPlayer)} pesca 4 carte!`);
        // Chi ha giocato il +4 sceglie il colore
        if (currentPlayer === 0) {
            const chosenColor = prompt("Scegli un colore (red, green, blue, yellow):").toLowerCase();
            if (colors.includes(chosenColor)) {
                currentCard.color = chosenColor;
            } else {
                alert("Colore non valido, verrà scelto rosso.");
                currentCard.color = 'red';
            }
        } else {
            // Logica CPU per scegliere il colore (potrebbe essere migliorata)
            const colorCounts = {};
            players[currentPlayer].forEach(c => {
                if (c.color !== 'wild') {
                    colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
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
            alert(`La CPU ha scelto il colore ${bestColor}.`);
        }
    } else if (card.value === 'wild') {
        // Chi ha giocato il jolly sceglie il colore
        if (currentPlayer === 0) {
            const chosenColor = prompt("Scegli un colore (red, green, blue, yellow):").toLowerCase();
            if (colors.includes(chosenColor)) {
                currentCard.color = chosenColor;
            } else {
                alert("Colore non valido, verrà scelto rosso.");
                currentCard.color = 'red';
            }
        } else {
            // Logica CPU per scegliere il colore (potrebbe essere migliorata)
            const colorCounts = {};
            players[currentPlayer].forEach(c => {
                if (c.color !== 'wild') {
                    colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
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
            alert(`La CPU ha scelto il colore ${bestColor}.`);
        }
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
    if (gameOver || currentPlayer !== 0) return;

    const card = players[playerIndex][cardIndex];
    if (canPlayCard(card)) {
        players[playerIndex].splice(cardIndex, 1); // Rimuove la carta dalla mano
        const playedCardElement = document.createElement('div');
        playedCardElement.classList.add('card', 'played-card');
        const playedCardImg = document.createElement('img');
        playedCardImg.src = `uno carte/${getCardImageName(card)}`;
        playedCardImg.alt = `${card.color} ${card.value}`;
        playedCardElement.appendChild(playedCardImg);
        playedCardElement.dataset.color = card.color;
        playedCardElement.dataset.value = card.value;

        const currentCardDisplay = document.querySelector('#game-container > .card:first-child');
        if (currentCardDisplay) {
            currentCardDisplay.remove();
        }
        document.getElementById('game-container').prepend(playedCardElement);

        currentCard = { ...card }; // Aggiorna la carta corrente

        checkWinCondition(playerIndex);
        if (!gameOver) {
            handleActionCard(card);
            currentPlayer = getNextPlayer();
            updateGameDisplay();
            if (currentPlayer === 1 && !gameOver) {
                setTimeout(cpuTurn, 1000); // Ritardo per il turno della CPU
            }
        }
    } else {
        alert("Non puoi giocare questa carta!");
    }
}

// Il giocatore pesca una carta
function drawCardForPlayer() {
    if (gameOver || currentPlayer !== 0) return;

    players[0].push(drawCard()); // Il giocatore pesca una carta
    currentPlayer = getNextPlayer(); // Passa il turno
    updateGameDisplay();
    if (currentPlayer === 1 && !gameOver) {
        setTimeout(cpuTurn, 1000); // Ritardo per il turno della CPU
    }
}

// Turno della CPU
function cpuTurn() {
    if (gameOver || currentPlayer !== 1) return;

    const cpuHand = players[1];
    let bestCardIndex = -1;

    // Priorità alle carte azione e jolly
    for (let i = 0; i < cpuHand.length; i++) {
        if (canPlayCard(cpuHand[i]) && (actions.includes(cpuHand[i].value) || wildActions.includes(cpuHand[i].value))) {
            bestCardIndex = i;
            break;
        }
    }

    // Se non ci sono azioni o jolly giocabili, cerca una carta normale
    if (bestCardIndex === -1) {
        bestCardIndex = cpuHand.findIndex(canPlayCard);
    }

    if (bestCardIndex !== -1) {
        const playedCard = cpuHand[bestCardIndex];
        players[1].splice(bestCardIndex, 1); // Rimuove la carta dalla mano

        const playedCardElement = document.createElement('div');
        playedCardElement.classList.add('card', 'played-card');
        const playedCardImg = document.createElement('img');
        playedCardImg.src = `uno carte/${getCardImageName(playedCard)}`;
        playedCardImg.alt = `${playedCard.color} ${playedCard.value}`;
        playedCardElement.appendChild(playedCardImg);
        playedCardElement.dataset.color = playedCard.color;
        playedCardElement.dataset.value = playedCard.value;

        const currentCardDisplay = document.querySelector('#game-container > .card:first-child');
        if (currentCardDisplay) {
            currentCardDisplay.remove();
        }
        document.getElementById('game-container').prepend(playedCardElement);

        currentCard = { ...playedCard }; // Aggiorna la carta corrente

        checkWinCondition(1);
        if (!gameOver) {
            handleActionCard(playedCard);
            currentPlayer = getNextPlayer();
            updateGameDisplay();
            if (currentPlayer === 1 && !gameOver) {
                setTimeout(cpuTurn, 1000);
            }
        }
    } else {
        // CPU pesca una carta
        players[1].push(drawCard());
        currentPlayer = getNextPlayer();
        updateGameDisplay();
        if (currentPlayer === 1 && !gameOver) {
            setTimeout(cpuTurn, 1000);
        }
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
    // Pulisci solo le carte del giocatore e il numero di carte della CPU
    const playerDiv = document.querySelector('.player-hand');
    if (playerDiv) {
        playerDiv.remove();
    }
    const cpuDiv = document.querySelector('.cpu-hand');
    if (cpuDiv) {
        cpuDiv.remove();
    }

    // Mostra le carte del giocatore
    const newPlayerDiv = document.createElement('div');
    newPlayerDiv.classList.add('player-hand');
    newPlayerDiv.textContent = 'Le tue carte:';
    players[0].forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        const cardImg = document.createElement('img');
        cardImg.src = `uno carte/${getCardImageName(card)}`;
        cardImg.alt = `${card.color} ${card.value}`;
        cardImg.onclick = () => playCard(0, index); // Aggiunge l'evento di click
        cardDiv.appendChild(cardImg);
        newPlayerDiv.appendChild(cardDiv);
    });
    gameContainer.appendChild(newPlayerDiv);

    // Carta per pescare una carta
    const drawCardDiv = document.querySelector('.draw-card');
    if (!drawCardDiv) {
        const newDrawCardDiv = document.createElement('div');
        newDrawCardDiv.classList.add('card', 'draw-card');
        const drawCardImg = document.createElement('img');
        drawCardImg.src = `uno carte/VUOTO.png`; // Immagine della carta per pescare
        drawCardImg.alt = "Pesca una carta";
        drawCardImg.onclick = drawCardForPlayer; // Evento per pescare la carta
        newDrawCardDiv.appendChild(drawCardImg);
        gameContainer.appendChild(newDrawCardDiv);
    }

    // Mostra il numero di carte della CPU (nascoste)
    const newCpuDiv = document.createElement('div');
    newCpuDiv.classList.add('cpu-hand');
    newCpuDiv.textContent = `Carte CPU: ${players[1].length}`;
    gameContainer.appendChild(newCpuDiv);
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