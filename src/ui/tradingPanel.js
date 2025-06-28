// tradingPanel.js - 绑定交易按钮到 TradingEngine
export function initTradingPanel(tradingEngine) {
  const buyBtn = document.getElementById('buy-btn');
  const sellBtn = document.getElementById('sell-btn');
  const leverageSelect = document.getElementById('leverage');

  function getLeverage() {
    return parseFloat(leverageSelect ? leverageSelect.value : '1');
  }

  function updateButtonStates() {
    const canTrade = tradingEngine.account.canTrade();
    
    if (buyBtn) {
      buyBtn.disabled = !canTrade;
      buyBtn.style.opacity = canTrade ? '1' : '0.5';
      buyBtn.style.cursor = canTrade ? 'pointer' : 'not-allowed';
    }
    
    if (sellBtn) {
      sellBtn.disabled = !canTrade;
      sellBtn.style.opacity = canTrade ? '1' : '0.5';
      sellBtn.style.cursor = canTrade ? 'pointer' : 'not-allowed';
    }
    
    if (leverageSelect) {
      leverageSelect.disabled = !canTrade;
      leverageSelect.style.opacity = canTrade ? '1' : '0.5';
    }
  }

  if (buyBtn) {
    buyBtn.addEventListener('click', () => {
      tradingEngine.placeMarketOrder({ side: 'buy', leverage: getLeverage() });
    });
  }

  if (sellBtn) {
    sellBtn.addEventListener('click', () => {
      tradingEngine.placeMarketOrder({ side: 'sell', leverage: getLeverage() });
    });
  }

  // 初始状态更新
  updateButtonStates();

  // 监听账户重启事件
  window.addEventListener('accountRestart', updateButtonStates);
  
  // 监听价格更新，检查爆仓状态变化
  window.addEventListener('priceUpdate', updateButtonStates);
} 