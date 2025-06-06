import { positiveItems, negativeItems } from './items.js';
import { modelRanks, MODEL_RANKS } from './models.js';
import { config } from './config.js';
import { WECHAT_URL } from './wechat-url.js';

// 宣传语数组
const promotionMessages = [
  "想炼出更好的模型？来启迪之星，算力管够！",
  "别点屏幕了，用真算力吧！启迪之星等你来！",
  "炼丹太贵？来启迪之星，算力价格更实惠！"
];

let score = 0;
let timeLeft = config.gameDuration;
let gameInterval = null;      // 控制倒计时
let itemInterval = null;      // 控制item自动切换
let isShaking = false;        // 控制是否在震动中
let isGameStarted = false;
let isGameEnded = false;
let clickedErrors = [];       // 记录点击过的错误选项
let clickedPositives = [];    // 记录点击过的正面物品
let lastClickTime = 0;        // 记录上次点击时间
let isAnimating = false;      // 控制是否正在动画中
let inactivityTimer = null;   // 控制不活跃提示的定时器
let inactivityTimeout = 3000; // 3秒不活跃后显示提示
let lastActivityTime = 0;     // 记录最后活动时间
let currentItem = null;  // 添加一个变量来存储当前显示的物品
let isFirstGame = true;  // 添加变量标记是否是第一局游戏

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
  clickedPositives = []; // 重置正面物品记录
  
  // 重置显示
  scoreDisplay.textContent = '0';
  timerDisplay.textContent = `${config.gameDuration}s`;
  modelDisplay.textContent = 'Qwen1.5-0.5B';
  furnaceContent.textContent = '猛戳炼丹炉\n开始训练大模型';
  
  // 重置样式
  furnace.style.pointerEvents = 'auto';
  furnace.classList.remove('active');
  furnace.classList.add('pulse');
  furnace.style.animation = 'pulse var(--furnace-pulse-interval) ease-in-out infinite';
  furnaceContent.classList.remove('negative-item');  // 移除负面物品样式
  
  // 清除所有定时器
  clearInterval(gameInterval);
  clearInterval(itemInterval);
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  // 移除所有提示
  const existingTip = document.querySelector('.inactivity-tip');
  if (existingTip) {
    existingTip.remove();
  }

  // 添加手指提示
  showFingerPointer();
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
  
  currentItem = getRandomItem();  // 更新当前物品
  
  // 先移除动画类
  furnaceContent.classList.remove('drop-in');
  // 触发重排以重新开始动画
  void furnaceContent.offsetWidth;
  // 添加动画类
  furnaceContent.classList.add('drop-in');
  
  // 根据物品类型设置样式
  if (currentItem.score < 0) {
    furnaceContent.classList.add('negative-item');
  } else {
    furnaceContent.classList.remove('negative-item');
  }
  
  furnaceContent.textContent = `${currentItem.emoji} ${currentItem.name}`;
}

function showInactivityTip() {
  const tip = document.createElement('div');
  tip.className = 'inactivity-tip';
  tip.textContent = '点击炼丹炉才能加分';
  document.body.appendChild(tip);
  
  // 添加闪烁动画
  tip.style.animation = 'blink 1s ease-in-out infinite';
  
  // 点击时移除提示
  document.addEventListener('click', function removeTip() {
    if (tip.parentNode) {
      tip.parentNode.removeChild(tip);
    }
    document.removeEventListener('click', removeTip);
  }, { once: true });
}

function resetInactivityTimer() {
  // 清除现有定时器
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  // 移除已存在的提示
  const existingTip = document.querySelector('.inactivity-tip');
  if (existingTip) {
    existingTip.remove();
  }
  
  // 只在第一局游戏时启动不活跃检测
  if (isGameStarted && !isGameEnded && isFirstGame) {
    inactivityTimer = setTimeout(() => {
      if (isGameStarted && !isGameEnded) {
        showInactivityTip();
      }
    }, inactivityTimeout);
  }
}

function startGame() {
  if (isGameStarted) return;
  
  isGameStarted = true;
  isGameEnded = false;  // 确保游戏结束状态被重置
  score = 0;
  timeLeft = config.gameDuration;
  updateScore(0);
  resultDisplay.textContent = '';
  
  furnace.classList.add('active');  // 添加气泡效果
  furnace.classList.add('pulse');   // 确保添加pulse效果
  furnace.style.animation = 'pulse var(--furnace-pulse-interval) ease-in-out infinite';  // 强制设置pulse动画

  // 移除手指提示
  const fingerPointer = document.querySelector('.finger-pointer');
  if (fingerPointer) {
    fingerPointer.remove();
  }

  // 倒计时开始
  gameInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) endGame();
  }, 1000);

  // item自动快速切换
  showNextItem();
  itemInterval = setInterval(showNextItem, config.contentSwitchInterval);
  
  // 启动不活跃检测
  resetInactivityTimer();
}

function endGame() {
  if (isGameEnded) return;
  
  isGameEnded = true;
  isGameStarted = false;  // 确保游戏状态被重置
  isFirstGame = false;    // 标记已经不是第一局游戏了
  clearInterval(gameInterval);
  clearInterval(itemInterval);
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  // 移除提示框
  const tip = document.querySelector('.inactivity-tip');
  if (tip) {
    tip.remove();
  }
  
  furnaceContent.textContent = '🔥';
  furnace.style.pointerEvents = 'none';
  const model = getCurrentModel(score);
  
  // 计算最终得分
  const finalScore = Math.floor(score);
  
  // 计算模型等级
  let modelRank = MODEL_RANKS.BEGINNER.name;
  if (finalScore >= MODEL_RANKS.EXPERT.min) {
    modelRank = MODEL_RANKS.EXPERT.name;
  } else if (finalScore >= MODEL_RANKS.ADVANCED.min) {
    modelRank = MODEL_RANKS.ADVANCED.name;
  } else if (finalScore >= MODEL_RANKS.INTERMEDIATE.min) {
    modelRank = MODEL_RANKS.INTERMEDIATE.name;
  }
  
  // 显示结算界面
  const resultOverlay = document.querySelector('.result-overlay');
  const resultModel = document.querySelector('.result-model');
  const resultMessage = document.querySelector('.result-message');
  const resultButton = document.querySelector('.result-button:not(.share-button)');
  const shareButton = document.querySelector('.share-button');
  
  // 设置结算内容
  resultModel.textContent = model.name;
  
  // 修改结算标题
  const resultTitle = document.querySelector('.result-title');
  resultTitle.textContent = `你炼出了模型：`;
  
  // 生成错误总结
  let errorSummary = '';
  if (clickedErrors.length > 0) {
    // 统计每个错误出现的次数
    const errorCounts = {};
    clickedErrors.forEach(item => {
      errorCounts[item.name] = (errorCounts[item.name] || 0) + 1;
    });
    
    // 获取所有错误选项的名称（去重）
    const uniqueErrors = [...new Set(clickedErrors.map(item => item.name))];
    
    errorSummary = '';
    uniqueErrors.forEach(name => {
      const count = errorCounts[name];
      errorSummary += `• ${count > 1 ? count + '次' : ''}${name}\n`;
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

    // 只有在有点击过正面物品时才添加鼓励语
    if (clickedPositives.length > 0) {
      const randomPositiveItem = clickedPositives[Math.floor(Math.random() * clickedPositives.length)];
      errorSummary += `不过能够${randomPositiveItem.name}，你也是有点绝活的！`;
    }
  }
  
  // 分开显示模型描述和错误总结
  resultMessage.innerHTML = `
    <div class="model-description">${model.description}</div>
    <div class="result-score">
      <div class="result-score-label">最终得分</div>
      <div class="result-score-value">${finalScore}</div>
    </div>
    ${(() => {
      // 找到下一个模型
      let nextModel = null;
      let strongerModelsCount = 0;
      for (let i = 0; i < modelRanks.length; i++) {
        if (modelRanks[i].min > finalScore) {
          if (!nextModel) {
            nextModel = modelRanks[i];
          }
          strongerModelsCount++;
        }
      }
      
      // 计算进度条各段宽度
      const totalRange = modelRanks[modelRanks.length - 1].min;
      const currentProgress = (finalScore / totalRange) * 100;
      
      // 生成进度条HTML
      return `
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-segment beginner" style="width: ${Math.min(100, (MODEL_RANKS.INTERMEDIATE.min / totalRange) * 100)}%"></div>
            <div class="progress-segment intermediate" style="width: ${Math.min(100, ((MODEL_RANKS.ADVANCED.min - MODEL_RANKS.INTERMEDIATE.min) / totalRange) * 100)}%"></div>
            <div class="progress-segment advanced" style="width: ${Math.min(100, ((MODEL_RANKS.EXPERT.min - MODEL_RANKS.ADVANCED.min) / totalRange) * 100)}%"></div>
            <div class="progress-segment expert" style="width: ${Math.min(100, ((totalRange - MODEL_RANKS.EXPERT.min) / totalRange) * 100)}%"></div>
          </div>
          <div class="flame-marker" style="left: 0%"></div>
          <div class="progress-labels">
            <div class="progress-label ${finalScore >= MODEL_RANKS.BEGINNER.min ? 'active' : ''}">菜鸟</div>
            <div class="progress-label ${finalScore >= MODEL_RANKS.INTERMEDIATE.min ? 'active' : ''}">学徒</div>
            <div class="progress-label ${finalScore >= MODEL_RANKS.ADVANCED.min ? 'active' : ''}">大师</div>
            <div class="progress-label ${finalScore >= MODEL_RANKS.EXPERT.min ? 'active' : ''}">宗师</div>
          </div>
        </div>
      `;
    })()}
    ${errorSummary ? `
      <div class="error-summary">
        <div class="error-title">大模型炼丹的路上，你经历了：</div>
        <div class="error-list">${errorSummary}</div>
      </div>
    ` : ''}
    <div class="promotion-section" style="margin-top: 24px; margin-bottom: 16px;">
      <div class="promotion-message" style="font-size: 14px; margin-bottom: 12px;">${promotionMessages[Math.floor(Math.random() * promotionMessages.length)]}</div>
    </div>
  `;
  
  // 显示结算界面
  resultOverlay.classList.add('show');
  resultModel.classList.add('model-reveal');
  
  // 等待DOM更新后移动火苗
  setTimeout(() => {
    const flameMarker = document.querySelector('.flame-marker');
    if (flameMarker) {
      const totalRange = modelRanks[modelRanks.length - 1].min;
      const currentProgress = (finalScore / totalRange) * 100;
      flameMarker.style.transition = 'left 1s cubic-bezier(0.4, 0, 0.2, 1)';
      flameMarker.style.left = `${currentProgress}%`;
    }
  }, 100);
  
  // 修改按钮布局
  const resultButtons = document.querySelector('.result-buttons');
  resultButtons.innerHTML = `
    <button class="result-button">回炉重炼</button>
    <button class="result-button learn-more-button" onclick="window.open('${WECHAT_URL}', '_blank')">前往了解</button>
    <button class="share-icon-button" title="分享战绩">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
      </svg>
    </button>
  `;

  // 添加分享按钮事件
  const shareIconButton = document.querySelector('.share-icon-button');
  shareIconButton.onclick = async () => {
    try {
      // 添加加载动画
      shareIconButton.classList.add('loading');
      const originalHTML = shareIconButton.innerHTML;
      shareIconButton.innerHTML = '<span>分享中...</span>';

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
            <h2><span class="fire-emoji">🔥</span>启迪之星<br>大模型炼丹场</h2>
            <div class="share-subtitle">我在<span class="time-number">${config.gameDuration}</span>秒内炼出了模型：</div>
          </div>
          <div class="share-model">${model.name}</div>
          <div class="share-message">${model.description}</div>
          <div class="share-score">
            <div class="share-score-label">最终得分</div>
            <div class="share-score-value">${finalScore}</div>
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
              <img src="wechat-qrcode.png" alt="扫码体验" />
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
      
      // 重置游戏状态
      resetGame();
    } catch (error) {
      console.error('生成分享图片失败:', error);
      alert('生成分享图片失败，请重试');
    } finally {
      // 移除加载动画
      shareIconButton.classList.remove('loading');
      shareIconButton.innerHTML = originalHTML;
    }
  };
  
  // 添加重新开始按钮事件
  const restartButton = document.querySelector('.result-button:not(.learn-more-button)');
  restartButton.onclick = () => {
    // 直接关闭结算界面并重置游戏状态
    resultOverlay.classList.remove('show');
    resultModel.classList.remove('model-reveal');
    resetGame();
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
  
  // 重置不活跃定时器
  resetInactivityTimer();
  
  // 检查点击间隔，如果小于300毫秒则忽略
  const now = Date.now();
  if (now - lastClickTime < 300) return;
  lastClickTime = now;
  
  if (currentItem.score < 0) {
    // 点击了负面物品，触发震动
    updateScore(currentItem.score);  // 更新分数
    showScorePopup(currentItem.score, true);  // 显示错误提示
    shakeFurnace();
    // 记录错误选项
    clickedErrors.push({...currentItem});  // 使用解构赋值创建新对象，避免引用问题
  } else {
    // 点击了正面物品，正常处理
    updateScore(currentItem.score);
    // 记录正面物品
    clickedPositives.push({...currentItem});
    // 清除当前定时器
    clearInterval(itemInterval);
    // 设置新的定时器
    itemInterval = setInterval(showNextItem, config.contentSwitchInterval);
    showNextItem();  // 点击后马上切换到下一条
  }
};

// 添加手指提示函数
function showFingerPointer() {
  // 移除已存在的手指提示
  const existingPointer = document.querySelector('.finger-pointer');
  if (existingPointer) {
    existingPointer.remove();
  }

  // 创建新的手指提示元素
  const fingerPointer = document.createElement('div');
  fingerPointer.className = 'finger-pointer';
  
  // 获取炼丹炉文字的位置
  const furnaceContentRect = furnaceContent.getBoundingClientRect();
  
  // 设置手指提示的位置，放在文字下方
  fingerPointer.style.left = `${furnaceContentRect.left + furnaceContentRect.width / 2 - 20}px`;
  fingerPointer.style.top = `${furnaceContentRect.bottom + 10}px`;
  
  // 添加到页面
  document.body.appendChild(fingerPointer);
}

// 在window.addEventListener('load', () => {之前添加以下代码
function showTutorial() {
  const tutorialOverlay = document.createElement('div');
  tutorialOverlay.className = 'tutorial-overlay';
  tutorialOverlay.innerHTML = `
    <div class="tutorial-content">
      <div class="tutorial-title">游戏玩法</div>
      <div class="tutorial-text">
        <p>✅ 掉落有利资源时，点击炼丹炉加分</p>
        <p>❌ 出现负面事件时，不要点击炼丹炉！</p>
        <p>随着分数积累，会不断炼出新的模型！</p>
      </div>
      <button class="tutorial-button">开始炼丹</button>
    </div>
  `;
  
  document.body.appendChild(tutorialOverlay);
  
  // 添加显示动画
  setTimeout(() => {
    tutorialOverlay.classList.add('show');
  }, 100);
  
  // 添加按钮点击事件
  const tutorialButton = tutorialOverlay.querySelector('.tutorial-button');
  tutorialButton.onclick = () => {
    tutorialOverlay.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(tutorialOverlay);
      showFingerPointer();
    }, 300);
  };
}

// 修改window.addEventListener('load', () => {部分
window.addEventListener('load', () => {
  showTutorial();
});

// 在窗口大小改变时更新手指提示位置
window.addEventListener('resize', () => {
  if (!isGameStarted) {
    showFingerPointer();
  }
});

// 在文件末尾添加新的动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes buttonPulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    }
  }
`;
document.head.appendChild(style);
