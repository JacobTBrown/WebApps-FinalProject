import * as Elements from './elements.js';
import * as Util from './util.js';
import {routePath} from '../controller/route.js';
import { currentUser } from '../controller/firebase_auth.js';
import { unauthorizedAccess } from './unauthorized_message.js';
import { BaseballGame } from '../model/baseball_game.js';
import { addBaseballGameHistory, getBaseballGameHistory} from '../controller/firestore_controller.js';
import { DEV } from '../model/constants.js';

export function addEventListeners() {
    Elements.menus.baseball.addEventListener('click', () => {
        history.pushState(null, null, routePath.BASEBALL);
        baseball_page();
    });
}

let gameModel;
let screen = { 
    gamekey: null,
    guess: null,
    guessCount: 0,
    guessHistory: null,
    buttons: null,
    newGameButton: null,
    historyButton: null,
    clearButton: null,
    statusMessage: null,
}

export async function baseball_page() {
    if (!currentUser) {
        Elements.root.innerHTML = unauthorizedAccess();
        return;
    }

    gameModel = new BaseballGame();
    gameModel.generateGamekey();

    let html;
    const response = await fetch('/viewpage/templates/baseball_page.html', {cache: 'no-store'});
    html = await response.text();
    Elements.root.innerHTML = html;

    getScreenElements();
    addGameEvents();
    updateScreen();
}

function addGameEvents() {
    for (let i = 0; i < 10; i++) {
        screen.buttons[i].addEventListener('click', buttonPressListener);
    }

    screen.newGameButton.addEventListener('click', () => {
        gameModel = new BaseballGame();
        gameModel.generateGamekey();
        for (let i = 0; i < 10; i++)
            screen.buttons[i].disabled = false;
        screen.statusMessage.innerHTML = `${gameModel.status}<br>`;
        updateScreen();
    });

    screen.historyButton.addEventListener('click', historyButtonEvent);
    screen.clearButton.addEventListener('click', () => {
        screen.statusMessage.innerHTML = '';
        updateScreen();
    });
}

async function buttonPressListener(event) {
    const buttonId = event.target.id;
    const pos = buttonId[buttonId.length-1];
    screen.buttons[pos].disabled = true;

    gameModel.setGuessKey(screen.buttons[pos].value);

    gameModel.isRoundOver();
    if (gameModel.roundOver != null) {
        gameModel.countBalls();
        gameModel.countStrikes();
        screen.guessCount++;

        gameModel.status = `[${screen.guessCount}] Guess: ${gameModel.guessKeys[0]}, ${gameModel.guessKeys[1]}, ${gameModel.guessKeys[2]}`
            + ` B#: ${gameModel.balls} S#: ${gameModel.strikes}`;
        screen.statusMessage.innerHTML += `${gameModel.status}<br>`;

        gameModel.isGameOver();
        if (gameModel.gameOver != null) {

            gameModel.status = `Struck out after ${screen.guessCount} ${screen.guessCount == 1 ? 'attempt' : 'attempts'}.`;
            screen.statusMessage.innerHTML += `${gameModel.status}<br>`;

            const gamePlay = {
                attempts: screen.guessCount,
                email: currentUser.email,
                timestamp: Date.now(),  
            }
            try {
                await addBaseballGameHistory(gamePlay);
                Util.info(`Game Over`, `Struck out after ${screen.guessCount} ${screen.guessCount == 1 ? 'attempt' : 'attempts'}.`);
            } catch (error) {
                Util.info('Game Over', `Failed to save the game play history: ${error}`);
                if (DEV) console.log('Game Over. Failed to save: ', error);
            }
            updateScreen();
            screen.guessCount = 0;
        } else {
            updateScreen();
            gameModel.resetAfterRound();
        }
    } else {
        gameModel.status = '';
        updateScreen();
    }
}

function getScreenElements() {
    screen.gamekey = document.getElementById('gamekey');
    // temporary setting
    screen.gamekey.innerHTML = gameModel.gamekey;
    screen.guess = document.getElementById('guess');
    screen.buttons = [];
    screen.guessHistory = [];
    screen.guessCount = 0;

    for (let i = 0; i < 10; i++) {
        screen.buttons.push(document.getElementById(`button-${i}`));
    }

    screen.newGameButton = document.getElementById('button-new-game');
    screen.historyButton = document.getElementById('button-history');
    screen.clearButton = document.getElementById('button-clear');
    screen.statusMessage = document.getElementById('status-message');
    screen.statusMessage.innerHTML = `${gameModel.status}<br>`;
}

function updateScreen() {
    screen.gamekey.innerHTML = gameModel.gamekey;

    screen.guess.innerHTML = `${gameModel.guessKeys[0] != null ? gameModel.guessKeys[0] : ''}, 
        ${gameModel.guessKeys[1] != null ? gameModel.guessKeys[1] : ''}, 
        ${gameModel.guessKeys[2] != null ? gameModel.guessKeys[2] : ''}`;

    screen.newGameButton.disabled = gameModel.gameOver == null;
    
    if (gameModel.roundOver != null) {
        for (let i = 0; i < 10; i++)
            screen.buttons[i].disabled = false;
        if (gameModel.gameOver != null) {
            for (let i = 0; i < 10; i++)
                screen.buttons[i].disabled = true;
        }
    }
}

async function historyButtonEvent() {
    let history;
    try {
        history = await getBaseballGameHistory(currentUser.email);
        let html = `
            <table class="table table-success table-striped">
            <tr><th>Attempts</th><th>Date</th></tr>
            <body>
        `;
        for (let i = 0; i < history.length; i++) {
            html += `
                <tr>
                    <td>
                        ${history[i].attempts}
                    </td>
                    <td>
                        ${new Date(history[i].timestamp).toLocaleString()}
                    </td>
                </tr>
            `;
        }
        html += '</body></table>';
        gameModel.status = html;
        screen.statusMessage.innerHTML = gameModel.status;
    } catch (error) {
        if (DEV) console.log('Error: history button', error);
        Util.info('Failed to get game history', JSON.stringify(error));
    }
}