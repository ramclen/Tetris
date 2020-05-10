const canvas = document.getElementById('tetris')
const context = canvas.getContext('2d');

context.scale(20, 20)

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    if (rowCount > 0) {
      new Audio('./asset/line.wav').play();
    }
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}


function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
        (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === 'T') {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ]
  } else if (type === 'O') {
    return [
      [2, 2],
      [2, 2],
    ]
  } else if (type === 'L') {
    return [
      [3, 0, 0],
      [3, 0, 0],
      [3, 3, 0],
    ]
  } else if (type === 'J') {
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0],
    ]
  } else if (type === 'I') {
    return [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
    ]
  } else if (type === 'S') {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ]
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ]
  }
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 })
  drawMatrix(player.matrix, player.pos)
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(
          x + offset.x,
          y + offset.y,
          1, 1
        );
      }
    })
  })
}
let dropCounter = 0;
let dropInterval = 1000;
let mainTheme;

let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (gameStarted && !mainTheme) {
    mainTheme = new Audio('./asset/main-theme.ogg');
    mainTheme.loop = true
    mainTheme.play();
  }
  if (gameStarted && dropCounter > dropInterval) {
    playerDrop();
  }
  requestAnimationFrame(update);
  draw();
  updateScore();
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    new Audio('./asset/hit.wav').play();
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = 'ILJOTZS';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos = {
    y: 0,
    x: (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
  };
  if (collide(arena, player)) {
    gameStarted = false;
    mainTheme.pause();
    mainTheme = null;
    new Audio('./asset/gameover.mp3').play();
    arena.forEach(row => row.fill(0));
    player.score = 0;
  }
}

function playerRotate(dir) {
  const { pos } = player
  let offset = 1;
  rotate(player.matrix, dir)
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      return;
    }
  }
}

let gameStarted = false;


document.addEventListener('keydown', event => {
  if (event.keyCode === 37) {
    playerMove(-1)
  } else if (event.keyCode === 39) {
    playerMove(1)
  } else if (event.keyCode === 40) {
    playerDrop();
  } else if (event.keyCode === 81) {
    playerRotate(-1)
  } else if (event.keyCode === 87) {
    playerRotate(1)
  } else if (event.keyCode === 32) {
    console.log('gameStarted');
    gameStarted = true;
  }
})


const colors = [
  null,
  'red',
  'blue',
  'violet',
  'green',
  'purple',
  'orange',
  'pink'
]
const arena = createMatrix(12, 20);

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value
      }
    })
  })
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x]
      ] = [
          matrix[y][x],
          matrix[x][y]
        ];
    }
  };

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }

}

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0
};

function updateScore() {
  document.getElementById('score').innerText = player.score;
}

playerReset();

update();

