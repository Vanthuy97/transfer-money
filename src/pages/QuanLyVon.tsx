import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Capital, DenominationConfig } from '../types';
import { dataService } from '../services/dataService';
import './QuanLyVon.css';

const QuanLyVon: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [capitals, setCapitals] = useState<Capital[]>([]);
  const [denominations, setDenominations] = useState<DenominationConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [capitalFormData, setCapitalFormData] = useState({
    amount: '',
    note: '',
  });
  const [denominationFormData, setDenominationFormData] = useState({
    value: '',
    label: '',
  });
  const [selectedCapital, setSelectedCapital] = useState<Capital | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    note: '',
  });

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        await dataService.initialize();
        const data = dataService.getData();
        setCapitals(data?.capitals || []);
        const config = dataService.getExchangeConfig();
        setDenominations(config.denominations || []);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi đọc dữ liệu:', error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddCapital = (e: React.FormEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    if (!capitalFormData.amount || parseFloat(capitalFormData.amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}`;
    const newCapital: Capital = {
      id: uniqueId,
      amount: parseFloat(capitalFormData.amount),
      date: now.toLocaleDateString('vi-VN'),
      time: now.toLocaleTimeString('vi-VN'),
      note: capitalFormData.note || undefined,
      addedBy: user?.username || 'Unknown',
    };

    try {
      dataService.addCapital(newCapital);
      // Reload từ dataService để đảm bảo dữ liệu đồng bộ
      const data = dataService.getData();
      setCapitals(data?.capitals || []);
      setCapitalFormData({ amount: '', note: '' });
    } catch (error) {
      console.error('Lỗi khi thêm vốn:', error);
      alert('Có lỗi xảy ra khi thêm vốn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDenomination = (e: React.FormEvent): void => {
    e.preventDefault();
    const value = parseFloat(denominationFormData.value);
    if (!value || value <= 0) {
      alert('Vui lòng nhập mệnh giá hợp lệ');
      return;
    }

    if (!denominationFormData.label.trim()) {
      alert('Vui lòng nhập nhãn hiển thị');
      return;
    }

    // Kiểm tra xem mệnh giá đã tồn tại chưa
    if (denominations.some((d) => d.value === value)) {
      alert('Mệnh giá này đã tồn tại');
      return;
    }

    const newDenomination: DenominationConfig = {
      value,
      label: denominationFormData.label.trim(),
      enabled: true,
    };

    try {
      dataService.addDenomination(newDenomination);
      const config = dataService.getExchangeConfig();
      setDenominations(config.denominations);
      setDenominationFormData({ value: '', label: '' });
    } catch (error) {
      console.error('Lỗi khi thêm mệnh giá:', error);
      alert('Có lỗi xảy ra khi thêm mệnh giá');
    }
  };

  const handleToggleDenomination = (value: number): void => {
    const denom = denominations.find((d) => d.value === value);
    if (denom) {
      dataService.updateDenomination(value, { enabled: !denom.enabled });
      const config = dataService.getExchangeConfig();
      setDenominations(config.denominations);
    }
  };

  const handleDeleteDenomination = (value: number): void => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mệnh giá này?')) {
      // Xóa bằng cách disable và xóa khỏi danh sách
      const config = dataService.getExchangeConfig();
      const updatedDenominations = config.denominations.filter((d) => d.value !== value);
      dataService.updateExchangeConfig({ denominations: updatedDenominations });
      setDenominations(updatedDenominations);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa vốn này?')) {
      try {
        dataService.deleteCapital(id);
        setCapitals(capitals.filter((c) => c.id !== id));
        if (selectedCapital?.id === id) {
          setIsModalOpen(false);
          setSelectedCapital(null);
        }
      } catch (error) {
        console.error('Lỗi khi xóa vốn:', error);
        alert('Có lỗi xảy ra khi xóa vốn');
      }
    }
  };

  const handleRowClick = (capital: Capital): void => {
    setSelectedCapital(capital);
    setEditFormData({
      amount: capital.amount.toString(),
      note: capital.note || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedCapital(null);
    setEditFormData({ amount: '', note: '' });
  };

  const handleSaveEdit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!selectedCapital) return;

    if (!editFormData.amount || parseFloat(editFormData.amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      // Cập nhật vốn trong dataService
      const updatedCapital: Capital = {
        ...selectedCapital,
        amount: parseFloat(editFormData.amount),
        note: editFormData.note || undefined,
      };

      // Xóa và thêm lại với dữ liệu mới
      dataService.deleteCapital(selectedCapital.id);
      dataService.addCapital(updatedCapital);

      // Cập nhật state
      setCapitals(
        capitals.map((c) => (c.id === selectedCapital.id ? updatedCapital : c))
      );
      handleCloseModal();
    } catch (error) {
      console.error('Lỗi khi cập nhật vốn:', error);
      alert('Có lỗi xảy ra khi cập nhật vốn');
    }
  };

  if (loading) {
    return (
      <div className="quan-ly-von-container">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="quan-ly-von-container">
      <header className="page-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Về Dashboard
          </button>
          <h1>Quản Lý Vốn</h1>
          <div className="user-info">
            <span>Xin chào, {user?.username}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="logout-button">
              Đăng Xuất
            </button>
          </div>
        </div>
      </header>

      <main className="page-main">
        <div className="page-content">
          <div className="forms-container">
            {/* Form trái: Quản lý mệnh giá */}
            <div className="form-section left-form">
              <h2>Quản Lý Mệnh Giá Tiền</h2>
              <form onSubmit={handleAddDenomination} className="denomination-form">
                <div className="form-group">
                  <label>Mệnh giá (VNĐ)</label>
                  <input
                    type="number"
                    value={denominationFormData.value}
                    onChange={(e) =>
                      setDenominationFormData({
                        ...denominationFormData,
                        value: e.target.value,
                      })
                    }
                    placeholder="VD: 20000"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nhãn hiển thị</label>
                  <input
                    type="text"
                    value={denominationFormData.label}
                    onChange={(e) =>
                      setDenominationFormData({
                        ...denominationFormData,
                        label: e.target.value,
                      })
                    }
                    placeholder="VD: 20k"
                    required
                  />
                </div>
                <button type="submit" className="submit-button">
                  Thêm Mệnh Giá
                </button>
              </form>

              <div className="denomination-list">
                <h3>Danh Sách Mệnh Giá</h3>
                {denominations.length === 0 ? (
                  <div className="no-data">Chưa có mệnh giá</div>
                ) : (
                  <div className="denomination-items">
                    {denominations.map((denom) => (
                      <div key={denom.value} className="denomination-item">
                        <span className="denom-label">{denom.label}</span>
                        <span className="denom-value">
                          {denom.value.toLocaleString('vi-VN')} VNĐ
                        </span>
                        <div className="denom-actions">
                          <button
                            className={`toggle-button ${denom.enabled ? 'enabled' : 'disabled'}`}
                            onClick={() => handleToggleDenomination(denom.value)}
                            title={denom.enabled ? 'Tắt' : 'Bật'}
                          >
                            {denom.enabled ? '✓' : '✗'}
                          </button>
                          <button
                            className="delete-button-small"
                            onClick={() => handleDeleteDenomination(denom.value)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form phải: Thêm vốn */}
            <div className="form-section right-form">
              <h2>Thêm Vốn Mới</h2>
              <form onSubmit={handleAddCapital} className="capital-form">
                <div className="form-group">
                  <label>Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    value={capitalFormData.amount}
                    onChange={(e) =>
                      setCapitalFormData({ ...capitalFormData, amount: e.target.value })
                    }
                    placeholder="Nhập số tiền"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ghi chú (tùy chọn)</label>
                  <input
                    type="text"
                    value={capitalFormData.note}
                    onChange={(e) =>
                      setCapitalFormData({ ...capitalFormData, note: e.target.value })
                    }
                    placeholder="Nhập ghi chú"
                  />
                </div>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang thêm...' : 'Thêm Vốn'}
                </button>
              </form>

              {/* Danh sách vốn ngay dưới form */}
              <div className="capital-list-section">
                <h3>Danh Sách Vốn</h3>
                {capitals.length === 0 ? (
                  <div className="no-data">Chưa có dữ liệu vốn</div>
                ) : (
                  <table className="capital-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Số tiền (VNĐ)</th>
                        <th>Người thêm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {capitals.map((capital, index) => (
                        <tr
                          key={capital.id}
                          className="capital-row"
                          onClick={() => handleRowClick(capital)}
                        >
                          <td>{index + 1}</td>
                          <td>
                            <strong>{capital.amount.toLocaleString('vi-VN')} VNĐ</strong>
                          </td>
                          <td>{capital.addedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal chi tiết và sửa vốn */}
      {isModalOpen && selectedCapital && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi Tiết Vốn</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="modal-form-row">
                <div className="form-group">
                  <label>Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, amount: e.target.value })
                    }
                    placeholder="Nhập số tiền"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ghi chú</label>
                  <input
                    type="text"
                    value={editFormData.note}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, note: e.target.value })
                    }
                    placeholder="Nhập ghi chú"
                  />
                </div>
              </div>
              <div className="modal-info">
                <div className="info-item">
                  <strong>Người thêm:</strong> {selectedCapital.addedBy}
                </div>
                <div className="info-item">
                  <strong>Ngày:</strong> {selectedCapital.date}
                </div>
                <div className="info-item">
                  <strong>Giờ:</strong> {selectedCapital.time}
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-button">
                  Lưu
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="delete-button-modal"
                  onClick={(e) => handleDelete(selectedCapital.id, e)}
                >
                  Xóa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyVon;

