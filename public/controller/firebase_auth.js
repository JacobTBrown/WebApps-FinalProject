import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

import * as Elements from '../viewpage/elements.js';
import * as Constants from '../model/constants.js';
import * as Util from '../viewpage/util.js';
import { routing } from './route.js';
import { welcome_page } from '../viewpage/welcome_page.js';

const auth = getAuth();

export let currentUser = null;

export function addEventListeners() {
    Elements.formSignin.addEventListener('submit', async e => {
        e.preventDefault(); // keeps from refreshing the current page
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            Elements.modalSignin.hide();
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            Util.info('Sign In Error', JSON.stringify(error), Elements.modalSignin);
            if (Constants.DEV)
                console.log('sign in error: ' + JSON.stringify(error));
        }
    });

    Elements.menus.signOut.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            Util.info('Sign In Error', JSON.stringify(error), Elements.modalSignin);
            if (Constants.DEV)
                console.log('sign in error: ' + JSON.stringify(error));
        }
    });

    onAuthStateChanged(auth, authStateChangedObserver);
}

async function authStateChangedObserver(user) {
    currentUser = user;
    if (user) {
        for (let i = 0; i < Elements.modalpreauthElements.length; i++) {
            Elements.modalpreauthElements[i].style.display = 'none';
        }
        for (let i = 0; i < Elements.modalpostauthElements.length; i++) {
            Elements.modalpostauthElements[i].style.display = 'block';
        }
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        routing(pathname, hash);
    } else {
        for (let i = 0; i < Elements.modalpreauthElements.length; i++) {
            Elements.modalpreauthElements[i].style.display = 'block';
        }
        for (let i = 0; i < Elements.modalpostauthElements.length; i++) {
            Elements.modalpostauthElements[i].style.display = 'none';
        }
        Elements.root.innerHTML = await welcome_page();
    }
}