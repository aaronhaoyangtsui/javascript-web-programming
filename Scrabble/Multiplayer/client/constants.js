export const letterScores = {
    '*': 0, 'a': 1, 'b': 3, 'c': 3, 'd': 2, 'e': 1, 'f': 4, 'g': 2, 'h': 4, 'i': 1, 'j': 8, 'k': 5, 'l': 1, 'm': 3,
    'n': 1, 'o': 1, 'p': 3, 'q': 10, 'r': 1, 's': 1, 't': 1, 'u': 1, 'v': 4, 'w': 4, 'x': 8, 'y': 4, 'z': 10
};

// Some preprocessing: Since JS cannot easily compare objects, we will transform the premium tile coordinates
// to numbers. For a pair of coordinates x, y, we set c = x * 100 + 1. We pick 100 because x and y are less than
// or equal to 15 (2-digit). This preprocessing allows us to use the builtin `Array.includes` later on.
// Example: (x, y) = (3, 14) --> processed = 3 * 100 + 14 = 314.

// The double letter score positions
export const LSx2p = [
    {x: 7, y: 7}, {x: 9, y: 7}, {x: 7, y: 9}, {x: 9, y: 9},
    {x: 8, y: 4}, {x: 7, y: 3}, {x: 9, y: 3}, {x: 4, y: 1}, {x: 12, y: 1},
    {x: 8, y: 12}, {x: 7, y: 13}, {x: 9, y: 13}, {x: 4, y: 15}, {x: 12, y: 15},
    {x: 4, y: 8}, {x: 3, y: 7}, {x: 3, y: 9}, {x: 1, y: 4}, {x: 1, y: 12},
    {x: 12, y: 8}, {x: 13, y: 7}, {x: 13, y: 9}, {x: 15, y: 4}, {x: 15, y: 12}
].map(coordinate => coordinate.x * 100 + coordinate.y);

// The triple letter score positions
export const LSx3p = [
    {x: 6, y: 2}, {x: 10, y: 2},
    {x: 2, y: 6}, {x: 6, y: 6}, {x: 10, y: 6}, {x: 14, y: 6},
    {x: 2, y: 10}, {x: 6, y: 10}, {x: 10, y: 10}, {x: 14, y: 10},
    {x: 6, y: 14}, {x: 10, y: 14},
].map(coordinate => coordinate.x * 100 + coordinate.y);

// The double word score positions
export const WSx2p = [
    {x: 8, y: 8},
    {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}, {x: 5, y: 5},
    {x: 11, y: 11}, {x: 12, y: 12}, {x: 13, y: 13}, {x: 14, y: 14},
    {x: 2, y: 14}, {x: 3, y: 13}, {x: 4, y: 12}, {x: 5, y: 11},
    {x: 11, y: 5}, {x: 12, y: 4}, {x: 13, y: 3}, {x: 14, y: 2},
].map(coordinate => coordinate.x * 100 + coordinate.y);

// The triple word score positions
export const WSx3p = [
    {x: 1, y: 1}, {x: 8, y: 1}, {x: 15, y: 1},
    {x: 1, y: 8}, {x: 15, y: 8},
    {x: 1, y: 15}, {x: 8, y: 15}, {x: 15, y: 15}
].map(coordinate => coordinate.x * 100 + coordinate.y);