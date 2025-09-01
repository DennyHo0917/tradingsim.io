// achievementsPanel.js - 渲染成就卡片并响应解锁
import { ACHIEVEMENTS } from '../config/achievementsConfig.js';

export function initAchievementsPanel() {
  const grid = document.getElementById('achievements-grid');
  const totalSpan = document.getElementById('achievements-total');
  const unlockedSpan = document.getElementById('achievements-unlocked');
  const totalTradesSpan = document.getElementById('stats-total-trades');
  const winRateSpan = document.getElementById('stats-win-rate');
  const maxBalanceSpan = document.getElementById('stats-max-balance');

  if (!grid) return;
  totalSpan.textContent = Object.keys(ACHIEVEMENTS).length;

  // 更新统计数据
  function updateStats() {
    const accountService = window.tradingServices?.accountService;
    if (accountService) {
      const info = accountService.getAccountInfo();
      if (totalTradesSpan) totalTradesSpan.textContent = info.totalTrades;
      if (winRateSpan) winRateSpan.textContent = `${info.winRate}%`;
      if (maxBalanceSpan) maxBalanceSpan.textContent = `$${info.maxBalance.toLocaleString()}`;
    }
  }

  // 创建卡片
  Object.values(ACHIEVEMENTS).forEach((ach) => {
    const card = document.createElement('div');
    card.className = 'achievement-card locked';
    card.id = `achievement-${ach.id}`;
    card.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-name">${ach.name}</div>
      <div class="achievement-description">${ach.description}</div>
      <div class="achievement-reward">Title: ${ach.reward.title}</div>
    `;
    grid.appendChild(card);
  });

  function onUnlock(e) {
    const ach = e.detail;
    const card = document.getElementById(`achievement-${ach.id}`);
    if (card) {
      card.classList.remove('locked');
      card.classList.add('unlocked');
    }
    const current = parseInt(unlockedSpan.textContent || '0') + 1;
    unlockedSpan.textContent = current;
    
    // 更新玩家称号显示
    const playerTitleEl = document.getElementById('player-title');
    if (playerTitleEl && ach.reward.title) {
      playerTitleEl.textContent = `${ach.reward.title}`;
    }
  }

  window.addEventListener('achievementUnlocked', onUnlock);
  
  // 监听事件以更新统计数据
  window.addEventListener('historyUpdate', updateStats);
  window.addEventListener('accountRestart', updateStats);
  
  // 初始更新统计数据
  updateStats();
} 