import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-functions.js";
import { CardGame, CardHolder } from "../model/card_game.js";

const functions = getFunctions();

const cfn_addGameplayHistory = httpsCallable(functions, 'cfn_addGameplayHistory');
export async function addGameplayHistory(product) {
    const result = await cfn_addGameplayHistory(product);
    return result.data;
}

const cfn_getGameplayByEmail = httpsCallable(functions, 'cfn_getGameplayByEmail');
export async function getGameplayByEmail(email) {
    const gameplay = [];
    const result = await cfn_getGameplayByEmail(email);
    if (result.data != null) {
        result.data.forEach(element => {
            const p = new CardHolder(element);
            gameplay.push(p);
        });
    }
    
    return gameplay;
}