import { getFirestore, collection, addDoc, query, where, orderBy, getDoc, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";
import { CommunityPost } from "../model/community_post.js";

import * as Constants from '../model/constants.js';

const db = getFirestore();
const TicTacToeGameCollection = 'tictactoe_game';
const BaseballCollection = 'baseball_game';
const CardCollection = 'card_game';

export async function addFeedHistory(post) {
    const docRef = await addDoc(collection(db, Constants.COLLECTION_NAMES.COMMUNITY_FEED), post);
    return docRef;
}

export async function updateFeedHistory(post) {
    const docRef = doc(db, "community_feed", post.docId);

    await updateDoc(docRef, { message: post.message, timestamp: post.timestamp });
}

export async function deleteFeedHistory(post) {
    const docRef = doc(db, "community_feed", post.docId);

    await deleteDoc(docRef);
}

export async function getFeedHistory() {
    let history = [];
    const q = query(
        collection(db, Constants.COLLECTION_NAMES.COMMUNITY_FEED),
        orderBy('timestamp', 'desc')
    );
    const snapShot = await getDocs(q);
    snapShot.forEach(doc => {
        const t = new CommunityPost(doc.data());
        t.set_docId(doc.id);
        history.push(t);
    });
    return history;
}

export async function addTicTacToeGameHistory(gamePlay) {
    await addDoc(collection(db, TicTacToeGameCollection), gamePlay);
}

export async function getTicTacToeGameHistory(email) {
    let history = [];
    const q = query(
        collection(db, TicTacToeGameCollection),
        where('email', '==', email),
        orderBy('timestamp', 'desc'),
    );
    const snapShot = await getDocs(q);
    snapShot.forEach(doc => {
        const {email, winner, moves, timestamp} = doc.data();
        history.push({email, winner, moves, timestamp});
    });
    return history;
}

export async function addBaseballGameHistory(gamePlay) {
    await addDoc(collection(db, BaseballCollection), gamePlay);
}

//subject to change for baseball stuffs
export async function getBaseballGameHistory(email) {
    let history = [];
    const q = query(
        collection(db, BaseballCollection),
        where('email', '==', email),
        orderBy('timestamp', 'desc'),
    );
    const snapShot = await getDocs(q);
    snapShot.forEach(doc => {
        const {attempts, email, timestamp} = doc.data();
        history.push({attempts, email, timestamp});
    });
    return history;
}