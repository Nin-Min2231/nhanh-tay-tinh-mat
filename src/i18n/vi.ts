// Toàn bộ chuỗi giao diện nằm ở đây (CLAUDE.md mục 5, quy tắc 16).
import type { GameId } from '../games/levels';

interface GameText {
  name: string;
  hint: string;
  /** Các dòng chỉ số hiện ở màn Kết quả. */
  lines?: (m: Record<string, number>) => string[];
}

/** Số giây có 1 chữ số thập phân, dấu phẩy kiểu Việt: 32,5 */
const sec1 = (ms: number) => (Math.round(ms / 100) / 10).toString().replace('.', ',');
/** Số giây có 2 chữ số thập phân: 0,52 */
const sec2 = (ms: number) => (Math.round(ms / 10) / 100).toString().replace('.', ',');

export const vi = {
  app: {
    title: 'Nhanh Tay Tinh Mắt',
    tagline: 'Chơi vui – Tập trung giỏi!',
    mascot: 'Sóc Bo',
  },
  common: {
    back: 'Quay lại',
    save: 'Lưu',
    start: 'Bắt đầu',
    playAgain: 'Chơi lại',
    goHome: 'Về nhà',
    next: 'Tiếp tục',
    comingSoon: 'Sắp có',
    locked: 'Đã khóa',
    stars: (n: number) => `${n} sao`,
    level: (n: number) => `Cấp ${n}`,
  },
  banner: {
    storage: 'Máy không lưu được tiến độ. Nhờ ba mẹ kiểm tra giúp nhé!',
  },
  toast: {
    exitHint: 'Bấm lần nữa để thoát',
  },
  viewport: {
    tooSmall: 'Mở toàn màn hình để chơi',
    tooSmallHint: 'Cửa sổ đang quá nhỏ. Hãy phóng to ra nhé!',
  },
  profiles: {
    selectTitle: 'Ai đang chơi nào?',
    addNew: 'Thêm bạn mới',
    newTitle: 'Tạo hồ sơ cho bé',
    nameLabel: 'Tên của con',
    namePlaceholder: 'Nhập tên',
    avatarLabel: 'Chọn hình đại diện',
    gradeLabel: 'Con học lớp mấy?',
    grade: (n: number) => `Lớp ${n}`,
    submit: 'Lưu và vào chơi',
    maxReached: 'Đã đủ 5 bạn rồi',
  },
  avatars: {
    cat: 'Mèo',
    dog: 'Chó',
    bunny: 'Thỏ',
    bear: 'Gấu',
    panda: 'Gấu trúc',
    fox: 'Cáo',
    frog: 'Ếch',
    lion: 'Sư tử',
    owl: 'Cú',
    pig: 'Heo',
    penguin: 'Chim cánh cụt',
    koala: 'Koala',
  } as Record<string, string>,
  home: {
    greeting: (name: string) => `Chào ${name}!`,
    missionsTitle: 'Nhiệm vụ hôm nay',
    missions: {
      reflex: 'Phản xạ',
      focus: 'Tập trung',
      learn: 'Học mà chơi',
    },
    groups: {
      reflex: 'Phản xạ',
      focus: 'Tập trung & Trí nhớ',
      learn: 'Học mà chơi',
    },
    timeLeft: (minutes: number) => `Còn ${minutes} phút`,
    timeLeftLabel: 'Thời gian chơi hôm nay',
    totalStars: (n: number) => `${n} sao`,
    switchPlayer: 'Đổi người chơi',
    album: 'Album',
    parent: 'Phụ huynh',
    outOfTime: 'Hôm nay con đã chơi đủ rồi!',
    goRest: 'Đến góc nghỉ',
    bestStars: (n: number) => `Sao tốt nhất: ${n}`,
    updateAvailable: 'Có bản mới – Cập nhật',
  },
  games: {
    G1: {
      name: 'Bóng Xanh – Bóng Đỏ',
      hint: 'Chạm bóng xanh thật nhanh! Bóng đỏ thì đừng chạm nhé.',
      lines: (m: Record<string, number>) => [
        `Con chạm được ${m.hits ?? 0} bóng xanh!`,
        ...((m.rtMeanMs ?? 0) > 0 ? [`Phản xạ trung bình: ${sec2(m.rtMeanMs ?? 0)} giây`] : []),
      ],
    },
    G2: {
      name: 'Bảng Số Thần Kỳ',
      hint: 'Chạm các số theo thứ tự từ nhỏ đến lớn.',
      lines: (m: Record<string, number>) => [
        `Con tìm xong trong ${sec1((m.timeSec ?? 0) * 1000)} giây!`,
      ],
    },
    G3: {
      name: 'Đuổi Bắt Thú Cưng',
      hint: 'Chạm bạn thú cưng đang chạy! Đừng đánh thức bạn Nhím.',
      lines: (m: Record<string, number>) => [
        `Con bắt được ${m.hits ?? 0} bạn thú!`,
        ...((m.hitsPerMin ?? 0) > 0 ? [`Mỗi phút con bắt được ${m.hitsPerMin} bạn`] : []),
      ],
    },
    G4: {
      name: 'Chuỗi Ánh Sáng',
      hint: 'Nhìn các ô sáng lên, rồi chạm lại đúng thứ tự.',
      lines: (m: Record<string, number>) => [
        `Con nhớ được chuỗi dài ${m.maxSpan ?? 0} ô!`,
        `Con lặp lại đúng ${m.correctSequences ?? 0} chuỗi`,
      ],
    },
    G5: {
      name: 'Nốt Nhạc Rơi',
      hint: 'Chạm nốt nhạc khi nó chạm vạch nhé!',
      lines: (m: Record<string, number>) => [
        `Chạm đúng nhịp: ${Math.round((m.perfectPct ?? 0) + (m.goodPct ?? 0))}% số nốt`,
        `Chuỗi liên tiếp dài nhất: ${m.maxCombo ?? 0} nốt`,
      ],
    },
    G6: { name: 'Hái Táo Tính Nhẩm', hint: 'Hái quả táo có đáp án đúng!' },
    G7: { name: 'Tìm Quy Luật', hint: 'Tìm hình tiếp theo của quy luật.' },
  } as Record<GameId, GameText>,
  g3: {
    cheer: 'Hú!',
    decoyHint: 'Shh! Bạn Nhím đang ngủ nhé.',
  },
  g4: {
    watch: 'Nhìn nhé!',
    yourTurn: 'Đến lượt con!',
    length: (n: number) => `Chuỗi: ${n}`,
    retry: 'Thử lại nhé!',
    nudge: 'Đến lượt con rồi nhé!',
    nice: 'Giỏi quá!',
  },
  g5: {
    perfect: 'Tuyệt!',
    good: 'Tốt!',
    combo: (n: number) => `x${n}`,
  },
  g2: {
    findNumber: 'Tìm số:',
    progress: (done: number, total: number) => `${done}/${total}`,
  },
  encourage: ['Gần đúng rồi!', 'Bình tĩnh nhé!', 'Cố lên nào!', 'Thử lại nhé!', 'Con làm được mà!'],
  intro: {
    chooseLevel: 'Con muốn chơi thế nào?',
    easy: 'Dễ',
    normal: 'Vừa',
    auto: 'Tự động',
    hard: 'Khó',
    replay: 'Xem lại hướng dẫn',
  },
  play: {
    pause: 'Tạm dừng',
    paused: 'Đã tạm dừng',
    resume: 'Chơi tiếp',
    exit: 'Thoát',
    exitNote: 'Thoát thì lượt này sẽ không được tính nhé.',
    warn2min: 'Còn 2 phút nữa thôi nhé!',
    timeUp: 'Hết giờ rồi! Mình chơi nốt lượt này nhé.',
    countdownLabel: 'Chuẩn bị',
  },
  result: {
    title: 'Kết quả',
    starsEarned: (n: number) => `Con được ${n} sao!`,
    praise: {
      1: 'Con đã cố gắng rất tốt!',
      2: 'Giỏi quá, con tiến bộ rồi!',
      3: 'Tuyệt vời! Con thật siêu!',
    } as Record<number, string>,
    levelUp: 'Lên cấp!',
    levelUpDetail: (n: number) => `Bây giờ con ở cấp ${n}`,
  },
  rest: {
    title: 'Giờ nghỉ ngơi',
    message: 'Hôm nay con chơi giỏi lắm! Mình nghỉ một chút nhé.',
    tomorrow: 'Mai mình chơi tiếp nha!',
    activityTitle: 'Con thử làm gì nhé?',
    activities: [
      'Nhảy dây 2 phút',
      'Tung bắt bóng',
      'Xếp Lego',
      'Vẽ một bức tranh',
      'Giúp mẹ việc nhà',
    ],
  },
  wip: {
    title: 'Đang xây dựng',
    message: 'Phần này sắp có rồi, chờ một chút nhé!',
    album: 'Album sticker',
    parentGate: 'Khu phụ huynh',
    parent: 'Khu phụ huynh',
  },
  /** Bảng gỡ lỗi (?debug=1) – chỉ có khi chạy dev; giao diện phụ huynh thật làm ở TASK-07. */
  debug: {
    title: 'Gỡ lỗi (chỉ khi dev)',
    mode: 'Chế độ',
    modeAuto: 'Tự động',
    modeFixed: 'Cố định',
    level: 'Cấp',
    minLevel: 'Cấp thấp nhất',
    maxLevel: 'Cấp cao nhất',
    auto: 'tự động',
    colors: 'Số màu bóng',
    simultaneous: 'Bóng cùng lúc',
    grid: 'Cỡ bảng',
    order: 'Thứ tự',
    orderForward: 'Xuôi',
    orderBackward: 'Ngược',
    speed: 'Tốc độ',
    slow: 'Chậm',
    medium: 'Vừa',
    fast: 'Nhanh',
    decoys: 'Nhím ngủ',
    pads: 'Số ô',
    startLen: 'Độ dài bắt đầu',
    fall: 'Tốc độ rơi',
    doubles: 'Nốt đôi',
    hint: 'Gợi ý',
    on: 'Bật',
    off: 'Tắt',
    recent: (scores: number[]) =>
      scores.length === 0
        ? 'Điểm gần đây: chưa có'
        : `Điểm gần đây: ${scores.map((s) => s.toFixed(2)).join(', ')}`,
  },
} as const;
