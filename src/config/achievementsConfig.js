// Trading Simulator - 成就系统配置
// 迁移自 index-simple.html 中的 ACHIEVEMENTS
export const ACHIEVEMENTS = {
  // 快速翻倍类
  MIDAS_TOUCH: {
    id: 'midas_touch',
    name: 'Midas Touch',
    description: 'Double your money in 1 day',
    icon: '✨',
    condition: { type: 'double_in_time', timeframe: 'day', multiplier: 2 },
    reward: { title: 'Day Trader' },
  },
  FLASH_TRADER: {
    id: 'flash_trader',
    name: 'Flash Trader',
    description: 'Double your money in 1 week',
    icon: '⚡',
    condition: { type: 'double_in_time', timeframe: 'week', multiplier: 2 },
    reward: { title: 'Speed Demon' },
  },
  RAPID_FIRE: {
    id: 'rapid_fire',
    name: 'Rapid Fire',
    description: 'Double your money in 1 month',
    icon: '🔥',
    condition: { type: 'double_in_time', timeframe: 'month', multiplier: 2 },
    reward: { title: 'Quick Gun' },
  },
  LIGHTNING_DOUBLE: {
    id: 'lightning_double',
    name: 'Lightning Double',
    description: 'Double your money in 1 quarter',
    icon: '⚡',
    condition: { type: 'double_in_time', timeframe: 'quarter', multiplier: 2 },
    reward: { title: 'Lightning Strike' },
  },
  QUARTER_KING: {
    id: 'quarter_king',
    name: 'Quarter King',
    description: 'Triple your money in 1 quarter',
    icon: '👑',
    condition: { type: 'double_in_time', timeframe: 'quarter', multiplier: 3 },
    reward: { title: 'Quarter King' },
  },
  // 里程碑类
  MILLIONAIRE: {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Reach $1,000,000 in account value',
    icon: '💰',
    condition: { type: 'balance_milestone', amount: 1000000 },
    reward: { title: 'Millionaire' },
  },
  WHALE: {
    id: 'whale',
    name: 'Whale',
    description: 'Make a single trade worth $5,000,000',
    icon: '🐋',
    condition: { type: 'single_trade_size', amount: 5000000 },
    reward: { title: 'Big Whale' },
  },
  // 技巧类
  PERFECT_TIMING: {
    id: 'perfect_timing',
    name: 'Perfect Timing',
    description: 'Win 10 trades in a row',
    icon: '🎯',
    condition: { type: 'consecutive_wins', count: 10 },
    reward: { title: 'Sniper' },
  },
  COMEBACK_KID: {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Recover from 80% loss to profitable',
    icon: '🚀',
    condition: { type: 'comeback', loss_threshold: 0.8 },
    reward: { title: 'Phoenix' },
  },
  // 杠杆类
  LEVERAGE_MASTER: {
    id: 'leverage_master',
    name: 'Leverage Master',
    description: 'Double money using 100x leverage',
    icon: '⚔️',
    condition: { type: 'leverage_double', leverage: 100, multiplier: 2 },
    reward: { title: 'Risk Master' },
  },
  
  // 新增成就 - 交易量类
  VOLUME_KING: {
    id: 'volume_king',
    name: 'Volume King',
    description: 'Complete 100 trades',
    icon: '📊',
    condition: { type: 'trade_count', count: 100 },
    reward: { title: 'Volume King' },
  },
  
  MARATHON_TRADER: {
    id: 'marathon_trader',
    name: 'Marathon Trader',
    description: 'Complete 500 trades',
    icon: '🏃',
    condition: { type: 'trade_count', count: 500 },
    reward: { title: 'Marathon Trader' },
  },
  
  // 新增成就 - 精准度类
  SHARPSHOOTER: {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Achieve 90% win rate with at least 20 trades',
    icon: '🏹',
    condition: { type: 'win_rate', rate: 0.9, min_trades: 20 },
    reward: { title: 'Sharpshooter' },
  },
  
  MARKSMAN: {
    id: 'marksman',
    name: 'Marksman',
    description: 'Achieve 80% win rate with at least 50 trades',
    icon: '🎯',
    condition: { type: 'win_rate', rate: 0.8, min_trades: 50 },
    reward: { title: 'Marksman' },
  },
  
  // 新增成就 - 财富类
  MULTI_MILLIONAIRE: {
    id: 'multi_millionaire',
    name: 'Multi-Millionaire',
    description: 'Reach $10,000,000 in account value',
    icon: '💎',
    condition: { type: 'balance_milestone', amount: 10000000 },
    reward: { title: 'Multi-Millionaire' },
  },
  
  BILLIONAIRE: {
    id: 'billionaire',
    name: 'Billionaire',
    description: 'Reach $1,000,000,000 in account value',
    icon: '🏦',
    condition: { type: 'balance_milestone', amount: 1000000000 },
    reward: { title: 'Billionaire' },
  },
  
  // 新增成就 - 时间类
  SURVIVOR: {
    id: 'survivor',
    name: 'Survivor',
    description: 'Trade for 1 full year without going bankrupt',
    icon: '🛡️',
    condition: { type: 'survive_time', timeframe: 'year' },
    reward: { title: 'Survivor' },
  },
  
  VETERAN: {
    id: 'veteran',
    name: 'Veteran',
    description: 'Trade for 5 full years',
    icon: '🎖️',
    condition: { type: 'survive_time', timeframe: 'five_years' },
    reward: { title: 'Veteran Trader' },
  },
  
  // 新增成就 - 特殊类
  CONTRARIAN: {
    id: 'contrarian',
    name: 'Contrarian',
    description: 'Profit from 5 major market crashes',
    icon: '🔄',
    condition: { type: 'profit_from_crashes', count: 5 },
    reward: { title: 'Contrarian' },
  },
  
  NEWS_TRADER: {
    id: 'news_trader',
    name: 'News Trader',
    description: 'Profit from 10 news events within 24 hours',
    icon: '📰',
    condition: { type: 'news_trading', count: 10, timeframe: 'day' },
    reward: { title: 'News Hawk' },
  },
}; 