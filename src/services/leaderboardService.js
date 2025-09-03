// LeaderboardService - 排行榜数据管理服务
import { LEADERBOARD_CONFIG, validateUsername } from '../config/leaderboardConfig.js';

export class LeaderboardService {
  constructor() {
    this.leaderboard = this.loadLeaderboard();
    this.currentGameStats = null; // 当前游戏统计数据
    
    // 调试信息：显示加载的排行榜数据
    console.log('[Leaderboard] Loaded leaderboard data:', this.leaderboard.length, 'entries');
    if (this.leaderboard.length > 0) {
      console.log('[Leaderboard] Sample entries:', this.leaderboard.slice(0, 3));
    }
  }

  // 从本地存储加载排行榜数据
  loadLeaderboard() {
    try {
      const saved = localStorage.getItem(LEADERBOARD_CONFIG.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // 确保数据格式正确
        if (Array.isArray(data)) {
          return data.map(entry => ({
            username: entry.username || 'Anonymous',
            survivalDays: entry.survivalDays || 0,
            maxProfit: entry.maxProfit || 0,
            maxBalance: entry.maxBalance || 10000,
            winRate: entry.winRate || 0,
            totalTrades: entry.totalTrades || 0,
            finalBalance: entry.finalBalance || 0,
            liquidationDate: entry.liquidationDate || Date.now(),
            gameStartTime: entry.gameStartTime || Date.now(),
            gameEndTime: entry.gameEndTime || Date.now()
          }));
        }
      }
    } catch (error) {
      console.warn('[Leaderboard] Failed to load leaderboard data:', error);
    }
    return [];
  }

  // 保存排行榜数据到本地存储
  saveLeaderboard() {
    try {
      localStorage.setItem(LEADERBOARD_CONFIG.STORAGE_KEY, JSON.stringify(this.leaderboard));
    } catch (error) {
      console.error('[Leaderboard] Failed to save leaderboard data:', error);
    }
  }

  // 开始新游戏时记录开始时间
  startNewGame(timeService = null) {
    // 使用游戏时间而不是真实时间
    const gameStartTime = timeService ? timeService.getCurrentGameTime().getTime() : new Date(1990, 0, 1).getTime();
    
    this.currentGameStats = {
      gameStartTime: gameStartTime, // 游戏时间
      maxBalance: 10000,
      maxProfit: 0,
      totalTrades: 0,
      winningTrades: 0
    };
  }

  // 更新当前游戏统计数据
  updateGameStats(accountInfo, timeService) {
    if (!this.currentGameStats) {
      this.startNewGame(timeService);
    }

    const stats = this.currentGameStats;
    
    // 更新最大余额
    if (accountInfo.maxBalance > stats.maxBalance) {
      stats.maxBalance = accountInfo.maxBalance;
    }
    
    // 更新最大利润 (相对于初始资金10000)
    const currentProfit = accountInfo.balance - 10000;
    if (currentProfit > stats.maxProfit) {
      stats.maxProfit = currentProfit;
    }
    
    // 更新交易统计
    stats.totalTrades = accountInfo.totalTrades;
    stats.winningTrades = accountInfo.winningTrades;
    
    // 计算存活天数 - 使用游戏时间
    if (timeService) {
      const currentGameTime = timeService.getCurrentGameTime();
      const gameStartTime = new Date(stats.gameStartTime);
      // 计算游戏内的天数差异
      const daysDiff = Math.floor((currentGameTime.getTime() - gameStartTime.getTime()) / (1000 * 60 * 60 * 24));
      stats.survivalDays = Math.max(0, daysDiff);
    }
  }

  // 用户爆仓时添加记录到排行榜
  addLeaderboardEntry(username, accountInfo, timeService) {
    const validation = validateUsername(username);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (!this.currentGameStats) {
      console.warn('[Leaderboard] No game stats available');
      return null;
    }

    const now = Date.now();
    const gameEndTime = timeService ? timeService.getCurrentGameTime().getTime() : now;
    
    // 计算最终存活天数 - 使用游戏时间
    let survivalDays = 0;
    if (timeService) {
      const gameStartTime = new Date(this.currentGameStats.gameStartTime);
      const currentGameTime = timeService.getCurrentGameTime();
      // 计算游戏内的天数差异
      survivalDays = Math.floor((currentGameTime.getTime() - gameStartTime.getTime()) / (1000 * 60 * 60 * 24));
    }

    const entry = {
      username: validation.username,
      survivalDays: Math.max(0, survivalDays),
      maxProfit: this.currentGameStats.maxProfit,
      maxBalance: this.currentGameStats.maxBalance,
      winRate: accountInfo.totalTrades > 0 ? (accountInfo.winningTrades / accountInfo.totalTrades * 100) : 0,
      totalTrades: accountInfo.totalTrades,
      finalBalance: accountInfo.balance,
      liquidationDate: now,
      gameStartTime: this.currentGameStats.gameStartTime,
      gameEndTime: gameEndTime
    };

    // 添加到排行榜
    this.leaderboard.push(entry);
    
    // 保持排行榜记录数量在限制内
    if (this.leaderboard.length > LEADERBOARD_CONFIG.MAX_ENTRIES) {
      // 按存活天数排序，移除表现最差的记录
      this.leaderboard.sort((a, b) => b.survivalDays - a.survivalDays);
      this.leaderboard = this.leaderboard.slice(0, LEADERBOARD_CONFIG.MAX_ENTRIES);
    }

    // 保存到本地存储
    this.saveLeaderboard();
    
    // 重置当前游戏统计
    this.currentGameStats = null;
    
    console.log('[Leaderboard] Added new entry:', entry);
    return entry;
  }

  // 获取排行榜数据，按指定类型排序
  getLeaderboard(sortType = LEADERBOARD_CONFIG.DEFAULT_SORT, limit = 50) {
    if (!LEADERBOARD_CONFIG.CATEGORIES[sortType]) {
      sortType = LEADERBOARD_CONFIG.DEFAULT_SORT;
    }

    let sortedData = [...this.leaderboard];
    
    // 特殊处理胜率排序 - 需要最少交易次数
    if (sortType === 'winRate') {
      sortedData = sortedData.filter(entry => entry.totalTrades >= 10);
    }
    
    // 排序
    sortedData.sort((a, b) => {
      const valueA = a[sortType] || 0;
      const valueB = b[sortType] || 0;
      return valueB - valueA; // 降序排列
    });

    return sortedData.slice(0, limit);
  }

  // 获取用户在各个排行榜中的排名
  getUserRanking(username) {
    const rankings = {};
    
    Object.keys(LEADERBOARD_CONFIG.CATEGORIES).forEach(category => {
      const leaderboard = this.getLeaderboard(category);
      const userIndex = leaderboard.findIndex(entry => 
        entry.username.toLowerCase() === username.toLowerCase()
      );
      
      if (userIndex !== -1) {
        rankings[category] = {
          rank: userIndex + 1,
          total: leaderboard.length,
          entry: leaderboard[userIndex]
        };
      }
    });
    
    return rankings;
  }

  // 获取排行榜统计信息
  getLeaderboardStats() {
    if (this.leaderboard.length === 0) {
      return {
        totalEntries: 0,
        avgSurvivalDays: 0,
        maxSurvivalDays: 0,
        avgMaxBalance: 0,
        topMaxBalance: 0
      };
    }

    const totalEntries = this.leaderboard.length;
    const avgSurvivalDays = this.leaderboard.reduce((sum, entry) => sum + entry.survivalDays, 0) / totalEntries;
    const maxSurvivalDays = Math.max(...this.leaderboard.map(entry => entry.survivalDays));
    const avgMaxBalance = this.leaderboard.reduce((sum, entry) => sum + entry.maxBalance, 0) / totalEntries;
    const topMaxBalance = Math.max(...this.leaderboard.map(entry => entry.maxBalance));

    return {
      totalEntries,
      avgSurvivalDays: Math.round(avgSurvivalDays * 10) / 10,
      maxSurvivalDays,
      avgMaxBalance: Math.round(avgMaxBalance),
      topMaxBalance
    };
  }

  // 清空排行榜数据（开发测试用）
  clearLeaderboard() {
    this.leaderboard = [];
    this.saveLeaderboard();
    console.log('[Leaderboard] Cleared all leaderboard data');
  }

  // 检查用户名是否已存在
  isUsernameExists(username) {
    return this.leaderboard.some(entry => 
      entry.username.toLowerCase() === username.toLowerCase()
    );
  }
}
