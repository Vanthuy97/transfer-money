import React, { useState } from 'react';
import { ExchangeData } from '../../types';
import ExchangeDetailModal from '../ExchangeDetailModal/ExchangeDetailModal';
import './CurrencyTable.css';

interface CurrencyTableProps {
  data: ExchangeData[];
  onEdit?: (exchange: ExchangeData) => void;
  onDelete?: (id: string) => void;
}

const CurrencyTable: React.FC<CurrencyTableProps> = ({ data, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExchange, setSelectedExchange] = useState<ExchangeData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const itemsPerPage = 10;

  if (!data || data.length === 0) {
    return (
      <div className="currency-table-container">
        <div className="no-data">Chưa có dữ liệu giao dịch</div>
      </div>
    );
  }

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

  const handleDelete = (id: string): void => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      onDelete?.(id);
    }
  };

  const handleViewDetail = (exchange: ExchangeData): void => {
    setSelectedExchange(exchange);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = (): void => {
    setIsDetailModalOpen(false);
    setSelectedExchange(null);
  };

  // Tính toán phân trang
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="currency-table-container">
        <div className="table-wrapper">
          <table className="currency-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Số tiền đổi</th>
                <th>Loại tiền</th>
                <th>Người đổi</th>
                <th>Link mạng xã hội</th>
                <th>Trạng thái</th>
                <th>Người tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => {
                return (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      <strong>
                        {item.exchangeAmount
                          ? item.exchangeAmount.toLocaleString('vi-VN') + ' VNĐ'
                          : item.fromAmount
                          ? item.fromAmount.toLocaleString('vi-VN') + ' VNĐ'
                          : '-'}
                      </strong>
                    </td>
                    <td>
                      {formatDenomination(item.denomination)}
                    </td>
                    <td>{item.exchangerName || item.customerName || '-'}</td>
                    <td>
                      {item.socialLink ? (
                        <a
                          href={item.socialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                        >
                          Xem link
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(item.status)}`}>
                        {item.status || 'Chưa Nhận Tiền'}
                      </span>
                    </td>
                    <td>{item.createdBy || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="detail-button"
                          onClick={() => handleViewDetail(item)}
                          title="Chi tiết"
                        >
                          👁️
                        </button>
                        {onEdit && (
                          <button
                            className="edit-button"
                            onClick={() => onEdit(item)}
                            title="Sửa"
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(item.id)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Trước
            </button>
            <div className="pagination-info">
              Trang {currentPage} / {totalPages}
            </div>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      <ExchangeDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        exchange={selectedExchange}
      />
    </>
  );
};

export default CurrencyTable;

