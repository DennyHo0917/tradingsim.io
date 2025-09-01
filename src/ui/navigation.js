// navigation.js - 控制顶部导航与页面切换
export function initNavigation() {
  // 只选择有 data-view 属性的导航按钮，排除 Help 和 Share 等功能按钮
  const navBtns = document.querySelectorAll('.nav-btn[data-view]');
  const sections = {
    trading: document.querySelector('.trading-section'),
    portfolio: document.querySelector('.positions-section'),
    history: document.querySelector('.history-section'),
    achievements: document.querySelector('.achievements-section'),
  };

  function activate(tab) {
    // 更新按钮
    navBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === tab));
    // 更新 body 类
    document.body.classList.remove('trading-active', 'portfolio-active', 'history-active', 'achievements-active');
    document.body.classList.add(`${tab}-active`);
    // 控制 section 显示
    Object.entries(sections).forEach(([key, el]) => {
      if (!el) return;
      el.style.display = key === tab ? '' : 'none';
    });
  }

  // 初始 tab 设为 trading
  activate('trading');

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.view;
      activate(tab);
    });
  });
} 