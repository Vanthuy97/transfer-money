import React, { useState, FormEvent, ChangeEvent } from 'react';
import { ExchangeData } from '../types';
import { dataService } from '../services/dataService';
import './ExchangeModal.css';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exchange: Omit<ExchangeData, 'id'>) => void;
  editingExchange?: ExchangeData | null;
}

const ExchangeModal: React.FC<ExchangeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExchange,
}) => {
  const [formData, setFormData] = useState({
    exchangeAmount: editingExchange?.exchangeAmount?.toString() || '',
    exchangerName: editingExchange?.exchangerName || '',
    phoneNumber: editingExchange?.phoneNumber || '',
    socialLink: editingExchange?.socialLink || '',
    feePercent: editingExchange?.feePercent?.toString() || '',
    receiveTime: editingExchange?.receiveTime || '',
    address: editingExchange?.address || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hàm chuyển đổi datetime string sang format datetime-local (YYYY-MM-DDTHH:mm)
  const convertToDateTimeLocal = (dateTimeStr: string): string => {
    if (!dateTimeStr) return '';
    try {
      // Thử parse nhiều format khác nhau
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return '';
      
      // Format thành YYYY-MM-DDTHH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Hàm format datetime để hiển thị (từ datetime-local format)
  const formatDateTimeForDisplay = (dateTimeStr: string): string => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return dateTimeStr; // Trả về nguyên bản nếu không parse được
      
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateTimeStr;
    }
  };

  React.useEffect(() => {
    const defaultFeePercent = dataService.getExchangeConfig().feePercent || 5;
    
    if (editingExchange) {
      setFormData({
        exchangeAmount: editingExchange.exchangeAmount?.toString() || '',
        exchangerName: editingExchange.exchangerName || '',
        phoneNumber: editingExchange.phoneNumber || '',
        socialLink: editingExchange.socialLink || '',
        feePercent: editingExchange.feePercent?.toString() || defaultFeePercent.toString(),
        receiveTime: convertToDateTimeLocal(editingExchange.receiveTime || ''),
        address: editingExchange.address || '',
      });
    } else {
      setFormData({
        exchangeAmount: '',
        exchangerName: '',
        phoneNumber: '',
        socialLink: '',
        feePercent: defaultFeePercent.toString(),
        receiveTime: '',
        address: '',
      });
    }
    setErrors({});
  }, [editingExchange, isOpen]);

  const formatCurrency = (value: string): string => {
    if (!value || value === '') return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return '';
    return numValue.toLocaleString('vi-VN') + '₫';
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa lỗi khi người dùng nhập
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.exchangeAmount || parseFloat(formData.exchangeAmount) <= 0) {
      newErrors.exchangeAmount = 'Vui lòng nhập số tiền đổi hợp lệ';
    }

    if (!formData.exchangerName.trim()) {
      newErrors.exchangerName = 'Vui lòng nhập tên người đổi';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (!formData.feePercent || parseFloat(formData.feePercent) < 0) {
      newErrors.feePercent = 'Vui lòng nhập phí đổi hợp lệ';
    }

    if (!formData.receiveTime.trim()) {
      newErrors.receiveTime = 'Vui lòng chọn thời gian muốn nhận';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const exchangeAmount = parseFloat(formData.exchangeAmount);
    const feePercent = parseFloat(formData.feePercent);
    const feeAmount = (exchangeAmount * feePercent) / 100;
    const totalReceived = exchangeAmount - feeAmount;

    const newExchange: Omit<ExchangeData, 'id'> = {
      fromDenomination: 20000, // Giá trị mặc định, có thể cập nhật sau
      fromAmount: exchangeAmount,
      toDenomination: 20000, // Giá trị mặc định, có thể cập nhật sau
      toAmount: totalReceived,
      feePercent,
      feeAmount,
      totalReceived,
      date: new Date().toLocaleDateString('vi-VN'),
      exchangeAmount,
      exchangerName: formData.exchangerName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      socialLink: formData.socialLink.trim() || undefined,
      receiveTime: formatDateTimeForDisplay(formData.receiveTime.trim()),
      address: formData.address.trim(),
      customerName: formData.exchangerName.trim(),
    };

    onSave(newExchange);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingExchange ? 'Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}</h2>
          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="exchangeAmount">
              Số tiền đổi <span className="required">*</span>
            </label>
            <input
              type="number"
              id="exchangeAmount"
              name="exchangeAmount"
              value={formData.exchangeAmount}
              onChange={handleChange}
              placeholder="Nhập số tiền đổi (VNĐ)"
              min="0"
              step="1000"
            />
            {formData.exchangeAmount && formatCurrency(formData.exchangeAmount) && (
              <span className="formatted-amount">
                {formatCurrency(formData.exchangeAmount)}
              </span>
            )}
            {errors.exchangeAmount && (
              <span className="error-text">{errors.exchangeAmount}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="exchangerName">
              Người đổi <span className="required">*</span>
            </label>
            <input
              type="text"
              id="exchangerName"
              name="exchangerName"
              value={formData.exchangerName}
              onChange={handleChange}
              placeholder="Nhập tên người đổi"
            />
            {errors.exchangerName && (
              <span className="error-text">{errors.exchangerName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">
              Số điện thoại <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
            {errors.phoneNumber && (
              <span className="error-text">{errors.phoneNumber}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="socialLink">Link Facebook hoặc mạng xã hội</label>
            <input
              type="url"
              id="socialLink"
              name="socialLink"
              value={formData.socialLink}
              onChange={handleChange}
              placeholder="Nhập link Facebook hoặc mạng xã hội"
            />
          </div>

          <div className="form-group">
            <label htmlFor="feePercent">
              Phí đổi (%) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="feePercent"
              name="feePercent"
              value={formData.feePercent}
              onChange={handleChange}
              placeholder="Nhập phí đổi (%)"
              min="0"
              max="100"
              step="0.1"
            />
            {errors.feePercent && (
              <span className="error-text">{errors.feePercent}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="receiveTime">
              Thời gian muốn nhận <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="receiveTime"
              name="receiveTime"
              value={formData.receiveTime}
              onChange={handleChange}
            />
            {errors.receiveTime && (
              <span className="error-text">{errors.receiveTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="address">
              Địa chỉ <span className="required">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              rows={3}
            />
            {errors.address && (
              <span className="error-text">{errors.address}</span>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="submit-button">
              {editingExchange ? 'Cập Nhật' : 'Thêm Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExchangeModal;

