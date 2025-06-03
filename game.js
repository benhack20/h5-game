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

function resetGame() {
  // 重置所有状态
  score = 0;
  timeLeft = config.gameDuration;
  isGameStarted = false;
  isShaking = false;
  
  // 重置显示
  scoreDisplay.textContent = '0';
  timerDisplay.textContent = `${config.gameDuration}s`;
  modelDisplay.textContent = 'raw model 0.1b';
  furnaceContent.textContent = '猛戳炼丹炉\n开始训练大模型';
  
  // 重置样式
  furnace.style.pointerEvents = 'auto';
  furnace.classList.remove('active');
  furnace.classList.add('pulse');
  furnace.style.animation = '';
  
  // 清除所有定时器
  clearInterval(gameInterval);
  clearInterval(itemInterval);
}

function getCurrentModel(score) {
  let current = modelRanks[0];
  for (let i = 0; i < modelRanks.length; i++) {
    if (score >= modelRanks[i].min) {
      current = modelRanks[i];
    } else {
      break;
    }
  }
  return current;
}

function updateModelDisplay() {
  modelDisplay.textContent = getCurrentModel(score).name;
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
  furnace.classList.remove('pulse');
  furnace.classList.add('active');  // 添加气泡效果

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
  
  // 显示结算界面
  const resultOverlay = document.querySelector('.result-overlay');
  const resultModel = document.querySelector('.result-model');
  const resultMessage = document.querySelector('.result-message');
  const resultButton = document.querySelector('.result-button:not(.share-button)');
  const shareButton = document.querySelector('.share-button');
  
  // 设置结算内容
  resultModel.textContent = model.name;
  resultMessage.textContent = model.description;
  
  // 显示结算界面
  resultOverlay.classList.add('show');
  resultModel.classList.add('model-reveal');
  
  // 添加分享按钮事件
  shareButton.onclick = async () => {
    try {
      // 添加加载动画
      shareButton.classList.add('loading');
      const originalText = shareButton.innerHTML;
      shareButton.innerHTML = '<span>分享战绩</span>';

      // 创建一个临时容器用于截图
      const shareContainer = document.createElement('div');
      shareContainer.className = 'share-container';
      shareContainer.innerHTML = `
        <div class="share-content">
          <h2>🔥 大模型炼丹场</h2>
          <div class="share-model">${model.name}</div>
          <div class="share-score">最终得分：${score}</div>
          <div class="share-message">${model.description}</div>
          <div class="share-qrcode">
            <img src="qrcode.png" alt="扫码体验" />
            <p>扫码体验</p>
          </div>
        </div>
      `;
      document.body.appendChild(shareContainer);

      // 使用html2canvas生成图片
      const canvas = await html2canvas(shareContainer, {
        backgroundColor: '#2d2d2d',
        scale: 2, // 提高清晰度
      });

      // 将canvas转换为图片
      const image = canvas.toDataURL('image/png');

      // 判断是否在微信环境中
      const isWeixinBrowser = /MicroMessenger/i.test(navigator.userAgent);
      
      if (isWeixinBrowser) {
        // 在微信中，在当前页面显示图片
        const shareOverlay = document.createElement('div');
        shareOverlay.className = 'share-overlay';
        shareOverlay.innerHTML = `
          <div class="share-image-container">
            <img src="${image}" alt="炼丹战绩" />
            <div class="share-tip">长按图片保存</div>
            <button class="share-close">关闭</button>
          </div>
        `;
        document.body.appendChild(shareOverlay);

        // 添加关闭按钮事件
        const closeButton = shareOverlay.querySelector('.share-close');
        closeButton.onclick = () => {
          document.body.removeChild(shareOverlay);
        };
      } else {
        // 在普通浏览器中，使用下载功能
        const link = document.createElement('a');
        link.download = '炼丹战绩.png';
        link.href = image;
        link.click();
      }

      // 清理临时元素
      document.body.removeChild(shareContainer);
      
      // 关闭结算界面
      resultOverlay.classList.remove('show');
      resultModel.classList.remove('model-reveal');
      resetGame();
      
      // 重新绑定点击事件
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
    } catch (error) {
      console.error('生成分享图片失败:', error);
      alert('生成分享图片失败，请重试');
    } finally {
      // 移除加载动画
      shareButton.classList.remove('loading');
      shareButton.innerHTML = originalText;
    }
  };
  
  // 添加重新开始按钮事件
  resultButton.onclick = () => {
    resultOverlay.classList.remove('show');
    resultModel.classList.remove('model-reveal');
    resetGame();
    // 重新绑定点击事件
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
  };
  
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
