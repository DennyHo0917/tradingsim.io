// Audio Manager - 游戏音效管理系统
// 统一管理所有游戏音效

export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.soundEnabled = true;
    this.masterVolume = 0.3; // 主音量 (0-1)
    this.init();
  }

  init() {
    // 初始化音频上下文（需要用户交互后才能启用）
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          console.log('[Audio] Audio context initialized');
        } catch (error) {
          console.warn('[Audio] Failed to initialize audio context:', error);
        }
      }
    }, { once: true });
  }

  // 播放成就解锁音效
  playAchievementSound() {
    if (!this.canPlaySound()) return;

    try {
      // 创建庆祝音效（上升音阶）
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 设置音效参数 - 欢快的上升音阶
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
      oscillator.frequency.setValueAtTime(1046.50, this.audioContext.currentTime + 0.3); // C6
      
      // 音量包络
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.8);
      
      // 添加额外的"叮"声效果
      setTimeout(() => this.playBellSound(), 200);
      
    } catch (error) {
      console.warn('[Audio] Achievement sound playback failed:', error);
    }
  }

  // 播放爆仓音效
  playLiquidationSound() {
    if (!this.canPlaySound()) return;

    try {
      // 创建爆仓音效（下降音阶 + 警告音）
      this.playLiquidationWarning();
      
      // 延迟播放下降音阶
      setTimeout(() => {
        this.playLiquidationDrop();
      }, 300);
      
    } catch (error) {
      console.warn('[Audio] Liquidation sound playback failed:', error);
    }
  }

  // 播放爆仓警告音
  playLiquidationWarning() {
    if (!this.audioContext) return;

    try {
      // 创建警告音效 - 快速的高频警报
      for (let i = 0; i < 3; i++) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square'; // 方波产生更刺耳的警告音
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime + i * 0.15); // A5
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + i * 0.15);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.6, this.audioContext.currentTime + i * 0.15 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.15 + 0.1);
        
        oscillator.start(this.audioContext.currentTime + i * 0.15);
        oscillator.stop(this.audioContext.currentTime + i * 0.15 + 0.1);
      }
    } catch (error) {
      console.warn('[Audio] Liquidation warning sound failed:', error);
    }
  }

  // 播放爆仓下降音效
  playLiquidationDrop() {
    if (!this.audioContext) return;

    try {
      // 创建下降音阶 - 表示失败/损失
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'sawtooth'; // 锯齿波产生更严厉的音色
      
      // 下降音阶：C5 -> G4 -> E4 -> C4
      oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
      oscillator.frequency.linearRampToValueAtTime(392.00, this.audioContext.currentTime + 0.2); // G4
      oscillator.frequency.linearRampToValueAtTime(329.63, this.audioContext.currentTime + 0.4); // E4
      oscillator.frequency.linearRampToValueAtTime(261.63, this.audioContext.currentTime + 0.6); // C4
      
      // 音量包络 - 逐渐减弱
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.8, this.audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.8);
      
    } catch (error) {
      console.warn('[Audio] Liquidation drop sound failed:', error);
    }
  }

  // 播放交易完成音效
  playTradeSound(isProfit = true) {
    if (!this.canPlaySound()) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'sine';
      
      if (isProfit) {
        // 盈利 - 上升音调
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
        oscillator.frequency.linearRampToValueAtTime(554.37, this.audioContext.currentTime + 0.1); // C#5
      } else {
        // 亏损 - 下降音调
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
        oscillator.frequency.linearRampToValueAtTime(349.23, this.audioContext.currentTime + 0.1); // F4
      }
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
      
    } catch (error) {
      console.warn('[Audio] Trade sound playback failed:', error);
    }
  }

  // 播放铃声效果（成就音效的补充）
  playBellSound() {
    if (!this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1318.51, this.audioContext.currentTime); // E6
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.5, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('[Audio] Bell sound failed:', error);
    }
  }

  // 检查是否可以播放音效
  canPlaySound() {
    return this.soundEnabled && this.audioContext && this.audioContext.state === 'running';
  }

  // 切换音效开关
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    console.log('[Audio] Sound', this.soundEnabled ? 'enabled' : 'disabled');
    return this.soundEnabled;
  }

  // 设置主音量
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    console.log('[Audio] Volume set to', (this.masterVolume * 100).toFixed(0) + '%');
  }

  // 获取音效状态
  getStatus() {
    return {
      enabled: this.soundEnabled,
      volume: this.masterVolume,
      contextState: this.audioContext?.state || 'not-initialized'
    };
  }
}

// 创建全局实例
export const audioManager = new AudioManager();
