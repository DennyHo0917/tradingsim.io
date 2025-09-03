// AccountService - 维护账户资产、持仓及委托
import { GAME_CONFIG } from '../config/gameConfig.js';
import { formatCurrency } from '../utils/format.js';

let POSITION_ID = 1;

export class AccountService {
  constructor(initialBalance = GAME_CONFIG.INITIAL_BALANCE) {
    this.initialBalance = initialBalance; // 保存初始余额用于重启
    this.balance = initialBalance; // 可用余额
    this.equity = initialBalance; // 账户净值 = balance + 未实现盈亏
    this.positions = []; // 当前持仓
    this.orders = []; // 挂单（预留）
    this.tradeHistory = []; // 历史交易记录
    this._ORDER_ID = 1;
    this.isLiquidated = false; // 标记是否已爆仓
    this.totalTrades = 0; // 总交易次数
    this.winningTrades = 0; // 盈利交易次数
    this.maxBalance = initialBalance; // 最大账户余额
  }

  // 重启游戏
  restart() {
    this.balance = this.initialBalance;
    this.equity = this.initialBalance;
    this.positions = [];
    this.orders = [];
    this.tradeHistory = []; // 重启时清空历史记录
    this.isLiquidated = false;
    this.totalTrades = 0;
    this.winningTrades = 0;
    this.maxBalance = this.initialBalance;
    POSITION_ID = 1; // 重置位置ID
    this._ORDER_ID = 1;
    
    // 通知排行榜服务开始新游戏
    const leaderboardService = window.tradingServices?.leaderboardService;
    if (leaderboardService) {
      leaderboardService.startNewGame();
    }
    
    // 触发更新事件
    window.dispatchEvent(new Event('positionsUpdate'));
    window.dispatchEvent(new Event('ordersUpdate'));
    window.dispatchEvent(new Event('historyUpdate'));
    window.dispatchEvent(new Event('accountRestart'));
    
    console.log('[Account] Game restarted - Balance reset to', formatCurrency(this.initialBalance));
  }

  // 设置爆仓状态
  setLiquidated(liquidated = true) {
    this.isLiquidated = liquidated;
  }

  // 检查是否可以开仓
  canTrade() {
    return !this.isLiquidated && this.balance > 0;
  }

  // 开仓 - 添加爆仓检查
  addPosition({ symbol, side, size, entryPrice, leverage }) {
    if (!this.canTrade()) {
      console.warn('[Trade] Cannot trade - account liquidated or no balance');
      return null;
    }
    
    // 获取游戏时间
    const timeService = window.tradingServices?.timeService;
    const gameTime = timeService ? timeService.getCurrentGameTime().getTime() : Date.now();
    
    const position = {
      id: POSITION_ID++,
      symbol,
      side, // 'buy' or 'sell'
      size,
      entryPrice,
      leverage,
      openTime: gameTime,
    };
    this.positions.push(position);
    // 暂时不冻结保证金，简化模型
    return position;
  }

  // 平仓
  closePosition(id, exitPrice) {
    const idx = this.positions.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const position = this.positions[idx];
    const pnl = this._calcPnl(position, exitPrice);
    this.balance += pnl; // 结算盈亏到余额
    
    // 更新统计数据
    this.totalTrades++;
    if (pnl > 0) {
      this.winningTrades++;
    }
    this.maxBalance = Math.max(this.maxBalance, this.balance);
    
    // 获取游戏时间
    const timeService = window.tradingServices?.timeService;
    const gameCloseTime = timeService ? timeService.getCurrentGameTime().getTime() : Date.now();
    
    // 添加到历史记录
    const trade = {
      id: position.id,
      symbol: position.symbol,
      side: position.side,
      size: position.size,
      entryPrice: position.entryPrice,
      exitPrice,
      pnl,
      leverage: position.leverage,
      openTime: position.openTime,
      closeTime: gameCloseTime,
      duration: gameCloseTime - position.openTime
    };
    this.tradeHistory.unshift(trade); // 新交易放在最前面
    
    // 限制历史记录数量，避免内存过多
    if (this.tradeHistory.length > 1000) {
      this.tradeHistory = this.tradeHistory.slice(0, 1000);
    }
    
    this.positions.splice(idx, 1);
    this.updateEquity(exitPrice);
    
    // 触发历史更新事件
    window.dispatchEvent(new Event('historyUpdate'));
    
    return trade;
  }

  // 计算并更新净值
  updateEquity(currentPrice) {
    const unrealized = this.positions.reduce((sum, p) => sum + this._calcPnl(p, currentPrice), 0);
    this.equity = this.balance + unrealized;
  }

  addBalance(amount) {
    this.balance += amount;
    this.equity += amount;
  }

  _calcPnl(position, price) {
    const direction = position.side === 'buy' ? 1 : -1;
    // 移除重复的杠杆计算 - size已经通过杠杆计算得出
    return direction * (price - position.entryPrice) * position.size;
  }

  addOrder(order) {
    order.id = this._ORDER_ID++;
    this.orders.push(order);
    return order;
  }

  cancelOrder(id) {
    const idx = this.orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      this.orders.splice(idx, 1);
    }
  }

  // ---- getters ----
  getAccountInfo() {
    return {
      balance: this.balance,
      equity: this.equity,
      positions: this.positions,
      orders: this.orders,
      tradeHistory: this.tradeHistory,
      totalTrades: this.totalTrades,
      winningTrades: this.winningTrades,
      winRate: this.totalTrades > 0 ? (this.winningTrades / this.totalTrades * 100).toFixed(1) : '0',
      maxBalance: this.maxBalance
    };
  }

  logStatus() {
    console.log(
      `[Account] balance=${formatCurrency(this.balance)}, equity=${formatCurrency(this.equity)}, positions=${this.positions.length}`
    );
  }
} 