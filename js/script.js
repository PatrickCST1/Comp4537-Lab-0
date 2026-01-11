class Rectangle {
    constructor(color, x, y, value, scrambled = false) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.value = value;
        this.scrambled = scrambled;

        this.el = document.createElement("div");
        this.el.classList.add("rectangle");

        // Store dynamic values as data attributes
        this.el.dataset.x = x;
        this.el.dataset.y = y;
        this.el.dataset.color = color;

        this.el.style.setProperty("--rect-x", x + "px");
        this.el.style.setProperty("--rect-y", y + "px");
        this.el.style.setProperty("--rect-color", color);

        this.updateDisplay();
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
}



function getRectArray(n) {
    const rects = [];
    const gameArea = document.getElementById("gameArea");

    // Ensure gameArea is visible so clientWidth/Height are valid
    gameArea.classList.remove("hidden");

    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;

    for (let i = 1; i <= n; i++) {
        // Create a temporary rectangle to measure size
        const temp = new Rectangle("black", 0, 0, i, true);
        gameArea.appendChild(temp.el);

        const rectWidth = temp.el.offsetWidth;
        const rectHeight = temp.el.offsetHeight;

        // Remove temp element
        gameArea.removeChild(temp.el);

        const maxX = areaWidth - rectWidth;
        const maxY = areaHeight - rectHeight;

        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);

        const color = getRandomColor();
        const rect = new Rectangle(color, x, y, i, true);

        rects.push(rect);
    }

    return rects;
}




function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}


function displayRectangles(rectArray) {
    const orderedRow = document.getElementById("orderedRow");
    orderedRow.innerHTML = "";

    rectArray.forEach(rect => {
        rect.setScrambled(false);
        rect.el.classList.remove("absolute");
        rect.el.classList.add("static");
        orderedRow.appendChild(rect.el);
    });
}


function gameSetup() {
    const input = document.getElementById("countInput");
    const message = document.getElementById("message");

    const count = parseInt(input.value, 10);

    if (isNaN(count) || count < 3 || count > 7) {
        message.textContent = messages.error_invalid_number || "Please enter a number between 3 and 7.";
        return;
    }

    message.textContent = `You have ${count} seconds to memorize the order.`;

    const row = document.getElementById("orderedRow");
    row.classList.remove("hidden");

    // 🔹 Create ONE array of rectangles
    const rectArray = getRectArray(count);

    // 🔹 Display those exact rectangles in the ordered row
    displayRectangles(rectArray);

    console.log("count:", count, "rectArray length:", rectArray.length);

    setTimeout(() => {
        runGame(rectArray);
    }, count * 1000);
}



function runGame(rectArray) {
    const orderedRow = document.getElementById("orderedRow");
    const gameArea = document.getElementById("gameArea");

    orderedRow.innerHTML = "";
    orderedRow.classList.add("hidden");
    gameArea.classList.remove("hidden");
    gameArea.innerHTML = "";

    rectArray.forEach(rect => {
        rect.setScrambled(true);

        rect.el.classList.remove("static");
        rect.el.classList.add("absolute");

        rect.el.addEventListener("click", () => {
            console.log(`Pressed rectangle value: ${rect.value}`);
            rect.el.classList.add("hidden");
        });

        gameArea.appendChild(rect.el);
    });
}


function main() {
    // Add event listener to startBtn
    document.getElementById("startBtn").addEventListener("click", gameSetup);
}

main();