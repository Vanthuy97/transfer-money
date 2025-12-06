import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Khởi tạo dataService khi component mount
    const init = async () => {
      await dataService.initialize();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Chỉ redirect nếu đang ở trang login
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    // Đảm bảo dataService đã được khởi tạo
    if (loading) {
      await dataService.initialize();
      setLoading(false);
    }

    // Xác thực tài khoản từ dataService
    if (dataService.validateAccount(username, password)) {
      login(username);
      navigate('/dashboard');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="loading">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Đăng Nhập</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

