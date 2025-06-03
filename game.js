import { positiveItems, negativeItems } from './items.js';
import { modelRanks } from './models.js';
import { config } from './config.js';

let score = 0;
let timeLeft = config.gameDuration;
let gameInterval = null;      // 控制倒计时
let itemInterval = null;      // 控制item自动切换

const scoreDisplay = document.getElementById('score');
const furnace = document.getElementById('furnace');
const furnaceContent = document.getElementById('furnace-content');
const timerDisplay = document.getElementById('timer');
const resultDisplay = document.getElementById('result');
const startButton = document.getElementById('start-button');
const modelDisplay = document.getElementById('current-model');

function getCurrentModel(score) {
  let current = modelRanks[0].name;
  for (let i = 0; i < modelRanks.length; i++) {
    if (score >= modelRanks[i].min) {
      current = modelRanks[i].name;
    } else {
      break;
    }
  }
  return current;
}

function updateModelDisplay() {
  modelDisplay.textContent = `当前模型：${getCurrentModel(score)}`;
}

function updateScore(change) {
  score += change;
  if(score < 0) score = 0; // 分数不能为负
  scoreDisplay.textContent = `分数：${score}`;
  updateModelDisplay();
}

function getRandomItem() {
  const isPositive = Math.random() > (1 - config.positiveItemProbability);
  const pool = isPositive ? positiveItems : negativeItems;
  return pool[Math.floor(Math.random() * pool.length)];
}

function showNextItem() {
  const item = getRandomItem();
  // 先移除动画类
  furnaceContent.classList.remove('drop-in');
  // 触发重排以重新开始动画
  void furnaceContent.offsetWidth;
  // 添加动画类
  furnaceContent.classList.add('drop-in');
  furnaceContent.textContent = `${item.emoji} ${item.name}`;
  furnace.onclick = () => {
    updateScore(item.score);
    // 清除当前定时器
    clearInterval(itemInterval);
    // 设置新的定时器
    itemInterval = setInterval(showNextItem, config.contentSwitchInterval);
    showNextItem();  // 点击后马上切换到下一条
  };
}

function startGame() {
  score = 0;
  timeLeft = config.gameDuration;
  updateScore(0);
  resultDisplay.textContent = '';
  startButton.disabled = true;
  furnace.style.pointerEvents = 'auto';

  // 倒计时开始
  gameInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `倒计时：${timeLeft}s`;
    if (timeLeft <= 0) endGame();
  }, 1000);

  // item自动快速切换
  showNextItem();
  itemInterval = setInterval(showNextItem, config.contentSwitchInterval);
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(itemInterval);
  furnaceContent.textContent = '🔥';
  furnace.style.pointerEvents = 'none';
  startButton.disabled = false;
  const model = getCurrentModel(score);
  resultDisplay.innerHTML = `你炼出了 <strong>${model}</strong>！<br/>分数：${score}<br/>想用真算力？快试试启迪之星算力服务！`;
  timerDisplay.textContent = `倒计时：0s`;
}

startButton.onclick = startGame;
