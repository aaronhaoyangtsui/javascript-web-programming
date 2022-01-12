import {Game} from './game.js';

const game = new Game();
const board = document.getElementById('board')
game.render(board);

document.getElementById('play').addEventListener('click', () => {
    const word = document.getElementById('word').value;
    const x = parseInt(document.getElementById('x').value);
    const y = parseInt(document.getElementById('y').value);
    const direction = document.getElementById('direction').value === 'horizontal';

    game.playAt(word, {x, y}, direction);
    game.render(board);
});

document.getElementById('reset').addEventListener('click', () => {
    game.reset();
    game.render(board);
});