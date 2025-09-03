// LeaderboardConfig - 排行榜配置
export const LEADERBOARD_CONFIG = {
  // 最大排行榜记录数量
  MAX_ENTRIES: 100,
  
  // 排序类型
  SORT_TYPES: {
    SURVIVAL_DAYS: 'survivalDays',
    MAX_PROFIT: 'maxProfit',
    MAX_BALANCE: 'maxBalance',
    WIN_RATE: 'winRate',
    TOTAL_TRADES: 'totalTrades'
  },
  
  // 默认排序
  DEFAULT_SORT: 'survivalDays',
  
  // 本地存储键名
  STORAGE_KEY: 'tradingSimLeaderboard',
  
  // 排行榜类别配置
  CATEGORIES: {
    survivalDays: {
      name: 'Survival Days',
      icon: '🏃',
      description: 'Longest survival time',
      unit: 'days',
      format: (value) => `${value} days`
    },
    maxProfit: {
      name: 'Max Profit',
      icon: '💰',
      description: 'Highest profit achieved',
      unit: 'USD',
      format: (value) => `$${value.toFixed(2)}`
    },
    maxBalance: {
      name: 'Max Balance',
      icon: '💎',
      description: 'Highest account balance',
      unit: 'USD',
      format: (value) => `$${value.toFixed(2)}`
    },
    winRate: {
      name: 'Win Rate',
      icon: '🎯',
      description: 'Best win rate (min 10 trades)',
      unit: '%',
      format: (value) => `${value.toFixed(1)}%`
    },
    totalTrades: {
      name: 'Total Trades',
      icon: '📊',
      description: 'Most trades completed',
      unit: 'trades',
      format: (value) => `${value} trades`
    }
  },
  
  // 用户名验证规则
  USERNAME_RULES: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
    ALLOWED_CHARS: /^[a-zA-Z0-9_\-\u4e00-\u9fff]+$/,
    FORBIDDEN_WORDS: ['admin', 'system', 'bot', 'null', 'undefined', 'anonymous']
  },
  
  // 默认用户名建议
  DEFAULT_NAMES: [
    'CryptoTrader', 'MarketWizard', 'TradingPro', 'BullRunner', 'BearHunter',
    'ProfitSeeker', 'RiskTaker', 'ChartMaster', 'DayTrader', 'SwingKing'
  ]
};

// 生成随机用户名建议
export function generateRandomUsername() {
  const names = LEADERBOARD_CONFIG.DEFAULT_NAMES;
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomNum = Math.floor(Math.random() * 9999) + 1;
  return `${randomName}${randomNum}`;
}

// 验证用户名
export function validateUsername(username) {
  const rules = LEADERBOARD_CONFIG.USERNAME_RULES;
  
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }
  
  const trimmed = username.trim();
  
  if (trimmed.length < rules.MIN_LENGTH) {
    return { valid: false, error: `Username must be at least ${rules.MIN_LENGTH} characters` };
  }
  
  if (trimmed.length > rules.MAX_LENGTH) {
    return { valid: false, error: `Username must be no more than ${rules.MAX_LENGTH} characters` };
  }
  
  if (!rules.ALLOWED_CHARS.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscore and dash' };
  }
  
  const lowerTrimmed = trimmed.toLowerCase();
  if (rules.FORBIDDEN_WORDS.some(word => lowerTrimmed.includes(word))) {
    return { valid: false, error: 'Username contains forbidden words' };
  }
  
  return { valid: true, username: trimmed };
}
