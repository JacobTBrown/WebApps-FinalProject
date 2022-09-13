import * as Auth from './controller/firebase_auth.js';
import * as About from './viewpage/about_page.js';
import * as TicTacToe from './viewpage/tictactoe_page.js';
import {routing} from './controller/route.js';

Auth.addEventListeners();
About.addEventListeners();
TicTacToe.addEventListeners();

window.onload = () => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    routing(pathname, hash);
};

window.addEventListener('popstate', e => {
    e.preventDefault();
    const pathname = e.target.location.pathname;
    const hash = e.target.location.hash;
    routing(pathname, hash);
});