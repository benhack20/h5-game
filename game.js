import { positiveItems, negativeItems } from './items.js';
import { modelRanks } from './models.js';
import { config } from './config.js';

let score = 0;
let timeLeft = config.gameDuration;
let gameInterval = null;      // 控制倒计时
let itemInterval = null;      // 控制item自动切换
let isShaking = false;        // 控制是否在震动中
let isGameStarted = false;
let isGameEnded = false;
let clickedErrors = [];       // 记录点击过的错误选项

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
  isGameEnded = false;
  clickedErrors = [];  // 重置错误记录
  
  // 重置显示
  scoreDisplay.textContent = '0';
  timerDisplay.textContent = `${config.gameDuration}s`;
  modelDisplay.textContent = 'Qwen1.5-0.5B';
  furnaceContent.textContent = '猛戳炼丹炉\n开始训练大模型';
  
  // 重置样式
  furnace.style.pointerEvents = 'auto';
  furnace.classList.remove('active');
  furnace.classList.add('pulse');
  furnace.style.animation = '';
  furnaceContent.classList.remove('negative-item');  // 移除负面物品样式
  
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

function showModelLogo(modelName) {
  let logoPath = '';
  if (modelName.includes('SSS')) {
    logoPath = 'logo/egg.png';  // 彩蛋模型使用特殊logo
  } else if (modelName.includes('DeepSeek')) {
    logoPath = 'logo/deepseek.png';
  } else if (modelName.includes('GPT') || modelName.includes('o3') || modelName.includes('o4')) {
    logoPath = 'logo/openai.png';
  } else if (modelName.includes('Claude')) {
    logoPath = 'logo/anthropic.png';
  } else if (modelName.includes('Gemini') || modelName.includes('Gemma')) {
    logoPath = 'logo/google.png';
  } else if (modelName.includes('Llama')) {
    logoPath = 'logo/meta.png';
  } else if (modelName.includes('Qwen')) {
    logoPath = 'logo/qwen.png';
  } else if (modelName.includes('ChatGLM')) {
    logoPath = 'logo/zhipu.png';
  } else if (modelName.includes('Mistral')) {
    logoPath = 'logo/mistral.png';
  }

  // 创建logo弹出元素
  const logoPopup = document.createElement('div');
  logoPopup.className = 'model-logo-popup';
  const img = document.createElement('img');
  img.src = logoPath;
  img.alt = modelName;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  logoPopup.appendChild(img);

  // 将logo添加到炼丹炉元素中
  const furnace = document.getElementById('furnace');
  furnace.style.position = 'relative';  // 确保定位正确
  furnace.appendChild(logoPopup);

  // 动画结束后移除元素
  logoPopup.addEventListener('animationend', () => {
    logoPopup.remove();
  });
}

function updateModelDisplay() {
  const oldModel = modelDisplay.textContent;
  const newModel = getCurrentModel(score).name;
  modelDisplay.textContent = newModel;
  
  // 如果模型发生变化，显示对应的logo
  if (oldModel !== newModel) {
    showModelLogo(newModel);
    
    // 如果获得了彩蛋模型，立即结束游戏
    if (newModel.includes('SSS')) {
      endGame();
    }
  }
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
  if (!isGameStarted || isGameEnded) return;  // 如果游戏已结束，不显示新物品
  
  const item = getRandomItem();
  // 先移除动画类
  furnaceContent.classList.remove('drop-in');
  // 触发重排以重新开始动画
  void furnaceContent.offsetWidth;
  // 添加动画类
  furnaceContent.classList.add('drop-in');
  
  // 根据物品类型设置样式
  if (item.score < 0) {
    furnaceContent.classList.add('negative-item');
  } else {
    furnaceContent.classList.remove('negative-item');
  }
  
  furnaceContent.textContent = `${item.emoji} ${item.name}`;
  furnace.onclick = () => {
    if (!isGameStarted || isShaking) return;  // 如果游戏已结束或正在震动，不响应点击
    
    if (item.score < 0) {
      // 点击了负面物品，触发震动
      updateScore(item.score);  // 更新分数
      showScorePopup(item.score, true);  // 显示错误提示
      shakeFurnace();
      // 记录错误选项
      clickedErrors.push({...item});  // 使用解构赋值创建新对象，避免引用问题
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
  isGameEnded = true;
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
  
  // 生成错误总结
  let errorSummary = '';
  if (clickedErrors.length > 0) {
    // 获取所有错误选项的名称（去重）
    const uniqueErrors = [...new Set(clickedErrors.map(item => item.name))];
    
    errorSummary = '';
    uniqueErrors.forEach(name => {
      errorSummary += `• ${name}\n`;
    });

    // 随机选择总结语
    const summaryPhrases = [
      "炼丹路上踩坑无数，谁能懂！",
      "心疼你三秒钟...",
      "这就是大模型创业的日常啊！",
      "这些坑你都踩过，真是个狠人！",
      "踩坑踩出经验，你离成功不远了！",
    ];
    const randomPhrase = summaryPhrases[Math.floor(Math.random() * summaryPhrases.length)];
    errorSummary += `\n${randomPhrase}`;
  }
  
  // 分开显示模型描述和错误总结
  resultMessage.innerHTML = `
    <div class="model-description">${model.description}</div>
    <div class="result-score">
      <div class="result-score-label">最终得分</div>
      <div class="result-score-value">${score}</div>
    </div>
    ${errorSummary ? `
      <div class="error-summary">
        <div class="error-title">大模型炼丹的路上，你经历了：</div>
        <div class="error-list">${errorSummary}</div>
      </div>
    ` : ''}
  `;
  
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
          <div class="share-furnace">
            <img src="furnace.png" alt="炼丹炉" class="share-furnace-img" />
            <div class="share-furnace-text">猛戳炼丹炉<br>开始训练大模型</div>
          </div>
          <div class="share-header">
            <h2><span class="fire-emoji">🔥</span>大模型炼丹场</h2>
            <div class="share-subtitle">我在<span class="time-number">${config.gameDuration}</span>秒内炼出了</div>
          </div>
          <div class="share-model">${model.name}</div>
          <div class="share-message">${model.description}</div>
          <div class="share-score">
            <div class="share-score-label">最终得分</div>
            <div class="share-score-value">${score}</div>
          </div>
          ${errorSummary ? `
            <div class="share-error-summary">
              <div class="share-error-title">大模型炼丹的路上，你经历了：</div>
              <div class="share-error-list">${errorSummary}</div>
            </div>
          ` : ''}
          <div class="share-footer">
            <div class="share-tagline">你能炼出什么模型？</div>
            <div class="share-qrcode">
              <img src="qrcode.png" alt="扫码体验" />
              <p>扫码来挑战</p>
            </div>
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
  if (!isGameStarted || isGameEnded) {
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
