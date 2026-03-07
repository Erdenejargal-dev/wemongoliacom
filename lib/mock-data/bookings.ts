export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded' | 'partial'

export interface Booking {
  id: string
  customerName: string
  customerEmail: string
  customerAvatar?: string
  serviceId: string
  serviceName: string
  date: string
  guests: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  amount: number
  createdAt: string
}

export const mockBookings: Booking[] = [
  { id: 'b001', customerName: 'Liam Chen', customerEmail: 'liam@email.com', serviceId: 's1', serviceName: 'Gobi Desert Adventure', date: '2025-07-15', guests: 2, status: 'confirmed', paymentStatus: 'paid', amount: 900, createdAt: '2025-06-01' },
  { id: 'b002', customerName: 'Sofia Müller', customerEmail: 'sofia@email.com', serviceId: 's2', serviceName: 'Khövsgöl Lake Trek', date: '2025-07-22', guests: 4, status: 'confirmed', paymentStatus: 'paid', amount: 1280, createdAt: '2025-06-03' },
  { id: 'b003', customerName: 'James Park', customerEmail: 'james@email.com', serviceId: 's4', serviceName: 'Eagle Hunting Experience', date: '2025-08-01', guests: 1, status: 'pending', paymentStatus: 'unpaid', amount: 550, createdAt: '2025-06-10' },
  { id: 'b004', customerName: 'Emma Johnson', customerEmail: 'emma@email.com', serviceId: 's1', serviceName: 'Gobi Desert Adventure', date: '2025-07-20', guests: 3, status: 'confirmed', paymentStatus: 'partial', amount: 1350, createdAt: '2025-06-05' },
  { id: 'b005', customerName: 'Arjun Patel', customerEmail: 'arjun@email.com', serviceId: 's3', serviceName: 'Naadam Festival Tour', date: '2025-07-11', guests: 2, status: 'cancelled', paymentStatus: 'refunded', amount: 560, createdAt: '2025-05-28' },
  { id: 'b006', customerName: 'Mia Nakamura', customerEmail: 'mia@email.com', serviceId: 's2', serviceName: 'Khövsgöl Lake Trek', date: '2025-08-10', guests: 2, status: 'pending', paymentStatus: 'unpaid', amount: 640, createdAt: '2025-06-12' },
  { id: 'b007', customerName: 'Carlos Rivera', customerEmail: 'carlos@email.com', serviceId: 's4', serviceName: 'Eagle Hunting Experience', date: '2025-08-18', guests: 2, status: 'confirmed', paymentStatus: 'paid', amount: 1100, createdAt: '2025-06-08' },
  { id: 'b008', customerName: 'Aisha Okonkwo', customerEmail: 'aisha@email.com', serviceId: 's1', serviceName: 'Gobi Desert Adventure', date: '2025-09-05', guests: 1, status: 'confirmed', paymentStatus: 'paid', amount: 450, createdAt: '2025-06-15' },
  { id: 'b009', customerName: 'Noah Williams', customerEmail: 'noah@email.com', serviceId: 's2', serviceName: 'Khövsgöl Lake Trek', date: '2025-07-28', guests: 3, status: 'completed', paymentStatus: 'paid', amount: 960, createdAt: '2025-05-20' },
  { id: 'b010', customerName: 'Zara Ahmed', customerEmail: 'zara@email.com', serviceId: 's1', serviceName: 'Gobi Desert Adventure', date: '2025-09-15', guests: 2, status: 'pending', paymentStatus: 'unpaid', amount: 900, createdAt: '2025-06-18' },
]
