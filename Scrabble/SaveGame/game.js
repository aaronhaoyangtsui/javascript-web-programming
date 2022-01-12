import {shuffle} from './shuffle.js';
import {letterScores, LSx2p, LSx3p, WSx2p, WSx3p} from './constants.js';

'use strict';

export class Game {
    constructor() {
        // Initialize the bag.
        const frequencies = {
            '*': 2, 'a': 9, 'b': 2, 'c': 2, 'd': 4, 'e': 12, 'f': 2, 'g': 3, 'h': 2, 'i': 9, 'j': 1, 'k': 1, 'l': 4, 'm': 2,
            'n': 6, 'o': 8, 'p': 2, 'q': 1, 'r': 6, 's': 4, 't': 6, 'u': 4, 'v': 2, 'w': 2, 'x': 1, 'y': 2, 'z': 1
        };

        this.bag = [];
        for (const letter in frequencies) {
            for (let i = 0; i < frequencies[letter]; ++i) {
                this.bag.push(letter);
            }
        }

        this.bag = shuffle(this.bag);

        // Initialize the grid, or restore it if it is present in local storage.
        if (window.localStorage.getItem("grid") !== null) {
            this.grid = JSON.parse(window.localStorage.getItem("grid"));
        } else {
            this.reset();
        }
    }

    /**
     * This function will reset the game to the default state.
     * It will NOT update visually, hence render should be called after resetting.
     */
    reset() {
        window.localStorage.removeItem("grid");

        this.grid = [];
        for (let i = 1; i <= 15; ++i) {
            this.grid[i] = [];
            for (let j = 1; j <= 15; ++j) {
                this.grid[i][j] = null;
            }
        }

        // if we saved the bag, we should also restore it / reset it in this function.
    }

    render(element) {
        element.innerHTML = '';

        for (let i = 1; i <= 15; ++i) {
            for (let j = 1; j <= 15; ++j) {
                const div = document.createElement('div');
                div.classList.add('grid-item');
                div.innerText = (this.grid[i][j] === null) ? '' : this.grid[i][j];

                const processed = i * 100 + j;

                if (LSx2p.includes(processed)) {
                    div.classList.add('LSx2');
                }

                if (LSx3p.includes(processed)) {
                    div.classList.add('LSx3');
                }

                if (WSx2p.includes(processed)) {
                    div.classList.add('WSx2');
                }

                if (WSx3p.includes(processed)) {
                    div.classList.add('WSx3');
                }

                element.appendChild(div);
            }
        }
    }

    /**
     * This function removes the first n tiles from the bag and returns them.
     * If n is greater than the number of remaining tiles, this removes and returns all the tiles from the bag.
     * If the bag is empty, this returns an empty array.
     * @param {number} n The number of tiles to take from the bag.
     * @returns {Array<string>} The first n tiles removed from the bag.
     */
    takeFromBag(n) {
        if (n >= this.bag.length) {
            const drawn = this.bag;
            this.bag = [];
            return drawn;
        }
        
        const drawn = [];
        for (let i = 0; i < n; ++i) {
            drawn.push(this.bag.pop());
        }
        return drawn;
    }

    /**
     * This function returns the current state of the board.
     * The positions where there are no tiles can be anything (undefined, null, ...).
     * @returns {Array<Array<string>>} A 2-dimensional array representing the current grid.
     */
    getGrid() {
        return this.grid;
    }

    /**
     * This function will be called when a player takes a turn and attempts to place a word on the board.
     * It will check whether the word can be placed at the given position. If not, it'll return -1.
     * It will then compute the score that the word will receive and return it, taking into account special positions.
     * @param {string} word The word to be placed.
     * @param {Object<x|y, number>} position The position, an object with properties x and y. Example: { x: 2, y: 3 }.
     * @param {boolean} direction Set to true if horizontal, false if vertical. 
     * @returns {number} The score the word will obtain (including special tiles), or -1 if the word cannot be placed.
     */
    playAt(word, position, direction) {
        let score = 0;
        let multiplier = 1; // The word score multiplier

        // We first check if the word can be placed
        for (let i = 0; i < word.length; ++i) {
            const tile = direction ? (this.grid[position.x + i] || [])[position.y] : (this.grid[position.x] || [])[position.y + i];
            if (tile !== null) {
                return -1;
            }
        }

        // We now place the word and compute its score at the samne time.
        for (let i = 0; i < word.length; ++i) {
            const coordinate = {
                x: direction ? (position.x + i) : position.x,
                y: direction ? position.y : (position.y + i),
            };

            this.grid[coordinate.x][coordinate.y] = word.charAt(i);
            
            const processed = coordinate.x * 100 + coordinate.y;

            if (LSx2p.includes(processed)) {
                score += letterScores[word.charAt(i)] * 2;
            } else if (LSx3p.includes(processed)) {
                score += letterScores[word.charAt(i)] * 3;
            } else {
                if (WSx2p.includes(processed)) {
                    multiplier *= 2;
                } else if (WSx3p.includes(processed)) {
                    multiplier *= 3;
                }

                score += letterScores[word.charAt(i)];
            }
        }

        // every time we place a word, we save the grid.
        window.localStorage.setItem("grid", JSON.stringify(this.grid));

        return score * multiplier;
    }
}
