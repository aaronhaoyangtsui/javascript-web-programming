/**
 * This function will check if a word is valid, that is if it matches any of the words in the dictionary.
 * @param {string} word A string containing lowercase letters, with possible wildcards.
 * @returns {boolean} Returns whether the given word is a valid word.
 */
export function isValid(word) {
    // if the word has no wildcard, then we just check if it is in the dictionary.
    if (!word.includes("*")) {
        return dictionary.includes(word);
    }

    // if it does have one or more wildcard, we replace the first one by every possible character, and recurse.
    for (let i = 0; i < 26; ++i) {
        const letter = String.fromCharCode("a".charCodeAt(0) + i);
        // replace only replaces the first occurence of *.
        if (isValid(word.replace("*", letter))) {
            return true;
        }
    }

    return false;
}

/**
 * This helper function will make a copy of a set of available tiles.
 * As you can see, this function is NOT exported. It is just a helper function for other functions in this file.
 * @param {Object<string, number>} availableTiles A mapping of available tiles to their amount.
 * @returns {Object<string, number>} A copy of the parameter. 
 */
function copyAvailableTiles(availableTiles) {
    const copy = {};
    
    for (const letter in availableTiles) {
        copy[letter] = availableTiles[letter];
    }

    return copy;
}

/**
 * Finds and returns every word from the dictionary that can be constructed with the given tiles.
 * The availableTiles object should not be modified.
 *
 * @param {Object<string, number>} availableTiles A collection of available tiles and their amount.
 * @returns All words that can be constructed with the given tiles.
 */
export function possibleWords(availableTiles) {
    const possibilities = [];

    // Let n be the size of the dictionary, m be the number of tiles in hand.
    // This implementation is not the fastest, O(nm).
    // We could use permutations which would execute in O(m!).
    // It would theoretically be faster, since in standard Scrabble m is constant and equals 7.
    // This other method would however scale really bad with many wildcard tiles.
    for (const word of dictionary) {
        if (canConstructWord(availableTiles, word)) {
            possibilities.push(word);
        }
    }

    return possibilities;
}

/**
 * Finds and returns the word with the highest base score from the dictionary, given a set of available tiles.
 * The availableTiles object should not be modified.
 *
 * @param {Object<string, number>} availableTiles A collection of available tiles and their amount.
 * @returns The word with the highest best score that can be constructed with the given tiles.
 */
export function bestPossibleWords(availableTiles) {
    const possibilities = possibleWords(availableTiles);

    let suggestions = [];
    let max = -1;

    for (const word of possibilities) {
        const score = baseScore(constructWord(availableTiles, word).join(''));
        if (score > max) {
            max = score;
            suggestions = [ word ];
        } else if (score === max) {
            suggestions.push(word);
        }
    }

    return suggestions;
}

/**
 * We define the base score of a word as the score obtained by adding each letter's score, without taking board position
 * into account. This function will compute and return the base score of a given word.
 *
 * @param {string} word The word that will be used to compute the base score.
 * @returns {number} The base score for the given word.
 */
export function baseScore(word) {
    const scores = {
        '*': 0, 'a': 1, 'b': 3, 'c': 3, 'd': 2, 'e': 1, 'f': 4, 'g': 2, 'h': 4, 'i': 1, 'j': 8, 'k': 5, 'l': 1, 'm': 3,
        'n': 1, 'o': 1, 'p': 3, 'q': 10, 'r': 1, 's': 1, 't': 1, 'u': 1, 'v': 4, 'w': 4, 'x': 8, 'y': 4, 'z': 10
    };
    
    let score = 0;

    for (const letter of word) {
        score += scores[letter];
    }
    
    return score;
}

/**
 * This function tris to build a word given a set of available tiles. It will prioritize letter tiles over wildcards.
 * It will return the list of tiles used, or null if the word is not constructible with the given tiles.
 *
 * @param {Object<string, number>} availableTiles A collection of available tiles and their amount.
 * @param {string} word The word a player wants to construct.
 * @returns {Array<string>} The letters used to construct the word, or null if it is not constructible with the tiles.
 */
export function constructWord(availableTiles, word) {
    const copy = copyAvailableTiles(availableTiles);

    const tiles = [];

    for (const letter of word) {
        if (letter in copy) {
            tiles.push(letter);
            --copy[letter];

            if (copy[letter] === 0) {
                delete copy[letter];
            }
        } else {
            if ('*' in copy) {
                tiles.push('*');
                --copy['*'];

                if (copy['*'] === 0) {
                    delete copy['*'];
                }
            } else {
                return null;
            }
        }
    }

    return tiles;
}

/**
 * This function checks whether a given word can be constructed with the available tiles.
 * The availableTiles object should not be modified.
 *
 * @param {Object<string, number>} availableTiles A collection of available tiles and their amount.
 * @param {string} word The word a player wants to construct.
 * @returns true if the word can be constructed with the available tiles, else false.
 */
export function canConstructWord(availableTiles, word) {
    return constructWord(availableTiles, word) !== null;
}