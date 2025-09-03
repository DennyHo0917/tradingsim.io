// LeaderboardPanel - 排行榜UI组件
import { LEADERBOARD_CONFIG, generateRandomUsername } from '../config/leaderboardConfig.js';

let leaderboardService = null;
let currentSortType = LEADERBOARD_CONFIG.DEFAULT_SORT;

// 初始化排行榜面板
export function initLeaderboardPanel(service) {
  leaderboardService = service;
  
  // 监听排行榜更新事件
  window.addEventListener('leaderboardUpdate', refreshLeaderboardDisplay);
  
  // 初始化排序按钮事件
  initSortButtons();
  
  // 初始化表头
  updatePrimaryMetricHeader();
  
  console.log('[UI] Leaderboard panel initialized');
}

// 初始化排序按钮事件
function initSortButtons() {
  // 为每个排序类型添加事件监听
  Object.keys(LEADERBOARD_CONFIG.CATEGORIES).forEach(sortType => {
    const button = document.getElementById(`sort-${sortType}`);
    if (button) {
      button.addEventListener('click', () => {
        currentSortType = sortType;
        updateSortButtons();
        updatePrimaryMetricHeader();
        refreshLeaderboardDisplay();
      });
    }
  });
}

// 更新排序按钮状态
function updateSortButtons() {
  Object.keys(LEADERBOARD_CONFIG.CATEGORIES).forEach(sortType => {
    const button = document.getElementById(`sort-${sortType}`);
    if (button) {
      if (sortType === currentSortType) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    }
  });
}

// 刷新排行榜显示
function refreshLeaderboardDisplay() {
  if (!leaderboardService) return;
  
  const leaderboard = leaderboardService.getLeaderboard(currentSortType, 20);
  const stats = leaderboardService.getLeaderboardStats();
  
  // 更新排行榜表格
  updateLeaderboardTable(leaderboard);
  
  // 更新统计信息
  updateLeaderboardStats(stats);
  
  // 更新排序按钮状态
  updateSortButtons();
}

// 更新排行榜表格
function updateLeaderboardTable(leaderboard) {
  const tbody = document.getElementById('leaderboard-tbody');
  const noData = document.getElementById('no-leaderboard-data');
  
  if (!tbody) return;
  
  if (leaderboard.length === 0) {
    tbody.innerHTML = '';
    if (noData) noData.style.display = 'block';
    return;
  }
  
  if (noData) noData.style.display = 'none';
  
  const categoryConfig = LEADERBOARD_CONFIG.CATEGORIES[currentSortType];
  
  tbody.innerHTML = leaderboard.map((entry, index) => {
    const rank = index + 1;
    const rankIcon = getRankIcon(rank);
    const primaryValue = categoryConfig.format(entry[currentSortType] || 0);
    
    // 格式化日期
    const liquidationDate = new Date(entry.liquidationDate).toLocaleDateString();
    
    return `
      <tr class="leaderboard-row ${rank <= 3 ? 'top-rank' : ''}">
        <td class="rank-cell">
          <span class="rank-number">${rankIcon} ${rank}</span>
        </td>
        <td class="username-cell">
          <span class="username">${escapeHtml(entry.username)}</span>
        </td>
        <td class="primary-value-cell">
          <span class="primary-value">${primaryValue}</span>
        </td>
        <td class="survival-cell">
          <span class="survival-days">${entry.survivalDays} days</span>
        </td>
        <td class="balance-cell">
          <span class="max-balance">$${entry.maxBalance.toFixed(0)}</span>
        </td>
        <td class="trades-cell">
          <span class="total-trades">${entry.totalTrades}</span>
          <span class="win-rate">(${entry.winRate.toFixed(1)}%)</span>
        </td>
        <td class="date-cell">
          <span class="liquidation-date">${liquidationDate}</span>
        </td>
      </tr>
    `;
  }).join('');
}

// 更新排行榜统计信息
function updateLeaderboardStats(stats) {
  const elements = {
    'leaderboard-total-entries': stats.totalEntries,
    'leaderboard-avg-survival': `${stats.avgSurvivalDays} days`,
    'leaderboard-max-survival': `${stats.maxSurvivalDays} days`,
    'leaderboard-avg-balance': `$${stats.avgMaxBalance.toFixed(0)}`,
    'leaderboard-top-balance': `$${stats.topMaxBalance.toFixed(0)}`
  };
  
  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

// 获取排名图标
function getRankIcon(rank) {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '🏅';
  }
}

// HTML转义函数
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 显示用户名输入弹窗
export function showUsernameModal(accountInfo, timeService, onSubmit) {
  const suggestedName = generateRandomUsername();
  
  const modalHtml = `
    <div class="username-modal-content">
      <div class="game-over-stats">
        <h4>🎮 Game Over - Final Stats</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <label>Survival Days:</label>
            <span class="stat-value">${calculateSurvivalDays(timeService)} days</span>
          </div>
          <div class="stat-item">
            <label>Max Balance:</label>
            <span class="stat-value">$${accountInfo.maxBalance.toFixed(2)}</span>
          </div>
          <div class="stat-item">
            <label>Total Trades:</label>
            <span class="stat-value">${accountInfo.totalTrades}</span>
          </div>
          <div class="stat-item">
            <label>Win Rate:</label>
            <span class="stat-value">${accountInfo.winRate}%</span>
          </div>
        </div>
      </div>
      
      <div class="username-input-section">
        <h4>💾 Save to Leaderboard</h4>
        <p>Enter your username to save your performance:</p>
        
        <div class="input-group">
          <label for="username-input">Username:</label>
          <input type="text" id="username-input" maxlength="20" 
                 placeholder="Enter your username" value="${suggestedName}">
          <button type="button" id="random-name-btn" class="random-btn" title="Generate random name">🎲</button>
        </div>
        
        <div class="username-rules">
          <small>
            • 2-20 characters • Letters, numbers, underscore, dash only<br>
            • No forbidden words
          </small>
        </div>
        
        <div id="username-error" class="error-message" style="display: none;"></div>
      </div>
    </div>
  `;
  
  // 显示模态框
  if (window.showGameModal) {
    window.showGameModal(
      '🏆 Add to Leaderboard', 
      modalHtml, 
      'leaderboard',
      () => {
        // 确认按钮回调
        const usernameInput = document.getElementById('username-input');
        const errorDiv = document.getElementById('username-error');
        
        if (usernameInput && errorDiv) {
          const username = usernameInput.value.trim();
          
          try {
            // 提交到排行榜
            const entry = onSubmit(username);
            if (entry) {
              // 成功添加到排行榜
              console.log('[Leaderboard] Successfully added entry:', entry);
              
              // 显示成功消息
              setTimeout(() => {
                if (window.showGameModal) {
                  window.showGameModal(
                    '✅ Added to Leaderboard!', 
                    `<p>Your score has been saved as <strong>${escapeHtml(entry.username)}</strong>!</p>
                     <p>Check the Leaderboard to see your ranking.</p>`,
                    'success'
                  );
                }
              }, 100);
            }
          } catch (error) {
            // 显示错误
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
            
            // 阻止关闭模态框
            return false;
          }
        }
      },
      () => {
        // 取消按钮回调 - 跳过保存
        console.log('[Leaderboard] User skipped saving to leaderboard');
      }
    );
    
    // 设置按钮文本
    setTimeout(() => {
      const confirmBtn = document.getElementById('modal-confirm');
      const cancelBtn = document.getElementById('modal-cancel');
      if (confirmBtn) confirmBtn.textContent = 'Save to Leaderboard';
      if (cancelBtn) {
        cancelBtn.textContent = 'Skip';
        cancelBtn.style.display = 'inline-block';
      }
      
      // 添加随机用户名按钮事件
      const randomBtn = document.getElementById('random-name-btn');
      const usernameInput = document.getElementById('username-input');
      if (randomBtn && usernameInput) {
        randomBtn.addEventListener('click', () => {
          usernameInput.value = generateRandomUsername();
          // 清除错误信息
          const errorDiv = document.getElementById('username-error');
          if (errorDiv) errorDiv.style.display = 'none';
        });
      }
      
      // 用户名输入实时验证
      if (usernameInput) {
        usernameInput.addEventListener('input', () => {
          const errorDiv = document.getElementById('username-error');
          if (errorDiv) errorDiv.style.display = 'none';
        });
        
        // 选中默认文本
        usernameInput.select();
      }
    }, 50);
  }
}

// 计算存活天数
function calculateSurvivalDays(timeService) {
  if (!timeService || !leaderboardService?.currentGameStats) {
    return 0;
  }
  
  const currentGameTime = timeService.getCurrentGameTime();
  const gameStartTime = new Date(leaderboardService.currentGameStats.gameStartTime);
  const daysDiff = Math.floor((currentGameTime - gameStartTime) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysDiff);
}

// 更新主要指标表头
function updatePrimaryMetricHeader() {
  const header = document.getElementById('primary-metric-header');
  if (header) {
    const categoryConfig = LEADERBOARD_CONFIG.CATEGORIES[currentSortType];
    header.textContent = categoryConfig ? categoryConfig.name : 'Primary Metric';
  }
}

// 导出刷新函数供外部调用
export { refreshLeaderboardDisplay };
