const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const nextPieceCanvas = document.getElementById('nextpiece');
const nextPieceContext = nextPieceCanvas.getContext('2d');

canvas.style.border = '1px solid white';
nextPieceCanvas.style.border = '1px solid white';

const playfield = [];
const tetrominoSequence = [];
const grid = canvas.height / 20;

const tetrominos = {
  'I': [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  'J': [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  'L': [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  'O': [
    [1,1],
    [1,1],
  ],
  'S': [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  'Z': [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  'T': [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ]
};

const colors = {
  'I': 'cyan',
  'O': 'yellow',
  'T': 'purple',
  'S': 'green',
  'Z': 'red',
  'J': 'blue',
  'L': 'orange'
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSequence() {
  const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  while (sequence.length) {
    const random = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(random, 1)[0];
    tetrominoSequence.push(name);
  }
}

function getNextTetromino() {
  if (tetrominoSequence.length === 0) {
    generateSequence();
  }

  const name = tetrominoSequence.pop();
  const matrix = tetrominos[name];

  const column = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = name === 'I' ? -1 : -2;


  return {
    name: name,
    matrix: matrix,
    column: column,
    row: row
  }
}

function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) => 
    row.map((value, j) => matrix[N - j][i])
  )

  return result;
}

function isValidMove(matrix, cellRow, cellColumn) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] && (
          // outside the game bounds
          cellColumn + col < 0 ||
          cellColumn + col >= playfield[0].length ||
          cellRow + row >= playfield.length ||
          // collides with another piece
          playfield[cellRow + row][cellColumn + col])
        ) {
        return false;
      }
    }
  }

  return true;
}

function placeTetromino() {
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {

        // game over if piece has any part offscreen
        if (tetromino.row + row < 0) {
          return showGameOver();
        }

        playfield[tetromino.row + row][tetromino.column + col] = tetromino.name;
      }
    }
  }

  // check for line clears starting from the bottom and working our way up
  for (let row = playfield.length - 1; row >= 0; ) {
    if (playfield[row].every(cell => !!cell)) {

      // drop every row above this one
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r-1][c];
        }
      }
    }
    else {
      row--;
    }
  }

  tetromino = getNextTetromino();
}

function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;

  context.fillStyle = 'black';
  //context.globalAlpha = 0.75;
  context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

  context.globalAlpha = 1;
  context.fillStyle = 'white';
  context.font = '15px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}


for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for(let column = 0; column < 10; column++) {
    playfield[row][column] = 0;
  }
}

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;
let gameOver = false;

function fpsMeter() {
  let prevTime = Date.now();
  let frames = 0;
  let counter = document.getElementById('fps-counter');

  requestAnimationFrame(function meter() {
    const time = Date.now();
    frames++;
    if (time > prevTime + 1000) {
      let fps = Math.round( ( frames * 1000 ) / ( time - prevTime ) );
      prevTime = time;
      frames = 0;

      counter.innerText = ('0' + fps).slice(-2);
    }

    requestAnimationFrame(meter);
  })
}

function game() {
  rAF = requestAnimationFrame(game);
  context.clearRect(0, 0, canvas.width, canvas.height);
  nextPieceContext.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

  for (let row = 0; row < 20; row++) {
    for (let column = 0; column < 10; column++) {
      context.fillStyle = 'rgba(25,25,25,0.05)';
      context.fillRect(0, row * grid, canvas.width, grid - 1);
      context.fillRect(column * grid, 0, grid - 1, canvas.height);
      if (playfield[row][column]) {
        const name = playfield[row][column];
        context.fillStyle = colors[name];
        
        context.fillRect(column * grid, row * grid, grid - 1, grid - 1);
      }
    }
  }

  for (let row = 0; row < 5; row++) {
    for (let column = 0; column < 5; column++) {
      nextPieceContext.fillStyle = 'rgba(25,25,25,0.05)';
      nextPieceContext.fillRect(0, row * grid, nextPieceCanvas.width, grid - 1);
      nextPieceContext.fillRect(column * grid, 0, grid - 1, nextPieceCanvas.height);
    }
  }


  if (tetromino) {

    if (++count > 35) {
      tetromino.row++;
      count = 0;
      
      if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.column)) {
        tetromino.row--;
        placeTetromino();
      }
    }

    context.fillStyle = colors[tetromino.name];

    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {

          context.fillRect((tetromino.column + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
        }
      }
    }
  }
}

document.addEventListener('keydown', (e) => {
  if (gameOver) return;

  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const col = e.key === 'ArrowLeft'
      ? tetromino.column - 1
      : tetromino.column + 1;

    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
      tetromino.column = col;
    }
  }

  if (e.key === 'ArrowUp') {
    const matrix = rotate(tetromino.matrix);
    if (isValidMove(matrix, tetromino.row, tetromino.column)) {
      tetromino.matrix = matrix;
    }
  }

  if(e.key === 'ArrowDown') {
    const row = tetromino.row + 1;

    if (!isValidMove(tetromino.matrix, row, tetromino.column)) {
      tetromino.row = row - 1;

      placeTetromino();
      return;
    }

    tetromino.row = row;
  }
});

rAF = requestAnimationFrame(game);
window.onload = () => {
  fpsMeter();
}