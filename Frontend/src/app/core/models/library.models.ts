export interface LoginResponse {
  memberId: number;
  firstName: string;
  lastName: string;
  email: string;
  memberType: string;
  token: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface MemberRecord {
  memberId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipNumber: string;
  membershipDate: string;
  memberType: string;
  isActive: boolean;
}

export interface BookRecord {
  bookId: number;
  title: string;
  author: string;
  isbn: string;
  publicationDate: string;
  availableQuantity: number;
  totalQuantity: number;
  category: string;
  isAvailable: boolean;
}

export interface TransactionRecord {
  transactionId: number;
  bookId: number;
  memberId: number;
  bookTitle: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  fine: number;
  isDamaged: boolean;
  status: string;
}

export interface ReservationRecord {
  reservationId: number;
  bookId: number;
  memberId: number;
  bookTitle: string;
  memberName: string;
  reservationDate: string;
  reservationExpiryDate: string | null;
  status: string;
}

export interface AdminDashboardData {
  users: MemberRecord[];
  books: BookRecord[];
  transactions: TransactionRecord[];
  reservations: ReservationRecord[];
}
