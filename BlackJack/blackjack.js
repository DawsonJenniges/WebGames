//RULES FUNCTIONS
document.addEventListener("DOMContentLoaded", () => {
    const rulesLink = document.getElementById("rulesLink");
    const rulesPanel = document.getElementById("rulesPanel");
    const closeRules = document.getElementById("closeRules");

    if (rulesLink && rulesPanel && closeRules) {

        rulesLink.addEventListener("click", function (e) {
            e.preventDefault();
            rulesPanel.classList.add("active");
        });

        closeRules.addEventListener("click", function () {
            rulesPanel.classList.remove("active");
        });
    }
});

const canvas = document.getElementById("blackjackCanvas");
const ctx = canvas.getContext("2d");

const dealBtn = document.getElementById("dealBtn");

dealBtn.addEventListener("click", () => {
    if (state === "betting" || state === "roundOver") {
        newDeal();
        state = "playerTurn";
    }
});

//Draw table function and card rendering will go here
function drawTable(ctx, width, height) {
    // Base felt
    ctx.fillStyle = "#2972b6"; // dark casino blue
    ctx.fillRect(0, 0, width, height);

    // Center glow gradient
    const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        height / 1.2
    );

    gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
    gradient.addColorStop(1, "rgba(0,0,0,0.6)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Dealer and Player areas
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(width / 2, height * 0.15, 140, 0, Math.PI, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width / 2, height * 0.75, 140, Math.PI, 0, false);
    ctx.stroke();

    // ----- Titles -----
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";

    ctx.fillText("DEALER", width / 2, height * 0.1);
    ctx.fillText("PLAYER", width / 2, height * 0.9);

    // --- Card Stack ---
    makeCardBack(width / 4 - 75, height / 2 - 70);
}

//helper card function
function getSuitSymbol(suit) {
    switch (suit) {
        case "Hearts": return "♥";
        case "Diamonds": return "♦";
        case "Clubs": return "♣";
        case "Spades": return "♠";
    }
}

//rounded ractangle function for cards
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function makeCard(card, x, y) {
    const width = 60;
    const height = 90;

    const isRed = card.suit === "Hearts" || card.suit === "Diamonds";
    const color = isRed ? "#d32f2f" : "#111";

    // Drop shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Card body
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, x, y, width, height, 10);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = "#ccc";
    ctx.stroke();

    // Value top-left
    ctx.fillStyle = color;
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.fillText(card.name, x + 5, y + 25);

    // Suit center
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText(getSuitSymbol(card.suit), x + width / 2, y + height / 2 + 15);

    // Value bottom-right
    ctx.font = "18px Arial";
    ctx.textAlign = "right";
    ctx.fillText(card.name, x + width - 5, y + height - 10);
}

function makeCardBack(x, y) {
    const width = 60;
    const height = 90;

    ctx.save();

    // --- Drop shadow ---
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // --- Card base (white edge like real cards) ---
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, x, y, width, height, 10);
    ctx.fill();

    ctx.restore();

    // --- Inner red gradient ---
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, "#b71c1c");
    gradient.addColorStop(1, "#7f0000");

    ctx.fillStyle = gradient;
    roundRect(ctx, x + 4, y + 4, width - 8, height - 8, 8);
    ctx.fill();

    // --- Border line ---
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- Pattern lines ---
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;

    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 15 + i * 10);
        ctx.lineTo(x + width - 8, y + 15 + i * 10);
        ctx.stroke();
    }

    // --- Center oval detail ---
    ctx.beginPath();
    ctx.ellipse(
        x + width / 2,
        y + height / 2,
        18,
        25,
        0,
        0,
        Math.PI * 2
    );
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

// GAME LOGIC
const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const values = [
    {name: "A", value: 11},
    {name: "2", value: 2},
    {name: "3", value: 3},
    {name: "4", value: 4},
    {name: "5", value: 5},
    {name: "6", value: 6},
    {name: "7", value: 7},
    {name: "8", value: 8},
    {name: "9", value: 9},
    {name: "10", value: 10},
    {name: "J", value: 10},
    {name: "Q", value: 10},
    {name: "K", value: 10}
];

//const tableImg = loadImage();

let state = "betting";
//state can be "betting", "dealing", "playerTurn", "dealerTurn", "roundOver"
let deck = []
let playerHand = [];
let dealerHand = [];


function shuffle(deck){
    for (let i = deck.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function createDeck(){
    const deck = [];
    for (let suit of suits){
        for (let value of values){
            deck.push({suit: suit, name: value.name, value: value.value});
        }
    }
    return shuffle(deck);
}

function countHand(hand){
    let total = 0;
    let aces = 0;

    for (let card of hand){
        total += card.value;
        if (card.name === "A"){
            aces++;
        }
    }

    while (total > 21 && aces > 0){
        total -= 10;
        aces--;
    }
    return total
}

function dealCard(hand){
    hand.push(deck.pop());
}

function newDeal(){
    deck = createDeck();
    playerHand = [];
    dealerHand = [];

    dealCard(playerHand);
    dealCard(dealerHand);
    dealCard(playerHand);
    dealCard(dealerHand);
}

function drawHand(hand, centerX, y, downcard=false){
    const spacing = 70;
    const totalWidth = (hand.length - 1) * spacing ;
    const startX = centerX - totalWidth / 2 - 30; // 30 is half card width for centering  

    for (let i = 0; i < hand.length; i++){
        if (i === 1 && downcard){
            makeCardBack(startX + i * spacing, y);
            continue;
        }
        makeCard(hand[i], startX + i * spacing, y);
    }
}

//Temporary draw loop to see table
function render(){
    drawTable(ctx, canvas.width, canvas.height);

    // Dealer (top)
    drawHand(dealerHand, canvas.width / 2, canvas.height / 4 - 25, true);

    // Player (bottom)
    drawHand(playerHand, canvas.width / 2, canvas.height / 2 + 20);

    requestAnimationFrame(render);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTable(ctx, canvas.width, canvas.height);

    // ---- STATE HANDLING ----
    if (state === "betting") {
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Click DEAL to start", canvas.width / 2, canvas.height / 2);
    }

    if (state === "playerTurn") {
        drawHand(dealerHand, canvas.width / 2, canvas.height / 4 - 25, true);
        drawHand(playerHand, canvas.width / 2, canvas.height / 2 + 20);
    }

    if (state === "dealerTurn") {
        drawHand(dealerHand, canvas.width / 2, canvas.height / 4 - 25, false);
        drawHand(playerHand, canvas.width / 2, canvas.height / 2 + 20);
    }

    if (state === "roundOver") {
        drawHand(dealerHand, canvas.width / 2, canvas.height / 4 - 25, false);
        drawHand(playerHand, canvas.width / 2, canvas.height / 2 + 20);

        const playerTotal = countHand(playerHand);
        const dealerTotal = countHand(dealerHand);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(
            `Player: ${playerTotal}  Dealer: ${dealerTotal}`,
            canvas.width / 2,
            canvas.height / 2 - 40
        );
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();




