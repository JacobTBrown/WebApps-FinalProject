import * as Elements from './elements.js';
import * as Util from './util.js';
import * as CloudFunctions from '../controller/cloud_functions.js';
import { routePath } from '../controller/route.js';
import { currentUser } from '../controller/firebase_auth.js';
import { unauthorizedAccess } from './unauthorized_message.js';
import { CardGame, CardHolder } from '../model/card_game.js';
//import { addBaseballGameHistory, getBaseballGameHistory} from '../controller/firestore_controller.js';
import { DEV } from '../model/constants.js';

export function addEventListeners() {
    Elements.menus.cardgame.addEventListener('click', () => {
        history.pushState(null, null, routePath.CARDGAME);
        cardgame_page();
    });
}

let gameModel;
let screen = { 
    secret: null,
    balance: null,
    currentBets: null,
    debts: null,
    cardImages: null,
    betCountLabels: null,
    subtractButtons: null,
    addButtons: null,
    playGameButton: null,
    newGameButton: null,
    loadCoinsButton: null,
    historyButton: null,
    clearButton: null,
    statusMessage: null,
}

export async function cardgame_page() {
    if (!currentUser) {
        Elements.root.innerHTML = unauthorizedAccess();
        return;
    }

    gameModel = new CardGame();
    gameModel.setupGame();

    let html;
    const response = await fetch('/viewpage/templates/cardgame_page.html', {cache: 'no-store'});
    html = await response.text();
    Elements.root.innerHTML = html;

    let gameplayHistory;
    try {
        gameplayHistory = await CloudFunctions.getGameplayByEmail(currentUser.email);
    } catch (e) {
        if (DEV) console.log(e);
        Util.info('Cannot get gameplay history', JSON.stringify(e));
        return;
    }
    if (gameplayHistory != null && gameplayHistory.length != 0) {
        gameModel.balance = gameplayHistory[0].balance;
        gameModel.debts = gameplayHistory[0].debts;
    }

    getScreenElements();
    addGameEvents();
    updateScreen();
}

function getScreenElements() {
    screen.secret = document.getElementById('label-secret');
    screen.secret.innerHTML = `${gameModel.secret}`;
    screen.balance = document.getElementById('label-stats-balance');
    screen.currentBets = document.getElementById('label-stats-bets');
    screen.debts = document.getElementById('label-stats-debts');

    screen.cardImages = [];
    screen.betCountLabels = [];
    screen.subtractButtons = [];
    screen.addButtons = [];    

    for (let i = 0; i < 3; i++) {
        screen.cardImages.push(document.getElementById(`image-card${i}`));
        screen.betCountLabels.push(document.getElementById(`label-card${i}-bet`));
        screen.subtractButtons.push(document.getElementById(`button-card${i}-subtract`));
        screen.subtractButtons[i].disabled = true;
        screen.addButtons.push(document.getElementById(`button-card${i}-add`));
    }

    screen.playGameButton = document.getElementById('button-play-game');
    screen.playGameButton.disabled = true;
    screen.newGameButton = document.getElementById('button-new-game');
    screen.newGameButton.disabled = true;
    screen.loadCoinsButton = document.getElementById('button-load-coins');
    screen.historyButton = document.getElementById('button-history');
    screen.clearButton = document.getElementById('button-clear');
    screen.statusMessage = document.getElementById('status-message');
    screen.statusMessage.innerHTML = `${gameModel.status}<br>`;
}

function addGameEvents() {
    for (let i = 0; i < 3; i++) {
        screen.addButtons[i].addEventListener('click', addButtonListener);
        screen.subtractButtons[i].addEventListener('click', subtractButtonListener);
    }

    screen.playGameButton.addEventListener('click', () => {
        var coins
        if (gameModel.card_bets_count[0] > 0 || gameModel.card_bets_count[1] > 0 || gameModel.card_bets_count[2] > 0) {
            screen.currentBets.innerHTML = `${gameModel.bets}`;
            for (let i = 0; i < 3; i++) {
                if (gameModel.secret == i)
                    screen.cardImages[i].src = "/images/firebaseicon.png";
                else
                    screen.cardImages[i].src = "/images/redcardback.png"; 
                screen.subtractButtons[i].disabled = true;
                screen.addButtons[i].disabled = true;
            }
            screen.newGameButton.disabled = false;
            gameModel.roundOver = true;

            if (gameModel.card_bets_count[gameModel.secret] > 0) {
                coins = gameModel.card_bets_count[gameModel.secret];
                coins *= 3;
                gameModel.balance += coins;

                screen.statusMessage.innerHTML = `You won ${coins} coins by betting ${screen.currentBets.innerHTML} coins`;
            } else {
                coins = 0;
                screen.statusMessage.innerHTML = `You won ${coins} coins by betting ${screen.currentBets.innerHTML} coins`;
            }
        }

        const gameplayHistory = new CardHolder();
        gameplayHistory.balance = gameModel.balance;
        gameplayHistory.debts = gameModel.debts;
        gameplayHistory.bet = gameModel.bets;
        gameplayHistory.won = coins;
        gameplayHistory.loan = gameModel.loan;
        gameplayHistory.email = currentUser.email;
        console.log(currentUser.email);
        gameplayHistory.timestamp = Date.now();

        var history;
        try {
            history = CloudFunctions.addGameplayHistory(gameplayHistory.toFirestore());
        } catch (e) {
            if (DEV) console.log(e);
            Util.info('Add history failed', `${e.code}: ${e.name} - ${e.message}`);
        }
        
        screen.playGameButton.disabled = true;
        updateScreen();
    });
    screen.newGameButton.addEventListener('click', () => {
        var balance = gameModel.balance;
        var debts = gameModel.debts;
        gameModel = new CardGame();
        gameModel.setupGame();
        gameModel.balance = balance;
        gameModel.debts = debts;
        
        for (let i = 0; i < 3; i++) {
            screen.cardImages[i].src = "/images/cardback.png";
            screen.betCountLabels[i].innerHTML = `${gameModel.card_bets_count[i]}`;
            screen.addButtons[i].disabled = false;
        }
        
        screen.statusMessage.innerHTML = `${gameModel.status}<br>`;
        screen.secret.innerHTML = `${gameModel.secret}`;
        screen.newGameButton.disabled = true;
        updateScreen();
    });
    screen.loadCoinsButton.addEventListener('click', () => {
        if (gameModel.balance == 0) {
            gameModel.loanCoins();

            screen.debts.innerHTML = `${gameModel.debts}`;
            screen.balance.innerHTML = `${gameModel.balance}`;
        } else {
            Util.info("Loan", "You can only loan coins when balance is 0.");
        }
        updateScreen();
    });

    screen.historyButton.addEventListener('click', historyButtonEvent);
    screen.clearButton.addEventListener('click', () => {
        screen.statusMessage.innerHTML = '';
        updateScreen();
    });
}

async function addButtonListener(event) {
    const buttonId = event.target.id;
    const pos = buttonId[buttonId.length-5];

    if (gameModel.balance > 0) {
        gameModel.placeBet();
        gameModel.card_bets_count[pos]++;
    }

    screen.betCountLabels[pos].innerHTML = `${gameModel.card_bets_count[pos]}`;
    updateScreen();
}

async function subtractButtonListener(event) {
    const buttonId = event.target.id;
    const pos = buttonId[buttonId.length-10];

    if (gameModel.card_bets_count[pos] > 0 &&  gameModel.bets > 0) {
        gameModel.removeBet();
        gameModel.card_bets_count[pos]--;
    }

    if (gameModel.card_bets_count[pos] == 0)
        screen.subtractButtons[pos].disabled = true;

    screen.betCountLabels[pos].innerHTML = `${gameModel.card_bets_count[pos]}`;
    updateScreen();
}

function updateScreen() {
    if ((gameModel.card_bets_count[0] != 0 || gameModel.card_bets_count[1] != 0 || gameModel.card_bets_count[2] != 0) && !gameModel.roundOver) {
        screen.playGameButton.disabled = false;
    }
    if (gameModel.card_bets_count[0] == 0 && gameModel.card_bets_count[1] == 0 && gameModel.card_bets_count[2] == 0 && !gameModel.roundOver)
        screen.playGameButton.disabled = true;

    if (gameModel.card_bets_count[0] > 0 && !gameModel.roundOver)
        screen.subtractButtons[0].disabled = false;
    if (gameModel.card_bets_count[1] > 0 && !gameModel.roundOver)
        screen.subtractButtons[1].disabled = false;
    if (gameModel.card_bets_count[2] > 0 && !gameModel.roundOver)
        screen.subtractButtons[2].disabled = false;
    
    screen.currentBets.innerHTML = `${gameModel.bets}`;
    screen.balance.innerHTML = `${gameModel.balance}`;
    screen.debts.innerHTML = `${gameModel.debts}`;
}

async function historyButtonEvent() {
    let history;
    try {
        history = await CloudFunctions.getGameplayByEmail(currentUser.email);
        let html = `
            <table class="table table-success table-striped">
            <body>
        `;
        for (let i = 0; i < history.length; i++) {
            html += `
                <tr>
                    <td>
                        ${new Date(history[i].timestamp).toLocaleString()}
                        <br>
                        Balance = ${history[i].balance}
                        Debts = ${history[i].debts}
                        BET ${history[i].bet}, WON ${history[i].won} 
            `;
            if (history[i].loan == true) {
                html += ` : Borrowed 8 coins`;
            }
            html += `</td></tr>`;

            if (i == 9)
                return;
        }
        html += '</body></table>';
        gameModel.status = html;
        screen.statusMessage.innerHTML = gameModel.status;
    } catch (error) {
        if (DEV) console.log('Error: history button', error);
        Util.info('Failed to get game history', JSON.stringify(error));
    }
}