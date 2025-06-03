let score = 0;
let timeLeft = 30;
let timerStarted = false;

const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const button = document.getElementById('clickBtn');

button.addEventListener('click', () => {
  if (!timerStarted) {
    startTimer();
    timerStarted = true;
  }
  score++;
  scoreDisplay.textContent = `分数：${score}`;
});

function startTimer() {
  const timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `剩余时间：${timeLeft}秒`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      button.disabled = true;
      button.textContent = '游戏结束';
      alert(`游戏结束！你最终得分是 ${score} 分`);
    }
  }, 1000);
}
