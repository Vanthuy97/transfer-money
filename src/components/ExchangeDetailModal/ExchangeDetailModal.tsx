import React from 'react';
import { ExchangeData } from '../../types';
import './ExchangeDetailModal.css';

interface ExchangeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: ExchangeData | null;
}

const ExchangeDetailModal: React.FC<ExchangeDetailModalProps> = ({
  isOpen,
  onClose,
  exchange,
}) => {
  if (!isOpen || !exchange) return null;

  const formatDenomination = (value?: number): string => {
    if (!value) return '-';
    if (value === 20000) return '20k';
    if (value === 50000) return '50k';
    if (value === 100000) return '100k';
    return `${(value / 1000).toFixed(0)}k`;
  };

  const getStatusClass = (status?: string): string => {
    switch (status) {
      case 'Chưa Nhận Tiền':
        return 'status-not-received';
      case 'Chờ Giao':
        return 'status-pending';
      case 'Đã Nhận Tiền':
        return 'status-received';
      case 'Hoàn Thành':
        return 'status-completed';
      default:
        return 'status-not-received';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="detail-modal-header">
          <h2>Chi Tiết Giao Dịch</h2>
          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="detail-modal-body">
          <div className="detail-section">
            <h3>Thông Tin Giao Dịch</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Số tiền đổi:</span>
                <span className="detail-value">
                  {exchange.exchangeAmount
                    ? exchange.exchangeAmount.toLocaleString('vi-VN') + ' VNĐ'
                    : exchange.fromAmount
                    ? exchange.fromAmount.toLocaleString('vi-VN') + ' VNĐ'
                    : '-'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Mệnh giá:</span>
                <span className="detail-value">
                  {formatDenomination(exchange.denomination)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phí đổi:</span>
                <span className="detail-value">
                  {exchange.feePercent}% ({exchange.feeAmount.toLocaleString('vi-VN')} VNĐ)
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Số tiền nhận:</span>
                <span className="detail-value">
                  {exchange.toAmount.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Trạng thái:</span>
                <span className={`status-badge ${getStatusClass(exchange.status)}`}>
                  {exchange.status || 'Chưa Nhận Tiền'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Người tạo:</span>
                <span className="detail-value">{exchange.createdBy || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ngày tạo:</span>
                <span className="detail-value">{exchange.date || '-'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Thông Tin Khách Hàng</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Tên người đổi:</span>
                <span className="detail-value">
                  {exchange.exchangerName || exchange.customerName || '-'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Số điện thoại:</span>
                <span className="detail-value">{exchange.phoneNumber || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Link mạng xã hội:</span>
                <span className="detail-value">
                  {exchange.socialLink ? (
                    <a
                      href={exchange.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      {exchange.socialLink}
                    </a>
                  ) : (
                    '-'
                  )}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Thời gian muốn nhận:</span>
                <span className="detail-value">{exchange.receiveTime || '-'}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Địa chỉ:</span>
                <span className="detail-value">{exchange.address || '-'}</span>
              </div>
              {exchange.note && (
                <div className="detail-item full-width">
                  <span className="detail-label">Ghi chú:</span>
                  <span className="detail-value">{exchange.note}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="detail-modal-footer">
          <button className="close-button" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeDetailModal;

