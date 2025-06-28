// achievementService.js - 处理成就解锁逻辑
import { ACHIEVEMENTS } from '../config/achievementsConfig.js';
import { formatCurrency } from '../utils/format.js';

export class AchievementService {
  constructor(accountService) {
    this.account = accountService;
    this.unlocked = new Set();
    this.intervalId = setInterval(() => this.checkAll(), 1000);
    
    // 追踪成就相关数据
    this.startTime = Date.now();
    this.gameStartTime = null;
    this.consecutiveWins = 0;
    this.maxDrawdown = 0;
    this.initialBalance = 10000;
    this.hasRecovered = false;
    this.crashProfits = 0;
    this.newsTradeCount = 0;
    this.lastNewsTradeReset = Date.now();
    
    // 监听交易和时间事件
    window.addEventListener('tradeCompleted', (e) => this.onTradeCompleted(e.detail));
    window.addEventListener('timeUpdate', (e) => this.onTimeUpdate(e.detail));
    window.addEventListener('newsTriggered', () => this.onNewsTriggered());
  }

  destroy() {
    clearInterval(this.intervalId);
  }

  checkAll() {
    Object.values(ACHIEVEMENTS).forEach((ach) => {
      if (!this.unlocked.has(ach.id) && this._check(ach)) {
        this.unlocked.add(ach.id);
        window.dispatchEvent(
          new CustomEvent('achievementUnlocked', { detail: ach })
        );
      }
    });
  }

  onTradeCompleted(trade) {
    // 更新连胜记录
    if (trade.pnl > 0) {
      this.consecutiveWins++;
    } else {
      this.consecutiveWins = 0;
    }
    
    // 检查回本
    const stats = this.account.getAccountInfo();
    const currentDrawdown = (this.initialBalance - stats.equity) / this.initialBalance;
    if (currentDrawdown > this.maxDrawdown) {
      this.maxDrawdown = currentDrawdown;
    }
    if (this.maxDrawdown >= 0.8 && stats.equity > this.initialBalance) {
      this.hasRecovered = true;
    }
  }
  
  onTimeUpdate(timeData) {
    if (!this.gameStartTime) {
      this.gameStartTime = timeData;
    }
  }
  
  onNewsTriggered() {
    const now = Date.now();
    // 重置24小时计数器
    if (now - this.lastNewsTradeReset > 24 * 60 * 60 * 1000) {
      this.newsTradeCount = 0;
      this.lastNewsTradeReset = now;
    }
  }

  _check(achievement) {
    const stats = this.account.getAccountInfo();
    const condition = achievement.condition;
    
    switch (condition.type) {
      case 'balance_milestone':
        return stats.equity >= condition.amount;
        
      case 'double_in_time':
        return this._checkDoubleInTime(condition, stats);
        
      case 'single_trade_size':
        return this._checkSingleTradeSize(condition, stats);
        
      case 'consecutive_wins':
        return this.consecutiveWins >= condition.count;
        
      case 'comeback':
        return this.hasRecovered;
        
      case 'leverage_double':
        return this._checkLeverageDouble(condition, stats);
        
      case 'trade_count':
        return stats.tradeHistory.length >= condition.count;
        
      case 'win_rate':
        return this._checkWinRate(condition, stats);
        
      case 'survive_time':
        return this._checkSurviveTime(condition);
        
      case 'profit_from_crashes':
        return this.crashProfits >= condition.count;
        
      case 'news_trading':
        return this.newsTradeCount >= condition.count;
        
      default:
        return false;
    }
  }
  
  _checkDoubleInTime(condition, stats) {
    // 简化实现：检查当前余额是否达到倍数
    return stats.equity >= this.initialBalance * condition.multiplier;
  }
  
  _checkSingleTradeSize(condition, stats) {
    return stats.tradeHistory.some(trade => 
      Math.abs(trade.entryPrice * trade.size * trade.leverage) >= condition.amount
    );
  }
  
  _checkLeverageDouble(condition, stats) {
    return stats.tradeHistory.some(trade => 
      trade.leverage >= condition.leverage && 
      trade.pnl > 0 && 
      stats.equity >= this.initialBalance * condition.multiplier
    );
  }
  
  _checkWinRate(condition, stats) {
    const trades = stats.tradeHistory;
    if (trades.length < condition.min_trades) return false;
    
    const winningTrades = trades.filter(trade => trade.pnl > 0).length;
    const winRate = winningTrades / trades.length;
    return winRate >= condition.rate;
  }
  
  _checkSurviveTime(condition) {
    if (!this.gameStartTime) return false;
    
    const currentTime = window.tradingServices?.timeService?.getCurrentGameTime();
    if (!currentTime) return false;
    
    const startTime = new Date(1990, 0, 1); // 游戏开始时间
    const timeDiff = currentTime.getTime() - startTime.getTime();
    
    switch (condition.timeframe) {
      case 'year':
        return timeDiff >= 365 * 24 * 60 * 60 * 1000;
      case 'five_years':
        return timeDiff >= 5 * 365 * 24 * 60 * 60 * 1000;
      default:
        return false;
    }
  }
} 