import { AppData, ExchangeData, Account } from '../types';

const STORAGE_KEY = 'transfer_money_data';

class DataService {
  private data: AppData | null = null;

  // Khởi tạo dữ liệu từ JSON hoặc localStorage
  async initialize(): Promise<AppData> {
    // Kiểm tra localStorage trước
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        this.data = JSON.parse(savedData);
        if (this.data) {
          return this.data;
        }
      } catch (error) {
        console.error('Lỗi khi đọc dữ liệu từ localStorage:', error);
      }
    }

    // Nếu không có trong localStorage, load từ JSON
    try {
      const response = await fetch('/data/app-data.json');
      this.data = await response.json() as AppData;
      this.saveToStorage();
      return this.data;
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu từ JSON:', error);
      // Trả về dữ liệu mặc định
      this.data = {
        accounts: [],
        exchanges: [],
      };
      this.saveToStorage();
      return this.data;
    }
  }

  // Lưu dữ liệu vào localStorage
  private saveToStorage(): void {
    if (this.data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  // Lấy tất cả dữ liệu
  getData(): AppData | null {
    return this.data;
  }

  // Lấy danh sách tài khoản
  getAccounts(): Account[] {
    return this.data?.accounts || [];
  }

  // Lấy danh sách giao dịch
  getExchanges(): ExchangeData[] {
    return this.data?.exchanges || [];
  }

  // Thêm giao dịch mới
  addExchange(exchange: Omit<ExchangeData, 'id'>): ExchangeData {
    if (!this.data) {
      throw new Error('Dữ liệu chưa được khởi tạo');
    }

    const newExchange: ExchangeData = {
      ...exchange,
      id: Date.now().toString(),
    };

    this.data.exchanges.push(newExchange);
    this.saveToStorage();
    return newExchange;
  }

  // Cập nhật giao dịch
  updateExchange(id: string, updatedExchange: Partial<ExchangeData>): ExchangeData | null {
    if (!this.data) {
      throw new Error('Dữ liệu chưa được khởi tạo');
    }

    const index = this.data.exchanges.findIndex((ex) => ex.id === id);
    if (index === -1) {
      return null;
    }

    this.data.exchanges[index] = {
      ...this.data.exchanges[index],
      ...updatedExchange,
      id, // Đảm bảo id không bị thay đổi
    };

    this.saveToStorage();
    return this.data.exchanges[index];
  }

  // Xóa giao dịch
  deleteExchange(id: string): boolean {
    if (!this.data) {
      throw new Error('Dữ liệu chưa được khởi tạo');
    }

    const index = this.data.exchanges.findIndex((ex) => ex.id === id);
    if (index === -1) {
      return false;
    }

    this.data.exchanges.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Xác thực tài khoản
  validateAccount(username: string, password: string): boolean {
    const accounts = this.getAccounts();
    const account = accounts.find(
      (acc) => acc.username === username && acc.password === password
    );
    return !!account;
  }

  // Reset dữ liệu về mặc định (từ JSON)
  async resetData(): Promise<AppData> {
    try {
      const response = await fetch('/data/app-data.json');
      this.data = await response.json() as AppData;
      this.saveToStorage();
      return this.data;
    } catch (error) {
      console.error('Lỗi khi reset dữ liệu:', error);
      throw error;
    }
  }
}

export const dataService = new DataService();

