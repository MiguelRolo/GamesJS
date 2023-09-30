const canvas = document.getElementById('jogo');
const context = canvas.getContext('2d');

canvas.style.border = '3px solid rgba(255, 255, 255, 0.2)';
const grid = 15;

const getRandomDirection = () => Math.random() < 0.5 ? -1 : 1;

const paddleVelocity = 6;
const paddleHeight = grid * 5;
const paddleMaxY = canvas.height - grid - paddleHeight;
const paddleLeft = {
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,
  dy: 0
}

const paddleRight = {
  x: canvas.width - (grid * 3),
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,
  dy: 0
}

const ballVelocity = 5 * getRandomDirection();
const ball = {
  x: canvas.width / 2 - grid / 2,
  y: canvas.height / 2 - grid / 2,
  width: grid,
  height: grid,
  reset: false,
  dx: ballVelocity,
  dy: -ballVelocity,
}

function Collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y;
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

function showGameOver(paddle) {
  cancelAnimationFrame(rAF);
  gameOver = true;
  gameStart = false;
  

  context.fillStyle = 'rgba(15,15,15,0.5)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'firebrick';
  context.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);

  context.globalAlpha = 1;
  context.fillStyle = 'white';
  context.font = '15px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
  context.fillText(
    paddle === 'left' ? 'LEFT PADDLE WON!' : 
    paddle === 'right' && 'RIGHT PADDLE WON!', 
    canvas.width / 2, canvas.height / 2);
  context.fillText('Press "N" to try again', canvas.width / 2, (canvas.height / 2) + 30);
}

const times = [];
let fps;

function refreshLoop() {
  window.requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    document.getElementById('fps-counter').innerText = times.length;
    refreshLoop();
  });
}

let scoreLeft = 0;
let scoreRight = 0;
let maxScore = 5;
let rAF = null;
let gameOver = false;
let gameStart = false;
let gamePause = false;


function game() {
  if (!gamePause) {
    rAF = requestAnimationFrame(game);
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'lightgrey';
  context.fillRect(0,0,canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.width);

  context.font = '30px "Courier New", Courier, monospace';
  context.fillText(('0' + scoreLeft).slice(-2), grid * 5, grid * 5);
  context.fillText(('0' + scoreRight).slice(-2), canvas.width - (grid * 8), grid * 5);
  
  for (let i = grid; i < canvas.height - grid; i+= grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }

  if (gameStart) {
    paddleLeft.y += paddleLeft.dy;
    paddleRight.y += paddleRight.dy;
  
    if (paddleLeft.y < grid) {
      paddleLeft.y = grid;
    } else if (paddleLeft.y > paddleMaxY) {
      paddleLeft.y = paddleMaxY;
    }
  
    if (paddleRight.y < grid) {
      paddleRight.y = grid;
    } else if (paddleRight.y > paddleMaxY) {
      paddleRight.y = paddleMaxY;
    }
  
    context.fillStyle = 'white';
    context.fillRect(paddleLeft.x, paddleLeft.y, paddleLeft.width, paddleLeft.height);
    context.fillRect(paddleRight.x, paddleRight.y, paddleRight.width, paddleRight.height);
    
    ball.x += ball.dx;
    ball.y += ball.dy;
  
    if (ball.y < grid) {
      ball.y = grid;
      ball.dy *= -1;
    } else if (ball.y + grid > canvas.height - grid) {
      ball.y = canvas.height - (grid * 2);
      ball.dy *= -1;
    }
  
    if (Collides(ball, paddleRight)) {
      ball.dx *= -1;
      ball.x = paddleRight.x - ball.width;
    } else if (Collides(ball, paddleLeft)) {
      ball.dx *= -1;
      ball.x = paddleLeft.x + paddleLeft.width;
    }
  
    if ((ball.x < 0 || ball.x > canvas.width) && !ball.reset) {
      ball.reset = true;
      
      if (ball.x < 0) {
        scoreRight++;
        if (scoreRight === maxScore) {
          setTimeout(() => showGameOver('right'), 250);
        }
      } else if (ball.x > canvas.width) {
        scoreLeft++;
        if (scoreLeft === maxScore) {
          setTimeout(() => showGameOver('left'), 250);
        }
      }
  
      setTimeout(() => {
        ball.reset = false;
        ball.x = canvas.width / 2 - grid / 2;
        ball.y = canvas.height / 2 - grid / 2;
        ball.dx *= -1;
        ball.dy *= getRandomDirection();
      }, 500);
    }
  
    context.fillStyle = 'white';
    context.fillRect(ball.x, ball.y, ball.width, ball.height);
    if (gamePause) {
      showGamePause();
    }
  } else {
    return showGameStart();
  }
}

document.addEventListener('keydown',(e) => {
  if (e.key === 'n') {
    if (gameOver) {
      rAF = requestAnimationFrame(game);
      gameOver = false;
    }
    gameStart = true;
    scoreLeft = 0;
    scoreRight = 0;
    ball.x = canvas.width / 2 - grid / 2;
    ball.y = canvas.height / 2 - grid / 2;
    ball.dx *= getRandomDirection();
    ball.dy *= getRandomDirection();
    paddleLeft.y = canvas.height / 2 - paddleHeight / 2;
    paddleRight.y = canvas.height / 2 - paddleHeight / 2;
  }

  if (!gameStart || gameOver) {
    if (e.key === '+' && maxScore < 99) {
      maxScore++;
    }
    if (e.key === '-' && maxScore > 1) {
      maxScore--;
    }
  }

  if (gameStart) {
    if (e.key === 'p') {
      if (!gamePause) {
        gamePause = true;
      } else {
        requestAnimationFrame(game);
        gamePause = false;
      }
    }

    if (e.key === 'ArrowUp') {
      paddleRight.dy = -paddleVelocity;
    }
    if (e.key === 'ArrowDown') {
      paddleRight.dy = paddleVelocity;
    }
    if (e.key === 'w') {
      paddleLeft.dy = -paddleVelocity;
    }
    if (e.key === 's') {
      paddleLeft.dy = paddleVelocity;
    }
  }
})

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    paddleRight.dy = 0;
  }
  if (e.key === 'w' || e.key === 's') {
    paddleLeft.dy = 0;
  }
})

rAF = requestAnimationFrame(game);
window.onload = () => {
  refreshLoop();
}