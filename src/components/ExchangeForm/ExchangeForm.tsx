import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { ExchangeData, ExchangeFormData, FormErrors } from '../../types';
import { dataService } from '../../services/dataService';
import './ExchangeForm.css';

interface ExchangeFormProps {
  onAddExchange: (exchange: Omit<ExchangeData, 'id'>) => void;
  onUpdateExchange?: (id: string, exchange: Partial<ExchangeData>) => void;
  editingExchange?: ExchangeData | null;
  onCancelEdit?: () => void;
}

const ExchangeForm: React.FC<ExchangeFormProps> = ({
  onAddExchange,
  onUpdateExchange,
  editingExchange,
  onCancelEdit,
}) => {
  const [config, setConfig] = useState(dataService.getExchangeConfig());
  const [formData, setFormData] = useState<ExchangeFormData>({
    denomination: 20000,
    fromAmount: '',
    feePercent: config.feePercent.toString(),
    customerName: '',
    note: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [calculatedResult, setCalculatedResult] = useState<{
    toAmount: number;
    feeAmount: number;
    totalReceived: number;
  } | null>(null);

  useEffect(() => {
    const currentConfig = dataService.getExchangeConfig();
    setConfig(currentConfig);
    setFormData((prev) => ({
      ...prev,
      feePercent: currentConfig.feePercent.toString(),
    }));
  }, []);

  useEffect(() => {
    if (editingExchange) {
      setFormData({
        denomination: editingExchange.denomination || 20000,
        fromAmount: editingExchange.fromAmount.toString(),
        feePercent: editingExchange.feePercent.toString(),
        customerName: editingExchange.customerName || '',
        note: editingExchange.note || '',
      });
      calculateExchange({
        denomination: editingExchange.denomination || 20000,
        fromAmount: editingExchange.fromAmount.toString(),
        feePercent: editingExchange.feePercent.toString(),
        customerName: editingExchange.customerName || '',
        note: editingExchange.note || '',
      });
    } else {
      const currentConfig = dataService.getExchangeConfig();
      const firstEnabled = currentConfig.denominations.find((d) => d.enabled);
      setFormData({
        denomination: firstEnabled?.value || 20000,
        fromAmount: '',
        feePercent: currentConfig.feePercent.toString(),
        customerName: '',
        note: '',
      });
      setCalculatedResult(null);
      setErrors({});
    }
  }, [editingExchange]);

  const calculateExchange = (data: ExchangeFormData): void => {
    const fromAmount = parseFloat(data.fromAmount);
    if (!fromAmount || fromAmount <= 0) {
      setCalculatedResult(null);
      return;
    }

    const feePercent = parseFloat(data.feePercent) || 0;
    const feeAmount = (fromAmount * feePercent) / 100;
    const totalReceived = fromAmount - feeAmount;
    const toAmount = totalReceived; // Không cần làm tròn theo mệnh giá nữa

    setCalculatedResult({
      toAmount,
      feeAmount,
      totalReceived,
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;

    const updatedData: ExchangeFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedData);

    // Xóa lỗi
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Tính toán lại nếu có thay đổi liên quan
    if (name === 'fromAmount' || name === 'denomination' || name === 'feePercent') {
      calculateExchange(updatedData);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fromAmount || parseFloat(formData.fromAmount) <= 0) {
      newErrors.fromAmount = 'Vui lòng nhập số tiền hợp lệ';
    }
    const feePercent = parseFloat(formData.feePercent);
    if (isNaN(feePercent) || feePercent < 0 || feePercent > 100) {
      newErrors.feePercent = 'Phí đổi phải từ 0% đến 100%';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!validate() || !calculatedResult) {
      return;
    }

    if (editingExchange && onUpdateExchange) {
      onUpdateExchange(editingExchange.id, {
        denomination: formData.denomination,
        fromAmount: parseFloat(formData.fromAmount),
        toAmount: calculatedResult.toAmount,
        feePercent: parseFloat(formData.feePercent),
        feeAmount: calculatedResult.feeAmount,
        totalReceived: calculatedResult.totalReceived,
        date: new Date().toLocaleDateString('vi-VN'),
        customerName: formData.customerName || undefined,
        note: formData.note || undefined,
      });
      if (onCancelEdit) {
        onCancelEdit();
      }
    } else {
      const newExchange: Omit<ExchangeData, 'id'> = {
        denomination: formData.denomination,
        fromAmount: parseFloat(formData.fromAmount),
        toAmount: calculatedResult.toAmount,
        feePercent: parseFloat(formData.feePercent),
        feeAmount: calculatedResult.feeAmount,
        totalReceived: calculatedResult.totalReceived,
        date: new Date().toLocaleDateString('vi-VN'),
        customerName: formData.customerName || undefined,
        note: formData.note || undefined,
      };

      onAddExchange(newExchange);

      // Reset form
      const currentConfig = dataService.getExchangeConfig();
      const firstEnabled = currentConfig.denominations.find((d) => d.enabled);
      setFormData({
        denomination: firstEnabled?.value || 20000,
        fromAmount: '',
        feePercent: currentConfig.feePercent.toString(),
        customerName: '',
        note: '',
      });
      setCalculatedResult(null);
      setErrors({});
    }
  };

  const enabledDenominations = config.denominations.filter((d) => d.enabled);

  return (
    <div className="exchange-form-container">
      <h2>{editingExchange ? 'Sửa Giao Dịch Đổi Tiền' : 'Thêm Giao Dịch Đổi Tiền'}</h2>
      <form onSubmit={handleSubmit} className="exchange-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="denomination">Mệnh giá</label>
            <select
              id="denomination"
              name="denomination"
              value={formData.denomination}
              onChange={handleChange}
            >
              {enabledDenominations.map((denom) => (
                <option key={denom.value} value={denom.value}>
                  {denom.label} ({denom.value.toLocaleString('vi-VN')} VNĐ)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fromAmount">Số tiền gửi (VNĐ)</label>
            <input
              type="number"
              id="fromAmount"
              name="fromAmount"
              value={formData.fromAmount}
              onChange={handleChange}
              placeholder="Nhập số tiền"
              min="0"
              step="1000"
              required
            />
            {errors.fromAmount && (
              <span className="error-text">{errors.fromAmount}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="feePercent">Phí đổi (%)</label>
            <input
              type="number"
              id="feePercent"
              name="feePercent"
              value={formData.feePercent}
              onChange={handleChange}
              placeholder="Nhập phí đổi"
              min="0"
              max="100"
              step="0.1"
              required
            />
            {errors.feePercent && (
              <span className="error-text">{errors.feePercent}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="customerName">Tên khách hàng (tùy chọn)</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Nhập tên khách hàng"
            />
          </div>

          <div className="form-group">
            <label htmlFor="note">Ghi chú (tùy chọn)</label>
            <input
              type="text"
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Nhập ghi chú"
            />
          </div>
        </div>

        {calculatedResult && (
          <div className="result-box">
            <div className="result-item">
              <strong>Số tiền phí: </strong>
              <span className="result-amount">
                {calculatedResult.feeAmount.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            <div className="result-item">
              <strong>Tổng tiền nhận (sau phí): </strong>
              <span className="result-amount">
                {calculatedResult.totalReceived.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            <div className="result-item highlight">
              <strong>Số tiền thực nhận: </strong>
              <span className="result-amount">
                {calculatedResult.toAmount.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="submit-button">
            {editingExchange ? 'Cập Nhật' : 'Thêm Giao Dịch'}
          </button>
          {editingExchange && onCancelEdit && (
            <button type="button" className="cancel-button" onClick={onCancelEdit}>
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExchangeForm;
