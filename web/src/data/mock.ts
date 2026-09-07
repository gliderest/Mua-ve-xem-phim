import type { Cinema, Comment, ContactMessage, Movie, Room, Showtime, User } from '@/types'

/* ============================================================
   CINÉRA — Mock data (prototype local, chưa có backend)
   Phase sau sẽ thay bằng Supabase thật.
   ============================================================ */

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', email: 'admin@cinera.vn', fullName: 'Quản trị viên CINÉRA', role: 'ADMIN' },
  { id: 'u2', username: 'minh', email: 'minh.nguyen@gmail.com', fullName: 'Nguyễn Văn Minh', role: 'USER' },
  { id: 'u3', username: 'lan', email: 'lan.pham@yahoo.com', fullName: 'Phạm Thu Lan', role: 'USER' },
  { id: 'u4', username: 'anh', email: 'anh.tran@outlook.com', fullName: 'Trần Quốc Anh', role: 'USER' },
]

export const MOCK_MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'Ánh Sáng Cuối Chân Trời',
    originalTitle: 'Light at the End of the Sky',
    description:
      'Một phim điện ảnh độc lập kể về hành trình tìm lại bản thân của một nhà quay phim trẻ giữa vùng cao nguyên mù sương. Ngôn ngữ hình ảnh được chăm chút từng khung hình, âm nhạc giao hưởng dẫn dắt cảm xúc xuyên suốt 2 tiếng.',
    durationMinutes: 128,
    genre: ['Drama', 'Adventure'],
    director: 'Lê Hồng Quân',
    cast: ['Minh Anh', 'Thu Hà', 'Quốc Bảo', 'Ngọc Dương'],
    releaseDate: '2026-08-21',
    language: 'Tiếng Việt (Phụ đề EN)',
    rated: 'T13',
    status: 'NOW_SHOWING',
    hue: 218,
    artIndex: 0,
    rating: 4.6,
    reviewCount: 312,
    slug: 'anh-sang-cuoi-chan-troi',
  },
  {
    id: 'm2',
    title: 'Người Gác Đêm',
    originalTitle: 'The Nightkeeper',
    description:
      'Khi thành phố chìm trong bóng tối, một người gác đêm già nhận ra những quy luật kỳ lạ của những kẻ mất tích vào ban đêm. Bộ phim kinh dị tâm lý với âm thanh ám ảnh và màn trình diễn đột phá.',
    durationMinutes: 112,
    genre: ['Horror', 'Mystery', 'Thriller'],
    director: 'Trần Vũ Long',
    cast: ['Hải Nam', 'Duy Khánh', 'Bảo Yến'],
    releaseDate: '2026-09-05',
    language: 'Tiếng Việt (Phụ đề EN)',
    rated: 'T18',
    status: 'NOW_SHOWING',
    hue: 8,
    artIndex: 1,
    rating: 4.2,
    reviewCount: 187,
    slug: 'nguoi-gac-dem',
  },
  {
    id: 'm3',
    title: 'Sài Gòn Trong Mưa',
    originalTitle: 'Saigon in the Rain',
    description:
      'Ba mảnh đời đan xen giữa những cơn mưa chợt đến của Sài Gòn. Một bộ phim đậm chất tự sự về tình người, về những ngã rẽ và những lời tạm biệt, được trau chuốt bởi tạo hình và bố cục tuyệt đẹp.',
    durationMinutes: 104,
    genre: ['Romance', 'Drama'],
    director: 'Nguyễn Thị Phương',
    cast: ['Linh Chi', 'Vũ Phong', 'Gia Huy'],
    releaseDate: '2026-08-28',
    language: 'Tiếng Việt',
    rated: 'T13',
    status: 'NOW_SHOWING',
    hue: 185,
    artIndex: 2,
    rating: 4.4,
    reviewCount: 256,
    slug: 'sai-gon-trong-mua',
  },
  {
    id: 'm4',
    title: 'Chuyến Bay Cuối',
    originalTitle: 'The Last Flight',
    description:
      'Một phi công già thực hiện chuyến bay cuối cùng trước khi nghỉ hưu, nhưng chuyến bay ấy mang theo một bí mật từ 30 năm trước. Phim hành động - chính kịch kịch tính, bối cảnh sân bay phục dựng công phu.',
    durationMinutes: 121,
    genre: ['Action', 'Drama'],
    director: 'Phạm Minh Đăng',
    cast: ['Công Lý', 'Mỹ Duyên', 'Khánh Huy'],
    releaseDate: '2026-07-15',
    language: 'Tiếng Việt (Phụ đề EN)',
    rated: 'T16',
    status: 'NOW_SHOWING',
    hue: 30,
    artIndex: 3,
    rating: 4.0,
    reviewCount: 143,
    slug: 'chuyen-bay-cuoi',
  },
{
    id: 'm5',
    title: 'Vùng Đất Bị Lãng Quên',
    originalTitle: 'The Forgotten Lands',
    description:
      'Kiệt tác khoa học viễn tưởng về một lục địa bí ẩn chỉ xuất hiện mỗi thập kỷ một lần. Kỹ xảo thị giác đẹp nghẹt thở cùng câu chuyện triết lý về ký ức loài người.',
    durationMinutes: 142,
    genre: ['Sci-Fi', 'Adventure', 'Fantasy'],
    director: 'Đỗ Văn Hùng',
    cast: ['Thanh Long', 'Phương Trinh', 'Đức Thịnh'],
    releaseDate: '2026-10-02',
    language: 'Tiếng Việt (Phụ đề EN)',
    rated: 'T13',
    status: 'COMING_SOON',
    hue: 260,
    artIndex: 4,
    rating: 4.8,
    reviewCount: 89,
    slug: 'vung-dat-bi-lang-quen',
  },
  {
    id: 'm6',
    title: 'Mùa Hoa Dại Nở',
    originalTitle: 'Season of Wildflowers',
    description:
      'Câu chuyện ấm áp về ngôi làng nhỏ ven sông, nơi mùa hoa dại nở cũng là mùa những giấc mơ được gieo xuống. Phim gia đình mang đến tiếng cười và nước mắt nhẹ nhàng.',
    durationMinutes: 96,
    genre: ['Family', 'Drama'],
    director: 'Võ Thanh Hòa',
    cast: ['Bé Nhím', 'Cao Minh', 'Hồng Nhung'],
    releaseDate: '2026-10-16',
    language: 'Tiếng Việt',
    rated: 'P',
    status: 'COMING_SOON',
    hue: 128,
    artIndex: 5,
    rating: 4.5,
    reviewCount: 45,
    slug: 'mua-hoa-dai-no',
  },
  {
    id: 'm7',
    title: 'Kẻ Đi Xuyên Đêm',
    originalTitle: 'The Midnight Runner',
    description:
      'Một nhân viên giao hàng ban đêm tình cờ trở thành nhân chứng của một vụ đánh cắp công nghệ cao. Phim hành động hồi hộp với những pha rượt đuổi được dàn dựng như một vũ điệu.',
    durationMinutes: 118,
    genre: ['Action', 'Thriller'],
    director: 'Lý Chí Thịnh',
    cast: ['John Nguyễn', 'Anna Lê', 'Bình Minh'],
    releaseDate: '2026-10-30',
    language: 'Tiếng Việt',
    rated: 'T16',
    status: 'COMING_SOON',
    hue: 340,
    artIndex: 6,
    rating: 0,
    reviewCount: 0,
    slug: 'ke-di-xuyen-dem',
  },
  {
    id: 'm8',
    title: 'Giao Thừa',
    originalTitle: 'New Year’s Eve',
    description:
      'Đúng đêm giao thừa, bốn gia đình xa lạ buộc phải ở lại cùng nhau trong một nhà ga đóng cửa. Phim hài - chính kịch đoàn tụ đầy nhân văn, khép lại năm cũ và mở ra hy vọng mới.',
    durationMinutes: 108,
    genre: ['Comedy', 'Drama'],
    director: 'Ngô Quốc Bảo',
    cast: ['Xuân Mai', 'Quốc Khanh', 'Thuý Vy'],
    releaseDate: '2026-12-20',
    language: 'Tiếng Việt',
    rated: 'T13',
    status: 'COMING_SOON',
    hue: 45,
    artIndex: 7,
    rating: 0,
    reviewCount: 0,
    slug: 'giao-thua',
  },
]

export const MOCK_CINEMAS: Cinema[] = [
  {
    id: 'c1',
    name: 'CINÉRA Landmark 81',
    address: 'Tầng 68, Vinhomes Landmark 81, Bình Thạnh, TP.HCM',
    description: 'Phòng chiếu cao nhất Việt Nam, hệ thống âm thanh Dolby Atmos thế hệ mới.',
    rooms: 6,
    district: 'Bình Thạnh',
  },
  {
    id: 'c2',
    name: 'CINÉRA Royal Center',
    address: '30 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    description: 'Rạp cổ điển hoài cổ được cải tạo, ghế bành bọc da thật, banner nghệ thuật.',
    rooms: 4,
    district: 'Hoàn Kiếm',
  },
  {
    id: 'c3',
    name: 'CINÉRA The Riviera',
    address: 'Lầu 3, The Riviera Point, 36 Nguyễn Hữu Thọ, Q.7, TP.HCM',
    description: 'Phòng VIP với ghế massage, lounge riêng trước giờ chiếu.',
    rooms: 5,
    district: 'Quận 7',
  },
]

export const MOCK_ROOMS: Room[] = [
  { id: 'r1', cinemaId: 'c1', name: 'Screen 1 — IMAX', rows: 10, cols: 14 },
  { id: 'r2', cinemaId: 'c1', name: 'Screen 2 — Dolby Atmos', rows: 9, cols: 12 },
  { id: 'r3', cinemaId: 'c2', name: 'Screen 1 — Classic', rows: 10, cols: 12 },
  { id: 'r4', cinemaId: 'c3', name: 'Screen 1 — VIP', rows: 8, cols: 10 },
]
const addDays = (days: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const at = (date: string, hour: number, minute = 0): string => {
  // setHours(24, 7) sẽ tự cuộn sang 00:07 ngày hôm sau — tránh "Invalid time value"
  const d = new Date(`${date}T00:00:00`)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const MOCK_SHOWTIMES: Showtime[] = [
  { id: 'st1', movieId: 'm1', cinemaId: 'c1', roomId: 'r1', date: addDays(0), startTime: at(addDays(0), 10, 30), endTime: at(addDays(0), 12, 38), priceStandard: 90000, priceVip: 120000 },
  { id: 'st2', movieId: 'm1', cinemaId: 'c1', roomId: 'r2', date: addDays(0), startTime: at(addDays(0), 14, 0), endTime: at(addDays(0), 16, 8), priceStandard: 80000, priceVip: 110000 },
  { id: 'st3', movieId: 'm1', cinemaId: 'c2', roomId: 'r3', date: addDays(0), startTime: at(addDays(0), 19, 30), endTime: at(addDays(0), 21, 38), priceStandard: 85000, priceVip: 115000 },
  { id: 'st4', movieId: 'm1', cinemaId: 'c3', roomId: 'r4', date: addDays(1), startTime: at(addDays(1), 20, 0), endTime: at(addDays(1), 22, 8), priceStandard: 150000, priceVip: 190000 },
  { id: 'st5', movieId: 'm2', cinemaId: 'c1', roomId: 'r2', date: addDays(0), startTime: at(addDays(0), 22, 15), endTime: at(addDays(0), 24, 7), priceStandard: 80000, priceVip: 110000 },
  { id: 'st6', movieId: 'm2', cinemaId: 'c1', roomId: 'r1', date: addDays(1), startTime: at(addDays(1), 11, 0), endTime: at(addDays(1), 12, 52), priceStandard: 90000, priceVip: 120000 },
  { id: 'st7', movieId: 'm3', cinemaId: 'c2', roomId: 'r3', date: addDays(0), startTime: at(addDays(0), 16, 30), endTime: at(addDays(0), 18, 14), priceStandard: 75000, priceVip: 105000 },
  { id: 'st8', movieId: 'm3', cinemaId: 'c3', roomId: 'r4', date: addDays(1), startTime: at(addDays(1), 18, 30), endTime: at(addDays(1), 20, 14), priceStandard: 140000, priceVip: 180000 },
  { id: 'st9', movieId: 'm4', cinemaId: 'c1', roomId: 'r1', date: addDays(1), startTime: at(addDays(1), 13, 30), endTime: at(addDays(1), 15, 31), priceStandard: 90000, priceVip: 120000 },
  { id: 'st10', movieId: 'm5', cinemaId: 'c1', roomId: 'r2', date: addDays(2), startTime: at(addDays(2), 19, 45), endTime: at(addDays(2), 22, 7), priceStandard: 80000, priceVip: 110000 },
]

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  m1: [
    { id: 'cm1', movieId: 'm1', userId: 'u2', name: 'Nguyễn Văn Minh', email: 'minh.nguyen@gmail.com', content: 'Phim quá đẹp! Từng khung hình như một bức tranh. Đáng đồng tiền bát gạo nhất năm.', rating: 5, createdAt: '2026-08-25T10:00:00Z' },
    { id: 'cm2', movieId: 'm1', name: 'Hồng Vân', email: 'hongvan@example.com', content: 'Nhạc phim rất hay, mình khóc gần nửa bộ phim. Diễn viên chính xuất sắc.', rating: 4, createdAt: '2026-08-26T08:30:00Z' },
    { id: 'cm3', movieId: 'm1', name: 'Duy Phong', email: 'duyphong@example.com', content: 'Được xem trên màn hình IMAX CINÉRA Landmark 81, trải nghiệm khó quên.', rating: 5, createdAt: '2026-08-27T19:15:00Z' },
  ],
  m2: [
    { id: 'cm4', movieId: 'm2', name: 'Kim Ngân', email: 'kimngan@example.com', content: 'Ám ảnh mà không rẻ tiền. Cốt truyện xoắn não, phải xem lại lần hai mới hết các chi tiết.', rating: 4, createdAt: '2026-09-06T09:00:00Z' },
  ],
  m3: [
    { id: 'cm5', movieId: 'm3', name: 'Thanh Tú', email: 'thanhtu@example.com', content: 'Sài Gòn đẹp quá đi. Cảm xúc dạt dào, một bộ phim nên xem cùng người thương.', rating: 5, createdAt: '2026-08-30T17:45:00Z' },
  ],
}

export const MOCK_CONTACT_MESSAGES: ContactMessage[] = [
  { id: 'msg1', name: 'Mai Anh', email: 'maianh@gmail.com', message: 'Tôi muốn hỏi về chính sách đổi soát vé khi phim bị hủy chiếu.', status: 'NEW', createdAt: '2026-09-05T09:12:00Z' },
  { id: 'msg2', name: 'Đức Huy', email: 'duchuy@gmail.com', message: 'Rạp Landmark 81 có chỗ gửi xe máy không? Tối cuối tuần có đông không ạ?', status: 'READ', createdAt: '2026-09-04T22:40:00Z' },
]

export const MOCK_AD = {
  id: 'ad1',
  title: 'Đêm Sân Khấu Đặc Biệt',
  description: 'Suất chiếu đặc biệt đêm 31/12: phim CINÉRA chọn lọc, bắn pháo hoa sau giờ chiếu tại Landmark 81.',
  cta: 'Đặt vé ngay',
  hue: 300,
}

/** Sinh mã đặt vé có prefix CINÉRA (theo kiến trúc #13) */
export const generateBookingCode = (): string => {
  const seq = Math.floor(10000 + Math.random() * 90000)
  return `CINÉRA${seq}`
}

export const formatVND = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)