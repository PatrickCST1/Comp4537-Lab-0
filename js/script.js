//Copilot was used for rectangle randomization logic

import { STRINGS } from "../lang/messages/en/user.js";

class Rectangle {
    constructor(color, x, y, value, scrambled = false) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.value = value;
        this.scrambled = scrambled;
        this.clickable = false;
        this.callback = null;

        this.el = document.createElement("div");
        this.el.classList.add("rectangle");

        this.el.dataset.x = x;
        this.el.dataset.y = y;
        this.el.dataset.color = color;

        this.el.style.setProperty("--rect-x", x + "px");
        this.el.style.setProperty("--rect-y", y + "px");
        this.el.style.setProperty("--rect-color", color);

        this.el.id = `rectangle-${this.value}`;

        this.onClick = this.onClick.bind(this);
        this.el.addEventListener("click", this.onClick);


        this.updateDisplay();
    }

    onClick() {
        if (this.clickable == true && this.callback != null) {
            this.callback(this.value);
            this.clickable = false;
        }
    }

    toggleClickable(isClickable) {
        this.clickable = isClickable;
    }

    setCallback(callback) {
        this.callback = callback;
    }

    updateDisplay() {
        if (this.scrambled) {
            this.el.classList.add("scrambled");
            this.el.textContent = "";
        } else {
            this.el.classList.remove("scrambled");
            this.el.textContent = this.value;
        }
    }

    setScrambled(isScrambled) {
        this.scrambled = isScrambled;
        this.updateDisplay();
    }

    attachTo(container) {
        container.appendChild(this.el);
    }

    randomizePosition(clientWidth, clientHeight) {
        const rectWidth = this.el.offsetWidth;
        const rectHeight = this.el.offsetHeight;
        console.log(this.el.offsetWidth)

        const maxX = clientWidth - rectWidth;
        const maxY = clientHeight - rectHeight;
        
        const newX = Math.floor(Math.random() * maxX);
        const newY = Math.floor(Math.random() * maxY);

        this.x = newX;
        this.y = newY;

        this.el.dataset.x = newX;
        this.el.dataset.y = newY;

        this.el.style.setProperty("--rect-x", newX + "px");
        this.el.style.setProperty("--rect-y", newY + "px");
    }

    static getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    }

    static getRectArray(n) {
        const rects = [];
        const gameArea = document.getElementById("gameArea");

        gameArea.classList.remove("hidden");

        const areaWidth = gameArea.clientWidth;
        const areaHeight = gameArea.clientHeight;

        for (let i = 1; i <= n; i++) {
            const temp = new Rectangle("black", 0, 0, i, true);
            temp.el.classList.add("absolute");
            gameArea.appendChild(temp.el);


            const rectWidth = temp.el.offsetWidth;
            const rectHeight = temp.el.offsetHeight;

            gameArea.removeChild(temp.el);

            const maxX = areaWidth - rectWidth;
            const maxY = areaHeight - rectHeight;

            const x = Math.floor(Math.random() * maxX);
            const y = Math.floor(Math.random() * maxY);

            const color = Rectangle.getRandomColor();
            const rect = new Rectangle(color, x, y, i, true);

            rects.push(rect);
        }

        return rects;
    }
}


class UserInterface {
    constructor() {
        this.messageDiv = document.getElementById("message");
        this.setHTMLText();
    }

    setMessage(message) {
        this.messageDiv.textContent = message;
    }

    clearMessage() {
        this.messageDiv.textContent = "";
    }

    setHTMLText() {
        document.getElementById("tabTitle").textContent = STRINGS.APP_TITLE;
        document.getElementById("gameTitle").textContent = STRINGS.GAME_TITLE;
        document.getElementById("countInputLabel").textContent = STRINGS.INPUT_LABEL_TEXT;
        document.getElementById("startBtn").textContent = STRINGS.START_BUTTON_TEXT;
    }
}


class GameEngine {
    constructor () {
        this.rectangles = [];
        this.rectangleCount = 0;
        this.userInterface = new UserInterface();
        this.nextRectangle = 1;
    }

    selectRectangle(rectangleValue) {
        if (rectangleValue == this.nextRectangle) {
            const rect = this.rectangles[rectangleValue - 1];

            rect.setScrambled(false);
            rect.toggleClickable(false);

            rect.el.classList.remove("absolute");
            rect.el.style.removeProperty("--rect-x");
            rect.el.style.removeProperty("--rect-y");

            document.getElementById(`rectangle-${rectangleValue}`)?.remove();
            document.getElementById("orderedRow").append(rect.el);
            document.getElementById("orderedRow").classList.remove("hidden");

            this.nextRectangle++;

        } else {
            document.getElementById("gameArea").innerHTML = "";
            document.getElementById("orderedRow").innerHTML = "";
            this.rectangles.forEach((rect)=>{
                rect.setScrambled(false);
                rect.toggleClickable(false);

                rect.el.classList.remove("absolute");
                rect.el.style.removeProperty("--rect-x");
                rect.el.style.removeProperty("--rect-y");

                document.getElementById(`rectangle-${rect.value}`)?.remove();
                document.getElementById("orderedRow").append(rect.el);
                document.getElementById("orderedRow").classList.remove("hidden");
            })
            this.userInterface.setMessage(STRINGS.WRONG_ORDER);
        }

        if (this.nextRectangle > this.rectangleCount) {
            this.userInterface.setMessage(STRINGS.EXCELLENT_MEMORY);
        }
    }

    displayRectangles() {
        const orderedRow = document.getElementById("orderedRow");
        orderedRow.innerHTML = "";

        this.rectangles.forEach(rect => {
            rect.setScrambled(false);
            rect.el.classList.remove("absolute");
            rect.el.classList.add("static");
            orderedRow.appendChild(rect.el);
        });
    }

    initializeGame () {
        document.getElementById("orderedRow").innerHTML = "";
        document.getElementById("gameArea").innerHTML = "";
        this.nextRectangle = 1;
        
        let input = document.getElementById("countInput");
        this.rectangleCount = input.value;

        if (isNaN(this.rectangleCount) || this.rectangleCount < 3 || this.rectangleCount > 7) {
            this.userInterface.setMessage(STRINGS.INPUT_LABEL);
            return;
        }

        this.rectangles = Rectangle.getRectArray(this.rectangleCount);

        this.userInterface.setMessage(STRINGS.MEMORIZATION_START + this.rectangleCount + STRINGS.MEMORIZATION_END);
        this.displayRectangles();

        setTimeout(() => {
            this.runGame();
        }, this.rectangleCount * 1000);
    }



    async runGame() {
        const rounds = this.rectangleCount;
        this.userInterface.setMessage(STRINGS.SHUFFLING);

        for (let i = 0; i < rounds; i++) {
            this.scrambleRectangles();

            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        this.rectangles.forEach(rect => {
            rect.setCallback(this.selectRectangle.bind(this));
            rect.toggleClickable(true);
        });

        this.userInterface.setMessage(STRINGS.GOOD_LUCK);
    }


    scrambleRectangles() {
        const orderedRow = document.getElementById("orderedRow");
        const gameArea = document.getElementById("gameArea");

        orderedRow.innerHTML = "";
        orderedRow.classList.add("hidden");
        gameArea.classList.remove("hidden");
        gameArea.innerHTML = "";

        gameArea.classList.remove("hidden");
        gameArea.innerHTML= "";


        const areaWidth = gameArea.clientWidth;
        const areaHeight = gameArea.clientHeight;

        this.rectangles.forEach(rect => {
            rect.setScrambled(true);
            rect.el.classList.remove("static");
            rect.el.classList.add("absolute");
            gameArea.appendChild(rect.el);

            rect.randomizePosition(areaWidth, areaHeight);
        });
    }
}


function main() {
    let gameEngine = new GameEngine();
    document.getElementById("startBtn").addEventListener("click", () => gameEngine.initializeGame());

}

main();