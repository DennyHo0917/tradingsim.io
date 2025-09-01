// Trading Simulator - 时间系统配置
// 对应 index-simple.html 中的 TIME_CONFIG
export const TIME_CONFIG = {
  GAME_START_YEAR: 1990,
  REAL_YEAR_DURATION_MS: 30 * 60 * 1000, // 30分钟 = 1游戏年
  REAL_DAY_DURATION_MS: (30 * 60 * 1000) / 365, // 约4.93秒 = 1游戏天
}; 