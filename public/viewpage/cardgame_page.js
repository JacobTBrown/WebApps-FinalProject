import * as Elements from './elements.js';
import * as Util from './util.js';
import {routePath} from '../controller/route.js';
import { currentUser } from '../controller/firebase_auth.js';
import { unauthorizedAccess } from './unauthorized_message.js';
import { CardGame } from '../model/card_game.js';
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
     
}

export async function cardgame_page() {
    if (!currentUser) {
        Elements.root.innerHTML = unauthorizedAccess();
        return;
    }

    //gameModel = new CardGame();
    //gameModel.generateGamekey();

    let html;
    const response = await fetch('/viewpage/templates/cardgame_page.html', {cache: 'no-store'});
    html = await response.text();
    Elements.root.innerHTML = html;

    // getScreenElements();
    // addGameEvents();
    // updateScreen();
}

function addGameEvents() {
     
}

async function buttonPressListener(event) {
     
}

function getScreenElements() {
     
}

function updateScreen() {
     
}

async function historyButtonEvent() {
     
}