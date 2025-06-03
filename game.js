import { positiveItems, negativeItems } from './items.js';
import { modelRanks } from './models.js';
import { config } from './config.js';

let score = 0;
let timeLeft = config.gameDuration;
let gameInterval = null;      // 控制倒计时
let itemInterval = null;      // 控制item自动切换
let isShaking = false;        // 控制是否在震动中
let isGameStarted = false;

const scoreDisplay = document.getElementById('score');
const furnace = document.getElementById('furnace');
const furnaceContent = document.getElementById('furnace-content');
const timerDisplay = document.getElementById('timer');
const resultDisplay = document.getElementById('result');
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
  modelDisplay.textContent = getCurrentModel(score);
}

function showScorePopup(score, isError = false) {
  const popup = document.createElement('div');
  popup.className = isError ? 'error-popup' : 'score-popup';
  popup.textContent = score > 0 ? `+${score}` : `${score}`;
  furnace.appendChild(popup);
  
  // 动画结束后移除元素
  popup.addEventListener('animationend', () => {
    popup.remove();
  });
}

function updateScore(change) {
  score += change;
  if(score < 0) score = 0; // 分数不能为负
  scoreDisplay.textContent = score;
  updateModelDisplay();
  if (change !== 0) {
    showScorePopup(change, change < 0);
  }
}

function getRandomItem() {
  const isPositive = Math.random() > (1 - config.positiveItemProbability);
  const pool = isPositive ? positiveItems : negativeItems;
  return pool[Math.floor(Math.random() * pool.length)];
}

function shakeFurnace() {
  if (isShaking) return;
  
  isShaking = true;
  furnace.style.animation = 'shake 0.5s ease-in-out';
  furnace.style.pointerEvents = 'none';  // 禁用点击
  
  // 暂停自动切换
  clearInterval(itemInterval);
  
  // 震动结束后恢复
  setTimeout(() => {
    furnace.style.animation = 'pulse var(--furnace-pulse-interval) ease-in-out infinite';
    furnace.style.pointerEvents = 'auto';  // 恢复点击
    isShaking = false;
    
    // 震动结束后继续游戏
    showNextItem();
    // 重新开始自动切换
    itemInterval = setInterval(showNextItem, config.contentSwitchInterval);
  }, 500);
}

function showNextItem() {
  if (!isGameStarted) return;  // 如果游戏已结束，不显示新物品
  
  const item = getRandomItem();
  // 先移除动画类
  furnaceContent.classList.remove('drop-in');
  // 触发重排以重新开始动画
  void furnaceContent.offsetWidth;
  // 添加动画类
  furnaceContent.classList.add('drop-in');
  furnaceContent.textContent = `${item.emoji} ${item.name}`;
  furnace.onclick = () => {
    if (!isGameStarted || isShaking) return;  // 如果游戏已结束或正在震动，不响应点击
    
    if (item.score < 0) {
      // 点击了负面物品，触发震动
      showScorePopup(item.score, true);  // 显示错误提示
      shakeFurnace();
    } else {
      // 点击了正面物品，正常处理
      updateScore(item.score);
      // 清除当前定时器
      clearInterval(itemInterval);
      // 设置新的定时器
      itemInterval = setInterval(showNextItem, config.contentSwitchInterval);
      showNextItem();  // 点击后马上切换到下一条
    }
  };
}

function startGame() {
  if (isGameStarted) return;
  
  isGameStarted = true;
  score = 0;
  timeLeft = config.gameDuration;
  updateScore(0);
  resultDisplay.textContent = '';
  furnace.style.pointerEvents = 'auto';
  furnace.classList.add('active');  // 添加动画类

  // 倒计时开始
  gameInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `${timeLeft}s`;
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
  isGameStarted = false;
  const model = getCurrentModel(score);
  resultDisplay.innerHTML = `你炼出了 <strong>${model}</strong>！<br/>分数：${score}<br/>想用真算力？快试试启迪之星算力服务！`;
  timerDisplay.textContent = `0s`;
}

// 初始化点击事件
furnace.onclick = () => {
  if (!isGameStarted) {
    startGame();
    return;
  }
  
  if (isShaking) return;  // 如果正在震动，不响应点击
  
  const currentItem = getRandomItem();
  if (currentItem.score < 0) {
    // 点击了负面物品，触发震动
    shakeFurnace();
  } else {
    // 点击了正面物品，正常处理
    updateScore(currentItem.score);
    // 清除当前定时器
    clearInterval(itemInterval);
    // 设置新的定时器
    itemInterval = setInterval(showNextItem, config.contentSwitchInterval);
    showNextItem();  // 点击后马上切换到下一条
  }
};
