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
        <h2>Danh Sách Giao Dịch Đổi Tiền</h2>
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
      <h2>Danh Sách Giao Dịch Đổi Tiền</h2>
      <div className="table-wrapper">
        <table className="currency-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Loại tiền gửi</th>
              <th>Số tiền gửi</th>
              <th>Loại tiền nhận</th>
              <th>Tỷ giá</th>
              <th>Số tiền nhận</th>
              <th>Ngày giao dịch</th>
              {(onEdit || onDelete) && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.fromCurrency}</td>
                <td>{item.fromAmount?.toLocaleString('vi-VN') || 0}</td>
                <td>{item.toCurrency}</td>
                <td>{item.exchangeRate || '-'}</td>
                <td>{item.toAmount?.toLocaleString('vi-VN') || 0}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrencyTable;

