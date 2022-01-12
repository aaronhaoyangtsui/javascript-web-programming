import { Game } from './game.js';
import { Rack } from './rack.js';
import * as utils from "./scrabbleUtils.js";

const NUMBER_OF_PLAYERS = 2;
let turn = 0; // Player 1 starts the game

function updateTurn() {
    document.getElementById("turn").innerText = document.getElementById(`p${turn % NUMBER_OF_PLAYERS}-name`).value;
}

function renderGame(game) {
    game.render(document.getElementById('board'));
}

function renderRacks(racks) {
    racks.forEach((rack, i) => rack.render(document.getElementById(`p${i}-rack`)));
}

window.addEventListener("load", async function () {
    const response = await fetch("dictionary.json");
    if (!response.ok) {
        console.log(response.error);
        return;
    }

    // We make dictionary a global.
    window.dictionary = await response.json();

    const game = new Game();

    updateTurn();

    const racks = [];
    const scores = Array.from(Array(NUMBER_OF_PLAYERS), () => 0);
    for (let i = 0; i < NUMBER_OF_PLAYERS; ++i) {
        racks[i] = new Rack();

        racks[i].takeFromBag(7, game);

        document.getElementById(`p${i}-name`).addEventListener("change", updateTurn);
    }

    renderRacks(racks);
    renderGame(game);

    document.getElementById('play').addEventListener('click', async () => {
        const word = document.getElementById('word').value;
        const x = parseInt(document.getElementById('x').value);
        const y = parseInt(document.getElementById('y').value);
        const direction = document.getElementById('direction').value === 'horizontal';

        const rack = racks[turn % NUMBER_OF_PLAYERS];

        // We need to remove tiles already on the grid from the word trying to be constructed.
        let remaining = word;
        for (let i = 0; i < word.length; ++i) {
            const tile = direction ? game.getGrid()[x + i][y] : game.getGrid()[x][y + i];
            if (tile !== null) {
                if (tile !== word[i]) {
                    alert(`The word intercepts already placed tiles.`);
                    return;
                } else {
                    remaining = remaining.replace(tile, '');
                }
            }
        }

        if (remaining === "") {
            alert("You need to place at least one tile!");
        }

        if (!utils.canConstructWord(rack.getAvailableTiles(), remaining)) {
            alert(`The word ${word} cannot be constructed.`);
        } else {
            try {
                const score = game.playAt(word, { x, y }, direction);
                scores[turn % NUMBER_OF_PLAYERS] += score;
                document.getElementById('word').value = "";
                document.getElementById(`p${turn % NUMBER_OF_PLAYERS}-score`).innerText = scores[turn % NUMBER_OF_PLAYERS];
                renderGame(game);

                const response = await fetch('/wordScore', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: document.getElementById(`p${turn % NUMBER_OF_PLAYERS}-name`).value,
                        score: score,
                        // Need to extend in case only one letter was played appending to a word for example.
                        // Not extending will also be accepted.
                        word: game.extend(word, { x, y }, direction)
                    })
                });

                if (!response.ok) {
                    console.error("Could not save the turn score to the server.");
                }

                const used = utils.constructWord(rack.getAvailableTiles(), remaining);
                used.forEach(tile => rack.removeTile(tile));
                rack.takeFromBag(used.length, game);
                renderRacks(racks);
                ++turn;
                updateTurn();
            } catch (e) {
                alert(e);
            }
        }
    });

    document.getElementById('reset').addEventListener('click', () => {
        game.reset();
        renderGame(game);
    });

    document.getElementById('shuffle').addEventListener('click', () => {
        racks[turn % NUMBER_OF_PLAYERS].shuffle(game);
        renderRacks(racks);
    });

    document.getElementById('end').addEventListener('click', async () => {
        for (let i = 0; i < NUMBER_OF_PLAYERS; ++i) {
            const response = await fetch('/gameScore', {
                method: 'POST',
                body: JSON.stringify({
                    name: document.getElementById(`p${i}-name`).value,
                    score: scores[i]
                })
            });
        
            if (!response.ok) {
                console.error(`Could not save the game score of player ${i + 1} to the server.`);
            }
        }
    });

    const wordScoresRequest = await fetch('./highestWordScores');
    const wordScoresData = wordScoresRequest.ok ? await wordScoresRequest.json() : [];

    for (const wordScore of wordScoresData) {
        const tr = document.createElement('tr');
        const name  = document.createElement('td');
        const word  = document.createElement('td');
        const score  = document.createElement('td');
        name.innerText = wordScore.name;
        word.innerText = wordScore.word;
        score.innerText = wordScore.score;
        tr.appendChild(name);
        tr.appendChild(word);
        tr.appendChild(score);
        document.getElementById('word-scores-table').appendChild(tr);
    }

    const gameScoresRequest = await fetch('./highestGameScores');
    const gameScoresData = gameScoresRequest.ok ? await gameScoresRequest.json() : [];

    for (const gameScore of gameScoresData) {
        const tr = document.createElement('tr');
        const name  = document.createElement('td');
        const score  = document.createElement('td');
        name.innerText = gameScore.name;
        score.innerText = gameScore.score;
        tr.appendChild(name);
        tr.appendChild(score);
        document.getElementById('game-scores-table').appendChild(tr);
    }
});