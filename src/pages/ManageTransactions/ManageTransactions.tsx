import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CurrencyTable from '../../components/CurrencyTable/CurrencyTable';
import { ExchangeData } from '../../types';
import { dataService } from '../../services/dataService';
import './ManageTransactions.css';

const ManageTransactions: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exchangeData, setExchangeData] = useState<ExchangeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        await dataService.initialize();
        const exchanges = dataService.getExchanges();
        setExchangeData(exchanges);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi đọc dữ liệu:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);


  const handleDeleteExchange = (id: string): void => {
    try {
      const success = dataService.deleteExchange(id);
      if (success) {
        // Reload lại toàn bộ danh sách từ dataService để đảm bảo dữ liệu chính xác
        const exchanges = dataService.getExchanges();
        setExchangeData(exchanges);
      } else {
        alert('Không tìm thấy giao dịch để xóa');
      }
    } catch (error) {
      console.error('Lỗi khi xóa giao dịch:', error);
      alert('Có lỗi xảy ra khi xóa giao dịch');
    }
  };

  const handleEditExchange = (exchange: ExchangeData): void => {
    navigate(`/add-edit-transaction/${exchange.id}`);
  };

  const handleOpenModal = (): void => {
    navigate('/add-edit-transaction');
  };

  if (loading) {
    return (
      <div className="manage-transactions-container">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="manage-transactions-container">
      <header className="page-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Về Dashboard
          </button>
          <h1>Quản Lý Giao Dịch</h1>
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
          <div className="table-header">
            <h2>Danh Sách Giao Dịch</h2>
            <button className="add-button" onClick={handleOpenModal}>
              + Thêm Mới
            </button>
          </div>
          <CurrencyTable
            data={exchangeData}
            onEdit={handleEditExchange}
            onDelete={handleDeleteExchange}
          />
        </div>
      </main>
    </div>
  );
};

export default ManageTransactions;

