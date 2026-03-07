export interface Review {
  id: string
  customerName: string
  customerAvatar?: string
  rating: number
  text: string
  serviceName: string
  serviceId: string
  date: string
  replied: boolean
  reply?: string
}

export const mockReviews: Review[] = [
  { id: 'r1', customerName: 'Liam Chen', rating: 5, text: 'Absolutely breathtaking experience! Our guide was incredibly knowledgeable and the Gobi Desert felt like another planet. Will definitely come back.', serviceName: 'Gobi Desert Adventure', serviceId: 's1', date: '2025-06-10', replied: true, reply: 'Thank you so much, Liam! It was a pleasure hosting you. Hope to see you again soon!' },
  { id: 'r2', customerName: 'Sofia Müller', rating: 5, text: 'Khövsgöl Lake is magical. The trek was perfectly paced and the camping under the stars was unforgettable. Highly recommend!', serviceName: 'Khövsgöl Lake Trek', serviceId: 's2', date: '2025-06-08', replied: false },
  { id: 'r3', customerName: 'James Park', rating: 4, text: 'Eagle hunting experience was unlike anything I\'ve ever done. The family was so welcoming. Only minor issue was the transport on day 2.', serviceName: 'Eagle Hunting Experience', serviceId: 's4', date: '2025-05-30', replied: true, reply: 'Thank you James! We\'ve addressed the transport issue for future guests.' },
  { id: 'r4', customerName: 'Emma Johnson', rating: 5, text: 'Perfect in every way. The desert sunrise was the most beautiful thing I\'ve ever seen. The food was surprisingly great too!', serviceName: 'Gobi Desert Adventure', serviceId: 's1', date: '2025-06-02', replied: false },
  { id: 'r5', customerName: 'Noah Williams', rating: 5, text: 'Three days felt like a lifetime of adventure. The lake is stunning and the guide made everything seamless. 10/10.', serviceName: 'Khövsgöl Lake Trek', serviceId: 's2', date: '2025-05-25', replied: false },
  { id: 'r6', customerName: 'Carlos Rivera', rating: 4, text: 'Incredible cultural immersion. The eagle hunters were fascinating. Wish we had more time with them.', serviceName: 'Eagle Hunting Experience', serviceId: 's4', date: '2025-06-14', replied: false },
]
