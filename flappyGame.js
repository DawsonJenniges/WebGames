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

const canvas = document.getElementById("flappyGame");
const ctx = canvas.getContext("2d");

const highScoreDisplay = document.getElementById("highScoreDisplay");
const instructionsEl = document.getElementById("instructions");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_GAP = 150;
const PIPE_WIDTH = 50;
const PIPE_SPEED = 3;
const GROUND_Y = 400;
const PIPE_INTERVAL = 1500;

let lastTime = 0;
let score = 0;
let gameOver = false;
let flying = false;
let enteringName = false;
let playerName = "";
let started = false;

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

function drawGameOver(){
    ctx.drawImage(gameOverImg, 24, 80, 200, 100);
}

function updateHighScoreDisplay() {
    highScoreDisplay.textContent = `High Score: ${record.name} - ${record.score}`;
}

let record = loadRecord();
updateHighScoreDisplay();

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

    update(delta) {
        if (!gameOver && flying) {
            this.vel += GRAVITY * delta;
            this.y += this.vel * delta;
        }

        // animation (keep frame animation consistent)
        this.frameCounter += delta;
        if (this.frameCounter > 5) {
            this.frameIndex = (this.frameIndex + 1) % birdFrames.length;
            this.frameCounter = 0;
        }
    }

    draw() {
        if(!started) {
            drawText("SPACE or CLICK to Start", 18, 50, HEIGHT / 2);
            return;
        }

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

    update(delta) {
        this.x -= PIPE_SPEED * delta;
    }

    draw() {
        // TOP PIPE (flipped upside down)
        ctx.save();
        ctx.scale(1, -1);
        ctx.drawImage(
            pipeImg,
            this.x,
            -this.topHeight,   // negative because canvas is flipped
            this.width,
            this.topHeight
        );
        ctx.restore();

        // BOTTOM PIPE (normal)
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
    if (!started) return;  // ← ADD THIS

    if (timestamp - lastPipeTime > PIPE_INTERVAL) {
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

    // ---- GROUND COLLISION ----
    if (bird.y + bird.height >= GROUND_Y) {
        gameOver = true;
        return;
    }

    // ---- PIPE COLLISIONS ----
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
        x: WIDTH / 2 - 53,
        y: HEIGHT / 2 - 20,
        width: 120,
        height: 40
    };

    ctx.fillStyle = "white";
    ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

    drawText("Restart", 16, btn.x + 30, btn.y + 25, "black");

    return btn;
}

function resetGame() {
    pipes = [];
    score = 0;
    gameOver = false;
    flying = false;
    started = false;
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
            updateHighScoreDisplay();
            enteringName = false;
        } else if (e.key === "Backspace") {
            playerName = playerName.slice(0, -1);
        } else if (playerName.length < 10 && e.key.length === 1) {
            playerName += e.key;
        }
    }
    if (!started && e.code === "Space") {
        started = true;
        flying = true;
        lastPipeTime = performance.now();  // ← ADD THIS
        bird.jump();
        return;
    } 
    else if (!gameOver) {
        bird.jump();
    }
});

canvas.addEventListener("mousedown", () => {
    if (enteringName) return;

    if (!started) {
        started = true;
        flying = true;
        lastPipeTime = performance.now();  // ← ADD THIS
        bird.jump();
        return;
    }   

    if (!gameOver) {
        bird.jump();
    }
});

function update(delta, timestamp) {
    // show/hide instructions area so it doesn't cover during play
    if (instructionsEl) {
        instructionsEl.style.display = started ? "none" : "block";
    }

    // ----- PIPES ONLY MOVE IF GAME NOT OVER -----
    if (!gameOver && started) {
        spawnPipe(timestamp);

        for (let pipe of pipes) {
            pipe.update(delta);
        }

        pipes = pipes.filter(p => p.x + p.width > 0);
    }

    // ----- BIRD LOGIC -----
    if (!gameOver) {
        bird.update(delta);
    } 
    else {
        // Bird keeps falling after death until it hits ground
        if (bird.y + bird.height < GROUND_Y) {
            bird.vel += GRAVITY * delta;
            bird.y += bird.vel * delta;
        } else {
            bird.y = GROUND_Y - bird.height;
            bird.vel = 0;
        }
    }

    // Only check collisions if still alive
    if (!gameOver) {
        checkCollisions();
    }

    // High score entry
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

    if (gameOver) {
        if (enteringName) {
            drawText("NEW RECORD!", 18, 70, 200);
            drawText("ENTER NAME:", 16, 60, 230);
            drawText(playerName, 16, 100, 260);
        } else {
            drawText("Game Over", 24, 80, 200);
            /* drawGameOver(); */
            drawRestartButton();
        }
    }
}
    

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;

    // normalize to 60fps baseline
    const delta = (timestamp - lastTime) / 16.67;

    lastTime = timestamp;

    update(delta, timestamp);
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
