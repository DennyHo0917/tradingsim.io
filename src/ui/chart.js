// chart.js - 简易实时折线图（HTML5 Canvas 版，无外部依赖）
import { generateRandomPrice } from '../utils/marketUtils.js';

export function initChart(marketService) {
  const container = document.getElementById('price-chart');
  if (!container) return;

  // 创建并插入 Canvas
  const canvas = document.createElement('canvas');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight || 400;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // 蜡烛图数据
  const BASE_CANDLE_INTERVAL_MS = 5000; // 基准：5 秒/根
  const MAX_CANDLES = 150;
  const candles = [];

  let lastCandle = {
    time: Date.now(),
    open: marketService.currentPrice,
    high: marketService.currentPrice,
    low: marketService.currentPrice,
    close: marketService.currentPrice,
  };

  // 市场状态管理 - 增强版
  const chartMarketState = {
    currentTrend: (Math.random() - 0.5) * 0.4, // 初始化为随机小趋势
    trendDuration: 0,
    lastTrendChange: 0,
    marketPhase: 'normal',
    phaseProgress: Math.random(), // 随机初始进度
    volatilityProfile: 0.8 + Math.random() * 0.4, // 0.8-1.2的波动率
    marketSentiment: 0, // -1到1，市场情绪
    momentumStrength: 0, // 动量强度
    supportResistanceLevels: [], // 支撑阻力位
    lastBreakoutTime: 0, // 上次突破时间
    newsEventCooldown: 0, // 新闻事件冷却时间
  };

  // 初始化支撑阻力位
  function initializeSupportResistance(basePrice) {
    chartMarketState.supportResistanceLevels = [
      { level: basePrice * 0.95, type: 'support', strength: Math.random() * 0.5 + 0.3 },
      { level: basePrice * 0.98, type: 'support', strength: Math.random() * 0.3 + 0.2 },
      { level: basePrice * 1.02, type: 'resistance', strength: Math.random() * 0.3 + 0.2 },
      { level: basePrice * 1.05, type: 'resistance', strength: Math.random() * 0.5 + 0.3 },
    ];
  }

  function updateChartMarketState() {
    chartMarketState.trendDuration++;
    chartMarketState.phaseProgress = Math.min(1, chartMarketState.phaseProgress + (0.003 + Math.random() * 0.007));
    
    // 降低新闻事件冷却
    if (chartMarketState.newsEventCooldown > 0) {
      chartMarketState.newsEventCooldown--;
    }
    
    // 趋势持续性：更动态，受市场阶段影响
    let basePersistence = 0.75; // 降低到75%
    
    // 根据市场阶段调整持续性
    switch (chartMarketState.marketPhase) {
      case 'accumulation':
        basePersistence = 0.85; // 积累期更稳定
        break;
      case 'markup':
        basePersistence = 0.70; // 上涨期变化更频繁
        break;
      case 'distribution':
        basePersistence = 0.80; // 分发期相对稳定
        break;
      case 'decline':
        basePersistence = 0.65; // 下跌期更混乱
        break;
      case 'normal':
        basePersistence = 0.75; // 正常期
        break;
    }
    
    // 趋势转换逻辑
    const shouldChangeTrend = Math.random() > basePersistence || 
                              chartMarketState.trendDuration > (30 + Math.random() * 40);
    
    if (shouldChangeTrend) {
      // 更自然的趋势转换
      const trendChangeIntensity = 0.2 + Math.random() * 0.8;
      const newTrendComponent = (Math.random() - 0.5) * 2 * trendChangeIntensity;
      
      // 加入均值回归倾向
      const meanReversion = -chartMarketState.currentTrend * 0.3;
      
      chartMarketState.currentTrend = chartMarketState.currentTrend * (1 - trendChangeIntensity) + 
                                      newTrendComponent + meanReversion;
      chartMarketState.currentTrend = Math.max(-1, Math.min(1, chartMarketState.currentTrend));
      chartMarketState.trendDuration = 0;
      chartMarketState.lastTrendChange = Date.now();
    }
    
    // 更智能的市场阶段转换
    if (chartMarketState.phaseProgress >= 1) {
      const currentPhase = chartMarketState.marketPhase;
      let nextPhase;
      
      // 基于当前阶段和随机性选择下一阶段
      const transitionRandom = Math.random();
      
      switch (currentPhase) {
        case 'normal':
          if (transitionRandom < 0.3) nextPhase = 'accumulation';
          else if (transitionRandom < 0.6) nextPhase = 'decline';
          else nextPhase = 'normal';
          break;
        case 'accumulation':
          if (transitionRandom < 0.6) nextPhase = 'markup';
          else if (transitionRandom < 0.8) nextPhase = 'normal';
          else nextPhase = 'distribution';
          break;
        case 'markup':
          if (transitionRandom < 0.5) nextPhase = 'distribution';
          else if (transitionRandom < 0.8) nextPhase = 'normal';
          else nextPhase = 'decline';
          break;
        case 'distribution':
          if (transitionRandom < 0.6) nextPhase = 'decline';
          else if (transitionRandom < 0.8) nextPhase = 'normal';
          else nextPhase = 'accumulation';
          break;
        case 'decline':
          if (transitionRandom < 0.4) nextPhase = 'accumulation';
          else if (transitionRandom < 0.7) nextPhase = 'normal';
          else nextPhase = 'distribution';
          break;
      }
      
      chartMarketState.marketPhase = nextPhase;
      chartMarketState.phaseProgress = 0;
    }
    
    // 动态调整波动率
    const volatilityTarget = getPhaseVolatility();
    chartMarketState.volatilityProfile = chartMarketState.volatilityProfile * 0.9 + volatilityTarget * 0.1;
    
    // 更新市场情绪（影响后续价格）
    const sentimentChange = (Math.random() - 0.5) * 0.1;
    chartMarketState.marketSentiment = Math.max(-1, Math.min(1, 
      chartMarketState.marketSentiment * 0.95 + sentimentChange
    ));
    
    // 更新动量强度
    const momentumDecay = 0.92;
    chartMarketState.momentumStrength *= momentumDecay;
  }

  function getPhaseVolatility() {
    switch (chartMarketState.marketPhase) {
      case 'accumulation': return 0.4 + Math.random() * 0.3; // 低波动
      case 'markup': return 0.8 + Math.random() * 0.6; // 中高波动
      case 'distribution': return 0.6 + Math.random() * 0.4; // 中等波动
      case 'decline': return 1.0 + Math.random() * 0.8; // 高波动
      case 'normal': return 0.7 + Math.random() * 0.5; // 中等波动
      default: return 0.8;
    }
  }

  // 检查突发事件（新闻、大单等）
  function checkNewsEvents() {
    if (chartMarketState.newsEventCooldown > 0) return { hasEvent: false };
    
    const eventProbability = 0.008; // 0.8%概率
    if (Math.random() < eventProbability) {
      chartMarketState.newsEventCooldown = 20 + Math.random() * 30; // 冷却20-50根K线
      
      const eventTypes = ['bullish_news', 'bearish_news', 'whale_buy', 'whale_sell', 'technical_breakthrough'];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      let impact = 0;
      let volatilityBoost = 1;
      
      switch (eventType) {
        case 'bullish_news':
          impact = 0.01 + Math.random() * 0.02; // 1-3%正面影响
          volatilityBoost = 1.5;
          break;
        case 'bearish_news':
          impact = -(0.01 + Math.random() * 0.02); // 1-3%负面影响
          volatilityBoost = 1.8;
          break;
        case 'whale_buy':
          impact = 0.005 + Math.random() * 0.015; // 0.5-2%
          volatilityBoost = 1.3;
          chartMarketState.momentumStrength = Math.min(1, chartMarketState.momentumStrength + 0.3);
          break;
        case 'whale_sell':
          impact = -(0.005 + Math.random() * 0.015); // -0.5%-2%
          volatilityBoost = 1.4;
          chartMarketState.momentumStrength = Math.min(1, chartMarketState.momentumStrength + 0.3);
          break;
        case 'technical_breakthrough':
          impact = (Math.random() - 0.5) * 0.03; // ±1.5%
          volatilityBoost = 2.0;
          break;
      }
      
      return { hasEvent: true, impact, volatilityBoost, eventType };
    }
    
    return { hasEvent: false };
  }

  // 检查支撑阻力位影响
  function checkSupportResistance(price, priceMove) {
    let adjustment = 0;
    
    for (const level of chartMarketState.supportResistanceLevels) {
      const distance = Math.abs(price - level.level) / level.level;
      
      if (distance < 0.005) { // 在0.5%范围内
        const influence = level.strength * (1 - distance / 0.005); // 距离越近影响越大
        
        if (level.type === 'support' && priceMove < 0) {
          // 支撑位阻止下跌
          adjustment += influence * 0.003;
        } else if (level.type === 'resistance' && priceMove > 0) {
          // 阻力位阻止上涨
          adjustment -= influence * 0.003;
        }
      }
    }
    
    return adjustment;
  }

  function generateEnhancedCandle(previousClose, timeIndex) {
    if (timeIndex > 0) { // 只在生成历史数据时调用
      updateChartMarketState();
    }
    
    // 检查突发事件
    const newsEvent = checkNewsEvents();
    
    // 开盘价计算 - 更真实的跳空逻辑
    let open = previousClose;
    const gapProbability = newsEvent.hasEvent ? 0.3 : 0.03; // 有新闻时更容易跳空
    if (Math.random() < gapProbability) {
      const baseGapSize = newsEvent.hasEvent ? newsEvent.impact * 0.5 : (Math.random() - 0.5) * 0.003;
      open = previousClose * (1 + baseGapSize);
    }
    
    // 基础价格变动 - 更强的趋势和随机性
    let baseTrend = chartMarketState.currentTrend * (0.0015 + Math.random() * 0.001); // 增加基础波动
    
    // 根据市场阶段调整 - 更明显的差异
    switch (chartMarketState.marketPhase) {
      case 'accumulation':
        baseTrend += (0.0002 + Math.random() * 0.0003); // 轻微上偏，有随机性
        break;
      case 'markup':
        baseTrend += chartMarketState.currentTrend > 0 ? (0.0008 + Math.random() * 0.0007) : 0; // 上涨期加强
        break;
      case 'distribution':
        baseTrend -= (0.0002 + Math.random() * 0.0003); // 轻微下偏
        break;
      case 'decline':
        baseTrend += chartMarketState.currentTrend < 0 ? -(0.0008 + Math.random() * 0.0007) : 0; // 下跌期加强
        break;
      case 'normal':
        baseTrend += (Math.random() - 0.5) * 0.0004; // 纯随机
        break;
    }
    
    // 市场情绪影响
    baseTrend += chartMarketState.marketSentiment * 0.0003;
    
    // 动量影响
    baseTrend += chartMarketState.momentumStrength * chartMarketState.currentTrend * 0.0005;
    
    // 突发事件影响
    if (newsEvent.hasEvent) {
      baseTrend += newsEvent.impact;
    }
    
    // 随机波动 - 更大的波动范围
    const baseVolatility = 0.005; // 增加基础波动率
    const currentVolatility = baseVolatility * chartMarketState.volatilityProfile;
    const newsVolatilityBoost = newsEvent.hasEvent ? newsEvent.volatilityBoost : 1;
    const randomMove = (Math.random() - 0.5) * currentVolatility * newsVolatilityBoost;
    
    // 计算初步收盘价
    let totalMove = baseTrend + randomMove;
    
    // 支撑阻力位影响
    const srAdjustment = checkSupportResistance(open, totalMove);
    totalMove += srAdjustment;
    
    let close = open * (1 + totalMove);
    
    // 限制单根K线最大变动 - 适当放宽
    const maxSingleMove = newsEvent.hasEvent ? 0.05 : 0.025; // 有新闻时允许更大变动
    const actualMove = (close - open) / open;
    if (Math.abs(actualMove) > maxSingleMove) {
      close = open * (1 + Math.sign(actualMove) * maxSingleMove);
    }
    
    // 生成高低价 - 更真实的影线分布
    let high, low;
    const candleDirection = close > open ? 'bull' : 'bear';
    const bodySize = Math.abs(close - open);
    const minBodyForWick = Math.max(bodySize, open * 0.0001); // 最小实体用于计算影线
    
    // 影线类型分布（更符合真实市场）
    const wickDistribution = Math.random();
    
    if (wickDistribution < 0.25) {
      // 25%：几乎无影线（强趋势）
      high = Math.max(open, close);
      low = Math.min(open, close);
      
      const tinyWick = minBodyForWick * (0.05 + Math.random() * 0.1);
      high += tinyWick;
      low -= tinyWick;
      
    } else if (wickDistribution < 0.65) {
      // 40%：正常影线
      const wickMultiplier = 0.5 + Math.random() * 1.0; // 0.5-1.5倍
      const wickSize = minBodyForWick * wickMultiplier;
      
      high = Math.max(open, close);
      low = Math.min(open, close);
      
      if (candleDirection === 'bull') {
        // 阳线：下影线通常更长（底部支撑）
        high += wickSize * (0.3 + Math.random() * 0.4);
        low -= wickSize * (0.6 + Math.random() * 0.6);
      } else {
        // 阴线：上影线通常更长（顶部阻力）
        high += wickSize * (0.6 + Math.random() * 0.6);
        low -= wickSize * (0.3 + Math.random() * 0.4);
      }
      
    } else if (wickDistribution < 0.85) {
      // 20%：单边长影线
      const longWickMultiplier = 1.5 + Math.random() * 2.0; // 1.5-3.5倍
      const longWickSize = minBodyForWick * longWickMultiplier;
      
      high = Math.max(open, close);
      low = Math.min(open, close);
      
      if (Math.random() < 0.5) {
        // 长上影线（顶部试探）
        high += longWickSize;
        low -= minBodyForWick * (0.1 + Math.random() * 0.2);
      } else {
        // 长下影线（底部试探）
        high += minBodyForWick * (0.1 + Math.random() * 0.2);
        low -= longWickSize;
      }
      
    } else {
      // 15%：十字星或纺锤（震荡）
      const centerPrice = (open + close) / 2;
      const wickRange = Math.max(minBodyForWick * 2, centerPrice * 0.002);
      
      const upperWick = wickRange * (0.6 + Math.random() * 0.8);
      const lowerWick = wickRange * (0.6 + Math.random() * 0.8);
      
      high = centerPrice + upperWick;
      low = centerPrice - lowerWick;
    }
    
    // 确保价格逻辑正确
    high = Math.max(high, Math.max(open, close));
    low = Math.min(low, Math.min(open, close));
    
    return {
      time: Date.now() - timeIndex * BASE_CANDLE_INTERVAL_MS,
      open,
      high,
      low,
      close
    };
  }

  // 生成历史K线
  const INITIAL_HISTORICAL = Math.floor(MAX_CANDLES / 2);
  let historyPrice = marketService.currentPrice;
  for (let i = INITIAL_HISTORICAL; i > 0; i--) {
    const candle = generateEnhancedCandle(historyPrice, i);
    historyPrice = candle.close;
    candles.push(candle);
  }

  // 使用最新价格生成当前蜡烛
  lastCandle = {
    time: Date.now(),
    open: historyPrice,
    high: historyPrice,
    low: historyPrice,
    close: historyPrice,
  };

  candles.push(lastCandle);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (candles.length === 0) return;

    // 计算可视范围
    const visible = candles.slice(-MAX_CANDLES);
    const highs = visible.map((c) => c.high);
    const lows = visible.map((c) => c.low);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const range = max - min || 1;

    const candleWidth = Math.max(2, canvas.width / MAX_CANDLES - 1);
    const half = candleWidth / 2;

    visible.forEach((c, idx) => {
      const xCenter = idx * (candleWidth + 1) + half + 0.5; // 0.5 避免模糊

      const yHigh = canvas.height - ((c.high - min) / range) * canvas.height;
      const yLow = canvas.height - ((c.low - min) / range) * canvas.height;
      const yOpen = canvas.height - ((c.open - min) / range) * canvas.height;
      const yClose = canvas.height - ((c.close - min) / range) * canvas.height;

      const up = c.close >= c.open;
      ctx.strokeStyle = up ? '#00d4ff' : '#ff4444';
      ctx.fillStyle = up ? '#00d4ff' : '#ff4444';
      ctx.lineWidth = 1;

      // 画影线
      ctx.beginPath();
      ctx.moveTo(xCenter, yHigh);
      ctx.lineTo(xCenter, yLow);
      ctx.stroke();

      // 画实体
      const bodyTop = up ? yClose : yOpen;
      const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));
      
      if (bodyHeight > 1) {
        ctx.fillRect(xCenter - half, bodyTop, candleWidth, bodyHeight);
      } else {
        // 十字星：画一条水平线
        ctx.beginPath();
        ctx.moveTo(xCenter - half, yOpen);
        ctx.lineTo(xCenter + half, yOpen);
        ctx.stroke();
      }
    });
  }

  draw();

  // 监听价格更新 -> 更新蜡烛 & 重绘
  window.addEventListener('priceUpdate', (e) => {
    const { currentPrice } = e.detail;
    const now = Date.now();

    // 根据时间系统速度动态调整蜡烛间隔，速度越快间隔越短
    const speed = (marketService.timeSystem && marketService.timeSystem.currentSpeed) || 1;
    const candleIntervalMs = BASE_CANDLE_INTERVAL_MS / Math.max(1, speed);

    if (now - lastCandle.time >= candleIntervalMs) {
      // 开启新蜡烛 - 使用增强的生成算法
      updateChartMarketState(); // 实时更新市场状态
      const newCandle = generateEnhancedCandle(lastCandle.close, 0);
      lastCandle = {
        time: now,
        open: newCandle.open,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
      };
      candles.push(lastCandle);
      if (candles.length > MAX_CANDLES) candles.shift();
    } else {
      // 更新当前蜡烛 - 更自然的价格更新
      lastCandle.high = Math.max(lastCandle.high, currentPrice);
      lastCandle.low = Math.min(lastCandle.low, currentPrice);
      lastCandle.close = currentPrice;
    }

    draw();
  });

  // 处理容器尺寸变动
  const resizeObserver = new ResizeObserver(() => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    draw();
  });
  resizeObserver.observe(container);

  console.log('[Chart] Enhanced canvas chart initialized');

  // 初始化支撑阻力位
  initializeSupportResistance(marketService.currentPrice);
} 