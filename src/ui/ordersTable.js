// ordersTable.js - 渲染挂单列表
import { formatCurrency } from '../utils/format.js';

export function initOrdersTable(accountService, tradingEngine) {
  const tbody = document.getElementById('orders-tbody');
  const noOrderDiv = document.getElementById('no-orders');

  function render() {
    if (!tbody) return;
    const orders = accountService.getAccountInfo().orders;
    tbody.innerHTML = '';

    if (orders.length === 0) {
      if (noOrderDiv) noOrderDiv.style.display = 'block';
      return;
    }
    if (noOrderDiv) noOrderDiv.style.display = 'none';

    orders.forEach((o) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.orderType.toUpperCase()}</td>
        <td>${o.side.toUpperCase()}</td>
        <td>--</td>
        <td>${formatCurrency(o.price)}</td>
        <td>${formatCurrency(window.tradingServices.marketService.currentPrice)}</td>
        <td>OPEN</td>
        <td><button data-oid="${o.id}" class="close-btn">Cancel</button></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.close-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-oid'));
        accountService.cancelOrder(id);
        window.dispatchEvent(new Event('ordersUpdate'));
      });
    });
  }

  render();
  window.addEventListener('ordersUpdate', render);
  window.addEventListener('priceUpdate', render);

  return { render };
} 