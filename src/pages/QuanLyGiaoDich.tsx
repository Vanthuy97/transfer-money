import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CurrencyTable from '../components/CurrencyTable';
import ExchangeModal from '../components/ExchangeModal';
import { ExchangeData } from '../types';
import { dataService } from '../services/dataService';
import './QuanLyGiaoDich.css';

const QuanLyGiaoDich: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exchangeData, setExchangeData] = useState<ExchangeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExchange, setEditingExchange] = useState<ExchangeData | null>(null);

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

  const handleAddExchange = (newExchange: Omit<ExchangeData, 'id'>): void => {
    try {
      dataService.addExchange(newExchange);
      // Reload lại toàn bộ danh sách từ dataService để đảm bảo dữ liệu chính xác
      const exchanges = dataService.getExchanges();
      setExchangeData(exchanges);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Lỗi khi thêm giao dịch:', error);
      alert('Có lỗi xảy ra khi thêm giao dịch');
    }
  };

  const handleUpdateExchange = (id: string, updatedExchange: Partial<ExchangeData>): void => {
    try {
      const exchange = dataService.updateExchange(id, updatedExchange);
      if (exchange) {
        // Reload lại toàn bộ danh sách từ dataService để đảm bảo dữ liệu chính xác
        const exchanges = dataService.getExchanges();
        setExchangeData(exchanges);
        setEditingExchange(null);
        setIsModalOpen(false);
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
        // Reload lại toàn bộ danh sách từ dataService để đảm bảo dữ liệu chính xác
        const exchanges = dataService.getExchanges();
        setExchangeData(exchanges);
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
    setIsModalOpen(true);
  };

  const handleOpenModal = (): void => {
    setEditingExchange(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingExchange(null);
  };

  const handleSaveExchange = (exchange: Omit<ExchangeData, 'id'>): void => {
    if (editingExchange) {
      handleUpdateExchange(editingExchange.id, exchange);
    } else {
      handleAddExchange(exchange);
    }
  };

  if (loading) {
    return (
      <div className="quan-ly-giao-dich-container">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="quan-ly-giao-dich-container">
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

      <ExchangeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveExchange}
        editingExchange={editingExchange}
      />
    </div>
  );
};

export default QuanLyGiaoDich;

