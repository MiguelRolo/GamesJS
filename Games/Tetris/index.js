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
          cellColumn + col < 0 ||
          cellColumn + col >= playfield[0].length ||
          cellRow + row >= playfield.length ||
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

        if (tetromino.row + row < 0) {
          return showGameOver();
        }

        playfield[tetromino.row + row][tetromino.column + col] = tetromino.name;
      }
    }
  }

  for (let row = playfield.length - 1; row >= 0; ) {
    if (playfield[row].every(cell => !!cell))  {
      linesCounter++;
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
}

function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;

  context.fillStyle = 'rgba(15,15,15,0.5)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'firebrick';
  context.fillRect(0, canvas.height / 2 - 30, canvas.width, 90);

  context.globalAlpha = 1;
  context.fillStyle = 'white';
  context.font = '15px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
  context.fillText('Press "N" to try again', canvas.width / 2, (canvas.height / 2) + 30);
}

function showGameStart() {
  context.fillStyle = 'rgba(15,15,15,0.5)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'firebrick';
  context.fillRect(0, canvas.height / 2 - 30, canvas.width, 90);

  context.globalAlpha = 1;
  context.fillStyle = 'white';
  context.font = '15px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('START GAME', canvas.width / 2, canvas.height / 2);
  context.fillText('Press "N" to start', canvas.width / 2, (canvas.height / 2) + 30);
}

function showGamePause() {
  context.fillStyle = 'rgba(15,15,15,0.5)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 1;
  context.fillStyle = 'white';
  context.font = '15px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('GAME PAUSED', canvas.width / 2, canvas.height / 2);
  context.fillText('Press "P" to continue', canvas.width / 2, (canvas.height / 2) + 30);
}


for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for(let column = 0; column < 10; column++) {
    playfield[row][column] = 0;
  }
}

let count = 0;
let linesCounter = 0;
let nextTetromino = getNextTetromino();
let tetromino = nextTetromino;
let rAF = null;
let gameOver = false;
let gameStart = false;
let gamePause = false;

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
  if (!gamePause) {
    rAF = requestAnimationFrame(game);
  }

  document.getElementById('lines-counter').innerText = ('0' + linesCounter).slice(-2);

  context.clearRect(0, 0, canvas.width, canvas.height);
  nextPieceContext.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

  for (let row = 0; row < 20; row++) {
    for (let column = 0; column < 10; column++) {
      context.fillStyle = 'rgba(25,25,25,0.05)';
      context.fillRect(0, row * grid, canvas.width, grid - 1);
      context.fillRect(column * grid, 0, grid - 1, canvas.height);
      if (playfield[row][column]) {
        const name = playfield[row][column];
        
        context.fillStyle = 'white';
        context.fillRect(column * grid, row * grid, grid - 1, grid - 1);
        context.fillStyle = colors[name];
        context.fillRect((column * grid) + 1, (row * grid) + 1, (grid - 1) - 2, (grid - 1) - 2);
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
  
  
  if (gameStart) {
    if (nextTetromino) {
      for (let row = 0; row < nextTetromino.matrix.length; row++) {
        for (let col = 0; col < nextTetromino.matrix[row].length; col++) {
          if (nextTetromino.matrix[row][col]) {
            nextPieceContext.fillStyle = 'white';
            nextPieceContext.fillRect(
              nextTetromino.name === 'I' 
                ? col * grid 
                : (col + 1) * grid, 
              nextTetromino.name === 'I' ? row * grid : (row + 1) * grid, 
              grid-1, 
              grid-1
            );
            nextPieceContext.fillStyle = colors[nextTetromino.name];
            nextPieceContext.fillRect(
              nextTetromino.name === 'I'
                ? (col * grid) + 1
                : ((col + 1) * grid) + 1, 
              nextTetromino.name === 'I'
                ? (row * grid) + 1
                : ((row + 1) * grid) + 1, 
              (grid-1) - 2, 
              (grid-1) - 2
            )
          }
        }
      }
    }
    if (tetromino) {
      if (++count > 35) {
        tetromino.row++;
        count = 0;
        
        if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.column)) {
          tetromino.row--;
          placeTetromino();
          tetromino = nextTetromino;
          nextTetromino = getNextTetromino();
        }
      }
  
      for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
          if (tetromino.matrix[row][col]) {
            context.fillStyle = 'white';
            context.fillRect((tetromino.column + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
            context.fillStyle = colors[tetromino.name];
            context.fillRect(((tetromino.column + col) * grid) + 1, ((tetromino.row + row) * grid) + 1, (grid-1) - 2, (grid-1) - 2);
          }
        }
      }
    }

    if (gamePause) {
      showGamePause();
    }
  } else {
    return showGameStart();
  }
}

document.getElementById('start-game').onclick = (e) => {
  if (!gameStart) {
    gameStart = true;
    tetromino = nextTetromino;
    nextTetromino = getNextTetromino();
    e.target.innerText = 'New Game';
  } 
  if (gameStart) {
    gameStart = true;
    for (let row = 0; row < 20; row++) {
      for (let column = 0; column < 10; column++) {
        playfield[row][column] = 0;
      }
    }
    tetromino = nextTetromino;
    nextTetromino = getNextTetromino();
    linesCounter = 0;
  }
}


document.getElementById('pause-game').onclick = (e) => {
  if (gameStart) {
    if (!gamePause) {
      gamePause = true;
      e.target.innerText = 'Resume';
    } else {
      requestAnimationFrame(game);
      gamePause = false;
      e.target.innerText = 'Pause';
    }
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'n') {
    if (gameOver) {
      rAF = requestAnimationFrame(game);
      gameOver = false;
    }
    tetromino = nextTetromino;
    nextTetromino = getNextTetromino();
    document.getElementById('start-game').innerText = 'New Game';
    gameStart = true;
    linesCounter = 0;
    for (let row = 0; row < 20; row++) {
      for (let column = 0; column < 10; column++) {
        playfield[row][column] = 0;
      }
    }
  }

  if (gameOver) return;

  if (gameStart) {
    if (e.key === 'p') {
      if (!gamePause) {
        gamePause = true;
        document.getElementById('pause-game').innerText = 'Resume';
      } else {
        requestAnimationFrame(game);
        gamePause = false;
        document.getElementById('pause-game').innerText = 'Pause';
      }
    }
    if (e.key === ' ') {
      count = 0;
      while (count < 35) {
        tetromino.row = count++;
        if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.column)) {
          tetromino.row--;
          placeTetromino();
          tetromino = nextTetromino;
          nextTetromino = getNextTetromino();
          return;
        } 
      }
    }

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
        tetromino = nextTetromino;
        nextTetromino = getNextTetromino();
        return;
      }
  
      tetromino.row = row;
    }
  }
});

rAF = requestAnimationFrame(game);
window.onload = () => {
  fpsMeter();
}