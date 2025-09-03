// Achievement Celebration System - 成就庆祝系统
// 包含烟花特效、音效和弹窗
import { audioManager } from '../utils/audioManager.js';

export class AchievementCelebration {
  constructor() {
    // 音效由统一的audioManager管理
  }

  // 主要庆祝函数
  celebrate(achievement) {
    console.log('[Achievement] 🎉 Celebrating achievement:', achievement.name);
    
    // 1. 显示成就弹窗
    this.showAchievementModal(achievement);
    
    // 2. 播放音效
    audioManager.playAchievementSound();
    
    // 3. 烟花特效
    this.launchFireworks();
    
    // 4. 屏幕闪光效果
    this.screenFlash();
    
    // 5. 页面震动效果（如果支持）
    this.vibrate();
  }

  // 显示成就解锁弹窗
  showAchievementModal(achievement) {
    // 注意：游戏暂停由modal.js统一处理
    const modalHtml = `
      <div class="achievement-celebration-content">
        <div class="achievement-unlock-header">
          <div class="achievement-unlock-icon">${achievement.icon}</div>
          <div class="achievement-unlock-glow"></div>
        </div>
        
        <div class="achievement-unlock-info">
          <h2 class="achievement-unlock-title">🏆 Achievement Unlocked!</h2>
          <h3 class="achievement-name">${achievement.name}</h3>
          <p class="achievement-description">${achievement.description}</p>
          
          ${achievement.reward?.title ? `
            <div class="achievement-reward">
              <span class="reward-label">New Title:</span>
              <span class="reward-title">${achievement.reward.title}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="achievement-celebration-footer">
          <p class="celebration-text">🎉 Congratulations! Keep up the great work! 🎉</p>
        </div>
      </div>
    `;

    if (window.showGameModal) {
      window.showGameModal(
        '🎆 Achievement Unlocked!',
        modalHtml,
        'achievement-celebration',
        () => {
          // 确认按钮回调 - 游戏恢复由modal.js统一处理
          console.log('[Achievement] Modal closed');
        }
      );
      
      // 设置按钮文本
      setTimeout(() => {
        const confirmBtn = document.getElementById('modal-confirm');
        if (confirmBtn) confirmBtn.textContent = '🎉 Awesome!';
      }, 50);
    }
  }



  // 烟花特效
  launchFireworks() {
    // 创建烟花容器
    const fireworksContainer = document.createElement('div');
    fireworksContainer.className = 'fireworks-container';
    document.body.appendChild(fireworksContainer);

    // 创建多个烟花
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createFirework(fireworksContainer);
      }, i * 200);
    }

    // 5秒后移除容器
    setTimeout(() => {
      if (fireworksContainer.parentNode) {
        fireworksContainer.parentNode.removeChild(fireworksContainer);
      }
    }, 5000);
  }

  // 创建单个烟花
  createFirework(container) {
    const firework = document.createElement('div');
    firework.className = 'firework';
    
    // 随机位置
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * (window.innerHeight * 0.6) + (window.innerHeight * 0.2);
    
    firework.style.left = x + 'px';
    firework.style.top = y + 'px';
    
    container.appendChild(firework);
    
    // 创建粒子
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework-particle';
      
      const angle = (i / 12) * Math.PI * 2;
      const velocity = 100 + Math.random() * 50;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;
      
      particle.style.setProperty('--dx', dx + 'px');
      particle.style.setProperty('--dy', dy + 'px');
      particle.style.backgroundColor = this.getRandomColor();
      
      firework.appendChild(particle);
    }
    
    // 2秒后移除烟花
    setTimeout(() => {
      if (firework.parentNode) {
        firework.parentNode.removeChild(firework);
      }
    }, 2000);
  }

  // 屏幕闪光效果
  screenFlash() {
    const flash = document.createElement('div');
    flash.className = 'achievement-screen-flash';
    document.body.appendChild(flash);
    
    setTimeout(() => {
      flash.classList.add('flash-active');
    }, 10);
    
    setTimeout(() => {
      if (flash.parentNode) {
        flash.parentNode.removeChild(flash);
      }
    }, 500);
  }

  // 震动效果
  vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }

  // 获取随机颜色
  getRandomColor() {
    const colors = [
      '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', 
      '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 切换音效开关（委托给audioManager）
  toggleSound() {
    return audioManager.toggleSound();
  }
}

// 创建全局实例
export const achievementCelebration = new AchievementCelebration();
