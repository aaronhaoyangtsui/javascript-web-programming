import {letterScores, LSx2p, LSx3p, WSx2p, WSx3p} from './constants.js';
import { baseScore } from './scrabbleUtils.js';

'use strict';

function shuffle(array) {
    // Fisher-Yates shuffle, used for random decoder cipher below    
    let m = array.length;
    
    // While there remain elements to shuffle…                                                                                
    while (m) {
	
        // Pick a remaining element…                                                                                          
        const i = Math.floor(Math.random() * m--);
	
        // And swap it with the current element.                                                                              
        const t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    
    return array;
}

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

        this.empty = true; // Track that we placed at least one word.

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
     * This function shuffles the given tiles into the bag, and returns replacement tiles.
     * @param {Array<string>} tiles  The tiles to shuffle back into the bag.
     * @returns {Array<string>} Some replacement tiles (same amount as shuffled)
     * @throws {string} An error message if there are not enough tiles remaining in the bag.
     */
    shuffle(tiles) {
        if (tiles.length > this.bag.length) {
            throw `There are only ${this.bag.length} tiles in the bag.`;
        }

        const drawn = this.takeFromBag(tiles.length);
        tiles.forEach(tile => this.bag.push(tile));
        return drawn;
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
     * This function will return the full word created when placing a word at a given position, looking in the
     * given direction.
     */
    extend(word, position, direction) {
        let extended = word;

        // First look left / up
        for (let i = 1;; ++i) {
            if ((direction && position.x - i < 1) || (!direction && position.y - i < 1)) {
                break;
            }

            const tile = direction ? this.grid[position.x - i][position.y] : this.grid[position.x][position.y - i];
            if (tile === null) {
                break;
            } else {
                extended = tile + extended;
            }
        }

        // Then right / down
        for (let i = 0;; ++i) {
            if ((direction && position.x + word.length + i > 15) || (!direction && position.y + word.length + i > 15)) {
                break;
            }

            const tile = direction ? this.grid[position.x + word.length + i][position.y] : this.grid[position.x][position.y + word.length + i];
            if (tile === null) {
                break;
            } else {
                extended = extended + tile;
            }
        }

        return extended;
    }

    /**
     * This utility function will return the score obtained by placing the word at the given position.
     * It will look to extend the word in the given direction.
     */
    _score(word, position, direction) {
        const extended = this.extend(word, position, direction);
        let score = baseScore(extended.replace(word, '')); // Previously placed tiles don't care about premiums.
        let multiplier = 1;

        for (let i = 0; i < word.length; ++i) {
            const coordinate = {
                x: direction ? (position.x + i) : position.x,
                y: direction ? position.y : (position.y + i),
            };

            if (this.grid[coordinate.x][coordinate.y] === null) {
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
            } else {
                score += letterScores[word.charAt(i)];
            }
        }

        return score * multiplier;
    }

    /**
     * This function will be called when a player takes a turn and attempts to place a word on the board.
     * It will check whether the word can be placed at the given position. If not, it'll throw an error message.
     * It will then compute the score that the turn will receive and return it.
     * @param {string} word The word to be placed.
     * @param {Object<x|y, number>} position The position, an object with properties x and y. Example: { x: 2, y: 3 }.
     * @param {boolean} direction Set to true if horizontal, false if vertical.
     * @returns {number} The score the turn will obtain.
     * @throws {string} An error message explaining what went wrong with the turn.
     */
    playAt(word, position, direction) {
        // Check if the word fits on the grid
        if (position.x < 1 || position.y < 1 || (direction && position.x + word.length > 15) || (!direction && position.y + word.length > 15)) {
            throw "The word does not fit on the grid starting at the given position.";
        }

        if (this.empty && word.length < 2) {
            throw "The first word must contain at least two letters.";
        }

        let extendsAtLeastOne = false;

        // Check if the word doesn't intercept "badly" already placed tiles.
        for (let i = 0; i < word.length; ++i) {
            const tile = direction ? this.grid[position.x + i][position.y] : this.grid[position.x][position.y + i];
            if (tile !== null && tile !== word[i]) {
                throw "The word intercepts already placed tiles.";
            }
        }

        // Check the formed word(s) are all valid, and compute the score.
        let score = 0;
        // First, we look left and right / up and down to see if we appended to some existing word
        const extended = this.extend(word, position, direction);
        if (extended.length !== 1) {
            if (!dictionary.includes(extended)) {
                throw `The word '${extended}' is not in the dictionary.`;
            }

            if (extended !== word) {
                extendsAtLeastOne = true;
            }
            score += this._score(word, position, direction);
        }

        // We then try every possibility in the other direction. If the word can be extended, then it should be valid.
        for (let i = 0; i < word.length; ++i) {
            const coordinate = {
                x: direction ? (position.x + i) : position.x,
                y: direction ? position.y : (position.y + i),
            };

            const extended = this.extend(word[i], coordinate, !direction);
            if (extended.length !== 1) {
                if (!dictionary.includes(extended)) {
                    throw `The word '${extended}' is not in the dictionary.`;
                }

                if (extended !== word) {
                    extendsAtLeastOne = true;
                }

                if (this.grid[coordinate.x][coordinate.y] === null) {
                    score += this._score(word[i], coordinate, !direction);
                }
            }
        }

        if (this.empty) {
            if (direction && (position.y !== 8 || position.x > 8 || position.x + word.length < 8)) {
                throw "The first word must be placed on the center tile.";
            } else if (!direction && (position.x !== 8 || position.y > 8 || position.y + word.length < 8)) {
                throw "The first word must be placed on the center tile.";
            }

            this.empty = false;
        } else if (!extendsAtLeastOne) {
            throw "The word does not build on previously placed tiles.";
        }

        // We now place the word.
        this.empty = false; // Track that we placed at least one word.
        for (let i = 0; i < word.length; ++i) {
            const coordinate = {
                x: direction ? (position.x + i) : position.x,
                y: direction ? position.y : (position.y + i),
            };

            this.grid[coordinate.x][coordinate.y] = word.charAt(i);
        }

        // every time we place a word, we save the grid.
        window.localStorage.setItem("grid", JSON.stringify(this.grid));

        return score;
    }
}
