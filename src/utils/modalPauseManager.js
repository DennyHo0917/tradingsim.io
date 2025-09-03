// Modal Pause Manager - 弹窗暂停管理器
// 统一管理弹窗显示时的游戏暂停/恢复

class ModalPauseManager {
  constructor() {
    this.previousGameSpeed = null;
    this.isPausedByModal = false;
  }

  // 暂停游戏（弹窗显示时调用）
  pauseGame(reason = 'modal') {
    const timeService = window.tradingServices?.timeService;
    if (timeService && !timeService.isPaused && !this.isPausedByModal) {
      // 保存当前速度
      this.previousGameSpeed = timeService.currentSpeed;
      // 暂停游戏
      timeService.setSpeed(0);
      this.isPausedByModal = true;
      console.log(`[ModalPause] Game paused for ${reason}, previous speed: ${this.previousGameSpeed}x`);
    }
  }

  // 恢复游戏（弹窗关闭时调用）
  resumeGame(reason = 'modal') {
    const timeService = window.tradingServices?.timeService;
    if (timeService && this.isPausedByModal && this.previousGameSpeed !== null) {
      // 恢复之前的速度
      timeService.setSpeed(this.previousGameSpeed);
      this.isPausedByModal = false;
      console.log(`[ModalPause] Game resumed after ${reason}, restored speed: ${this.previousGameSpeed}x`);
      this.previousGameSpeed = null;
    }
  }

  // 检查是否被弹窗暂停
  isPaused() {
    return this.isPausedByModal;
  }

  // 重置状态（用于调试）
  reset() {
    this.previousGameSpeed = null;
    this.isPausedByModal = false;
    console.log('[ModalPause] State reset');
  }
}

// 创建全局实例
export const modalPauseManager = new ModalPauseManager();

// 添加到全局对象供调试使用
if (typeof window !== 'undefined') {
  window.modalPauseManager = modalPauseManager;
}
