
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

function drawTable(ctx, width, height) {
    // ----- Base Felt -----
    ctx.fillStyle = "#2972b6"; // dark casino blue
    ctx.fillRect(0, 0, width, height);

    // ----- Radial Light Gradient (center glow) -----
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

    // ----- Dealer Area -----
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(width / 2, height * 0.15, 140, 0, Math.PI, false);
    ctx.stroke();

    // ----- Player Area -----
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.75, 140, Math.PI, 0, false);
    ctx.stroke();

    // ----- Titles -----
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";

    ctx.fillText("DEALER", width / 2, height * 0.1);
    ctx.fillText("PLAYER", width / 2, height * 0.9);
}

//Temporary draw loop to see table
function render(){
    drawTable(ctx, canvas.width, canvas.height);
    requestAnimationFrame(render);
}

render();


