// accountPanel.js - 更新账户面板 UI
import { formatCurrency } from '../utils/format.js';

export function initAccountPanel(accountService) {
  const balanceEl = document.getElementById('account-balance');
  const equityEl = document.getElementById('account-equity');
  const posCountEl = document.getElementById('position-count');
  const orderCountEl = document.getElementById('order-count');
  const pnlEl = document.getElementById('total-pnl');

  function refresh() {
    const info = accountService.getAccountInfo();
    if (balanceEl) {
      balanceEl.textContent = formatCurrency(info.balance);
      if (accountService.isLiquidated) {
        balanceEl.style.color = '#ff4757';
      } else {
        balanceEl.style.color = '';
      }
    }
    
    if (equityEl) {
      equityEl.textContent = formatCurrency(info.equity);
      if (accountService.isLiquidated) {
        equityEl.style.color = '#ff4757';
      } else {
        equityEl.style.color = '';
      }
    }
    
    if (posCountEl) posCountEl.textContent = info.positions.length;
    if (orderCountEl) orderCountEl.textContent = info.orders.length;

    const unrealized = info.equity - info.balance;
    if (pnlEl) {
      pnlEl.textContent = formatCurrency(unrealized);
      pnlEl.className = unrealized > 0 ? 'pnl-positive' : unrealized < 0 ? 'pnl-negative' : 'pnl-neutral';
    }

    // 显示爆仓状态
    const playerTitleEl = document.getElementById('player-title');
    if (playerTitleEl && accountService.isLiquidated) {
      playerTitleEl.textContent = '⚠️ LIQUIDATED - Trading Disabled';
      playerTitleEl.style.color = '#ff4757';
    }
  }

  // 初始渲染
  refresh();

  // priceUpdate 时刷新
  window.addEventListener('priceUpdate', refresh);

  // positionsUpdate 时刷新
  window.addEventListener('positionsUpdate', refresh);

  // ordersUpdate 时刷新
  window.addEventListener('ordersUpdate', refresh);

  // 监听账户重启事件
  window.addEventListener('accountRestart', () => {
    const playerTitleEl = document.getElementById('player-title');
    if (playerTitleEl) {
      playerTitleEl.textContent = '';
      playerTitleEl.style.color = '#ffd700';
    }
    refresh();
  });

  // 暴露给外部在交易后可手动刷新
  return { refresh };
} 