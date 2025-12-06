import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ExchangeData, ExchangeStatus } from '../../types';
import { dataService } from '../../services/dataService';
import './AddEditTransaction.css';

interface ExchangeItem {
  denomination: string;
  exchangeAmount: string;
  feePercent: string;
}

const AddEditTransaction: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [config, setConfig] = useState(() => dataService.getExchangeConfig());
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([
    {
      denomination: '',
      exchangeAmount: '',
      feePercent: config.feePercent.toString(),
    },
  ]);
  const [formData, setFormData] = useState({
    exchangerName: '',
    phoneNumber: '',
    socialLink: '',
    receiveTime: '',
    address: '',
    status: 'Chưa Nhận Tiền' as ExchangeStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const loadExchange = async () => {
        try {
          await dataService.initialize();
          const exchanges = dataService.getExchanges();
          const exchange = exchanges.find((e: ExchangeData) => e.id === id);
          if (exchange) {
            setFormData({
              exchangerName: exchange.exchangerName || '',
              phoneNumber: exchange.phoneNumber || '',
              socialLink: exchange.socialLink || '',
              receiveTime: convertToDateTimeLocal(exchange.receiveTime || ''),
              address: exchange.address || '',
              status: exchange.status || 'Chưa Nhận Tiền',
            });
            // Nếu đang sửa, chỉ hiển thị 1 item
            setExchangeItems([
              {
                denomination: exchange.denomination?.toString() || '',
                exchangeAmount: exchange.exchangeAmount?.toString() || exchange.fromAmount.toString(),
                feePercent: exchange.feePercent.toString(),
              },
            ]);
          }
        } catch (error) {
          console.error('Lỗi khi tải giao dịch:', error);
          alert('Không tìm thấy giao dịch');
          navigate('/manage-transactions');
        }
      };
      loadExchange();
    }
  }, [id, isEditing, navigate]);

  const convertToDateTimeLocal = (dateTimeStr: string): string => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return '';
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

  const formatDateTimeForDisplay = (dateTimeStr: string): string => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return dateTimeStr;
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

  const formatCurrency = (value: string): string => {
    if (!value || value === '') return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return '';
    return numValue.toLocaleString('vi-VN') + '₫';
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleItemChange = (index: number, field: keyof ExchangeItem, value: string): void => {
    setExchangeItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addExchangeItem = (): void => {
    setExchangeItems((prev) => [
      ...prev,
      {
        denomination: '',
        exchangeAmount: '',
        feePercent: config.feePercent.toString(),
      },
    ]);
  };

  const removeExchangeItem = (index: number): void => {
    if (exchangeItems.length > 1) {
      setExchangeItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.exchangerName.trim()) {
      newErrors.exchangerName = 'Vui lòng nhập tên người đổi';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (!formData.receiveTime.trim()) {
      newErrors.receiveTime = 'Vui lòng chọn thời gian muốn nhận';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    exchangeItems.forEach((item, index) => {
      if (!item.denomination || parseFloat(item.denomination) <= 0) {
        newErrors[`denomination_${index}`] = 'Vui lòng chọn mệnh giá';
      }
      if (!item.exchangeAmount || parseFloat(item.exchangeAmount) <= 0) {
        newErrors[`exchangeAmount_${index}`] = 'Vui lòng nhập số tiền đổi hợp lệ';
      }
      if (!item.feePercent || parseFloat(item.feePercent) < 0) {
        newErrors[`feePercent_${index}`] = 'Vui lòng nhập phí đổi hợp lệ';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditing && id) {
        // Sửa giao dịch - chỉ cập nhật 1 giao dịch
        const item = exchangeItems[0];
        const exchangeAmount = parseFloat(item.exchangeAmount);
        const denomination = parseFloat(item.denomination);
        const feePercent = parseFloat(item.feePercent);
        const feeAmount = (exchangeAmount * feePercent) / 100;
        const totalReceived = exchangeAmount - feeAmount;
        const toAmount = totalReceived; // Không cần làm tròn theo mệnh giá nữa

        const updatedExchange: Partial<ExchangeData> = {
          denomination,
          fromAmount: exchangeAmount,
          toAmount,
          feePercent,
          feeAmount,
          totalReceived,
          exchangeAmount,
          exchangerName: formData.exchangerName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          socialLink: formData.socialLink.trim() || undefined,
          receiveTime: formatDateTimeForDisplay(formData.receiveTime.trim()),
          address: formData.address.trim(),
          customerName: formData.exchangerName.trim(),
          status: formData.status,
        };

        dataService.updateExchange(id, updatedExchange);
        alert('Cập nhật giao dịch thành công!');
      } else {
        // Thêm mới - có thể thêm nhiều giao dịch cho 1 khách
        exchangeItems.forEach((item) => {
          const exchangeAmount = parseFloat(item.exchangeAmount);
          const denomination = parseFloat(item.denomination);
          const feePercent = parseFloat(item.feePercent);
          const feeAmount = (exchangeAmount * feePercent) / 100;
          const totalReceived = exchangeAmount - feeAmount;
          const toAmount = totalReceived;

          const newExchange: Omit<ExchangeData, 'id'> = {
            denomination,
            fromAmount: exchangeAmount,
            toAmount,
            feePercent,
            feeAmount,
            totalReceived,
            date: new Date().toLocaleDateString('vi-VN'),
            createdBy: user?.username || '',
            exchangeAmount,
            exchangerName: formData.exchangerName.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            socialLink: formData.socialLink.trim() || undefined,
            receiveTime: formatDateTimeForDisplay(formData.receiveTime.trim()),
            address: formData.address.trim(),
            customerName: formData.exchangerName.trim(),
            status: formData.status,
          };

          dataService.addExchange(newExchange);
        });
        alert(`Thêm ${exchangeItems.length} giao dịch thành công!`);
      }

      navigate('/manage-transactions');
    } catch (error) {
      console.error('Lỗi khi lưu giao dịch:', error);
      alert('Có lỗi xảy ra khi lưu giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const enabledDenominations = config.denominations.filter((d: { enabled: boolean }) => d.enabled);

  return (
    <div className="add-edit-transaction-container">
      <header className="page-header">
        <div className="header-content">
          <button onClick={() => navigate('/manage-transactions')} className="back-button">
            ← Quay lại
          </button>
          <h1>{isEditing ? 'Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}</h1>
          <div className="user-info">
            <span>Xin chào, {user?.username}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="logout-button">
              Đăng Xuất
            </button>
          </div>
        </div>
      </header>

      <main className="page-main">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="exchange-form-page">
            {/* Thông tin khách hàng */}
            <div className="form-section">
              <h2>Thông Tin Khách Hàng</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="exchangerName">
                    Người đổi <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="exchangerName"
                    name="exchangerName"
                    value={formData.exchangerName}
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phoneNumber && (
                    <span className="error-text">{errors.phoneNumber}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="socialLink">Link Facebook hoặc mạng xã hội</label>
                  <input
                    type="url"
                    id="socialLink"
                    name="socialLink"
                    value={formData.socialLink}
                    onChange={handleFormChange}
                    placeholder="Nhập link Facebook hoặc mạng xã hội"
                  />
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
                    onChange={handleFormChange}
                  />
                  {errors.receiveTime && (
                    <span className="error-text">{errors.receiveTime}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  Địa chỉ <span className="required">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Nhập địa chỉ"
                  rows={3}
                />
                {errors.address && (
                  <span className="error-text">{errors.address}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="status">
                  Trạng thái <span className="required">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <option value="Chưa Nhận Tiền">Chưa Nhận Tiền</option>
                  <option value="Chờ Giao">Chờ Giao</option>
                  <option value="Đã Nhận Tiền">Đã Nhận Tiền</option>
                  <option value="Hoàn Thành">Hoàn Thành</option>
                </select>
              </div>
            </div>

            {/* Danh sách giao dịch */}
            <div className="form-section">
              <div className="section-header">
                <h2>Danh Sách Giao Dịch</h2>
                {!isEditing && (
                  <button
                    type="button"
                    className="add-item-button"
                    onClick={addExchangeItem}
                  >
                    + Thêm Loại Tiền
                  </button>
                )}
              </div>

              {exchangeItems.map((item, index) => (
                <div key={index} className="exchange-item-card">
                  <div className="item-header">
                    <h3>Giao Dịch {index + 1}</h3>
                    {!isEditing && exchangeItems.length > 1 && (
                      <button
                        type="button"
                        className="remove-item-button"
                        onClick={() => removeExchangeItem(index)}
                      >
                        ✕ Xóa
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor={`denomination_${index}`}>
                        Mệnh giá <span className="required">*</span>
                      </label>
                      <select
                        id={`denomination_${index}`}
                        value={item.denomination}
                        onChange={(e) => handleItemChange(index, 'denomination', e.target.value)}
                      >
                        <option value="">Chọn mệnh giá</option>
                        {enabledDenominations.map((denom: { value: number; label: string }) => (
                          <option key={denom.value} value={denom.value}>
                            {denom.label} ({denom.value.toLocaleString('vi-VN')} VNĐ)
                          </option>
                        ))}
                      </select>
                      {errors[`denomination_${index}`] && (
                        <span className="error-text">{errors[`denomination_${index}`]}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`exchangeAmount_${index}`}>
                        Số tiền đổi <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        id={`exchangeAmount_${index}`}
                        value={item.exchangeAmount}
                        onChange={(e) => handleItemChange(index, 'exchangeAmount', e.target.value)}
                        placeholder="Nhập số tiền đổi (VNĐ)"
                        min="0"
                        step="1000"
                      />
                      {item.exchangeAmount && formatCurrency(item.exchangeAmount) && (
                        <span className="formatted-amount">
                          {formatCurrency(item.exchangeAmount)}
                        </span>
                      )}
                      {errors[`exchangeAmount_${index}`] && (
                        <span className="error-text">{errors[`exchangeAmount_${index}`]}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`feePercent_${index}`}>
                        Phí đổi (%) <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        id={`feePercent_${index}`}
                        value={item.feePercent}
                        onChange={(e) => handleItemChange(index, 'feePercent', e.target.value)}
                        placeholder="Nhập phí đổi (%)"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      {errors[`feePercent_${index}`] && (
                        <span className="error-text">{errors[`feePercent_${index}`]}</span>
                      )}
                    </div>
                  </div>

                  {item.exchangeAmount && item.feePercent && (
                    <div className="calculation-preview">
                      <div className="calc-item">
                        <span>Số tiền đổi:</span>
                        <strong>{parseFloat(item.exchangeAmount).toLocaleString('vi-VN')} VNĐ</strong>
                      </div>
                      <div className="calc-item">
                        <span>Phí ({item.feePercent}%):</span>
                        <strong>
                          {((parseFloat(item.exchangeAmount) * parseFloat(item.feePercent)) / 100).toLocaleString('vi-VN')} VNĐ
                        </strong>
                      </div>
                      <div className="calc-item highlight">
                        <span>Số tiền nhận:</span>
                        <strong>
                          {(parseFloat(item.exchangeAmount) - (parseFloat(item.exchangeAmount) * parseFloat(item.feePercent)) / 100).toLocaleString('vi-VN')} VNĐ
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate('/manage-transactions')}
              >
                Hủy
              </button>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Đang lưu...' : isEditing ? 'Cập Nhật' : 'Lưu Giao Dịch'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddEditTransaction;

