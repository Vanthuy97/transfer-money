export interface User {
  username: string;
}

export interface Account {
  username: string;
  password: string;
}

export type ExchangeStatus = 'Chưa Nhận Tiền' | 'Chờ Giao' | 'Đã Nhận Tiền' | 'Hoàn Thành';

export interface ExchangeData {
  id: string;
  denomination: number; // Mệnh giá tiền (20k, 50k, 100k)
  fromAmount: number; // Số tiền gửi (tổng)
  toAmount: number; // Số tiền nhận (tổng) - tính từ fromAmount trừ phí
  feePercent: number; // Phí đổi (%)
  feeAmount: number; // Số tiền phí
  totalReceived: number; // Tổng tiền nhận (sau khi trừ phí)
  date: string;
  createdBy?: string; // Người tạo giao dịch
  customerName?: string; // Tên khách hàng (tùy chọn)
  note?: string; // Ghi chú
  status?: ExchangeStatus; // Trạng thái giao dịch
  // Các trường mới
  exchangeAmount?: number; // Số tiền đổi
  exchangerName?: string; // Người đổi
  contactName?: string; // Tên liên hệ
  phoneNumber?: string; // Số điện thoại
  socialLink?: string; // Link facebook hoặc mạng xã hội
  receiveTime?: string; // Thời gian muốn nhận
  address?: string; // Địa chỉ
}

export interface Capital {
  id: string;
  amount: number;
  date: string;
  time: string; // Thời gian chính xác (giờ:phút:giây)
  note?: string;
  addedBy: string; // Username người thêm
}

export interface DenominationConfig {
  value: number; // Mệnh giá (20000, 50000, 100000)
  label: string; // Nhãn hiển thị (20k, 50k, 100k)
  enabled: boolean; // Có được sử dụng không
}

export interface ExchangeConfig {
  feePercent: number; // Phí đổi mặc định (%)
  denominations: DenominationConfig[]; // Danh sách mệnh giá
}

export interface AppData {
  accounts: Account[];
  exchanges: ExchangeData[];
  capitals: Capital[];
  exchangeConfig: ExchangeConfig; // Cấu hình đổi tiền
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
}

export interface ExchangeFormData {
  denomination: number;
  fromAmount: string;
  feePercent: string;
  customerName: string;
  note: string;
}

export interface FormErrors {
  fromAmount?: string;
  feePercent?: string;
}

