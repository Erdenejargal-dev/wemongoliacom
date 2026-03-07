export interface MonthlyData {
  month: string
  bookings: number
  revenue: number
}

export interface ServicePerformance {
  name: string
  bookings: number
  revenue: number
  rating: number
}

export const monthlyData: MonthlyData[] = [
  { month: 'Jan', bookings: 12, revenue: 4800 },
  { month: 'Feb', bookings: 18, revenue: 7200 },
  { month: 'Mar', bookings: 24, revenue: 9600 },
  { month: 'Apr', bookings: 31, revenue: 12400 },
  { month: 'May', bookings: 42, revenue: 16800 },
  { month: 'Jun', bookings: 56, revenue: 22400 },
  { month: 'Jul', bookings: 78, revenue: 31200 },
  { month: 'Aug', bookings: 65, revenue: 26000 },
  { month: 'Sep', bookings: 49, revenue: 19600 },
  { month: 'Oct', bookings: 35, revenue: 14000 },
  { month: 'Nov', bookings: 22, revenue: 8800 },
  { month: 'Dec', bookings: 15, revenue: 6000 },
]

export const topServices: ServicePerformance[] = [
  { name: 'Gobi Desert Adventure', bookings: 87, revenue: 39150, rating: 4.8 },
  { name: 'Naadam Festival Tour', bookings: 130, revenue: 36400, rating: 4.7 },
  { name: 'Khövsgöl Lake Trek', bookings: 54, revenue: 17280, rating: 4.9 },
  { name: 'Eagle Hunting Experience', bookings: 32, revenue: 17600, rating: 5.0 },
]

export const summaryStats = {
  totalBookings: 303,
  monthlyRevenue: 22400,
  upcomingTours: 18,
  averageRating: 4.85,
  totalRevenue: 178800,
  pendingPayouts: 3200,
  platformFee: 8940,
}

export const payoutHistory = [
  { id: 'p1', date: '2025-06-01', amount: 4800, status: 'paid' as const },
  { id: 'p2', date: '2025-05-01', amount: 6200, status: 'paid' as const },
  { id: 'p3', date: '2025-04-01', amount: 5100, status: 'paid' as const },
  { id: 'p4', date: '2025-03-01', amount: 3900, status: 'paid' as const },
  { id: 'p5', date: '2025-07-01', amount: 3200, status: 'pending' as const },
]
