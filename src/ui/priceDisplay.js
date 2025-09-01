// priceDisplay.js - 更新顶部价格及买/卖按钮价格
import { formatCurrency } from '../utils/format.js';

export function refreshPriceDisplay(detail) {
  const { currentPrice, previousPrice } = detail;
  const currentPriceEl = document.getElementById('current-price');
  const priceChangeEl = document.getElementById('price-change');
  const buyPriceEl = document.getElementById('buy-price');
  const sellPriceEl = document.getElementById('sell-price');

  if (!currentPriceEl) return;

  currentPriceEl.textContent = formatCurrency(currentPrice);

  const diff = currentPrice - previousPrice;
  const percent = previousPrice ? (diff / previousPrice) * 100 : 0;
  const sign = diff > 0 ? '+' : '';

  if (priceChangeEl) {
    priceChangeEl.textContent = `${sign}${formatCurrency(diff)} (${sign}${percent.toFixed(2)}%)`;
    priceChangeEl.className = diff > 0 ? 'price-positive' : diff < 0 ? 'price-negative' : 'price-neutral';
  }

  if (buyPriceEl) buyPriceEl.textContent = formatCurrency(currentPrice);
  if (sellPriceEl) sellPriceEl.textContent = formatCurrency(currentPrice);
} 