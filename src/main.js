// Trading Simulator - 模块化入口
import { GAME_CONFIG } from './config/gameConfig.js';
import { MARKET_CONFIG } from './config/marketConfig.js';
import { TIME_CONFIG } from './config/timeConfig.js';
import { ACHIEVEMENTS } from './config/achievementsConfig.js';
import { NEWS_CONFIG } from './config/newsConfig.js';
import { generateRandomPrice } from './utils/marketUtils.js';
import { formatCurrency } from './utils/format.js';
import { MarketService } from './services/marketService.js';
import { TimeService } from './services/timeService.js';
import { AccountService } from './services/accountService.js';
import { TradingEngine } from './services/tradingEngine.js';
import { NewsService } from './services/newsService.js';
import { initAccountPanel } from './ui/accountPanel.js';
import { initTradingPanel } from './ui/tradingPanel.js';
import { initPositionsTable } from './ui/positionsTable.js';
import { initOrdersTable } from './ui/ordersTable.js';
import { initHistoryTable } from './ui/historyTable.js';
import { initChart } from './ui/chart.js';
import { AchievementService } from './services/achievementService.js';
import { LeaderboardService } from './services/leaderboardService.js';
import { initAchievementsPanel } from './ui/achievementsPanel.js';
import { initLeaderboardPanel } from './ui/leaderboardPanel.js';
import { initNavigation } from './ui/navigation.js';
import { initModal, showModal, checkAndShowWelcome, showWelcomeModal, resetWelcomeStatus } from './ui/modal.js';
import { refreshPriceDisplay } from './ui/priceDisplay.js';
import { initTimeControls } from './ui/timeControls.js';
import { initNewsDisplay } from './ui/newsDisplay.js';
import { achievementCelebration } from './ui/achievementCelebration.js';
import { modalPauseManager } from './utils/modalPauseManager.js';
import { audioManager } from './utils/audioManager.js';

console.log('[Module] GAME_CONFIG', GAME_CONFIG);
console.log('[Module] MARKET_CONFIG', MARKET_CONFIG);
console.log('[Module] TIME_CONFIG', TIME_CONFIG);
console.log('[Module] ACHIEVEMENTS', ACHIEVEMENTS);
console.log('[Module] NEWS_CONFIG', NEWS_CONFIG);

console.log('[Utils] generateRandomPrice sample:', generateRandomPrice(100, 0.02));
console.log('[Utils] formatCurrency sample:', formatCurrency(12345.678));

const timeService = new TimeService();
timeService.start();
console.log('[Service] TimeService started');

const marketService = new MarketService(timeService);
marketService.start();
console.log('[Service] MarketService started');

const accountService = new AccountService();
const tradingEngine = new TradingEngine(accountService, marketService);

const newsService = new NewsService(timeService, marketService);
newsService.start();
console.log('[Service] NewsService started');

const achievementService = new AchievementService(accountService);
const leaderboardService = new LeaderboardService();

// 开始新游戏追踪 - 传入timeService以使用游戏时间
leaderboardService.startNewGame(timeService);

window.tradingServices = { accountService, tradingEngine, marketService, timeService, achievementService, newsService, leaderboardService, achievementCelebration, modalPauseManager, audioManager };

// 全局初始化函数
function initUI() {
  initModal();
  initNavigation();
  initTimeControls(timeService);
  initAccountPanel(accountService);
  initTradingPanel(tradingEngine);
  initPositionsTable(accountService, tradingEngine);
  initOrdersTable(accountService, tradingEngine);
  initHistoryTable(accountService);
  initChart(marketService);
  initAchievementsPanel();
  initLeaderboardPanel(leaderboardService);
  initNewsDisplay(newsService);

  // 初始价格显示
  refreshPriceDisplay({ currentPrice: marketService.currentPrice, previousPrice: marketService.currentPrice });

  // 监听价格更新刷新价格显示
  window.addEventListener('priceUpdate', (e) => {
    refreshPriceDisplay(e.detail);
    
    // 更新排行榜统计数据
    const accountInfo = accountService.getAccountInfo();
    leaderboardService.updateGameStats(accountInfo, timeService);
  });

  // 添加分享按钮事件监听
  document.getElementById('share-x-btn')?.addEventListener('click', () => {
    const url = encodeURIComponent(window.location.href);
    const info = window.tradingServices?.accountService?.getAccountInfo?.();
    let text = 'I\'m playing Trading Simulator!';
    if (info) {
      text += ` Current balance: $${info.balance.toFixed(2)}.`;
    }
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
    window.open(shareUrl, '_blank');
  });

  // 添加帮助按钮事件监听
  document.getElementById('help-btn')?.addEventListener('click', () => {
    showWelcomeModal();
  });

  // 检查并显示欢迎弹窗（仅首次访问）
  checkAndShowWelcome();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initUI);
} else {
  initUI();
}

// TODO: 后续逐步迁移 index-simple.html 中的逻辑到此文件及其子模块

// 开发测试功能 - 手动触发新闻（可在浏览器控制台使用）
window.testNews = {
  triggerWar: () => newsService.triggerNewsType('WAR'),
  triggerPandemic: () => newsService.triggerNewsType('PANDEMIC'),
  triggerTech: () => newsService.triggerNewsType('TECHNOLOGY'),
  triggerFinance: () => newsService.triggerNewsType('FINANCE'),
  triggerPolitics: () => newsService.triggerNewsType('POLITICS'),
  triggerPolicy: () => newsService.triggerNewsType('POLICY'),
  triggerCulture: () => newsService.triggerNewsType('CULTURE'),
  triggerNatural: () => newsService.triggerNewsType('NATURAL'),
  getHistory: () => newsService.getNewsHistory()
};

// 调试功能 - 重置欢迎状态
window.resetWelcome = resetWelcomeStatus;

// 调试功能 - 音效测试
window.testAudio = {
  // 测试成就音效
  testAchievement: () => {
    const { audioManager } = window.tradingServices;
    if (audioManager) {
      audioManager.playAchievementSound();
      console.log('🎉 Playing achievement sound');
    }
  },
  
  // 测试爆仓音效
  testLiquidation: () => {
    const { audioManager } = window.tradingServices;
    if (audioManager) {
      audioManager.playLiquidationSound();
      console.log('💥 Playing liquidation sound');
    }
  },
  
  // 测试盈利交易音效
  testProfitTrade: () => {
    const { audioManager } = window.tradingServices;
    if (audioManager) {
      audioManager.playTradeSound(true);
      console.log('📈 Playing profit trade sound');
    }
  },
  
  // 测试亏损交易音效
  testLossTrade: () => {
    const { audioManager } = window.tradingServices;
    if (audioManager) {
      audioManager.playTradeSound(false);
      console.log('📉 Playing loss trade sound');
    }
  },
  
  // 切换音效
  toggleSound: () => {
    const { audioManager } = window.tradingServices;
    if (audioManager) {
      const enabled = audioManager.toggleSound();
      console.log('🔊 Sound:', enabled ? 'ON' : 'OFF');
      return enabled;
    }
  },
  
  // 设置音量
  setVolume: (volume) => {
    const { audioManager } = window.tradingServices;
    if (audioManager) {
      audioManager.setVolume(volume);
      console.log('🔊 Volume set to:', (volume * 100).toFixed(0) + '%');
    }
  },
  
  // 获取音效状态
  getStatus: () => {
    const { audioManager } = window.tradingServices;
    if (audioManager) {
      const status = audioManager.getStatus();
      console.log('🔊 Audio Status:', status);
      return status;
    }
  }
};

// 调试功能 - 成就测试
window.testAchievement = {
  // 测试成就庆祝效果
  testCelebration: () => {
    const { achievementCelebration } = window.tradingServices;
    if (achievementCelebration) {
      const testAchievement = {
        id: 'test',
        name: 'Test Achievement',
        description: 'This is a test achievement for demonstration',
        icon: '🎉',
        reward: { title: 'Test Master' }
      };
      achievementCelebration.celebrate(testAchievement);
    }
  },
  
  // 切换音效（委托给audioManager）
  toggleSound: () => {
    return window.testAudio.toggleSound();
  }
};

// 调试功能 - 排行榜测试
window.testLeaderboard = {
  // 强制触发爆仓（测试用）
  forceLiquidation: () => {
    const account = window.tradingServices.accountService;
    const trading = window.tradingServices.tradingEngine;
    account.balance = 0;
    account.equity = 0;
    account.setLiquidated(true);
    trading.showLiquidationModal();
  },
  
  // 添加测试数据到排行榜
  addTestEntry: (username = 'TestUser') => {
    const leaderboard = window.tradingServices.leaderboardService;
    const account = window.tradingServices.accountService;
    const time = window.tradingServices.timeService;
    
    // 模拟一些统计数据
    const testAccountInfo = {
      balance: 0,
      totalTrades: Math.floor(Math.random() * 100) + 10,
      winningTrades: Math.floor(Math.random() * 50) + 5,
      maxBalance: Math.floor(Math.random() * 50000) + 10000
    };
    
    try {
      const entry = leaderboard.addLeaderboardEntry(username + Math.floor(Math.random() * 1000), testAccountInfo, time);
      window.dispatchEvent(new Event('leaderboardUpdate'));
      console.log('Added test entry:', entry);
      return entry;
    } catch (error) {
      console.error('Failed to add test entry:', error);
    }
  },
  
  // 清空排行榜
  clearLeaderboard: () => {
    const leaderboard = window.tradingServices.leaderboardService;
    leaderboard.clearLeaderboard();
    window.dispatchEvent(new Event('leaderboardUpdate'));
    console.log('Leaderboard cleared');
  },
  
  // 获取排行榜数据
  getLeaderboard: () => {
    const leaderboard = window.tradingServices.leaderboardService;
    return leaderboard.getLeaderboard();
  }
}; 