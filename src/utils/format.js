// 通用格式化函数
// 迁移自 index-simple.html

export function formatCurrency(value, decimals = null) {
  // 自动选择合适的小数位数
  if (decimals === null) {
    if (value < 1) {
      decimals = 3;
    } else if (value < 100) {
      decimals = 2;
    } else {
      decimals = 1;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
} 