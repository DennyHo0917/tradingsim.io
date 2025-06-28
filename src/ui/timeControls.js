// timeControls.js - binds speed buttons and updates date/status
export function initTimeControls(timeService) {
  const btns = [
    { id: 'pause-btn', speed: 0 },
    { id: 'play-0.5x-btn', speed: 0.5 },
    { id: 'play-1x-btn', speed: 1 },
    { id: 'play-3x-btn', speed: 3 },
    { id: 'play-5x-btn', speed: 5 },
  ];

  function setActive(speed) {
    btns.forEach(({ id, speed: s }) => {
      const b = document.getElementById(id);
      if (b) b.classList.toggle('active', s === speed);
    });
  }

  btns.forEach(({ id, speed }) => {
    const b = document.getElementById(id);
    if (b) {
      b.addEventListener('click', () => {
        timeService.setSpeed(speed);
        setActive(speed);
      });
    }
  });

  const gameTimeEl = document.getElementById('game-time');

  function refresh(e) {
    const data = e.detail;
    if (gameTimeEl) gameTimeEl.textContent = `📅 ${data.fullString}`;
    // 移除对time-status的控制，让新闻系统使用该元素
  }

  window.addEventListener('timeUpdate', refresh);

  // 初始化
  setActive(timeService.currentSpeed);
  refresh({ detail: timeService.getFormattedTime() });
} 