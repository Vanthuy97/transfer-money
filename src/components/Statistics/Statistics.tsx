import React from 'react';
import { ExchangeData, Capital } from '../../types';
import './Statistics.css';

interface StatisticsProps {
  exchanges: ExchangeData[];
  capitals: Capital[];
}

const Statistics: React.FC<StatisticsProps> = ({ exchanges, capitals }) => {
  // Tính tổng vốn (tất cả đều VNĐ)
  const totalCapital = capitals.reduce((sum, capital) => sum + capital.amount, 0);

  // Tính tổng tiền giao dịch (chỉ tính tiền gốc, không tính phí)
  const totalExchangesReceived = exchanges.reduce(
    (sum, exchange) => sum + exchange.fromAmount,
    0
  );
  const totalExchangesPaid = exchanges.reduce(
    (sum, exchange) => sum + exchange.toAmount,
    0
  );
  const totalFees = exchanges.reduce((sum, exchange) => sum + exchange.feeAmount, 0);

  // Tính tổng tiền còn lại: tổng vốn - tổng tiền đã trả cho khách
  // (Số tiền nhận từ khách đã được tính vào vốn khi giao dịch, nên chỉ cần trừ số tiền đã trả)
  const remainingCapital = totalCapital - totalExchangesPaid;

  // Tính theo mệnh giá
  const calculateByDenomination = () => {
    const byDenom: Record<number, { received: number; paid: number }> = {};
    exchanges.forEach((exchange) => {
      if (!exchange.denomination) return;
      if (!byDenom[exchange.denomination]) {
        byDenom[exchange.denomination] = { received: 0, paid: 0 };
      }
      byDenom[exchange.denomination].received += exchange.fromAmount;
      byDenom[exchange.denomination].paid += exchange.toAmount;
    });
    return byDenom;
  };

  const byDenomination = calculateByDenomination();
  const formatDenomination = (value: number): string => {
    if (value === 20000) return '20k';
    if (value === 50000) return '50k';
    if (value === 100000) return '100k';
    return `${(value / 1000).toFixed(0)}k`;
  };

  return (
    <div className="statistics-container">
      <h2>Tổng Hợp Thông Tin</h2>
      <div className="statistics-grid">
        <div className="stat-section">
          <h3>📊 Tổng Vốn</h3>
          <div className="currency-list">
            <div className="currency-item highlight">
              <span className="currency-label">Tổng vốn:</span>
              <span className="currency-value">
                {totalCapital.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            <div className="currency-item highlight">
              <span className="currency-label">Tổng tiền còn lại:</span>
              <span className="currency-value">
                {remainingCapital.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          </div>
        </div>

        <div className="stat-section">
          <h3>💰 Tổng Tiền Giao Dịch</h3>
          <div className="currency-list">
            <div className="currency-item">
              <span className="currency-label">Tổng đã đổi:</span>
              <span className="currency-value">
                {exchanges.length} giao dịch
              </span>
            </div>
            <div className="currency-item">
              <span className="currency-label">Tổng tiền nhận (đã gồm phí):</span>
              <span className="currency-value">
                {totalExchangesReceived.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            <div className="currency-item highlight">
              <span className="currency-label">Tổng phí lời:</span>
              <span className="currency-value">
                {totalFees.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            {Object.keys(byDenomination).length > 0 && (
              <div className="sub-list">
                <div className="sub-title">Theo mệnh giá:</div>
                {Object.entries(byDenomination).map(([denom, totals]) => (
                  <div key={denom} className="currency-item sub-item">
                    <span className="currency-label">
                      {formatDenomination(Number(denom))}: Nhận{' '}
                      {totals.received.toLocaleString('vi-VN')} VNĐ - Trả{' '}
                      {totals.paid.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

