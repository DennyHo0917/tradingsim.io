// newsDisplay.js - 新闻滚动显示组件
import { NEWS_CONFIG } from '../config/newsConfig.js';

export function initNewsDisplay(newsService) {
  const newsBarEl = document.getElementById('news-bar');
  if (!newsBarEl) {
    console.warn('[NewsDisplay] news-bar element not found');
    return;
  }

  // 在 news-bar 内追加新闻滚动容器
  const tickerWrapper = document.createElement('div');
  tickerWrapper.className = 'news-ticker';
  tickerWrapper.innerHTML = `
    <div class="news-content" id="news-content">
      📰 Welcome to Trading Simulator - Stay tuned for market news...
    </div>
  `;
  // 先清理可能已有的新闻容器，避免重复
  const oldTicker = newsBarEl.querySelector('.news-ticker');
  if (oldTicker) oldTicker.remove();
  newsBarEl.appendChild(tickerWrapper);

  const newsContent = document.getElementById('news-content');
  let currentNewsIndex = 0;
  let newsQueue = [];
  let isScrolling = false;

  // 添加CSS样式
  if (!document.getElementById('news-ticker-styles')) {
    const style = document.createElement('style');
    style.id = 'news-ticker-styles';
    style.textContent = `
      /* time-status 显示为 flex，左侧时间，右侧新闻 */
      #game-time {
        font-size: 1.1em;
        color: #00d4ff;
        font-weight: bold;
        white-space: nowrap;
      }

      .news-ticker {
        width: 100%;
        height: 50px;
        overflow: hidden;
        position: relative;
        background: transparent;
        border-radius: 8px;
        padding: 12px 20px;
        border: 1px solid transparent;
      }
      
      .news-content {
        white-space: nowrap;
        font-size: 1.1em;
        color: #fff;
        line-height: 1.4;
        display: flex;
        align-items: center;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        animation: none;
        transform: translateX(100%);
        transition: none;
        font-weight: 500;
      }
      
      .news-content.scrolling {
        animation: scroll-news linear;
      }
      
      .news-content.war {
        color: #ff4444;
      }
      
      .news-content.pandemic {
        color: #ff6b35;
      }
      
      .news-content.technology {
        color: #00d4ff;
      }
      
      .news-content.finance {
        color: #ffd700;
      }
      
      .news-content.politics {
        color: #ff69b4;
      }
      
      .news-content.policy {
        color: #90ee90;
      }
      
      .news-content.culture {
        color: #dda0dd;
      }
      
      .news-content.natural {
        color: #ff8c00;
      }
      
      @keyframes scroll-news {
        0% {
          transform: translateX(100%);
        }
        100% {
          transform: translateX(-100%);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 计算滚动动画持续时间 - 固定为10秒
  function calculateScrollDuration(text) {
    return 10; // 固定10秒滚动时间
  }

  // 显示新闻
  function displayNews(newsText, newsType = 'default') {
    if (isScrolling) {
      newsQueue.push({ text: newsText, type: newsType });
      return;
    }

    isScrolling = true;
    
    // 重置动画
    newsContent.style.animation = 'none';
    newsContent.style.transform = 'translateX(100%)';
    
    // 设置内容和样式
    newsContent.textContent = newsText;
    newsContent.className = `news-content ${newsType.toLowerCase()}`;
    
    // 强制重排以确保样式应用
    newsContent.offsetHeight;
    
    // 开始滚动动画
    const duration = calculateScrollDuration(newsText);
    newsContent.style.animation = `scroll-news ${duration}s linear`;
    newsContent.classList.add('scrolling');

    // 动画结束后显示下一条新闻
    setTimeout(() => {
      isScrolling = false;
      newsContent.classList.remove('scrolling');
      newsContent.style.animation = 'none';
      
      if (newsQueue.length > 0) {
        const nextNews = newsQueue.shift();
        displayNews(nextNews.text, nextNews.type);
      } else {
        // 显示默认消息
        showDefaultMessage();
      }
    }, duration * 1000);
  }

  // 显示默认消息
  function showDefaultMessage() {
    // 不再循环显示历史新闻，只显示静态消息
    newsContent.textContent = '📰 Market is stable - No major news at this time';
    newsContent.className = 'news-content';
    newsContent.classList.remove('scrolling');
    newsContent.style.animation = 'none';
    newsContent.style.transform = 'translateX(0)';
  }

  // 监听新闻事件
  window.addEventListener('newsTriggered', (e) => {
    const news = e.detail;
    const impactText = news.impact.percentage !== 0 
      ? ` (Market Impact: ${(news.impact.percentage * 100).toFixed(1)}%)`
      : '';
    
    displayNews(`🚨 BREAKING: ${news.text}${impactText}`, news.type);
  });

  // 初始显示
  showDefaultMessage();

  // 移除定期轮换，新闻只滚动一次

  return {
    displayNews,
    addToQueue: (text, type) => {
      newsQueue.push({ text, type });
    }
  };
} 