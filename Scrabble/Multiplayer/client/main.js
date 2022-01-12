import {Game} from './game.js';
import {Rack} from './rack.js';
import * as utils from "./scrabbleUtils.js";

const NUMBER_OF_PLAYERS = 2;
let turn = 0; // Player 1 starts the game

function updateTurn() {
    document.getElementById("turn").innerText = document.getElementById(`p${turn + 1}-name`).value;
}

function renderGame(game) {
    game.render(document.getElementById('board'));
}

function renderRacks(racks) {
    racks.forEach((rack, i) => rack.render(document.getElementById(`p${i + 1}-rack`)));
}

window.addEventListener("load", async function() {
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
    for (let i = 0; i < NUMBER_OF_PLAYERS; ++i) {
        racks[i] = new Rack();

        racks[i].takeFromBag(7, game);
        
        document.getElementById(`p${i + 1}-name`).addEventListener("change", updateTurn);
    }

    renderRacks(racks);
    renderGame(game);
    
    document.getElementById('play').addEventListener('click', () => {
        const word = document.getElementById('word').value;
        const x = parseInt(document.getElementById('x').value);
        const y = parseInt(document.getElementById('y').value);
        const direction = document.getElementById('direction').value === 'horizontal';

        const rack = racks[turn];

        if (!utils.canConstructWord(rack.getAvailableTiles(), word) || !dictionary.includes(word)) {
            alert(`The word ${word} cannot be constructed by ${document.getElementById(`p${turn + 1}-name`).value}.`);
        } else {
            if (game.playAt(utils.constructWord(rack.getAvailableTiles(), word).join(''), {x, y}, direction) !== -1) {
                renderGame(game);
    
                const used = utils.constructWord(rack.getAvailableTiles(), word);
                used.forEach(tile => rack.removeTile(tile));
                rack.takeFromBag(used.length, game);
                renderRacks(racks);
                turn = (turn + 1) % NUMBER_OF_PLAYERS;
                updateTurn();
            } else {
                alert(`The word ${word} cannot be placed at (${x}, ${y}).`);
            }
        }
    });
    
    document.getElementById('reset').addEventListener('click', () => {
        game.reset();
        renderGame(game);
    });

    document.getElementById('help').addEventListener('click', () => {
        const possibilities = utils.bestPossibleWords(racks[turn].getAvailableTiles());
        const hint = possibilities[Math.floor(Math.random() * possibilities.length)];
        document.getElementById("hint").innerText = hint;
    });
});