// Utility functions related to market price simulation
// 迁移自 index-simple.html

// 市场状态管理
const marketState = {
  momentum: 0,
  trendStrength: 0,
  volatilityRegime: 'normal', // 'low', 'normal', 'high'
  supportLevel: null,
  resistanceLevel: null,
  lastBreakout: 0,
  cyclePosition: 0, // 0-1, 用于模拟市场周期
  microTrend: 0, // 短期趋势偏向
  consolidationCount: 0, // 整理计数器
};

// 生成随机价格，带动量因子以获得更平滑的曲线
export function generateRandomPrice(currentPrice, volatility, deltaTime = 1) {
  // 更新市场状态
  updateMarketState(currentPrice);
  
  // 计算基础价格变动
  const basePriceMove = calculateBasePriceMove(currentPrice, volatility, deltaTime);
  
  // 应用支撑阻力影响
  const supportResistanceEffect = calculateSupportResistanceEffect(currentPrice, basePriceMove);
  
  // 最终价格
  let newPrice = currentPrice * (1 + basePriceMove + supportResistanceEffect);
  
  // 价格边界检查
  newPrice = Math.max(newPrice, currentPrice * 0.95); // 单次最大跌幅5%
  newPrice = Math.min(newPrice, currentPrice * 1.05); // 单次最大涨幅5%
  
  return newPrice;
}

function updateMarketState(currentPrice) {
  // 更新动量（带衰减）
  const randomFactor = (Math.random() - 0.5) * 2;
  marketState.momentum = marketState.momentum * 0.85 + randomFactor * 0.15;
  
  // 更新周期位置
  marketState.cyclePosition = (marketState.cyclePosition + 0.001) % 1;
  
  // 周期性调整趋势强度
  const cycleTrend = Math.sin(marketState.cyclePosition * Math.PI * 4) * 0.3;
  marketState.trendStrength = marketState.trendStrength * 0.95 + cycleTrend * 0.05;
  
  // 更新微趋势
  marketState.microTrend = marketState.microTrend * 0.9 + (Math.random() - 0.5) * 0.1;
  
  // 动态更新波动率状态
  const volatilityRand = Math.random();
  if (volatilityRand < 0.005) {
    // 0.5% 概率进入高波动
    marketState.volatilityRegime = 'high';
  } else if (volatilityRand < 0.01) {
    // 0.5% 概率进入低波动
    marketState.volatilityRegime = 'low';
  } else if (volatilityRand > 0.98) {
    // 2% 概率回归正常波动
    marketState.volatilityRegime = 'normal';
  }
  
  // 整理计数器
  if (Math.abs(marketState.momentum) < 0.3) {
    marketState.consolidationCount++;
  } else {
    marketState.consolidationCount = 0;
  }
  
  // 动态调整支撑阻力位
  updateSupportResistance(currentPrice);
}

function updateSupportResistance(currentPrice) {
  // 每隔一段时间重新设定支撑阻力位
  if (Math.random() < 0.01 || !marketState.supportLevel) {
    const range = currentPrice * 0.05; // 5%的价格范围
    marketState.supportLevel = currentPrice - range * (0.5 + Math.random() * 0.5);
    marketState.resistanceLevel = currentPrice + range * (0.5 + Math.random() * 0.5);
  }
}

function calculateBasePriceMove(currentPrice, volatility, deltaTime) {
  // 基础趋势分量
  const trendComponent = marketState.trendStrength * 0.001;
  
  // 动量分量
  const momentumComponent = marketState.momentum * 0.0005;
  
  // 微趋势分量
  const microTrendComponent = marketState.microTrend * 0.0003;
  
  // 随机分量（受波动率影响）
  let volatilityMultiplier = 1;
  switch (marketState.volatilityRegime) {
    case 'low':
      volatilityMultiplier = 0.5;
      break;
    case 'high':
      volatilityMultiplier = 2.0;
      break;
    default:
      volatilityMultiplier = 1.0;
  }
  
  const randomComponent = (Math.random() - 0.5) * volatility * volatilityMultiplier * Math.sqrt(deltaTime);
  
  // 整理期间降低波动
  const consolidationMultiplier = marketState.consolidationCount > 20 ? 0.6 : 1.0;
  
  // 突破效应：整理后的爆发
  let breakoutMultiplier = 1.0;
  if (marketState.consolidationCount > 30 && Math.random() < 0.05) {
    breakoutMultiplier = 2.0;
    marketState.lastBreakout = Date.now();
    marketState.consolidationCount = 0;
  }
  
  return (trendComponent + momentumComponent + microTrendComponent + randomComponent) 
         * consolidationMultiplier * breakoutMultiplier;
}

function calculateSupportResistanceEffect(currentPrice, basePriceMove) {
  if (!marketState.supportLevel || !marketState.resistanceLevel) {
    return 0;
  }
  
  const newPrice = currentPrice * (1 + basePriceMove);
  let effect = 0;
  
  // 接近阻力位时的反弹效应
  const resistanceDistance = (marketState.resistanceLevel - newPrice) / marketState.resistanceLevel;
  if (resistanceDistance < 0.02 && resistanceDistance > 0) {
    // 在阻力位2%范围内，有向下的力
    effect -= resistanceDistance * 0.001;
  }
  
  // 接近支撑位时的反弹效应
  const supportDistance = (newPrice - marketState.supportLevel) / marketState.supportLevel;
  if (supportDistance < 0.02 && supportDistance > 0) {
    // 在支撑位2%范围内，有向上的力
    effect += (0.02 - supportDistance) * 0.001;
  }
  
  // 突破支撑阻力的概率和效应
  if (newPrice > marketState.resistanceLevel && Math.random() < 0.1) {
    // 10%概率突破阻力，产生加速效应
    effect += 0.002;
    marketState.resistanceLevel = newPrice * (1 + 0.03 + Math.random() * 0.02); // 新阻力位
  }
  
  if (newPrice < marketState.supportLevel && Math.random() < 0.1) {
    // 10%概率跌破支撑，产生加速下跌
    effect -= 0.002;
    marketState.supportLevel = newPrice * (1 - 0.03 - Math.random() * 0.02); // 新支撑位
  }
  
  return effect;
} 