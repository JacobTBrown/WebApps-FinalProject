import * as Elements from './elements.js';
import * as Util from '../viewpage/util.js';
import {routePath} from '../controller/route.js';
import { currentUser } from '../controller/firebase_auth.js';
import { unauthorizedAccess } from './unauthorized_message.js';
import { TicTacToeGame, marking } from '../model/tictactoe_game.js';
import {addTicTacToeGameHistory, getTicTacToeGameHistory} from '../controller/firestore_controller.js';
import { DEV } from '../model/constants.js';

export function addEventListeners() {
    Elements.menus.tictactoe.addEventListener('click', () => {
        history.pushState(null, null, routePath.TICTACTOE);
        tictactoe_page();
    });
}

let gameModel;
let screen = { 
    turn: null,
    moves: null,
    buttons: null,
    images: null,
    newGameButton: null,
    historyButton: null,
    clearButton: null,
    statusMessage: null,
}

const imageSource = {
    X: '/images/X.png',
    O: '/images/O.png',
    U: '/images/U.png',
};

export async function tictactoe_page() {
    if (!currentUser) {
        Elements.root.innerHTML = unauthorizedAccess();
        return;
    }

    gameModel = new TicTacToeGame();

    let html;
    const response = await fetch('/viewpage/templates/tictactoe_page.html', {cache: 'no-store'});
    html = await response.text();
    Elements.root.innerHTML = html;

    getScreenElements();
    addGameEvents();
    updateScreen();
}

function addGameEvents() {
    for (let i = 0; i < 9; i++) {
        screen.buttons[i].addEventListener('click', buttonPressListener);
    }

    screen.newGameButton.addEventListener('click', () => {
        gameModel = new TicTacToeGame();
        updateScreen();
    });

    screen.historyButton.addEventListener('click', historyButtonEvent);
    screen.clearButton.addEventListener('click', () => {
        gameModel.status = '';
        updateScreen();
    });
}

async function buttonPressListener(event) {
    const buttonId = event.target.id;
    const pos = buttonId[buttonId.length-1];
    gameModel.board[pos] = gameModel.turn;
    gameModel.toggleTurns();
    gameModel.moves++;

    gameModel.setWinner();
    if (gameModel.winner != null) {
        if (gameModel.winner == marking.U) {
            gameModel.status = 'Game Over: DRAW';
        } else {
            gameModel.status = `Game Over - Winner: ${marking[gameModel.winner]} with ${gameModel.moves} moves.`;
        }
        updateScreen();
        const gamePlay = {
            email: currentUser.email,
            winner: gameModel.winner,
            moves: gameModel.moves,
            timestamp: Date.now(),  
        }
        try {
            await addTicTacToeGameHistory(gamePlay);
            Util.info('Game Over', gameModel.status);
        } catch (error) {
            Util.info('Game Over', `Failed to save the game play history: ${error}`);
            if (DEV) console.log('Game Over. Failed to save: ', error);
        }

        Util.info('Game Over', gameModel.status);
    } else {
        updateScreen();
    }
}

function getScreenElements() {
    screen.turn = document.getElementById('turn');
    screen.moves = document.getElementById('moves');
    screen.buttons = [];
    screen.images = [];

    for (let i = 0; i < 9; i++) {
        screen.buttons.push(document.getElementById(`button-${i}`));
        screen.images.push(document.getElementById(`image-${i}`));   
    }

    screen.newGameButton = document.getElementById('button-new-game');
    screen.historyButton = document.getElementById('button-history');
    screen.clearButton = document.getElementById('button-clear');
    screen.statusMessage = document.getElementById('status-message');
}

function updateScreen() {

    screen.turn.src = imageSource[gameModel.turn];
    screen.moves.innerHTML = gameModel.moves;

    for (let i = 0; i < 9; i++) {
        screen.images[i].src = imageSource[gameModel.board[i]];
        screen.buttons[i].disabled = gameModel.board[i] != marking.U || gameModel.winner != null;
    }

    screen.newGameButton.disabled = gameModel.winner == null;
    screen.statusMessage.innerHTML = gameModel.status;
}

async function historyButtonEvent() {
    let history;
    try {
        history = await getTicTacToeGameHistory(currentUser.email);
        let html = `
            <table class="table table-success table-striped">
            <tr><th>Winner</th><th>Moves</th><th>Date</th></tr>
            <body>
        `;
        for (let i = 0; i < history.length; i++) {
            html += `
                <tr>
                    <td>
                        ${history[i].winner == marking.U ? 'Draw' : history[i].winner}
                    </td>
                    <td>
                        ${history[i].moves}
                    </td>
                    <td>
                        ${new Date(history[i].timestamp).toLocaleString()}
                    </td>
                </tr>
            `;
        }
        html += '</body></table>';
        gameModel.status = html;
        updateScreen();
    } catch (error) {
        if (DEV) console.log('Error: history button', error);
        Util.info('Failed to get game history', JSON.stringify(error));
    }
}