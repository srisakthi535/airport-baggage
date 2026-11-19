
// FLIGHT DETAILS - HASH TABLE
const flights = {
    "AI-101": { destination: "Delhi", counter: "A1" },
    "6E-205": { destination: "Chennai", counter: "B2" },
    "SG-310": { destination: "Mumbai", counter: "C3" }
};

// BAGGAGE DATA
const originalBags = [
    { id: "B01", flight: "AI-101", weight: 15, priority: "Normal" },
    { id: "B02", flight: "6E-205", weight: 12, priority: "High" },
    { id: "B03", flight: "SG-310", weight: 18, priority: "Emergency" },
    { id: "B04", flight: "AI-101", weight: 10, priority: "Normal" },
    { id: "B05", flight: "6E-205", weight: 20, priority: "Normal" },
    { id: "B06", flight: "SG-310", weight: 14, priority: "High" },
    { id: "B07", flight: "AI-101", weight: 16, priority: "Normal" },
    { id: "B08", flight: "6E-205", weight: 11, priority: "Emergency" },
    { id: "B09", flight: "SG-310", weight: 13, priority: "Normal" },
    { id: "B10", flight: "AI-101", weight: 19, priority: "High" }
];

let normalQueue = [];
let priorityQueue = [];
let currentBag = null;
let remainingBags = [];

let score = 0;
let correct = 0;
let wrong = 0;
let seconds = 0;
let timerInterval = null;
let gameRunning = false;

// PRIORITY VALUES
function priorityValue(bag) {
    if (bag.priority === "Emergency") return 0;
    if (bag.priority === "High") return 1;
    return 2;
}

// PRIORITY QUEUE - MIN HEAP
function heapPush(bag) {
    priorityQueue.push(bag);

    let i = priorityQueue.length - 1;

    while (i > 0) {
        let parent = Math.floor((i - 1) / 2);

        if (priorityValue(priorityQueue[parent]) <=
            priorityValue(priorityQueue[i])) break;

        [priorityQueue[parent], priorityQueue[i]] =
            [priorityQueue[i], priorityQueue[parent]];

        i = parent;
    }
}

function heapPop() {
    if (priorityQueue.length === 0) return null;

    const first = priorityQueue[0];
    const last = priorityQueue.pop();

    if (priorityQueue.length > 0) {
        priorityQueue[0] = last;

        let i = 0;

        while (true) {
            let left = 2 * i + 1;
            let right = 2 * i + 2;
            let smallest = i;

            if (left < priorityQueue.length &&
                priorityValue(priorityQueue[left]) <
                priorityValue(priorityQueue[smallest])) {
                smallest = left;
            }

            if (right < priorityQueue.length &&
                priorityValue(priorityQueue[right]) <
                priorityValue(priorityQueue[smallest])) {
                smallest = right;
            }

            if (smallest === i) break;

            [priorityQueue[i], priorityQueue[smallest]] =
                [priorityQueue[smallest], priorityQueue[i]];

            i = smallest;
        }
    }

    return first;
}

// START GAME
function startGame() {

    clearInterval(timerInterval);

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("result").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    score = 0;
    correct = 0;
    wrong = 0;
    seconds = 0;

    normalQueue = [];
    priorityQueue = [];

    remainingBags = originalBags.map(bag => ({ ...bag }));

    // QUEUE AND PRIORITY QUEUE
    remainingBags.forEach(bag => {

        if (bag.priority === "Normal") {
            normalQueue.push(bag);
        } else {
            heapPush(bag);
        }

    });

    gameRunning = true;

    updateScore();

    timerInterval = setInterval(() => {
        if (!gameRunning) return;

        seconds++;

        let min = String(Math.floor(seconds / 60)).padStart(2, "0");
        let sec = String(seconds % 60).padStart(2, "0");

        document.getElementById("timer").textContent =
            min + ":" + sec;

    }, 1000);

    nextBag();
}

// GET NEXT BAG
function nextBag() {

    if (!gameRunning) return;

    if (priorityQueue.length > 0) {
        currentBag = heapPop();
    } else if (normalQueue.length > 0) {
        currentBag = normalQueue.shift();
    } else {
        finishGame();
        return;
    }

    document.getElementById("bag").innerHTML = `
        🧳 CURRENT BAGGAGE<br>
        Bag ID: ${currentBag.id}<br>
        Flight: ${currentBag.flight}<br>
        Destination: ${flights[currentBag.flight].destination}<br>
        Priority: ${currentBag.priority}<br>
        Weight: ${currentBag.weight} kg
    `;

    document.getElementById("message").textContent = "";

    document.getElementById("queueInfo").textContent =
        "Urgent Bags: " + priorityQueue.length +
        " | Normal Bags: " + normalQueue.length;
}

// ASSIGN BAG
function assignBag(selectedCounter) {

    if (!gameRunning || !currentBag) return;

    const correctCounter =
        flights[currentBag.flight].counter;

    if (selectedCounter === correctCounter) {

        score += 10;
        correct++;

        if (currentBag.priority !== "Normal") {
            score += 15;
        }

        document.getElementById("message").textContent =
            "✅ Correct Assignment! Points Earned!";

        document.getElementById("message").style.color =
            "green";

    } else {

        score -= 10;
        wrong++;

        document.getElementById("message").textContent =
            "❌ Wrong Counter! Correct Counter: " +
            correctCounter;

        document.getElementById("message").style.color =
            "red";
    }

    remainingBags = remainingBags.filter(
        bag => bag.id !== currentBag.id
    );

    updateScore();

    currentBag = null;

    setTimeout(nextBag, 600);
}

// UPDATE SCORE
function updateScore() {

    document.getElementById("score").textContent = score;
    document.getElementById("correct").textContent = correct;
    document.getElementById("wrong").textContent = wrong;
}

// SEARCHING ALGORITHM
function searchFlight() {

    const input = document.getElementById("searchInput");
    const flightNo = input.value.trim().toUpperCase();

    if (flightNo === "") {
        alert("Please enter a flight number!");
        return;
    }

    if (flights[flightNo]) {

        const details = flights[flightNo];

        alert(
            "FLIGHT FOUND!\n\n" +
            "Flight: " + flightNo + "\n" +
            "Destination: " + details.destination + "\n" +
            "Counter: " + details.counter
        );

    } else {

        alert("Flight Not Found!");

    }

    input.value = "";
}

// SORTING ALGORITHM
function sortBags() {

    const sorted = [...remainingBags].sort(
        (a, b) => a.weight - b.weight
    );

    let output = "BAGGAGE SORTED BY WEIGHT\n\n";

    sorted.forEach(bag => {
        output +=
            bag.id + " - " +
            bag.weight + " kg - " +
            bag.priority + "\n";
    });

    alert(output);
}

// FINAL RESULT
function finishGame() {

    gameRunning = false;
    clearInterval(timerInterval);

    document.getElementById("game").classList.add("hidden");
    document.getElementById("result").classList.remove("hidden");

    let rank;

    if (correct >= 9) rank = "S";
    else if (correct >= 7) rank = "A";
    else if (correct >= 5) rank = "B";
    else rank = "C";

    document.getElementById("totalBags").textContent =
        originalBags.length;

    document.getElementById("finalCorrect").textContent =
        correct;

    document.getElementById("finalWrong").textContent =
        wrong;

    document.getElementById("finalTime").textContent =
        document.getElementById("timer").textContent;

    document.getElementById("finalScore").textContent =
        score;

    document.getElementById("rank").textContent =
        "🏆 YOUR RANK: " + rank;
}

// INSTRUCTIONS
function showInstructions() {

    alert(
        "HOW TO PLAY\n\n" +
        "1. Click Play Game.\n" +
        "2. Check baggage details.\n" +
        "3. Select the correct flight counter.\n" +
        "4. Emergency and High priority bags come first.\n" +
        "5. Correct answer earns points.\n" +
        "6. Complete all 10 bags to win!"
    );
}

// MAIN MENU
function goHome() {

    gameRunning = false;
    clearInterval(timerInterval);

    document.getElementById("game").classList.add("hidden");
    document.getElementById("result").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
}
