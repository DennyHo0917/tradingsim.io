// TradingEngine - 简化版交易撮合与仓位管理
import { GAME_CONFIG } from '../config/gameConfig.js';
import { AccountService } from './accountService.js';
import { formatCurrency } from '../utils/format.js';
import { showUsernameModal } from '../ui/leaderboardPanel.js';
import { audioManager } from '../utils/audioManager.js';

export class TradingEngine {
  constructor(accountService, marketService) {
    this.account = accountService;
    this.market = marketService;

    // 订阅价格更新事件，实时计算账户权益
    window.addEventListener('priceUpdate', (e) => {
      const price = e.detail.currentPrice;
      this.account.updateEquity(price);

      // Liquidation check
      if (this.account.equity <= 0 && this.account.positions.length && !this.account.isLiquidated) {
        console.warn('[Liquidation] Equity <= 0, liquidating all positions');
        
        // 播放爆仓音效
        audioManager.playLiquidationSound();
        
        this.closeAll();
        this.account.balance = 0;
        this.account.equity = 0;
        this.account.setLiquidated(true);
        
        if (window.showGameModal) {
          this.showLiquidationModal();
        }
        window.dispatchEvent(new Event('positionsUpdate'));
        window.dispatchEvent(new Event('ordersUpdate'));
      }
    });
  }

  // 显示爆仓弹窗
  showLiquidationModal() {
    const accountInfo = this.account.getAccountInfo();
    const leaderboardService = window.tradingServices?.leaderboardService;
    const timeService = window.tradingServices?.timeService;
    
    // 更新排行榜服务的当前游戏统计
    if (leaderboardService && timeService) {
      leaderboardService.updateGameStats(accountInfo, timeService);
    }
    
    // 显示用户名输入弹窗
    if (leaderboardService && timeService) {
      showUsernameModal(accountInfo, timeService, (username) => {
        try {
          const entry = leaderboardService.addLeaderboardEntry(username, accountInfo, timeService);
          
          // 触发排行榜更新事件
          window.dispatchEvent(new Event('leaderboardUpdate'));
          
          return entry;
        } catch (error) {
          console.error('[Leaderboard] Failed to add entry:', error);
          throw error;
        }
      });
    } else {
      // 如果排行榜服务不可用，显示传统的爆仓弹窗
      this.showTraditionalLiquidationModal();
    }
  }
  
  // 传统爆仓弹窗（备用）
  showTraditionalLiquidationModal() {
    const message = `
      <div style="text-align: center; margin: 20px 0;">
        <p style="font-size: 1.2em; color: #ff4757; margin-bottom: 15px;">💥 Account Liquidated!</p>
        <p>Your account equity reached $0. All positions have been closed.</p>
        <p style="margin-top: 20px;">What would you like to do?</p>
      </div>
    `;
    
    window.showGameModal(
      '💥 Liquidation', 
      message, 
      'liquidation',
      () => {
        // 重启游戏
        this.account.restart();
        console.log('[Game] Restarted after liquidation');
      },
      () => {
        // 继续观看，但无法交易
        console.log('[Game] Continue watching after liquidation');
      }
    );
    
    // 更新按钮文本
    setTimeout(() => {
      const confirmBtn = document.getElementById('modal-confirm');
      const cancelBtn = document.getElementById('modal-cancel');
      if (confirmBtn) confirmBtn.textContent = 'Restart Game';
      if (cancelBtn) {
        cancelBtn.textContent = 'Continue Watching';
        cancelBtn.style.display = 'inline-block';
      }
    }, 50);
  }

  // 市价开仓（简单示例）
  placeMarketOrder({ side = 'buy', leverage = 1 }) {
    // 检查是否可以交易
    if (!this.account.canTrade()) {
      if (window.showGameModal) {
        window.showGameModal(
          '❌ Cannot Trade', 
          '<p>Trading is disabled. Your account has been liquidated.<br>Please restart the game to continue trading.</p>',
          'info'
        );
      }
      return;
    }
    
    const price = this.market.currentPrice;
    // position size = balance * leverage / price (简化：全仓)
    const positionValue = this.account.balance * leverage;
    const size = positionValue / price;

    const pos = this.account.addPosition({
      symbol: 'CRYPTOUSD',
      side,
      size,
      entryPrice: price,
      leverage,
    });

    if (!pos) {
      // 开仓失败
      return;
    }

    window.dispatchEvent(new Event('positionsUpdate'));
    console.log(
      `[Trade] Open ${side.toUpperCase()} size=${size.toFixed(3)} @ ${price} leverage=${leverage} (posId=${pos.id})`
    );
    // 播放交易音效（开仓总是中性音效）
    audioManager.playTradeSound(true);
    
    if (window.showGameModal) {
      window.showGameModal('✅ Order Filled', `<p>${side.toUpperCase()} ${size.toFixed(3)} @ ${price}</p>`);
    }
    this.account.logStatus();
  }

  closePosition(id) {
    const price = this.market.currentPrice;
    const closed = this.account.closePosition(id, price);
    if (closed) {
      console.log(`[Trade] Close posId=${closed.id} pnl=${formatCurrency(closed.pnl)} @ ${price}`);
      this.account.logStatus();
      
      // 触发交易完成事件用于成就系统
      window.dispatchEvent(new CustomEvent('tradeCompleted', { detail: closed }));
      
      // 播放交易音效（根据盈亏决定音调）
      audioManager.playTradeSound(closed.pnl >= 0);
      
      window.dispatchEvent(new Event('positionsUpdate'));
      if (window.showGameModal) {
        const text = closed.pnl >= 0 ? 'Profit' : 'Loss';
        window.showGameModal('Position Closed', `<p>${text}: ${formatCurrency(closed.pnl)}</p>`);
      }
    }
  }

  closeAll(id = null) {
    if (id !== null) {
      this.closePosition(id);
      return;
    }
    const price = this.market.currentPrice;
    [...this.account.positions].forEach((p) => {
      this.closePosition(p.id);
    });
  }

  placeLimitOrder({ side='buy', price, leverage=1 }) {
    const order = this.account.addOrder({
      symbol: 'CRYPTOUSD',
      side,
      orderType: 'limit',
      price,
      leverage,
      createTime: Date.now(),
    });
    window.dispatchEvent(new Event('ordersUpdate'));
    console.log(`[Order] Place LIMIT ${side.toUpperCase()} @ ${price}`);
    return order;
  }
} 