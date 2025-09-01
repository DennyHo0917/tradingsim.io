// historyTable.js - 渲染历史交易记录和新闻历史
import { formatCurrency } from '../utils/format.js';

export function initHistoryTable(accountService) {
  const tbody = document.getElementById('history-tbody');
  const noHistoryDiv = document.getElementById('no-history');

  function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  function formatGameDateTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const quarter = Math.ceil(month / 3);
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthStr = monthNames[month - 1];
    
    return `${year} Q${quarter} ${monthStr} ${day}`;
  }

  function render() {
    if (!tbody) return;
    const info = accountService.getAccountInfo();
    const history = info.tradeHistory || [];

    // 清空
    tbody.innerHTML = '';
    if (history.length === 0) {
      if (noHistoryDiv) noHistoryDiv.style.display = 'block';
      return;
    }
    if (noHistoryDiv) noHistoryDiv.style.display = 'none';

    history.forEach((trade) => {
      const tr = document.createElement('tr');
      
      const dirText = trade.side === 'buy' ? 'LONG' : 'SHORT';
      const dirClass = trade.side === 'buy' ? 'pnl-positive' : 'pnl-negative';
      const pnlClass = trade.pnl > 0 ? 'pnl-positive' : trade.pnl < 0 ? 'pnl-negative' : 'pnl-neutral';
      const returnPercent = ((trade.pnl / (trade.entryPrice * trade.size)) * 100).toFixed(2);
      
      // 为整行添加盈亏颜色类
      const rowClass = trade.pnl > 0 ? 'trade-profit-row' : trade.pnl < 0 ? 'trade-loss-row' : 'trade-neutral-row';
      tr.className = rowClass;

      tr.innerHTML = `
        <td>${formatGameDateTime(trade.closeTime)}</td>
        <td>${trade.symbol}</td>
        <td class="${dirClass}">${dirText}</td>
        <td>${trade.size.toFixed(4)}</td>
        <td>${formatCurrency(trade.entryPrice)}</td>
        <td>${formatCurrency(trade.exitPrice)}</td>
        <td class="${pnlClass}">${formatCurrency(trade.pnl)}</td>
        <td class="${pnlClass}">${returnPercent}%</td>
        <td>${formatDuration(trade.duration)}</td>
        <td>${trade.leverage}x</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // 标签页切换功能
  function initHistoryTabs() {
    const tradingTab = document.getElementById('trading-history-tab');
    const newsTab = document.getElementById('news-history-tab');
    const tradingContent = document.getElementById('trading-history-content');
    const newsContent = document.getElementById('news-history-content');

    if (!tradingTab || !newsTab || !tradingContent || !newsContent) return;

    function showTradingHistory() {
      tradingTab.classList.add('active');
      newsTab.classList.remove('active');
      tradingContent.style.display = 'block';
      newsContent.style.display = 'none';
    }

    function showNewsHistory() {
      newsTab.classList.add('active');
      tradingTab.classList.remove('active');
      newsContent.style.display = 'block';
      tradingContent.style.display = 'none';
      renderNewsHistory();
    }

    tradingTab.addEventListener('click', showTradingHistory);
    newsTab.addEventListener('click', showNewsHistory);
  }

  // 渲染新闻历史
  function renderNewsHistory() {
    const newsService = window.tradingServices?.newsService;
    if (!newsService) return;

    const newsTbody = document.getElementById('news-history-tbody');
    const noNewsHistoryDiv = document.getElementById('no-news-history');
    if (!newsTbody) return;

    const newsHistory = newsService.getNewsHistory() || [];

    // 清空
    newsTbody.innerHTML = '';
    if (newsHistory.length === 0) {
      if (noNewsHistoryDiv) noNewsHistoryDiv.style.display = 'block';
      return;
    }
    if (noNewsHistoryDiv) noNewsHistoryDiv.style.display = 'none';

    newsHistory.forEach((news) => {
      const tr = document.createElement('tr');
      
      // 新闻类型颜色
      const typeClass = `news-type-${news.type.toLowerCase()}`;
      
      // 影响颜色
      const impactPercent = (news.impact.percentage * 100).toFixed(1);
      const impactClass = news.impact.percentage > 0 ? 'pnl-positive' : 
                         news.impact.percentage < 0 ? 'pnl-negative' : 'pnl-neutral';
      
      // 持续时间
      const durationText = news.impact.duration ? `${Math.round(news.impact.duration)} days` : 'Instant';

      tr.innerHTML = `
        <td>${news.timestamp}</td>
        <td class="${typeClass}" style="text-transform: capitalize; font-weight: 600;">${news.type}</td>
        <td style="max-width: 400px; white-space: normal; word-wrap: break-word;">${news.text}</td>
        <td class="${impactClass}">${impactPercent}%</td>
        <td>${durationText}</td>
      `;
      
      newsTbody.appendChild(tr);
    });
  }

  // 初始化标签页
  initHistoryTabs();

  // 初始渲染
  render();

  // 监听历史更新事件
  window.addEventListener('historyUpdate', render);
  window.addEventListener('accountRestart', render);
  window.addEventListener('newsTriggered', () => {
    // 如果当前显示新闻历史标签，则刷新
    const newsContent = document.getElementById('news-history-content');
    if (newsContent && newsContent.style.display !== 'none') {
      renderNewsHistory();
    }
  });

  return { render, renderNewsHistory };
} 