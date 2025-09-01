// modal.js - 通用弹窗封装，兼容旧 showGameModal

// 欢迎弹窗版本常量
const WELCOME_VERSION = 'v1.0';

// 显示欢迎弹窗
export function showWelcomeModal() {
  const welcomeMessage = `
    <div style="text-align: center; line-height: 1.6; max-width: 500px; margin: 0 auto;">
      <div style="font-size: 2.5em; margin-bottom: 20px;">🎯</div>
      <h2 style="color: #00d4ff; margin-bottom: 20px; font-size: 1.4em;">Welcome to Trading Simulator!</h2>
      
      <div style="text-align: left; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p style="margin-bottom: 15px;"><strong>🎮 What is this?</strong><br/>
        A realistic financial trading game where you can practice trading without real money risk.</p>
        
        <p style="margin-bottom: 15px;"><strong>📈 How it works:</strong><br/>
        • K-line charts are randomly generated<br/>
        • Dynamic news events affect price movements<br/>
        • Use leverage to amplify your trades (up to 100x!)</p>
        
        <p style="margin-bottom: 15px;"><strong>🎯 Your Goal:</strong><br/>
        Start with $10,000 and try to get rich... or go bust trying!</p>
        
        <p style="color: #ffd700;"><strong>⚡ Ready to make your fortune?</strong></p>
      </div>
      
      <p style="font-size: 0.9em; color: #aaa; margin-top: 20px;">
        <em>This is a simulation for educational purposes only. No real money is involved.</em>
      </p>
    </div>
  `;
  
  showModal('🚀 Trading Simulator', welcomeMessage, 'welcome', () => {
    // 标记用户已看过当前版本的欢迎信息
    const welcomeKey = `tradingSim_welcomeSeen_${WELCOME_VERSION}`;
    localStorage.setItem(welcomeKey, 'true');
  });
}

// 检查是否需要显示欢迎弹窗
export function checkAndShowWelcome() {
  const welcomeKey = `tradingSim_welcomeSeen_${WELCOME_VERSION}`;
  const hasSeenWelcome = localStorage.getItem(welcomeKey);
  
  if (!hasSeenWelcome) {
    // 延迟一点显示，让页面完全加载
    setTimeout(() => {
      showWelcomeModal();
    }, 500);
  }
}

// 调试函数：重置欢迎状态（可在控制台调用）
export function resetWelcomeStatus() {
  // 清除旧版本的key
  localStorage.removeItem('tradingSim_welcomeSeen');
  // 清除当前版本的key
  const welcomeKey = `tradingSim_welcomeSeen_${WELCOME_VERSION}`;
  localStorage.removeItem(welcomeKey);
  console.log('[Welcome] Welcome status reset, refresh page to see welcome modal');
}

export function showModal(title, message, type = 'info', onConfirm = null, onCancel = null) {
  const modal = document.getElementById('game-modal');
  if (!modal) return;
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const confirmBtn = document.getElementById('modal-confirm');
  const cancelBtn = document.getElementById('modal-cancel');

  // 填充内容
  modalTitle.textContent = title;
  modalMessage.innerHTML = message;

  // 类型样式
  modal.className = 'game-modal';
  if (type === 'liquidation') modal.classList.add('liquidation-modal');
  if (type === 'welcome') modal.classList.add('welcome-modal');

  // 按钮
  if (onCancel) {
    cancelBtn.style.display = 'inline-block';
    cancelBtn.onclick = () => {
      onCancel();
      closeModal();
    };
  } else {
    cancelBtn.style.display = 'none';
  }
  confirmBtn.onclick = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  modal.style.display = 'flex';
  setTimeout(() => confirmBtn.focus(), 50);
}

export function closeModal() {
  const modal = document.getElementById('game-modal');
  if (modal) modal.style.display = 'none';
}

export function initModal() {
  const modal = document.getElementById('game-modal');
  if (!modal) return;
  const overlay = modal.querySelector('.modal-overlay');
  if (overlay) overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });
}

// 兼容旧调用名
window.showGameModal = showModal;
window.closeGameModal = closeModal; 