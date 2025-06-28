// MarketService - 负责模拟市场价格并派发价格更新事件
import { MARKET_CONFIG } from '../config/marketConfig.js';
import { generateRandomPrice } from '../utils/marketUtils.js';

export class MarketService {
  constructor(timeSystem = null) {
    this.timeSystem = timeSystem; // 可选的时间系统依赖
    this.currentPrice = MARKET_CONFIG.BASE_PRICE;
    this.previousPrice = MARKET_CONFIG.BASE_PRICE;
    this.isRunning = false;
    this.updateIntervalId = null;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.priceUpdateAccumulator = 0; // 用于处理小于1的速度
    
    this.updateIntervalId = setInterval(() => {
      // 检查时间系统是否暂停
      if (this.timeSystem && this.timeSystem.isPaused) {
        return; // 暂停时不更新价格
      }
      
      const speed = this.timeSystem ? this.timeSystem.currentSpeed || 1 : 1;
      if (speed === 0) {
        return; // 速度为0时不更新价格
      }
      
      // 处理小于1的速度
      this.priceUpdateAccumulator += speed;
      
      if (this.priceUpdateAccumulator >= 1) {
        const updateCount = Math.floor(this.priceUpdateAccumulator);
        for (let i = 0; i < updateCount; i++) {
          this.updatePrice();
        }
        this.priceUpdateAccumulator -= updateCount;
      }
    }, MARKET_CONFIG.UPDATE_INTERVAL);
  }

  stop() {
    if (!this.isRunning) return;
    clearInterval(this.updateIntervalId);
    this.isRunning = false;
    this.priceUpdateAccumulator = 0;
  }

  updatePrice() {
    this.previousPrice = this.currentPrice;

    const volatility = MARKET_CONFIG.VOLATILITY;
    this.currentPrice = generateRandomPrice(this.currentPrice, volatility);

    // 边界限制并格式化
    this.currentPrice = Math.max(this.currentPrice, MARKET_CONFIG.MIN_PRICE);
    this.currentPrice = Math.min(this.currentPrice, MARKET_CONFIG.MAX_PRICE);
    this.currentPrice = Number(this.currentPrice.toFixed(this.currentPrice < 1 ? 3 : this.currentPrice < 100 ? 2 : 1));

    this.dispatchPriceUpdate();
  }

  dispatchPriceUpdate() {
    const event = new CustomEvent('priceUpdate', {
      detail: {
        currentPrice: this.currentPrice,
        previousPrice: this.previousPrice,
        priceChange: this.currentPrice - this.previousPrice,
        priceChangePercent:
          ((this.currentPrice - this.previousPrice) / this.previousPrice) * 100,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(event);
  }

  getBidAskPrices() {
    const spreadAmount = (this.currentPrice * MARKET_CONFIG.SPREAD_BPS) / 10000;
    return {
      bid: Number((this.currentPrice - spreadAmount / 2).toFixed(2)),
      ask: Number((this.currentPrice + spreadAmount / 2).toFixed(2)),
    };
  }

  // 新增：设置价格方法（供新闻系统使用）
  setPrice(newPrice) {
    this.previousPrice = this.currentPrice;
    this.currentPrice = Math.max(1, newPrice);
    
    // 应用边界限制和格式化
    this.currentPrice = Math.max(this.currentPrice, MARKET_CONFIG.MIN_PRICE);
    this.currentPrice = Math.min(this.currentPrice, MARKET_CONFIG.MAX_PRICE);
    this.currentPrice = Number(this.currentPrice.toFixed(this.currentPrice < 1 ? 3 : this.currentPrice < 100 ? 2 : 1));
    
    this.dispatchPriceUpdate();
  }
} 