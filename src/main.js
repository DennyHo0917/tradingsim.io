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
import { initAchievementsPanel } from './ui/achievementsPanel.js';
import { initNavigation } from './ui/navigation.js';
import { initModal, showModal } from './ui/modal.js';
import { refreshPriceDisplay } from './ui/priceDisplay.js';
import { initTimeControls } from './ui/timeControls.js';
import { initNewsDisplay } from './ui/newsDisplay.js';

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
window.tradingServices = { accountService, tradingEngine, marketService, timeService, achievementService, newsService };

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
  initNewsDisplay(newsService);

  // 初始价格显示
  refreshPriceDisplay({ currentPrice: marketService.currentPrice, previousPrice: marketService.currentPrice });

  // 监听价格更新刷新价格显示
  window.addEventListener('priceUpdate', (e) => refreshPriceDisplay(e.detail));

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