import React from 'react';
import { ExchangeData } from '../types';
import './CurrencyTable.css';

interface CurrencyTableProps {
  data: ExchangeData[];
  onEdit?: (exchange: ExchangeData) => void;
  onDelete?: (id: string) => void;
}

const CurrencyTable: React.FC<CurrencyTableProps> = ({ data, onEdit, onDelete }) => {
  if (!data || data.length === 0) {
    return (
      <div className="currency-table-container">
        <div className="no-data">Chưa có dữ liệu giao dịch</div>
      </div>
    );
  }

  const handleDelete = (id: string): void => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      onDelete?.(id);
    }
  };

  return (
    <div className="currency-table-container">
      <div className="table-wrapper">
        <table className="currency-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Số tiền đổi</th>
              <th>Người đổi</th>
              <th>Số điện thoại</th>
              <th>Link mạng xã hội</th>
              <th>Phí đổi</th>
              <th>Thời gian nhận</th>
              <th>Địa chỉ</th>
              <th>Ngày tạo</th>
              {(onEdit || onDelete) && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              return (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>
                      {item.exchangeAmount
                        ? item.exchangeAmount.toLocaleString('vi-VN') + ' VNĐ'
                        : item.fromAmount
                        ? item.fromAmount.toLocaleString('vi-VN') + ' VNĐ'
                        : '-'}
                    </strong>
                  </td>
                  <td>{item.exchangerName || item.customerName || '-'}</td>
                  <td>{item.phoneNumber || '-'}</td>
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
                    {item.feePercent}%<br />
                    <small>
                      {item.feeAmount
                        ? item.feeAmount.toLocaleString('vi-VN') + ' VNĐ'
                        : ''}
                    </small>
                  </td>
                  <td>{item.receiveTime || '-'}</td>
                  <td className="address-cell">
                    {item.address || '-'}
                  </td>
                  <td>{item.date || '-'}</td>
                  {(onEdit || onDelete) && (
                    <td>
                      <div className="action-buttons">
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
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrencyTable;

