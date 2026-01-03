// 游戏核心变量
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// 画布与蛇参数 不变
const gridSize = 20;
const tileCount = 20;
canvas.width = gridSize * tileCount;
canvas.height = gridSize * tileCount;

let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameLoop;
let isGameOver = true;
let isPaused = false;

// 水果样式表（直接画布绘制，无DOM兼容问题，更稳定）
const fruits = [
  { color: "#e63946", radius: 8 }, // 苹果 红
  { color: "#f9c74f", radius: 7 }, // 柠檬 黄
  { color: "#ff4d6d", radius: 6 }, // 草莓 粉
  { color: "#f8961e", radius: 8 }, // 橙子 橙
  { color: "#7209b7", radius: 7 }, // 葡萄 紫
  { color: "#43aa8b", radius: 9 }  // 西瓜 绿
];

// 初始化游戏
function initGame() {
  snake = [{ x: 10 * gridSize, y: 10 * gridSize }];
  direction = 'right';
  nextDirection = 'right';
  score = 0;
  scoreElement.textContent = `分数: ${score}`;
  spawnFood();
  isGameOver = false;
  isPaused = false;
  pauseBtn.textContent = '暂停游戏';
}

// 生成随机水果食物
function spawnFood() {
  food.x = Math.floor(Math.random() * tileCount) * gridSize;
  food.y = Math.floor(Math.random() * tileCount) * gridSize;
  // 避免刷在蛇身上
  for(let segment of snake){
    if(segment.x === food.x && segment.y === food.y){
      spawnFood();
      return;
    }
  }
  // 随机选一种水果
  food.type = Math.floor(Math.random() * fruits.length);
}

// 绘制可爱圆润蛇身
function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.beginPath();
    // 蛇头深粉 蛇身浅粉，圆润可爱风
    ctx.fillStyle = index === 0 ? "#ff8fa3" : "#ffc2d1";
    // 大圆角，蛇身更萌
    ctx.roundRect(segment.x + 1, segment.y + 1, gridSize - 2, gridSize - 2, 6);
    ctx.fill();
    // 蛇头加小眼睛，更灵动
    if(index === 0){
      ctx.fillStyle = "#000";
      let eyeSize = 2;
      if(direction === 'right'){
        ctx.fillRect(segment.x+14, segment.y+4, eyeSize, eyeSize);
        ctx.fillRect(segment.x+14, segment.y+14, eyeSize, eyeSize);
      }else if(direction === 'left'){
        ctx.fillRect(segment.x+4, segment.y+4, eyeSize, eyeSize);
        ctx.fillRect(segment.x+4, segment.y+14, eyeSize, eyeSize);
      }else if(direction === 'up'){
        ctx.fillRect(segment.x+4, segment.y+4, eyeSize, eyeSize);
        ctx.fillRect(segment.x+14, segment.y+4, eyeSize, eyeSize);
      }else if(direction === 'down'){
        ctx.fillRect(segment.x+4, segment.y+14, eyeSize, eyeSize);
        ctx.fillRect(segment.x+14, segment.y+14, eyeSize, eyeSize);
      }
    }
  });
}

// 绘制水果食物
function drawFood() {
  let fruit = fruits[food.type];
  ctx.beginPath();
  // 圆形水果，贴合可爱风格
  ctx.arc(food.x + gridSize/2, food.y + gridSize/2, fruit.radius, 0, Math.PI*2);
  ctx.fillStyle = fruit.color;
  ctx.fill();
  // 加高光，更立体
  ctx.beginPath();
  ctx.arc(food.x + gridSize/3, food.y + gridSize/3, 2, 0, Math.PI*2);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fill();
}

// 移动蛇 逻辑不变
function moveSnake() {
  if (isPaused || isGameOver) return;
  direction = nextDirection;
  const head = { ...snake[0] };

  switch (direction) {
    case 'up': head.y -= gridSize; break;
    case 'down': head.y += gridSize; break;
    case 'left': head.x -= gridSize; break;
    case 'right': head.x += gridSize; break;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = `分数: ${score}`;
    spawnFood();
  } else {
    snake.pop();
  }
  checkCollision();
  draw();
}

// 碰撞检测 不变
function checkCollision() {
  const head = snake[0];
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    gameOver();
  }
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) gameOver();
  }
}

// 绘制游戏 不变
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawFood();
}

// 游戏结束 不变
function gameOver() {
  clearInterval(gameLoop);
  isGameOver = true;
  alert(`游戏结束！最终分数: ${score}`);
}

// 方向控制 不变
document.addEventListener('keydown', (e) => {
  if (isGameOver) return;
  switch (e.key) {
    case 'ArrowUp': if (direction !== 'down') nextDirection = 'up'; break;
    case 'ArrowDown': if (direction !== 'up') nextDirection = 'down'; break;
    case 'ArrowLeft': if (direction !== 'right') nextDirection = 'left'; break;
    case 'ArrowRight': if (direction !== 'left') nextDirection = 'right'; break;
    case ' ': e.preventDefault(); togglePause(); break;
  }
});

// 启停按钮逻辑 不变
startBtn.addEventListener('click', () => {
  if (!isGameOver) return;
  initGame();
  gameLoop = setInterval(moveSnake, 300);
});

pauseBtn.addEventListener('click', togglePause);
function togglePause() {
  if (isGameOver) return;
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? '继续游戏' : '暂停游戏';
}

// 初始化
draw();