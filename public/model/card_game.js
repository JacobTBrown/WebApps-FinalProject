export class CardHolder {
    constructor(data) {
        if (data) {
            this.balance = Number(data.balance);
            this.debts = Number(data.debts);
            this.bet = Number(data.bet);
            this.won = Number(data.won);
            this.loan = data.loan;
            this.email = data.email;
            this.timestamp = new Date(data.timestamp).toLocaleString();
        }
    }

    toFirestore() {
        return {
            balance: this.balance,
            debts: this.debts,
            bet: this.bet,
            won: this.won,
            loan: this.loan,
            email: this.email,
            timestamp: this.timestamp,
        }
    }
}

export class CardGame {
    constructor() {
        this.secret = null;
        this.balance = 8;
        this.bets = 0;
        this.debts = 0;
        this.roundOver = null;
        this.loan = null;

        this.card_bets_count = [];

        this.email = null;
        this.timestamp = null;

        this.status = 'Ready! Bet coins and press [Play]!';
    }

    setupGame() {
        var secretPosition = Math.floor(Math.random() * 3);
        this.secret = secretPosition;

        this.card_bets_count.push(0);
        this.card_bets_count.push(0);
        this.card_bets_count.push(0);
        this.roundOver = false;
        this.loan = false;
    }

    loanCoins() {
        this.debts += 8;
        this.balance += 8;
        this.loan = true;
    }

    placeBet() {
        this.balance--;
        this.bets++;
    }

    removeBet() {
        this.balance++;
        this.bets--;
    }
}