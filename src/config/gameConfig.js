// Trading Simulator - 游戏级通用配置
// 与 index-simple.html 中的 GAME_CONFIG 对应
// TODO: 后续在 main.js 中统一引用并删除旧全局常量

export const GAME_CONFIG = {
  INITIAL_BALANCE: 10000,
  BASE_CURRENCY: 'USD',
  DEFAULT_SYMBOL: 'CRYPTOUSD',
  MAX_LEVERAGE: 100,
  MIN_TRADE_SIZE: 0.01,
  MAX_TRADE_SIZE: 100,
}; 