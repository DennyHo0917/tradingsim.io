// modal.js - 通用弹窗封装，兼容旧 showGameModal

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