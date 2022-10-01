export class BaseballGame {
    constructor() {
        this.gamekey = null;
        this.keys = [];
        this.firstKey = null;
        this.secondKey = null;
        this.thirdKey = null;

        this.guess = null;
        this.guessKeys = [];
        this.firstGuess = null;
        this.secondGuess = null;
        this.thirdGuess = null;

        this.count = 0;
        this.balls = 0;
        this.strikes = 0;
        
        this.roundOver = null;
        this.gameOver = null;

        this.status = 'Ready to Play';
    }
    
    generateGamekey() {
        var firstKey = Math.floor(Math.random() * 9);
        var secondKey = Math.floor(Math.random() * 9);
        while (secondKey == firstKey) {
            secondKey = Math.floor(Math.random() * 9);
        }
        var thirdKey = Math.floor(Math.random() * 9);
        while (thirdKey == firstKey || thirdKey == secondKey) {
            thirdKey = Math.floor(Math.random() * 9);
        }

        this.keys.push(firstKey);
        this.keys.push(secondKey);
        this.keys.push(thirdKey);

        this.gamekey = this.keys[0] + ", " + this.keys[1] + ", " + this.keys[2];
    }

    setGuessKey(n) {
        this.guessKeys.push(n);
        this.count++;
    }

    resetAfterRound() {
        this.guess = null;
        this.guessKeys = [];
        this.firstGuess = null;
        this.secondGuess = null;
        this.thirdGuess = null;

        this.count = 0;
        this.balls = 0;
        this.strikes = 0;
        
        this.roundOver = null;
    }

    countBalls() {
        if (this.keys[0] == this.guessKeys[1] || this.keys[0] == this.guessKeys[2])
            this.balls++;
        if (this.keys[1] == this.guessKeys[0] || this.keys[1] == this.guessKeys[2])
            this.balls++;
        if (this.keys[2] == this.guessKeys[0] || this.keys[2] == this.guessKeys[1])
            this.balls++;
        
        return this.balls;
    }

    countStrikes() {
        if (this.keys[0] == this.guessKeys[0])
            this.strikes++;
        if (this.keys[1] == this.guessKeys[1])
            this.strikes++;
        if (this.keys[2] == this.guessKeys[2])
            this.strikes++;
        
        return this.strikes;
    }

    isRoundOver() {
        if (this.count == 3) {
            this.roundOver = true;
            return;
        }
        else 
            this.roundOver = null;
    }

    isGameOver() {
        if (this.strikes == 3) 
            this.gameOver = true;
        else
            this.gameOver = null;
    }
}