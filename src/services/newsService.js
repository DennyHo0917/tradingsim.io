// NewsService - 负责新闻系统的管理和价格影响
import { NEWS_CONFIG } from '../config/newsConfig.js';

export class NewsService {
  constructor(timeService, marketService) {
    this.timeService = timeService;
    this.marketService = marketService;
    this.currentQuarter = null;
    this.quarterNewsCount = 0;
    this.activeNews = [];
    this.newsHistory = [];
    this.isRunning = false;
    this.gradualImpacts = []; // 存储渐进式市场影响
    
    // 监听时间更新
    window.addEventListener('timeUpdate', (e) => this.onTimeUpdate(e.detail));
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[NewsService] Started');
  }

  stop() {
    this.isRunning = false;
  }

  onTimeUpdate(timeData) {
    if (!this.isRunning) return;
    
    // 检查是否进入新季度
    const currentQuarter = `${timeData.year}-${timeData.quarter}`;
    if (this.currentQuarter !== currentQuarter) {
      this.currentQuarter = currentQuarter;
      this.quarterNewsCount = 0;
      console.log(`[NewsService] New quarter: ${currentQuarter}`);
    }

    // 处理渐进式市场影响
    this.processGradualImpacts();

    // 随机触发新闻（降低触发概率）
    if (this.quarterNewsCount < NEWS_CONFIG.MAX_NEWS_PER_QUARTER && Math.random() < 0.005) {
      this.triggerRandomNews(timeData);
    }
  }

  triggerRandomNews(timeData) {
    // 随机选择一条新闻
    const randomNews = NEWS_CONFIG.NEWS_POOL[Math.floor(Math.random() * NEWS_CONFIG.NEWS_POOL.length)];
    
    // 计算价格影响
    const impact = this.calculatePriceImpact(randomNews.type);
    
    const newsEvent = {
      id: Date.now() + Math.random(),
      type: randomNews.type,
      text: randomNews.text,
      impact: impact,
      timestamp: timeData.fullString,
      gameTime: this.timeService.getCurrentGameTime().getTime()
    };

    // 添加到活跃新闻队列
    this.activeNews.push(newsEvent);
    this.quarterNewsCount++;
    
    // 添加到历史记录
    this.newsHistory.unshift(newsEvent);
    if (this.newsHistory.length > 500) {
      this.newsHistory = this.newsHistory.slice(0, 500);
    }

    // 渐进式应用价格影响（分散到多根K线）
    this.scheduleGradualImpact(impact, newsEvent);

    // 触发新闻事件
    window.dispatchEvent(new CustomEvent('newsTriggered', { detail: newsEvent }));
    
    console.log(`[NewsService] News triggered: ${randomNews.text} (Impact: ${impact.percentage.toFixed(2)}%)`);
  }

  calculatePriceImpact(newsType) {
    const config = NEWS_CONFIG.IMPACT_RANGES[newsType];
    if (!config) {
      return { percentage: 0, duration: 0 };
    }

    // 根据概率决定是否有影响
    if (Math.random() > config.probability) {
      return { percentage: 0, duration: 0 };
    }

    // 计算影响幅度（百分比）
    const percentage = config.min + Math.random() * (config.max - config.min);
    
    // 计算影响持续时间（游戏天数）
    let duration;
    switch (newsType) {
      case 'WAR':
      case 'PANDEMIC':
        duration = 30 + Math.random() * 90; // 30-120天
        break;
      case 'NATURAL':
        duration = 7 + Math.random() * 21; // 7-28天
        break;
      case 'POLITICS':
      case 'POLICY':
        duration = 14 + Math.random() * 42; // 14-56天
        break;
      case 'FINANCE':
        duration = 3 + Math.random() * 14; // 3-17天
        break;
      case 'TECHNOLOGY':
        duration = 21 + Math.random() * 63; // 21-84天
        break;
      case 'CULTURE':
        duration = 1 + Math.random() * 7; // 1-8天
        break;
      default:
        duration = 7 + Math.random() * 14; // 7-21天
    }

    return {
      percentage: percentage / 100, // 转换为小数
      duration: duration,
      decayRate: Math.abs(percentage) / (duration * 100) // 每天衰减率
    };
  }

  applyPriceImpact(impact) {
    if (impact.percentage === 0) return;

    // 立即影响价格
    const currentPrice = this.marketService.currentPrice;
    const newPrice = currentPrice * (1 + impact.percentage);
    this.marketService.setPrice(newPrice);

    // 如果有持续影响，设置衰减
    if (impact.duration > 0) {
      this.addPersistentEffect(impact);
    }
  }

  // 安排渐进式的市场影响
  scheduleGradualImpact(impact, newsEvent) {
    if (impact.percentage === 0) return;

    // 将影响分散到3-6根K线
    const kLineCount = 3 + Math.floor(Math.random() * 4); // 3-6根K线
    const impactPerKLine = impact.percentage / kLineCount;
    
    // 使用游戏内的时间间隔，每根K线间隔游戏中的6小时
    // 这样可以在一个游戏日内分散影响
    const gameTimeInterval = 6 * 60 * 60 * 1000; // 游戏中的6小时（毫秒）
    const currentGameTime = this.timeService.getCurrentGameTime().getTime();
    
    for (let i = 0; i < kLineCount; i++) {
              // 第一根K线立即生效，后续K线每6小时一根
      const triggerTime = currentGameTime + (i * gameTimeInterval);
      
      this.gradualImpacts.push({
        percentage: impactPerKLine,
        newsEvent: newsEvent,
        triggerTime: triggerTime,
        applied: false,
        kLineIndex: i + 1,
        totalKLines: kLineCount
      });
    }

    console.log(`[NewsService] Impact will be applied gradually over ${kLineCount} K-lines: ${newsEvent.text} (${(impact.percentage * 100).toFixed(2)}% total)`);
    console.log(`[NewsService] Current game time: ${new Date(currentGameTime).toISOString()}`);
    console.log(`[NewsService] Trigger times:`, this.gradualImpacts.slice(-kLineCount).map(gi => new Date(gi.triggerTime).toISOString()));
  }

  // 处理渐进式市场影响
  processGradualImpacts() {
    const currentGameTime = this.timeService.getCurrentGameTime().getTime();
    
    this.gradualImpacts.forEach(gradualImpact => {
      if (!gradualImpact.applied && currentGameTime >= gradualImpact.triggerTime) {
        // 应用部分影响
        const currentPrice = this.marketService.currentPrice;
        const newPrice = currentPrice * (1 + gradualImpact.percentage);
        this.marketService.setPrice(newPrice);
        
        gradualImpact.applied = true;
        
        console.log(`[NewsService] Gradual impact applied (${gradualImpact.kLineIndex}/${gradualImpact.totalKLines}): ${(gradualImpact.percentage * 100).toFixed(2)}% at ${new Date(currentGameTime).toISOString()}`);
      }
    });

    // 清理已应用的影响
    this.gradualImpacts = this.gradualImpacts.filter(impact => !impact.applied);
  }

  addPersistentEffect(impact) {
    // 这里可以添加持续性影响的逻辑
    // 比如每天逐渐衰减影响
    // 为简化实现，暂时只做瞬时影响
  }

  getCurrentNews() {
    return this.activeNews.slice(-5); // 返回最近5条新闻
  }

  getNewsHistory() {
    return this.newsHistory;
  }

  // 手动触发特定类型新闻（用于测试）
  triggerNewsType(type) {
    const newsOfType = NEWS_CONFIG.NEWS_POOL.filter(news => news.type === type);
    if (newsOfType.length === 0) return null;

    const randomNews = newsOfType[Math.floor(Math.random() * newsOfType.length)];
    const timeData = this.timeService.getFormattedTime();
    
    const impact = this.calculatePriceImpact(randomNews.type);
    
    const newsEvent = {
      id: Date.now() + Math.random(),
      type: randomNews.type,
      text: randomNews.text,
      impact: impact,
      timestamp: timeData.fullString,
      gameTime: this.timeService.getCurrentGameTime().getTime()
    };

    this.activeNews.push(newsEvent);
    this.newsHistory.unshift(newsEvent);
    
    // 渐进式应用价格影响（分散到多根K线）
    this.scheduleGradualImpact(impact, newsEvent);
    window.dispatchEvent(new CustomEvent('newsTriggered', { detail: newsEvent }));
    
    return newsEvent;
  }
} 