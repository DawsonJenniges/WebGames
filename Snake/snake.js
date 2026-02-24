function loadImage(src){
    const img = new Image();
    img.src = src;
    return img;
}

const snakeImg = loadImage("Images/snake.png");
const appleImg = loadImage("Images/apple.png");

const canvas = document.getElementById("snakeGame");
const ctx = canvas.getContext("2d");

const highScoreDisplay = document.getElementById("highScoreDisplay");

const BLOCK_SIZE = 20;
let SCREEN_WIDTH = canvas.width;
let SCREEN_HEIGHT = canvas.height;

let GRID_WIDTH = SCREEN_WIDTH / BLOCK_SIZE;
let GRID_HEIGHT = SCREEN_HEIGHT / BLOCK_SIZE;

let snake;
let direction;
let nextDirection;
let food;
let gameOver;
let score;
let lastMoveTime = 0;
let started = false;
let restartBtn = null;
const MOVE_DELAY = 100; // ms (controls speed)

let record = loadRecord();
updateHighScoreDisplay();

function loadRecord() {
    const data = localStorage.getItem("snakeRecord");
    return data ? JSON.parse(data) : { score: 0 };
}

function saveRecord(score) {
    localStorage.setItem("snakeRecord", JSON.stringify({ score }));
}

function updateHighScoreDisplay() {
    highScoreDisplay.textContent = `High Score: ${record.score}`;
}

function resetGame() {
    snake = [
        {x: 5, y: 12},
        {x: 4, y: 12},
        {x: 3, y: 12}
    ];

    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};

    spawnFood();
    gameOver = false;
    score = 0;
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
    };
}

function checkBorderCollision() {
    const head = snake[0];
    return (
        head.x < 0 ||
        head.x >= GRID_WIDTH ||
        head.y < 0 ||
        head.y >= GRID_HEIGHT
    );
}

function checkSelfCollision() {
    const head = snake[0];
    return snake.slice(1).some(segment =>
        segment.x === head.x && segment.y === head.y
    );
}

function update(timestamp) {
    if(!started) 
    {
        drawStartMessage();    
        return;
    }
    if (gameOver) {
        drawGameOver();
        drawRestartButton();
        return;
    }
        

    if (timestamp - lastMoveTime > MOVE_DELAY) {
        direction = nextDirection;

        const newHead = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y
        };

        snake.unshift(newHead);

        if (newHead.x === food.x && newHead.y === food.y) {
            score++;
            spawnFood();
        } else {
            snake.pop();
        }

        if (checkBorderCollision() || checkSelfCollision()) {
            gameOver = true;

            if (score > record.score) {
                saveRecord(score);
                record = { score };
                updateHighScoreDisplay();
            }
        }

        lastMoveTime = timestamp;
    }
}

function drawRestartButton() {
    restartButton = {
        x: SCREEN_WIDTH / 2 - 65,
        y: SCREEN_HEIGHT / 2 + 20,
        width: 120,
        height: 40
    };

    ctx.fillStyle = "white";
    ctx.fillRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);

    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.fillText("Restart",
        restartButton.x + 25,
        restartButton.y + 25
    );
}

function drawStartMessage(){
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Press an arrow key to start", SCREEN_WIDTH / 2 - 150, SCREEN_HEIGHT / 2);
}

function drawSnake() {
    for (let segment of snake) {
        ctx.drawImage(
            snakeImg,
            segment.x * BLOCK_SIZE,
            segment.y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
    }
}

function drawFood() {
    ctx.drawImage(
        appleImg,
        food.x * BLOCK_SIZE,
        food.y * BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
    );
}

function drawGridBackground() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function drawGameOver() {
    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.fillText("GAME OVER", SCREEN_WIDTH / 2 - 120, SCREEN_HEIGHT / 2);

    drawRestartButton();
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

document.addEventListener("keydown", (e) => {

    const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

    if (arrows.includes(e.code)) {
        e.preventDefault();
        if (!started) {
            started = true;
        }
    }

    if (gameOver) {
        if (e.key === "p" || e.key === "P") {
            resetGame();
        }
        if (e.key === "q" || e.key === "Q") {
            window.location.reload();
        }
        return;
    }

    if (e.key === "ArrowUp" && direction.y !== 1) {
        nextDirection = {x: 0, y: -1};
    }
    if (e.key === "ArrowDown" && direction.y !== -1) {
        nextDirection = {x: 0, y: 1};
    }
    if (e.key === "ArrowLeft" && direction.x !== 1) {
        nextDirection = {x: -1, y: 0};
    }
    if (e.key === "ArrowRight" && direction.x !== -1) {
        nextDirection = {x: 1, y: 0};
    }
});

canvas.addEventListener("click", (e) => {
    if (!gameOver || !restartButton) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
        mouseX >= restartButton.x &&
        mouseX <= restartButton.x + restartButton.width &&
        mouseY >= restartButton.y &&
        mouseY <= restartButton.y + restartButton.height
    ) {
        started = false;
        resetGame();
    }
});

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    drawGridBackground();
    update(timestamp);
    drawSnake();
    drawFood();
    drawScore();

    if (gameOver) {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

resetGame();
requestAnimationFrame(gameLoop);