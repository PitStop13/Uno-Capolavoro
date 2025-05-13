
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
let plus2Stack = 0;
let plus4Stack = 0;

function initGame(numPlayers = 2) {
    deck = [];
    players = Array(numPlayers).fill(null).map(() => []);
    currentPlayer = 0;
    currentDirection = 1;
    gameOver = false;
    choosingColor = false;
    cardBeingPlayed = null;
    hasDrawnCard = false;
    plus2Stack = 0;
    plus4Stack = 0;
    
    createDeck();
    shuffleDeck();
    dealCards(numPlayers);
    
    // Pesca la prima carta
    do {
        currentCard = drawCard();
    } while (currentCard.color === 'wild' || wildActions.includes(currentCard.value));
    
    updateGameDisplay();
    
    if (currentPlayer !== 0) {
        setTimeout(cpuTurn, 1500);
    }
}

function createDeck() {
    // Carte numeriche
    for (let color of colors) {
        // Una carta 0 per colore
        deck.push({ color, value: '0' });
        
        // Due carte per ogni numero da 1 a 9
        for (let i = 1; i <= 9; i++) {
            deck.push({ color, value: i.toString() });
            deck.push({ color, value: i.toString() });
        }
        
        // Due carte per ogni azione (+2, skip, reverse)
        for (let action of actions) {
            deck.push({ color, value: action });
            deck.push({ color, value: action });
        }
    }
    
    // Carte speciali (wild e +4)
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'wild' });
        deck.push({ color: 'wild', value: '+4' });
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
            players[j].push(drawCard());
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
    const tempDeck = [];
    
    // Prendi tutte le carte tranne l'ultima giocata
    players.forEach(hand => {
        hand.forEach(card => {
            if (!(card.color === lastCard.color && card.value === lastCard.value)) {
                tempDeck.push(card);
            }
        });
    });
    
    deck = tempDeck;
    shuffleDeck();
}

function canPlayCard(card) {
    if (!currentCard) return true;
    
    // Se ci sono carte +2 o +4 in stack, si possono giocare solo quelle
    if (plus2Stack > 0 && card.value !== '+2') return false;
    if (plus4Stack > 0 && card.value !== '+4') return false;
    
    // Carte normali
    return card.color === 'wild' || 
           card.color === currentCard.color || 
           card.value === currentCard.value;
}

function playCard(playerIndex, cardIndex) {
    if (gameOver || currentPlayer !== playerIndex || choosingColor) return;
    
    const card = players[playerIndex][cardIndex];
    
    if (canPlayCard(card)) {
        players[playerIndex].splice(cardIndex, 1);
        currentCard = { ...card };
        updateGameDisplay();
        
        checkWinCondition(playerIndex);
        if (gameOver) return;
        
        handleActionCard(card);
    } else {
        alert("Non puoi giocare questa carta!");
    }
}

function handleActionCard(card) {
    if (card.color === 'wild') {
        if (card.value === '+4') {
            // Verifica che il giocatore non abbia carte del colore corrente
            if (currentCard.color !== 'wild' && players[currentPlayer].some(c => c.color === currentCard.color)) {
                alert("Hai una carta del colore corrente! Non puoi giocare +4");
                players[currentPlayer].push(card); // Rimetti la carta in mano
                currentCard = { color: currentCard.color, value: currentCard.value }; // Ripristina la carta precedente
                updateGameDisplay();
                return;
            }
            
            plus4Stack++;
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
    } else {
        switch (card.value) {
            case '+2':
                plus2Stack++;
                const nextPlayer = getNextPlayer();
                for (let i = 0; i < 2; i++) {
                    players[nextPlayer].push(drawCard());
                }
                alert(`${getPlayerName(nextPlayer)} pesca 2 carte!`);
                break;
            case 'skip':
                alert(`${getPlayerName(getNextPlayer())} salta il turno!`);
                break;
            case 'reverse':
                if (players.length === 2) {
                    alert(`${getPlayerName(getNextPlayer())} salta il turno!`);
                } else {
                    currentDirection *= -1;
                    alert("Direzione invertita!");
                }
                break;
        }
    }
    
    // Se non è una carta wild che richiede scelta colore, passa il turno
    if (!choosingColor) {
        switchTurn(card.value === 'skip' || card.value === 'reverse' || card.value === '+2');
    }
}

function chooseColor(color) {
    if (choosingColor && cardBeingPlayed) {
        // Crea una copia della carta originale per mantenerla
        const originalCard = { ...currentCard };
        choosingColor = false;
        
        if (cardBeingPlayed.value === '+4') {
            const nextPlayer = getNextPlayer();
            for (let i = 0; i < 4; i++) {
                players[nextPlayer].push(drawCard());
            }
            alert(`${getPlayerName(nextPlayer)} pesca 4 carte!`);
            plus4Stack = 0;
            
            // Aggiorna il display con la carta originale
            currentCard = originalCard;
            updateGameDisplay();
            
            // Poi passa il turno
            switchTurn(true);
        } else if (cardBeingPlayed.value === 'wild') {
            // Per le wild normali, manteniamo la carta originale
            currentCard = originalCard;
            updateGameDisplay();
            switchTurn();
        }
        
        cardBeingPlayed = null;
    }
}
function switchTurn(skip = false) {
    if (gameOver) return;
    
    hasDrawnCard = false;
    
    // Gestione degli stack +2/+4
    if (plus2Stack > 0) {
        plus2Stack--;
        if (plus2Stack === 0) {
            currentPlayer = (currentPlayer + currentDirection + players.length) % players.length;
        }
    } else if (plus4Stack > 0) {
        plus4Stack--;
        if (plus4Stack === 0) {
            currentPlayer = (currentPlayer + currentDirection + players.length) % players.length;
        }
    } else {
        currentPlayer = (currentPlayer + (skip ? currentDirection * 2 : currentDirection) + players.length) % players.length;
    }
    
    updateGameDisplay();
    
    // Se è il turno della CPU, attendi un po' prima di giocare
    if (currentPlayer !== 0 && !gameOver) {
        setTimeout(cpuTurn, 1500);
    }
}

function getNextPlayer() {
    return (currentPlayer + currentDirection + players.length) % players.length;
}
function getPlayerName(index) {
    return index === 0 ? 'Tu' : 'CPU';
}

function drawCardForPlayer() {
    if (gameOver || currentPlayer !== 0 || choosingColor || hasDrawnCard) return;
    
    const drawnCard = drawCard();
    players[0].push(drawnCard);
    hasDrawnCard = true;
    
    // Se la carta pescata è giocabile, chiedi se vuoi giocarla
    if (canPlayCard(drawnCard)) {
        if (confirm("Vuoi giocare la carta appena pescata?")) {
            const cardIndex = players[0].length - 1;
            playCard(0, cardIndex);
            return;
        }
    }
    
    updateGameDisplay();
}

function drawAndPass() {
    if (gameOver || currentPlayer !== 0 || choosingColor || !hasDrawnCard) return;
    
    // Se ci sono +2/+4 in stack, il giocatore deve pescare
    if (plus2Stack > 0) {
        for (let i = 0; i < plus2Stack * 2; i++) {
            players[0].push(drawCard());
        }
        alert(`Hai pescato ${plus2Stack * 2} carte!`);
        plus2Stack = 0;
    } else if (plus4Stack > 0) {
        for (let i = 0; i < plus4Stack * 4; i++) {
            players[0].push(drawCard());
        }
        alert(`Hai pescato ${plus4Stack * 4} carte!`);
        plus4Stack = 0;
    }
    
    switchTurn();
}

function cpuTurn() {
    if (gameOver || currentPlayer === 0 || choosingColor) return;
    
    const cpuIndex = currentPlayer;
    const hand = players[cpuIndex];
    
    // Trova tutte le carte giocabili
    const playableCards = hand.map((card, index) => ({ card, index })).filter(({ card }) => canPlayCard(card));
    
    if (playableCards.length > 0) {
        // Priorità: +4, +2, altre carte speciali, poi numeriche
        let cardToPlay;
        
        // Cerca +4
        cardToPlay = playableCards.find(({ card }) => card.value === '+4');
        if (!cardToPlay) {
            // Cerca +2
            cardToPlay = playableCards.find(({ card }) => card.value === '+2');
        }
        if (!cardToPlay) {
            // Cerca altre carte speciali
            cardToPlay = playableCards.find(({ card }) => actions.includes(card.value) || wildActions.includes(card.value));
        }
        if (!cardToPlay) {
            // Scegli una carta a caso tra quelle giocabili
            cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
        }
        
        const { card, index } = cardToPlay;
        players[cpuIndex].splice(index, 1);
        currentCard = { ...card };
        updateGameDisplay();
        
        checkWinCondition(cpuIndex);
        if (gameOver) return;
        
        if (card.color === 'wild') {
            setTimeout(() => {
                const colorCount = { red: 0, green: 0, blue: 0, yellow: 0 };
                hand.forEach(c => {
                    if (colors.includes(c.color)) {
                        colorCount[c.color]++;
                    }
                });
                
                let chosenColor = 'red';
                let maxCount = 0;
                for (const color in colorCount) {
                    if (colorCount[color] > maxCount) {
                        chosenColor = color;
                        maxCount = colorCount[color];
                    }
                }
                
                alert(`La CPU ha scelto il colore ${chosenColor}`);
                
                if (card.value === '+4') {
                    const nextPlayer = getNextPlayer();
                    for (let i = 0; i < 4; i++) {
                        players[nextPlayer].push(drawCard());
                    }
                    alert(`${getPlayerName(nextPlayer)} pesca 4 carte!`);
                    plus4Stack = 0;
                    switchTurn(true);
                } else {
                    switchTurn();
                }
                
                updateGameDisplay();
            }, 1000);
            return;
        }
        
        handleActionCard(card);
    } else {
        // Pesca una carta
        const drawnCard = drawCard();
        players[cpuIndex].push(drawnCard);
        updateGameDisplay();
        
        // Se può giocare la carta appena pescata, fallo
        if (canPlayCard(drawnCard)) {
            setTimeout(() => {
                const cardIndex = players[cpuIndex].length - 1;
                playCard(cpuIndex, cardIndex);
            }, 1000);
        } else {
            switchTurn();
        }
    }
}

function checkWinCondition(playerIndex) {
    if (players[playerIndex].length === 0) {
        gameOver = true;
        alert(`${getPlayerName(playerIndex)} ha vinto!`);
        updateGameDisplay();
    }
}

function updateGameDisplay() {
    const container = document.getElementById('game-container');
    container.innerHTML = '';
    
    // Mostra il turno corrente
    const turnInfo = document.createElement('h2');
    turnInfo.textContent = `Turno di ${getPlayerName(currentPlayer)}`;
    container.appendChild(turnInfo);
    
    // Mostra la carta corrente
    if (currentCard) {
        const currentCardDiv = document.createElement('div');
        currentCardDiv.className = 'card played-card';
        const cardImg = document.createElement('img');
        cardImg.src = `uno carte/${getCardImageName(currentCard)}`;
        cardImg.alt = `${currentCard.color} ${currentCard.value}`;
        currentCardDiv.appendChild(cardImg);
        container.appendChild(currentCardDiv);
    }
    
    // Mostra la mano del giocatore umano
    const handDiv = document.createElement('div');
    handDiv.className = 'player-hand';
    players[0].forEach((card, i) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        const img = document.createElement('img');
        img.src = `uno carte/${getCardImageName(card)}`;
        img.alt = `${card.color} ${card.value}`;
        img.onclick = () => playCard(0, i);
        cardDiv.appendChild(img);
        handDiv.appendChild(cardDiv);
    });
    container.appendChild(handDiv);
    
    // Pulsanti di controllo
    const controls = document.createElement('div');
    controls.className = 'player-controls';
    
    // Pulsante Pesca
    const drawBtn = document.createElement('div');
    drawBtn.className = 'card draw-card';
    const drawImg = document.createElement('img');
    drawImg.src = 'uno carte/VUOTO.png';
    drawImg.alt = 'Pesca Carta';
    drawImg.onclick = drawCardForPlayer;
    drawBtn.appendChild(drawImg);
    controls.appendChild(drawBtn);
    
    // Pulsante Passa
    const passBtn = document.createElement('button');
    passBtn.className = 'pass-button';
    passBtn.textContent = 'Passa';
    passBtn.disabled = !hasDrawnCard && plus2Stack === 0 && plus4Stack === 0;
    passBtn.onclick = drawAndPass;
    controls.appendChild(passBtn);
    
    container.appendChild(controls);
    
    // Mostra la mano della CPU (solo se esiste)
    if (players.length > 1) {
        const cpuHandDiv = document.createElement('div');
        cpuHandDiv.className = 'cpu-hand';
        cpuHandDiv.innerHTML = `<h3>CPU (${players[1].length} carte)</h3>`;
        
        const cardsContainer = document.createElement('div');
        cardsContainer.style.display = 'flex';
        cardsContainer.style.flexWrap = 'wrap';
        cardsContainer.style.justifyContent = 'center';
        cardsContainer.style.gap = '5px';
        
        // Mostra carte coperte per la CPU
        for (let j = 0; j < players[1].length; j++) {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            const img = document.createElement('img');
            img.src = 'uno carte/VUOTO.png';
            img.alt = 'Carta coperta';
            cardDiv.appendChild(img);
            cardsContainer.appendChild(cardDiv);
        }
        
        cpuHandDiv.appendChild(cardsContainer);
        container.appendChild(cpuHandDiv);
    }
    
    // Mostra la scelta del colore se necessario
    updateColorChoiceDisplay();
}

function updateColorChoiceDisplay() {
    const container = document.getElementById('game-container');
    const old = document.getElementById('color-choice');
    if (old) old.remove();
    
    if (choosingColor && currentPlayer === 0) {
        const choiceDiv = document.createElement('div');
        choiceDiv.id = 'color-choice';
        
        const title = document.createElement('p');
        title.textContent = 'Scegli un colore:';
        choiceDiv.appendChild(title);
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.display = 'flex';
        buttonsDiv.style.justifyContent = 'center';
        buttonsDiv.style.gap = '10px';
        
        colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'color-button';
            btn.style.backgroundColor = color;
            btn.onclick = () => chooseColor(color);
            buttonsDiv.appendChild(btn);
        });
        
        choiceDiv.appendChild(buttonsDiv);
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

// Avvia il gioco quando la pagina è caricata
window.onload = () => initGame(2);