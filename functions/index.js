const functions = require("firebase-functions");

const Constants = require('./constants.js');
const { ref } = require("firebase-functions/v1/database");

var admin = require("firebase-admin");
var serviceAccount = require("./account_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
exports.cfn_addGameplayHistory = functions.https.onCall(addGameplayHistory);
async function addGameplayHistory(data, context) {
    try {
        await admin.firestore().collection(Constants.COLLECTION_NAMES.GAMEPLAY).add(data);
        return ref.id;
    } catch (e) {
        if (Constants.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', `add gameplay failed ${JSON.stringify(e)}`);
    }
}

exports.cfn_getGameplayByEmail = functions.https.onCall(getGameplayByEmail);
async function getGameplayByEmail(email, context) {
    try {
        let history = [];
        const snapshot = await admin.firestore().collection(Constants.COLLECTION_NAMES.GAMEPLAY).where('email', '==', email).orderBy('timestamp', "desc").get();
        snapshot.forEach(doc => {
            const {balance, debts, bet, won, email, loan, timestamp} = doc.data();
            const p = {balance, debts, bet, won, email, loan, timestamp};
            p.docId = doc.id;
            history.push(p);
        });
        return history;
    } catch (e) {
        if (Constants.DEV) console.log(e);
        throw new functions.https.HttpsError('internal', `getGameplayByEmail failed: ${JSON.stringify(e)}`);
    }
}