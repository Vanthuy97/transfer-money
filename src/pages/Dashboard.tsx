import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Statistics from '../components/Statistics';
import { ExchangeData, Capital } from '../types';
import { dataService } from '../services/dataService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exchanges, setExchanges] = useState<ExchangeData[]>([]);
  const [capitals, setCapitals] = useState<Capital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        await dataService.initialize();
        const data = dataService.getData();
        setExchanges(data?.exchanges || []);
        setCapitals(data?.capitals || []);
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
          <h1>Dashboard - Quản Lý Đổi Tiền</h1>
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
          {/* Menu Cards */}
          <div className="menu-cards">
            <div
              className="menu-card"
              onClick={() => navigate('/quan-ly-von')}
            >
              <div className="card-icon">💼</div>
              <h2>Quản Lý Vốn</h2>
              <p>Quản lý và theo dõi vốn đầu tư</p>
            </div>

            <div
              className="menu-card"
              onClick={() => navigate('/quan-ly-giao-dich')}
            >
              <div className="card-icon">💱</div>
              <h2>Quản Lý Giao Dịch</h2>
              <p>Quản lý các giao dịch đổi tiền</p>
            </div>
          </div>

          {/* Statistics */}
          <Statistics exchanges={exchanges} capitals={capitals} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
