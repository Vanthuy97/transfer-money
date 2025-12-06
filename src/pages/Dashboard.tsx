import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CurrencyTable from '../components/CurrencyTable';
import ExchangeForm from '../components/ExchangeForm';
import { ExchangeData } from '../types';
import { dataService } from '../services/dataService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exchangeData, setExchangeData] = useState<ExchangeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingExchange, setEditingExchange] = useState<ExchangeData | null>(null);

  useEffect(() => {
    // Khởi tạo và load dữ liệu
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

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const handleAddExchange = (newExchange: Omit<ExchangeData, 'id'>): void => {
    try {
      const exchange = dataService.addExchange(newExchange);
      setExchangeData([...exchangeData, exchange]);
    } catch (error) {
      console.error('Lỗi khi thêm giao dịch:', error);
      alert('Có lỗi xảy ra khi thêm giao dịch');
    }
  };

  const handleUpdateExchange = (id: string, updatedExchange: Partial<ExchangeData>): void => {
    try {
      const exchange = dataService.updateExchange(id, updatedExchange);
      if (exchange) {
        setExchangeData(
          exchangeData.map((ex) => (ex.id === id ? exchange : ex))
        );
        setEditingExchange(null);
      } else {
        alert('Không tìm thấy giao dịch để cập nhật');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật giao dịch:', error);
      alert('Có lỗi xảy ra khi cập nhật giao dịch');
    }
  };

  const handleDeleteExchange = (id: string): void => {
    try {
      const success = dataService.deleteExchange(id);
      if (success) {
        setExchangeData(exchangeData.filter((ex) => ex.id !== id));
        if (editingExchange?.id === id) {
          setEditingExchange(null);
        }
      } else {
        alert('Không tìm thấy giao dịch để xóa');
      }
    } catch (error) {
      console.error('Lỗi khi xóa giao dịch:', error);
      alert('Có lỗi xảy ra khi xóa giao dịch');
    }
  };

  const handleEditExchange = (exchange: ExchangeData): void => {
    setEditingExchange(exchange);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = (): void => {
    setEditingExchange(null);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Quản Lý Đổi Tiền</h1>
          <div className="user-info">
            <span>Xin chào, {user?.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Đăng Xuất
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <ExchangeForm
            onAddExchange={handleAddExchange}
            onUpdateExchange={handleUpdateExchange}
            editingExchange={editingExchange}
            onCancelEdit={handleCancelEdit}
          />
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

export default Dashboard;
