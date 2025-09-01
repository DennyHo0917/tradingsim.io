// TimeService - 负责游戏内时间推进与速度控制
import { TIME_CONFIG } from '../config/timeConfig.js';

export class TimeService {
  constructor() {
    this.gameStartDate = new Date(TIME_CONFIG.GAME_START_YEAR, 0, 1);
    this.accumulatedGameTime = 0; // 累积游戏时间 (ms)
    this.lastUpdateTime = Date.now();
    this.currentSpeed = 1; // 1x 默认
    this.isPaused = false;
    this.tickIntervalId = null;
  }

  start() {
    if (this.tickIntervalId) return;
    this.tickIntervalId = setInterval(() => {
      // 主动触发一次时间计算与事件派发
      const formatted = this.getFormattedTime();
      const event = new CustomEvent('timeUpdate', { detail: formatted });
      window.dispatchEvent(event);
    }, 1000); // 每秒一次即可
  }

  stop() {
    if (this.tickIntervalId) clearInterval(this.tickIntervalId);
    this.tickIntervalId = null;
  }

  setSpeed(speed) {
    // 切换速度前先累积当前时间
    this._updateAccumulatedTime();
    this.currentSpeed = speed;
    this.isPaused = speed === 0;
    this.lastUpdateTime = Date.now();
  }

  _updateAccumulatedTime() {
    if (!this.isPaused && this.currentSpeed > 0) {
      const realElapsed = Date.now() - this.lastUpdateTime;
      const gameElapsed =
        (realElapsed * this.currentSpeed * 365 * 24 * 60 * 60 * 1000) /
        TIME_CONFIG.REAL_YEAR_DURATION_MS;
      this.accumulatedGameTime += gameElapsed;
    }
    this.lastUpdateTime = Date.now();
  }

  getCurrentGameTime() {
    this._updateAccumulatedTime();
    return new Date(this.gameStartDate.getTime() + this.accumulatedGameTime);
  }

  getStatus() {
    return this.isPaused || this.currentSpeed === 0
      ? { status: 'Pausing', speed: '0x' }
      : { status: 'Playing', speed: `${this.currentSpeed}x` };
  }

  getFormattedTime() {
    const t = this.getCurrentGameTime();
    const year = t.getFullYear();
    const month = t.getMonth() + 1;
    const day = t.getDate();
    const quarter = Math.ceil(month / 3);
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthStr = monthNames[month - 1];

    return {
      year,
      quarter: `Q${quarter}`,
      month: monthStr,
      day,
      fullString: `${year} Q${quarter} (${monthStr} ${day})`,
    };
  }
} 