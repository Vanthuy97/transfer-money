import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { ExchangeData, FormData, FormErrors, Currency, ExchangeRates } from '../types';
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
  onCancelEdit 
}) => {
  const [formData, setFormData] = useState<FormData>({
    fromCurrency: 'VND',
    fromAmount: '',
    toCurrency: 'USD',
    exchangeRate: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (editingExchange) {
      setFormData({
        fromCurrency: editingExchange.fromCurrency,
        fromAmount: editingExchange.fromAmount.toString(),
        toCurrency: editingExchange.toCurrency,
        exchangeRate: editingExchange.exchangeRate,
        toAmount: editingExchange.toAmount.toString(),
      });
    } else {
      // Reset form khi không ở chế độ sửa
      setFormData({
        fromCurrency: 'VND',
        fromAmount: '',
        toCurrency: 'USD',
        exchangeRate: '',
      });
      setErrors({});
    }
  }, [editingExchange]);

  const currencies: Currency[] = ['VND', 'USD', 'EUR', 'GBP', 'JPY', 'CNY'];

  const exchangeRates: ExchangeRates = {
    VND: { USD: 0.000043, EUR: 0.000040, GBP: 0.000035, JPY: 0.0064, CNY: 0.00031 },
    USD: { VND: 23250, EUR: 0.93, GBP: 0.81, JPY: 149.5, CNY: 7.24 },
    EUR: { VND: 25000, USD: 1.08, GBP: 0.87, JPY: 161, CNY: 7.78 },
    GBP: { VND: 28700, USD: 1.23, EUR: 1.15, JPY: 184, CNY: 8.92 },
    JPY: { VND: 156, USD: 0.0067, EUR: 0.0062, GBP: 0.0054, CNY: 0.048 },
    CNY: { VND: 3210, USD: 0.138, EUR: 0.128, GBP: 0.112, JPY: 20.7 },
  };

  const calculateExchange = (data: FormData): void => {
    const { fromCurrency, toCurrency, fromAmount } = data;
    if (fromCurrency === toCurrency) {
      setFormData((prev) => ({
        ...prev,
        exchangeRate: '1',
        toAmount: fromAmount || '',
      }));
      return;
    }

    const rate = exchangeRates[fromCurrency]?.[toCurrency];
    if (rate && fromAmount) {
      const toAmount = (parseFloat(fromAmount) * rate).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        exchangeRate: rate.toString(),
        toAmount: toAmount,
      }));
    } else if (rate) {
      setFormData((prev) => ({
        ...prev,
        exchangeRate: rate.toString(),
        toAmount: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        exchangeRate: '',
        toAmount: '',
      }));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    // Tạo object mới với giá trị đã cập nhật
    const updatedData: FormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedData);

    // Xóa lỗi khi người dùng nhập
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Tự động tính tỷ giá và số tiền nhận với giá trị mới
    if (name === 'fromCurrency' || name === 'toCurrency' || name === 'fromAmount') {
      calculateExchange(updatedData);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fromAmount || parseFloat(formData.fromAmount) <= 0) {
      newErrors.fromAmount = 'Vui lòng nhập số tiền hợp lệ';
    }
    if (formData.fromCurrency === formData.toCurrency) {
      newErrors.toCurrency = 'Loại tiền gửi và nhận không được giống nhau';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    if (editingExchange && onUpdateExchange) {
      // Cập nhật giao dịch
      onUpdateExchange(editingExchange.id, {
        fromCurrency: formData.fromCurrency,
        fromAmount: parseFloat(formData.fromAmount),
        toCurrency: formData.toCurrency,
        exchangeRate: formData.exchangeRate,
        toAmount: parseFloat(formData.toAmount || '0'),
        date: new Date().toLocaleDateString('vi-VN'),
      });
      if (onCancelEdit) {
        onCancelEdit();
      }
    } else {
      // Thêm giao dịch mới
      const newExchange = {
        fromCurrency: formData.fromCurrency,
        fromAmount: parseFloat(formData.fromAmount),
        toCurrency: formData.toCurrency,
        exchangeRate: formData.exchangeRate,
        toAmount: parseFloat(formData.toAmount || '0'),
        date: new Date().toLocaleDateString('vi-VN'),
      };

      onAddExchange(newExchange);

      // Reset form
      setFormData({
        fromCurrency: 'VND',
        fromAmount: '',
        toCurrency: 'USD',
        exchangeRate: '',
      });
      setErrors({});
    }
  };

  return (
    <div className="exchange-form-container">
      <h2>{editingExchange ? 'Sửa Giao Dịch Đổi Tiền' : 'Thêm Giao Dịch Đổi Tiền'}</h2>
      <form onSubmit={handleSubmit} className="exchange-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fromCurrency">Loại tiền gửi</label>
            <select
              id="fromCurrency"
              name="fromCurrency"
              value={formData.fromCurrency}
              onChange={handleChange}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fromAmount">Số tiền gửi</label>
            <input
              type="number"
              id="fromAmount"
              name="fromAmount"
              value={formData.fromAmount}
              onChange={handleChange}
              placeholder="Nhập số tiền"
              min="0"
              step="0.01"
            />
            {errors.fromAmount && (
              <span className="error-text">{errors.fromAmount}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="toCurrency">Loại tiền nhận</label>
            <select
              id="toCurrency"
              name="toCurrency"
              value={formData.toCurrency}
              onChange={handleChange}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            {errors.toCurrency && (
              <span className="error-text">{errors.toCurrency}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="exchangeRate">Tỷ giá</label>
            <input
              type="text"
              id="exchangeRate"
              name="exchangeRate"
              value={formData.exchangeRate}
              readOnly
              className="readonly-input"
            />
          </div>
        </div>

        {formData.toAmount && (
          <div className="result-box">
            <strong>Số tiền nhận: </strong>
            <span className="result-amount">
              {parseFloat(formData.toAmount).toLocaleString('vi-VN')} {formData.toCurrency}
            </span>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="submit-button">
            {editingExchange ? 'Cập Nhật' : 'Thêm Giao Dịch'}
          </button>
          {editingExchange && onCancelEdit && (
            <button 
              type="button" 
              className="cancel-button"
              onClick={onCancelEdit}
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExchangeForm;

