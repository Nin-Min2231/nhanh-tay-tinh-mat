// Hình thú cưng tự thiết kế, vẽ bằng canvas (không dùng ảnh/nhân vật có bản quyền).
// Mỗi con vẽ trong khung 200×200: chuyển sắc, vệt sáng, mắt bóng, má hồng, viền mềm.
// Vẽ 1 lần vào sprite (canvas ẩn) rồi chỉ drawImage mỗi khung hình → nhanh và không tạo object mới.
import type { PetKind } from './config';

type C = CanvasRenderingContext2D;
type Stops = readonly (readonly [number, string])[];

export type SpriteKind = PetKind | 'hedgehog';
export const DESIGN = 200;
/** Nội dung được thu về 90% để không bị cắt ở mép (tai thỏ, chuông mèo, gai nhím). */
const FIT = 0.9;
/** Thân (đầu) chiếm khoảng 124/200 × 0,9 khung sprite → sprite ≈ 1,8 × đường kính thân. */
export const SPRITE_SCALE = 1.8;
/** Tâm thân nằm ở khoảng 58% chiều cao sprite (tính từ trên). */
export const SPRITE_CENTER_Y = 0.58;

const TAU = Math.PI * 2;
const OUTLINE = 'rgba(70, 36, 20, 0.55)';

function rg(c: C, x: number, y: number, r: number, stops: Stops, fx = x, fy = y): CanvasGradient {
  const g = c.createRadialGradient(fx, fy, 0, x, y, r);
  for (const [o, col] of stops) g.addColorStop(o, col);
  return g;
}

function lg(c: C, x0: number, y0: number, x1: number, y1: number, stops: Stops): CanvasGradient {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  for (const [o, col] of stops) g.addColorStop(o, col);
  return g;
}

interface EllOpts {
  stroke?: string;
  lw?: number;
  rot?: number;
}

function ell(
  c: C,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string | CanvasGradient,
  o: EllOpts = {},
): void {
  c.beginPath();
  c.ellipse(x, y, rx, ry, o.rot ?? 0, 0, TAU);
  c.fillStyle = fill;
  c.fill();
  if (o.stroke) {
    c.lineWidth = o.lw ?? 3;
    c.strokeStyle = o.stroke;
    c.stroke();
  }
}

function fillPath(c: C, fill: string | CanvasGradient, stroke?: string, lw = 3): void {
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.lineWidth = lw;
    c.lineJoin = 'round';
    c.strokeStyle = stroke;
    c.stroke();
  }
}

function line(c: C, pts: readonly (readonly [number, number])[], color: string, lw: number): void {
  c.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? c.moveTo(x, y) : c.lineTo(x, y)));
  c.lineWidth = lw;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.strokeStyle = color;
  c.stroke();
}

/** Mắt bóng: viền tối, mống mắt chuyển sắc, đồng tử, 2 vệt sáng. */
function glossyEye(c: C, x: number, y: number, r: number, iris: string, irisDark: string): void {
  ell(c, x, y, r, r * 1.12, '#17141f');
  ell(
    c,
    x,
    y + r * 0.1,
    r * 0.82,
    r * 0.93,
    rg(c, x, y + r * 0.3, r * 0.9, [
      [0, '#fff3c4'],
      [0.45, iris],
      [1, irisDark],
    ]),
  );
  ell(c, x, y + r * 0.08, r * 0.42, r * 0.52, '#0b0a10');
  ell(c, x + r * 0.33, y - r * 0.38, r * 0.3, r * 0.3, '#ffffff');
  ell(c, x - r * 0.3, y + r * 0.36, r * 0.13, r * 0.13, 'rgba(255,255,255,0.85)');
}

/** Mắt cười ^ ^ khi vui (“hú”). */
function happyEye(c: C, x: number, y: number, r: number): void {
  c.beginPath();
  c.arc(x, y + r * 0.35, r * 0.9, Math.PI * 1.12, Math.PI * 1.88);
  c.lineWidth = r * 0.5;
  c.lineCap = 'round';
  c.strokeStyle = '#2b1a14';
  c.stroke();
}

function eyes(
  c: C,
  cheer: boolean,
  x1: number,
  x2: number,
  y: number,
  r: number,
  iris: string,
  dark: string,
): void {
  if (cheer) {
    happyEye(c, x1, y, r);
    happyEye(c, x2, y, r);
  } else {
    glossyEye(c, x1, y, r, iris, dark);
    glossyEye(c, x2, y, r, iris, dark);
  }
}

/** Miệng há to với lưỡi hồng (khi “hú”). */
function openMouth(c: C, x: number, y: number, w: number, h: number): void {
  c.beginPath();
  c.moveTo(x - w, y);
  c.quadraticCurveTo(x, y + h * 1.7, x + w, y);
  c.quadraticCurveTo(x, y + h * 0.25, x - w, y);
  c.closePath();
  fillPath(
    c,
    lg(c, x, y, x, y + h, [
      [0, '#8e1b33'],
      [1, '#c2304f'],
    ]),
    '#4b1220',
    2.5,
  );
  c.save();
  c.clip();
  ell(c, x, y + h * 1.05, w * 0.55, h * 0.55, '#ff8fa3');
  c.restore();
}

function blush(c: C, x: number, y: number, rx: number, ry: number): void {
  ell(
    c,
    x,
    y,
    rx,
    ry,
    rg(c, x, y, rx, [
      [0, 'rgba(255,105,140,0.62)'],
      [1, 'rgba(255,105,140,0)'],
    ]),
  );
}

function whiskers(c: C, x: number, y: number, dir: 1 | -1, color: string, len = 34): void {
  line(
    c,
    [
      [x, y],
      [x + dir * len, y - 7],
    ],
    color,
    2.2,
  );
  line(
    c,
    [
      [x, y + 6],
      [x + dir * (len + 4), y + 6],
    ],
    color,
    2.2,
  );
  line(
    c,
    [
      [x, y + 12],
      [x + dir * len, y + 19],
    ],
    color,
    2.2,
  );
}

function glossyNose(
  c: C,
  x: number,
  y: number,
  rx: number,
  ry: number,
  base: string,
  dark: string,
): void {
  ell(
    c,
    x,
    y,
    rx,
    ry,
    rg(
      c,
      x,
      y,
      rx * 1.3,
      [
        [0, base],
        [1, dark],
      ],
      x - rx * 0.3,
      y - ry * 0.4,
    ),
    { stroke: 'rgba(0,0,0,0.25)', lw: 1.5 },
  );
  ell(c, x - rx * 0.35, y - ry * 0.4, rx * 0.35, ry * 0.28, 'rgba(255,255,255,0.75)');
}

// ---------------------------------------------------------------- Thỏ
function drawRabbit(c: C, cheer: boolean): void {
  const fur: Stops = [
    [0, '#ffffff'],
    [0.55, '#f6f1fb'],
    [1, '#d6c9ea'],
  ];
  // ngực/lông cổ
  ell(c, 100, 176, 40, 20, rg(c, 100, 176, 44, fur), { stroke: '#c6b8de', lw: 2.5 });
  // tai dài (mặt ngoài trắng, trong hồng)
  for (const s of [-1, 1] as const) {
    const ex = 100 + s * 30;
    ell(
      c,
      ex,
      52,
      17,
      50,
      lg(c, ex - 17, 10, ex + 17, 90, [
        [0, '#ffffff'],
        [1, '#e2d6f0'],
      ]),
      { stroke: '#c6b8de', lw: 3, rot: s * 0.17 },
    );
    ell(
      c,
      ex + s * 1,
      56,
      9,
      38,
      lg(c, ex, 18, ex, 90, [
        [0, '#ffc3d6'],
        [1, '#ff93b4'],
      ]),
      { rot: s * 0.17 },
    );
  }
  // đầu
  ell(c, 100, 120, 64, 56, rg(c, 100, 120, 72, fur, 80, 92), { stroke: '#c6b8de', lw: 3 });
  blush(c, 58, 138, 17, 11);
  blush(c, 142, 138, 17, 11);
  // mõm
  ell(
    c,
    100,
    140,
    24,
    17,
    rg(c, 100, 140, 26, [
      [0, '#ffffff'],
      [1, '#efe6f7'],
    ]),
  );
  eyes(c, cheer, 74, 126, 112, 12, '#c98a4a', '#5a3216');
  // mũi + miệng
  ell(
    c,
    100,
    128,
    8.5,
    6.2,
    rg(
      c,
      100,
      128,
      10,
      [
        [0, '#ffb0c8'],
        [1, '#e0608a'],
      ],
      97,
      125,
    ),
    { stroke: 'rgba(120,30,60,0.35)', lw: 1.5 },
  );
  ell(c, 97, 126, 3, 2, 'rgba(255,255,255,0.8)');
  if (cheer) {
    openMouth(c, 100, 141, 12, 9);
  } else {
    line(
      c,
      [
        [100, 134],
        [100, 141],
      ],
      '#b06a85',
      2.5,
    );
    c.beginPath();
    c.moveTo(100, 141);
    c.quadraticCurveTo(92, 150, 84, 142);
    c.moveTo(100, 141);
    c.quadraticCurveTo(108, 150, 116, 142);
    c.lineWidth = 2.5;
    c.strokeStyle = '#b06a85';
    c.stroke();
    // răng cửa
    c.beginPath();
    c.roundRect(94.5, 144, 11, 12, 3);
    fillPath(c, '#ffffff', '#d4c4dc', 1.6);
    line(
      c,
      [
        [100, 144],
        [100, 156],
      ],
      '#d4c4dc',
      1.2,
    );
  }
  whiskers(c, 66, 140, -1, 'rgba(190,176,215,0.9)', 30);
  whiskers(c, 134, 140, 1, 'rgba(190,176,215,0.9)', 30);
}

// ---------------------------------------------------------------- Mèo
function drawCat(c: C, cheer: boolean): void {
  const orange: Stops = [
    [0, '#ffd08a'],
    [0.4, '#ffa03f'],
    [1, '#e06f16'],
  ];
  // thân/ngực
  ell(c, 100, 178, 52, 22, rg(c, 100, 178, 56, orange), { stroke: OUTLINE, lw: 3 });
  ell(c, 100, 184, 26, 14, 'rgba(255,255,255,0.75)');
  // tai
  for (const s of [-1, 1] as const) {
    c.beginPath();
    c.moveTo(100 + s * 56, 96);
    c.lineTo(100 + s * 48, 26);
    c.quadraticCurveTo(100 + s * 46, 20, 100 + s * 40, 24);
    c.lineTo(100 + s * 6, 64);
    c.closePath();
    fillPath(
      c,
      lg(c, 100 + s * 56, 24, 100 + s * 20, 90, [
        [0, '#ffb25a'],
        [1, '#e8761c'],
      ]),
      OUTLINE,
      3,
    );
    c.beginPath();
    c.moveTo(100 + s * 46, 86);
    c.lineTo(100 + s * 42, 42);
    c.lineTo(100 + s * 16, 68);
    c.closePath();
    fillPath(
      c,
      lg(c, 100 + s * 44, 40, 100 + s * 24, 86, [
        [0, '#ffc5d3'],
        [1, '#ff8fae'],
      ]),
    );
  }
  // đầu
  ell(c, 100, 120, 68, 58, rg(c, 100, 120, 76, orange, 78, 88), { stroke: OUTLINE, lw: 3 });
  // vằn trán + má
  const stripe = '#c4561a';
  line(
    c,
    [
      [100, 66],
      [100, 86],
    ],
    stripe,
    6,
  );
  line(
    c,
    [
      [82, 70],
      [87, 86],
    ],
    stripe,
    5,
  );
  line(
    c,
    [
      [118, 70],
      [113, 86],
    ],
    stripe,
    5,
  );
  for (const s of [-1, 1] as const) {
    line(
      c,
      [
        [100 + s * 66, 112],
        [100 + s * 50, 116],
      ],
      stripe,
      5,
    );
    line(
      c,
      [
        [100 + s * 66, 128],
        [100 + s * 50, 128],
      ],
      stripe,
      5,
    );
  }
  // mõm trắng
  ell(
    c,
    100,
    144,
    30,
    21,
    rg(c, 100, 146, 32, [
      [0, '#ffffff'],
      [1, '#ffe6c9'],
    ]),
  );
  blush(c, 58, 138, 13, 9);
  blush(c, 142, 138, 13, 9);
  eyes(c, cheer, 72, 128, 112, 12.5, '#46c37b', '#136b3e');
  // mũi + miệng
  c.beginPath();
  c.moveTo(92, 130);
  c.quadraticCurveTo(100, 126, 108, 130);
  c.quadraticCurveTo(104, 140, 100, 141);
  c.quadraticCurveTo(96, 140, 92, 130);
  c.closePath();
  fillPath(
    c,
    lg(c, 100, 128, 100, 141, [
      [0, '#ffa6bd'],
      [1, '#e2587f'],
    ]),
    'rgba(120,30,60,0.4)',
    1.6,
  );
  if (cheer) {
    openMouth(c, 100, 146, 10, 7);
  } else {
    c.beginPath();
    c.moveTo(100, 141);
    c.quadraticCurveTo(100, 148, 92, 150);
    c.moveTo(100, 141);
    c.quadraticCurveTo(100, 148, 108, 150);
    c.lineWidth = 2.4;
    c.strokeStyle = '#8a4a3a';
    c.lineCap = 'round';
    c.stroke();
  }
  whiskers(c, 70, 146, -1, 'rgba(255,255,255,0.95)', 42);
  whiskers(c, 130, 146, 1, 'rgba(255,255,255,0.95)', 42);
  // vòng cổ đỏ + chuông vàng
  c.beginPath();
  c.moveTo(60, 168);
  c.quadraticCurveTo(100, 192, 140, 168);
  c.lineTo(144, 178);
  c.quadraticCurveTo(100, 204, 56, 178);
  c.closePath();
  fillPath(
    c,
    lg(c, 100, 168, 100, 200, [
      [0, '#ff6b7e'],
      [1, '#c4223a'],
    ]),
    'rgba(90,10,30,0.5)',
    2.5,
  );
  ell(
    c,
    100,
    192,
    10,
    10,
    rg(
      c,
      100,
      192,
      12,
      [
        [0, '#fff4b0'],
        [0.6, '#ffc93d'],
        [1, '#c98a00'],
      ],
      96,
      188,
    ),
    { stroke: 'rgba(120,70,0,0.6)', lw: 2 },
  );
  line(
    c,
    [
      [91, 192],
      [109, 192],
    ],
    'rgba(120,70,0,0.6)',
    1.6,
  );
  ell(c, 100, 197, 2.2, 2.2, 'rgba(120,70,0,0.7)');
}

// ---------------------------------------------------------------- Cún
function drawDog(c: C, cheer: boolean): void {
  const gold: Stops = [
    [0, '#ffe0b0'],
    [0.45, '#f4ae55'],
    [1, '#c9782a'],
  ];
  // thân/ngực trắng
  ell(
    c,
    100,
    178,
    50,
    22,
    rg(c, 100, 178, 56, [
      [0, '#ffffff'],
      [1, '#f3dcb8'],
    ]),
    { stroke: OUTLINE, lw: 3 },
  );
  // tai cụp
  for (const s of [-1, 1] as const) {
    c.save();
    c.translate(100 + s * 62, 106);
    c.rotate(s * 0.34);
    ell(
      c,
      0,
      0,
      24,
      48,
      lg(c, -24, -40, 24, 50, [
        [0, '#c27a3a'],
        [1, '#6e3510'],
      ]),
      { stroke: 'rgba(50,20,5,0.6)', lw: 3 },
    );
    ell(c, -s * 6, -12, 8, 22, 'rgba(255,255,255,0.18)');
    c.restore();
  }
  // đầu
  ell(c, 100, 112, 62, 57, rg(c, 100, 112, 70, gold, 80, 84), { stroke: OUTLINE, lw: 3 });
  // vệt trắng giữa trán + mảng nâu quanh mắt
  c.beginPath();
  c.moveTo(100, 56);
  c.quadraticCurveTo(110, 90, 116, 130);
  c.lineTo(84, 130);
  c.quadraticCurveTo(90, 90, 100, 56);
  c.closePath();
  fillPath(c, 'rgba(255,255,255,0.55)');
  ell(c, 70, 100, 20, 19, 'rgba(122,62,18,0.5)', { rot: -0.3 });
  // mõm
  ell(
    c,
    100,
    140,
    35,
    26,
    rg(c, 100, 142, 38, [
      [0, '#fffaf0'],
      [1, '#f5d9a8'],
    ]),
    { stroke: 'rgba(120,70,20,0.35)', lw: 2 },
  );
  blush(c, 54, 132, 13, 9);
  blush(c, 146, 132, 13, 9);
  eyes(c, cheer, 74, 126, 102, 11.5, '#a05a1e', '#3b1d08');
  // lông mày
  ell(c, 74, 84, 4.5, 3.2, '#f6dcae');
  ell(c, 126, 84, 4.5, 3.2, '#f6dcae');
  glossyNose(c, 100, 124, 14, 10, '#5a5a6a', '#000000');
  line(
    c,
    [
      [100, 133],
      [100, 141],
    ],
    '#6a3a20',
    2.6,
  );
  if (cheer) {
    openMouth(c, 100, 142, 15, 9);
  } else {
    c.beginPath();
    c.moveTo(100, 141);
    c.quadraticCurveTo(88, 152, 76, 141);
    c.moveTo(100, 141);
    c.quadraticCurveTo(112, 152, 124, 141);
    c.lineWidth = 2.6;
    c.strokeStyle = '#6a3a20';
    c.lineCap = 'round';
    c.stroke();
    // lưỡi thè
    c.beginPath();
    c.moveTo(90, 148);
    c.quadraticCurveTo(100, 150, 110, 148);
    c.quadraticCurveTo(110, 170, 100, 170);
    c.quadraticCurveTo(90, 170, 90, 148);
    c.closePath();
    fillPath(
      c,
      lg(c, 100, 148, 100, 170, [
        [0, '#ff9db0'],
        [1, '#e0566f'],
      ]),
      'rgba(110,20,40,0.55)',
      2,
    );
    line(
      c,
      [
        [100, 150],
        [100, 164],
      ],
      'rgba(150,30,60,0.6)',
      1.6,
    );
  }
  // vòng cổ xanh + thẻ tên vàng
  c.beginPath();
  c.moveTo(62, 164);
  c.quadraticCurveTo(100, 188, 138, 164);
  c.lineTo(142, 174);
  c.quadraticCurveTo(100, 200, 58, 174);
  c.closePath();
  fillPath(
    c,
    lg(c, 100, 164, 100, 198, [
      [0, '#4fc3f7'],
      [1, '#1578c0'],
    ]),
    'rgba(10,40,90,0.5)',
    2.5,
  );
  ell(
    c,
    100,
    190,
    9,
    9,
    rg(
      c,
      100,
      190,
      11,
      [
        [0, '#fff4b0'],
        [0.6, '#ffc93d'],
        [1, '#c98a00'],
      ],
      96,
      186,
    ),
    { stroke: 'rgba(120,70,0,0.6)', lw: 2 },
  );
  c.beginPath();
  c.arc(100, 190, 3, 0, TAU);
  c.fillStyle = 'rgba(120,70,0,0.7)';
  c.fill();
}

// ---------------------------------------------------------------- Gà con
function drawChick(c: C, cheer: boolean): void {
  const fluff: Stops = [
    [0, '#fffbc8'],
    [0.5, '#ffe066'],
    [1, '#ffb52e'],
  ];
  // chân
  for (const x of [80, 120]) {
    line(
      c,
      [
        [x, 176],
        [x, 188],
      ],
      '#ff8a1e',
      5,
    );
    line(
      c,
      [
        [x - 10, 192],
        [x, 188],
        [x + 10, 192],
      ],
      '#ff8a1e',
      4.5,
    );
  }
  // cánh
  for (const s of [-1, 1] as const) {
    c.save();
    c.translate(100 + s * 66, 128);
    c.rotate(s * 0.45);
    ell(
      c,
      0,
      0,
      17,
      34,
      lg(c, -17, -30, 17, 30, [
        [0, '#ffe066'],
        [1, '#f19a12'],
      ]),
      { stroke: 'rgba(160,90,0,0.5)', lw: 3 },
    );
    c.restore();
  }
  // thân tròn
  ell(c, 100, 118, 72, 66, rg(c, 100, 118, 80, fluff, 78, 84), {
    stroke: 'rgba(160,90,0,0.5)',
    lw: 3,
  });
  ell(c, 100, 148, 42, 32, 'rgba(255,255,255,0.4)');
  // chỏm lông
  for (const [dx, dy, rot] of [
    [-9, 0, -0.5],
    [0, -6, 0],
    [10, -1, 0.5],
  ] as const) {
    c.save();
    c.translate(100 + dx, 52 + dy);
    c.rotate(rot);
    ell(
      c,
      0,
      0,
      5.5,
      14,
      lg(c, 0, -14, 0, 14, [
        [0, '#fff3a0'],
        [1, '#f5b31a'],
      ]),
      { stroke: 'rgba(160,90,0,0.45)', lw: 2 },
    );
    c.restore();
  }
  blush(c, 52, 128, 15, 10);
  blush(c, 148, 128, 15, 10);
  eyes(c, cheer, 74, 126, 100, 13, '#5a3a1a', '#0e0a06');
  // mỏ
  c.beginPath();
  c.moveTo(86, 114);
  c.quadraticCurveTo(100, 104, 114, 114);
  c.quadraticCurveTo(110, 130, 100, 132);
  c.quadraticCurveTo(90, 130, 86, 114);
  c.closePath();
  fillPath(
    c,
    lg(c, 100, 106, 100, 132, [
      [0, '#ffc15e'],
      [1, '#ff7a00'],
    ]),
    'rgba(150,60,0,0.6)',
    2.4,
  );
  if (cheer) {
    openMouth(c, 100, 126, 9, 8);
  } else {
    line(
      c,
      [
        [89, 122],
        [111, 122],
      ],
      'rgba(150,60,0,0.6)',
      1.8,
    );
    ell(c, 96, 112, 4, 2.2, 'rgba(255,255,255,0.7)');
  }
}

// ---------------------------------------------------------------- Nhím ngủ
function drawHedgehog(c: C): void {
  // gai: 2 lớp, tối ở trong – sáng ở ngoài
  const cx = 100;
  const cy = 124;
  const layers = [
    {
      n: 17,
      r0: 56,
      r1: 100,
      w: 0.17,
      c0: '#4a2e1c',
      c1: '#7a5236',
      a0: Math.PI * 1.02,
      a1: Math.PI * 1.98,
    },
    {
      n: 15,
      r0: 54,
      r1: 92,
      w: 0.19,
      c0: '#6a452c',
      c1: '#c79a6e',
      a0: Math.PI * 1.06,
      a1: Math.PI * 1.94,
    },
  ];
  for (const L of layers) {
    for (let i = 0; i < L.n; i++) {
      const a = L.a0 + ((L.a1 - L.a0) * (i + (L === layers[1] ? 0.5 : 0))) / L.n;
      const px = cx + Math.cos(a) * L.r0 * 1.25;
      const py = cy + Math.sin(a) * L.r0 * 0.95;
      const tx = cx + Math.cos(a) * L.r1 * 1.18;
      const ty = cy + Math.sin(a) * L.r1 * 0.98;
      const nx = -Math.sin(a) * 9;
      const ny = Math.cos(a) * 9;
      c.beginPath();
      c.moveTo(px - nx, py - ny);
      c.lineTo(tx, ty);
      c.lineTo(px + nx, py + ny);
      c.closePath();
      fillPath(
        c,
        lg(c, px, py, tx, ty, [
          [0, L.c0],
          [1, L.c1],
        ]),
        'rgba(40,20,10,0.5)',
        1.4,
      );
    }
  }
  // thân gai
  ell(
    c,
    cx,
    cy + 2,
    70,
    54,
    rg(
      c,
      cx,
      cy,
      76,
      [
        [0, '#9a6e4c'],
        [0.7, '#6a452c'],
        [1, '#4a2e1c'],
      ],
      80,
      100,
    ),
    { stroke: 'rgba(40,20,10,0.6)', lw: 3 },
  );
  // tai
  for (const s of [-1, 1] as const) {
    ell(
      c,
      cx + s * 40,
      98,
      11,
      14,
      rg(c, cx + s * 40, 98, 14, [
        [0, '#ffd7c2'],
        [1, '#e8a98c'],
      ]),
      { stroke: 'rgba(90,40,20,0.55)', lw: 2.5 },
    );
  }
  // mặt
  ell(
    c,
    cx,
    142,
    52,
    42,
    rg(
      c,
      cx,
      142,
      58,
      [
        [0, '#fff0da'],
        [0.6, '#f2cfa6'],
        [1, '#d9a678'],
      ],
      90,
      128,
    ),
    { stroke: 'rgba(110,60,30,0.5)', lw: 3 },
  );
  // mõm nhọn
  c.beginPath();
  c.moveTo(cx - 24, 138);
  c.quadraticCurveTo(cx, 128, cx + 24, 138);
  c.quadraticCurveTo(cx + 10, 176, cx, 178);
  c.quadraticCurveTo(cx - 10, 176, cx - 24, 138);
  c.closePath();
  fillPath(
    c,
    lg(c, cx, 130, cx, 178, [
      [0, '#fff6e6'],
      [1, '#e8bf94'],
    ]),
    'rgba(110,60,30,0.35)',
    2,
  );
  glossyNose(c, cx, 168, 8, 6.5, '#555566', '#000000');
  // mắt nhắm
  for (const s of [-1, 1] as const) {
    c.beginPath();
    c.moveTo(cx + s * 32 - 12, 134);
    c.quadraticCurveTo(cx + s * 32, 146, cx + s * 32 + 12, 134);
    c.lineWidth = 4.2;
    c.lineCap = 'round';
    c.strokeStyle = '#3b2a20';
    c.stroke();
    line(
      c,
      [
        [cx + s * 32 - 12, 134],
        [cx + s * 32 - 15, 131],
      ],
      '#3b2a20',
      2.2,
    );
  }
  blush(c, cx - 44, 152, 13, 9);
  blush(c, cx + 44, 152, 13, 9);
  // miệng cười nhỏ
  c.beginPath();
  c.moveTo(cx - 8, 177);
  c.quadraticCurveTo(cx, 183, cx + 8, 177);
  c.lineWidth = 2.2;
  c.strokeStyle = '#7a4a30';
  c.stroke();
  // bàn chân nhỏ
  ell(c, cx - 30, 184, 12, 7, '#e3b58a', { stroke: 'rgba(90,40,20,0.5)', lw: 2 });
  ell(c, cx + 30, 184, 12, 7, '#e3b58a', { stroke: 'rgba(90,40,20,0.5)', lw: 2 });
}

/** Vẽ 1 con vào khung 200×200 (gốc ở góc trên-trái). */
export function drawPet(c: C, kind: SpriteKind, cheer: boolean): void {
  switch (kind) {
    case 'rabbit':
      return drawRabbit(c, cheer);
    case 'cat':
      return drawCat(c, cheer);
    case 'dog':
      return drawDog(c, cheer);
    case 'chick':
      return drawChick(c, cheer);
    case 'hedgehog':
      return drawHedgehog(c);
  }
}

/** Sprite vuông cạnh `side` CSS px (độ phân giải ×dpr). */
export function renderSprite(
  kind: SpriteKind,
  cheer: boolean,
  side: number,
  dpr: number,
): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  const px = Math.max(8, Math.round(side * dpr));
  cv.width = px;
  cv.height = px;
  const c = cv.getContext('2d');
  if (!c) return cv;
  c.translate(px * ((1 - FIT) / 2), px * ((1 - FIT) / 2));
  c.scale((px / DESIGN) * FIT, (px / DESIGN) * FIT);
  drawPet(c, kind, cheer);
  return cv;
}
