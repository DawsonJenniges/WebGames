function loadImage(src){
    const img = new Image();
    img.src = src;
    return img;
}

const bgImg = loadImage("Images/background-night.png");
const groundImg = loadImage("Images/base.png");
const pipeImg = loadImage("Images/pipe-green.png");
const gameOverImg = loadImage("Images/gameover.png");

const birdFrames = [
    loadImage("Images/bird1.png"),
    loadImage("Images/bird2.png"),
    loadImage("Images/bird3.png")
];

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_GAP = 150;
const PIPE_WIDTH = 50;
const PIPE_SPEED = 3;
const GROUND_Y = 400;
const PIPE_INTERVAL = 1500;

let score = 0;
let gameOver = false;
let flying = false;
let enteringName = false;
let playerName = "";

let lastPipeTime = 0;
let pipes = [];

function drawBackground(){
    ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
}

function drawGround() {
    ctx.drawImage(groundImg, 0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
}

function loadRecord() {
    const data = localStorage.getItem("flappyRecord");
    return data ? JSON.parse(data) : { name: "NONE", score: 0 };
}

function saveRecord(name, score) {
    localStorage.setItem("flappyRecord", JSON.stringify({ name, score }));
}

let record = loadRecord();

class Bird {
    constructor() {
        this.x = 80;
        this.y = HEIGHT / 2;
        this.vel = 0;
        this.width = 34;
        this.height = 24;
        this.frameIndex = 0;
        this.frameCounter = 0;
    }

    update() {
        if (!gameOver && flying) {
            this.vel += GRAVITY;
            this.y += this.vel;
        }

        // animation
        this.frameCounter++;
        if (this.frameCounter > 5) {
            this.frameIndex = (this.frameIndex + 1) % birdFrames.length;
            this.frameCounter = 0;
        }

        if (this.y + this.height > GROUND_Y) {
            this.y = GROUND_Y - this.height;
            gameOver = true;
        }
    }

    draw() {
        ctx.save();

        // rotate based on velocity
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.vel * 0.05);

        ctx.drawImage(
            birdFrames[this.frameIndex],
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        ctx.restore();
    }

    jump() {
        this.vel = -8;
    }

    getHitbox() {
    return {
        x: this.x + 5,
        y: this.y + 5,
        width: this.width - 10,
        height: this.height - 10
    };
}
}


class Pipe {
    constructor() {
        this.x = WIDTH;
        this.width = 60;

        const minGapY = 120;
        const maxGapY = GROUND_Y - 120;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

        this.topHeight = gapY - PIPE_GAP / 2;
        this.bottomY = gapY + PIPE_GAP / 2;

        this.passed = false;
    }

    update() {
        this.x -= PIPE_SPEED;
    }

    draw() {
        // TOP PIPE
        ctx.drawImage(
            pipeImg,
            this.x,
            0,
            this.width,
            this.topHeight
        );

        // BOTTOM PIPE
        ctx.drawImage(
            pipeImg,
            this.x,
            this.bottomY,
            this.width,
            GROUND_Y - this.bottomY
        );
    }

    getTopRect() {
        return {
            x: this.x,
            y: 0,
            width: this.width,
            height: this.topHeight
        };
    }

    getBottomRect() {
        return {
            x: this.x,
            y: this.bottomY,
            width: this.width,
            height: GROUND_Y - this.bottomY
        };
    }
}




const bird = new Bird();

function spawnPipe(timestamp) {
    if (timestamp - lastPipeTime > PIPE_INTERVAL) {
        const offset = Math.random() * 200 - 100;
        pipes.push(new Pipe());
        lastPipeTime = timestamp;
    }
}

function collide(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function checkCollisions() {
    const birdBox = bird.getHitbox();

    for (let pipe of pipes) {
        if (
            collide(birdBox, pipe.getTopRect()) ||
            collide(birdBox, pipe.getBottomRect())
        ) {
            gameOver = true;
        }

        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score++;
        }
    }
}

function drawText(text, size, x, y, color = "white") {
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.fillText(text, x, y);
}

function drawRestartButton() {
    const btn = {
        x: WIDTH / 2 - 60,
        y: HEIGHT / 2 + 60,
        width: 120,
        height: 40
    };

    ctx.fillStyle = "gray";
    ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

    drawText("Restart", 16, btn.x + 30, btn.y + 25, "black");

    return btn;
}

function resetGame() {
    pipes = [];
    score = 0;
    gameOver = false;
    flying = false;
    enteringName = false;
    bird.y = HEIGHT / 2;
    bird.vel = 0;
}

canvas.addEventListener("click", (e) => {
    if (gameOver && !enteringName) {
        resetGame();
    }
});

document.addEventListener("keydown", (e) => {
    if (enteringName) {
        if (e.key === "Enter" && playerName.length > 0) {
            saveRecord(playerName, score);
            record = { name: playerName, score: score };
            enteringName = false;
        } else if (e.key === "Backspace") {
            playerName = playerName.slice(0, -1);
        } else if (playerName.length < 10 && e.key.length === 1) {
            playerName += e.key;
        }
    } else if (!gameOver) {
        if (!flying) flying = true;
        bird.jump();
    }
});

function update(timestamp) {
    if (!gameOver) {
        spawnPipe(timestamp);
    }

    bird.update();

    for (let pipe of pipes) {
        pipe.update();
    }

    pipes = pipes.filter(p => p.x + p.width > 0);

    checkCollisions();

    if (gameOver && score > record.score && !enteringName) {
        enteringName = true;
        playerName = "";
    }
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    drawBackground();   // ← ADD THIS

    for (let pipe of pipes) {
        pipe.draw();
    }

    bird.draw();
    drawGround();

    drawText(score, 32, WIDTH / 2 - 10, 40);
    drawText(`BEST: ${record.name} - ${record.score}`, 14, 10, 20, "black");

    if (gameOver) {
        if (enteringName) {
            drawText("NEW RECORD!", 18, 70, 200);
            drawText("ENTER NAME:", 16, 60, 230);
            drawText(playerName, 16, 100, 260);
        } else {
            drawText("Game Over", 24, 80, 200);
            drawRestartButton();
        }
    }
}
    

function gameLoop(timestamp) {
    update(timestamp);
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
