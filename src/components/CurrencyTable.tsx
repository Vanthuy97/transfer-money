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
              <th>Khách hàng</th>
              <th>Tiền gửi</th>
              <th>Tiền nhận</th>
              <th>Phí đổi</th>
              <th>Số tiền nhận</th>
              <th>Ngày</th>
              {(onEdit || onDelete) && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const formatDenomination = (value: number): string => {
                if (value === 20000) return '20k';
                if (value === 50000) return '50k';
                if (value === 100000) return '100k';
                return `${(value / 1000).toFixed(0)}k`;
              };

              return (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.customerName || '-'}</td>
                  <td>
                    {item.fromAmount.toLocaleString('vi-VN')} VNĐ
                    <br />
                    <small>({formatDenomination(item.fromDenomination)})</small>
                  </td>
                  <td>
                    <small>({formatDenomination(item.toDenomination)})</small>
                  </td>
                  <td>
                    {item.feePercent}%<br />
                    <small>({item.feeAmount.toLocaleString('vi-VN')} VNĐ)</small>
                  </td>
                  <td>
                    <strong>{item.toAmount.toLocaleString('vi-VN')} VNĐ</strong>
                    <br />
                    <small>
                      ({Math.floor(item.totalReceived / item.toDenomination)} tờ{' '}
                      {formatDenomination(item.toDenomination)})
                    </small>
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

