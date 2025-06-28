// positionsTable.js - 渲染持仓列表
import { formatCurrency } from '../utils/format.js';

export function initPositionsTable(accountService, tradingEngine) {
  const tbody = document.getElementById('positions-tbody');
  const noPosDiv = document.getElementById('no-positions');

  function render() {
    if (!tbody) return;
    const positions = accountService.getAccountInfo().positions;

    // 清空
    tbody.innerHTML = '';
    if (positions.length === 0) {
      if (noPosDiv) noPosDiv.style.display = 'block';
      return;
    }
    if (noPosDiv) noPosDiv.style.display = 'none';

    positions.forEach((p) => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-pos', p.id);

      const dirText = p.side === 'buy' ? 'LONG' : 'SHORT';
      const dirClass = p.side === 'buy' ? 'pnl-positive' : 'pnl-negative';
      const currentPrice = window.tradingServices.marketService.currentPrice;
      const pnl = (p.side === 'buy' ? 1 : -1) * (currentPrice - p.entryPrice) * p.size;

      tr.innerHTML = `
        <td>${p.symbol}</td>
        <td>${dirText}</td>
        <td>${(p.size).toFixed(3)}</td>
        <td>${formatCurrency(p.entryPrice)}</td>
        <td>${formatCurrency(currentPrice)}</td>
        <td class="${pnl>0?'pnl-positive':pnl<0?'pnl-negative':'pnl-neutral'}">${formatCurrency(pnl)}</td>
        <td><button data-pos="${p.id}" class="close-btn">Close</button></td>
      `;
      tbody.appendChild(tr);
    });

    // 绑定关闭事件
    tbody.querySelectorAll('.close-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-pos'));
        tradingEngine.closePosition(id);
      });
    });
  }

  // 初始渲染
  render();

  function updatePrice() {
    const currentPrice = window.tradingServices.marketService.currentPrice;
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((tr) => {
      const posId = parseInt(tr.getAttribute('data-pos'));
      const p = accountService
        .getAccountInfo()
        .positions.find((x) => x.id === posId);
      if (!p) return;
      const priceCell = tr.children[4]; // Current Price column
      const pnlCell = tr.children[5];
      if (priceCell) priceCell.textContent = formatCurrency(currentPrice);
      const pnl = (p.side === 'buy' ? 1 : -1) * (currentPrice - p.entryPrice) * p.size;
      if (pnlCell) {
        pnlCell.textContent = formatCurrency(pnl);
        pnlCell.className = pnl > 0 ? 'pnl-positive' : pnl < 0 ? 'pnl-negative' : 'pnl-neutral';
      }
    });
  }

  window.addEventListener('priceUpdate', updatePrice);
  window.addEventListener('positionsUpdate', render);

  return { render };
} 