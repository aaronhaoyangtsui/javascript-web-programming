import {Game} from './game.js';
import {Rack} from './rack.js';
import * as utils from "./scrabbleUtils.js";

window.addEventListener("load", async function() {
    const response = await fetch("dictionary.json");
    if (!response.ok) {
        console.log(response.error);
        return;
    }

    // We make dictionary a global.
    window.dictionary = await response.json();

    const game = new Game();
    const boardElement = document.getElementById('board')
    game.render(boardElement);

    const rack = new Rack();
    rack.takeFromBag(7, game);
    rack.render(document.getElementById("rack"));
    
    document.getElementById('play').addEventListener('click', () => {
        const word = document.getElementById('word').value;
        const x = parseInt(document.getElementById('x').value);
        const y = parseInt(document.getElementById('y').value);
        const direction = document.getElementById('direction').value === 'horizontal';

        if (!utils.canConstructWord(rack.getAvailableTiles(), word) || !dictionary.includes(word)) {
            alert(`The word ${word} cannot be constructed.`);
        } else {
            if (game.playAt(utils.constructWord(rack.getAvailableTiles(), word).join(''), {x, y}, direction) !== -1) {
                game.render(boardElement);
    
                const used = utils.constructWord(rack.getAvailableTiles(), word);
                used.forEach(tile => rack.removeTile(tile));
                rack.takeFromBag(used.length, game);
                rack.render(document.getElementById("rack"));
            }
        }
    });
    
    document.getElementById('reset').addEventListener('click', () => {
        game.reset();
        game.render(boardElement);
    });

    document.getElementById('help').addEventListener('click', () => {
        const possibilities = utils.bestPossibleWords(rack.getAvailableTiles());
        const hint = possibilities[Math.floor(Math.random() * possibilities.length)];
        document.getElementById("hint").innerText = hint;
    });
});