# CLAUDE.md – Dự án game “Nhanh Tay Tinh Mắt”

> File này là bộ nhớ dự án cho Claude Code. Đọc hết trước khi làm bất kỳ việc gì.
> Ngôn ngữ trao đổi với chủ dự án: **tiếng Việt**. Code, tên biến, commit message: tiếng Anh.
> Môi trường: chủ dự án dùng **Claude Code Desktop (tab Code) trên Windows**, phiên Local. Chủ dự án là PM, không phải lập trình viên:
> giải thích ngắn gọn, hướng dẫn từng bước khi cần thao tác (GitHub, điện thoại).

## 1. Dự án là gì

Web app dạng **PWA** (Progressive Web App – web cài lên màn hình chính như app, chạy offline) gồm **7 mini-game**
giúp bé 8 tuổi (Lớp 2) tăng **tập trung**, **phản xạ ngón tay**, **tính nhẩm** và **tư duy logic**.
Thiết bị mục tiêu: **điện thoại Android** và **máy tính bảng Samsung Galaxy Tab**, trình duyệt **Chrome** (Samsung Internet: hỗ trợ cơ bản).
**Không** hỗ trợ iPad/iPhone/Safari – không viết code riêng cho iOS. Host trên **GitHub Pages**.

| ID | Game | Nhóm |
|---|---|---|
| G1 | Bóng Xanh – Bóng Đỏ (Go/No-Go) | Phản xạ |
| G2 | Bảng Số Thần Kỳ (Schulte) | Tập trung & Trí nhớ |
| G3 | Đuổi Bắt Thú Cưng | Phản xạ |
| G4 | Chuỗi Ánh Sáng (Simon/Corsi) | Tập trung & Trí nhớ |
| G5 | Nốt Nhạc Rơi (rhythm tap) | Phản xạ |
| G6 | Hái Táo Tính Nhẩm (toán lớp 1–3) | Học mà chơi |
| G7 | Tìm Quy Luật (logic) | Học mà chơi |

Tài liệu chi tiết (nguồn sự thật – **source of truth**):

- `docs/01_SPEC.md` – màn hình, luồng, yêu cầu F/NF/UI, mô hình dữ liệu, độ khó, thưởng, khu phụ huynh, PWA
- `docs/02_GAMES.md` – luật chơi, chấm điểm, bảng 10 cấp độ của từng game
- `docs/data/levels.json` – bảng cấp độ dạng JSON (import trực tiếp vào code)
- `docs/03_TASKS.md` – thứ tự công việc TASK-00 → TASK-10
- `docs/04_ACCEPTANCE.md` – test case nghiệm thu
- `docs/PROGRESS.md` – nhật ký tiến độ (đọc đầu phiên, cập nhật cuối mỗi TASK)

Nếu tài liệu mâu thuẫn hoặc thiếu: **hỏi chủ dự án**, không tự đoán. Ghi câu hỏi vào `docs/PROGRESS.md` mục “Câu hỏi mở”.

## 2. Công nghệ (đã chốt – không tự đổi)

| Hạng mục | Lựa chọn |
|---|---|
| Build | Vite 5+, TypeScript `strict: true` |
| UI màn hình | Preact + `@preact/signals` (nhẹ, giống React) |
| Game động (G1, G3, G5) | Canvas 2D + `requestAnimationFrame`, scale theo `devicePixelRatio` |
| Game tĩnh (G2, G4, G6, G7) | DOM/SVG + CSS animation |
| PWA | `vite-plugin-pwa` (Workbox `generateSW`, `registerType: 'prompt'`) |
| Biểu đồ | Chart.js (đóng gói, tree-shake; **không** CDN) |
| Font | `@fontsource/nunito` (có tiếng Việt), đóng gói sẵn |
| Âm thanh | Web Audio API tự tổng hợp (không file nhạc bản quyền) |
| Lưu trữ | `localStorage` qua module `storage.ts` (try/catch, schema version, migration) |
| Test | Vitest (unit), Playwright Chromium (e2e – project `phone` 360×740, `tablet` 1280×800 ngang, `tablet-portrait` 800×1280; đều `hasTouch`) |
| Chất lượng | ESLint + Prettier |
| Deploy | GitHub Actions → GitHub Pages |

Không thêm thư viện mới ngoài danh sách trên nếu chưa hỏi chủ dự án (ngoại lệ: `cross-env`, `@playwright/test`, plugin ESLint/Prettier chuẩn).

**Windows**: mọi npm script phải chạy được trên Windows (PowerShell/Git Bash) – dùng `cross-env`, đường dẫn bằng `path.join`, không dùng lệnh chỉ có ở bash.
**Xem trước**: `.claude/launch.json` cấu hình `npm run dev` (cổng 5173) cho Browser pane của Claude Desktop.

## 3. Lệnh

```bash
npm install          # cài
npm run dev          # chạy local; thêm "-- --host" để mở bằng điện thoại/tablet cùng wifi
npm run build        # build production (dist/)
npm run preview      # xem bản build
npm run test         # Vitest
npm run test:e2e     # Playwright
npm run lint         # ESLint + tsc --noEmit
```

## 4. Cấu trúc thư mục (mục tiêu)

```
src/
  main.tsx                 # khởi động, đăng ký SW, mount App
  app/
    router.ts              # hash router: #/profiles #/home #/play/:gameId #/result #/album #/rest #/parent/...
    backButton.ts          # xử lý nút/cử chỉ Quay lại Android (NF10)
    store.ts               # state toàn cục (signals) + actions
    storage.ts             # đọc/ghi localStorage, migration, backup/restore
    session.ts             # đồng hồ thời gian chơi/ngày, tạm dừng, giới hạn
    adaptive.ts            # độ khó thích ứng (thuần, có test)
    scoring.ts             # tính sao (thuần, có test)
    rewards.ts             # nhiệm vụ, hộp quà, mở khóa (thuần + RNG seed, có test)
    rng.ts                 # RNG có seed (mulberry32) – dùng cho mọi random cần test
    audio.ts  haptics.ts   # âm thanh Web Audio; rung thật trên điện thoại + luôn kèm lắc hình (tablet Samsung không có mô-tơ rung)
    device.ts              # deviceId, deviceClass (phone/tablet)
  i18n/vi.ts               # TẤT CẢ chuỗi giao diện (không hard-code chuỗi trong component)
  ui/
    components/            # Button, BigCard, Modal, StarBurst, Confetti, Mascot (SVG), ProgressBar...
    screens/               # ProfileSelect, Home, GameIntro, Result, Album, Rest, ParentGate, parent/*
    theme.css              # biến màu, cỡ chữ, safe-area
  games/
    common/                # GameModule interface, CanvasStage, PointerInput, Countdown, PauseOverlay
    g1-balls/  g2-schulte/  g3-pets/  g4-lights/  g5-notes/  g6-math/  g7-patterns/
      index.ts             # export GameModule
      config.ts            # bảng cấp độ (lấy từ docs/data/levels.json)
      logic.ts             # logic thuần: sinh đề, chấm điểm (có test)
      view.ts(x)           # vẽ + nhận chạm
      logic.test.ts
public/icons/              # icon PWA 192, 512, maskable
.github/workflows/deploy.yml
```

## 5. Quy tắc bắt buộc (vi phạm = chưa xong)

**An toàn trẻ em & riêng tư**
1. Không quảng cáo, không mua hàng, không link ra ngoài, không analytics, không gửi dữ liệu ra mạng (không `fetch` tới domain ngoài).
2. Hộp quà chỉ nhận bằng nỗ lực/phụ huynh tặng; không có tiền tệ mua bằng tiền thật.
3. Phản hồi khi sai luôn nhẹ nhàng, không âm thanh chê, không trừ sao đã có.
4. Chỉ dùng hình/nhân vật/nhạc tự thiết kế; **không** vẽ nhân vật có bản quyền, không dùng giai điệu bài hát có sẵn.

**Thiết bị cảm ứng**
5. Dùng **Pointer Events** (`pointerdown`). Thời gian phản ứng = `event.timeStamp − onsetTime`, trong đó `onsetTime` là
   `performance.now()` ở frame kích thích được vẽ lần đầu. Không đo theo số frame.
6. Game G1–G4, G6, G7 chỉ nhận **chạm đầu tiên** (bỏ qua pointer khác khi đang có 1 pointer giữ). G5 nhận **đa điểm**.
7. Chạm vào chỗ trống/vật sai trong G1, G3 bị tính lỗi (chống bấm bừa).
8. Vùng chạm ≥ 48px (nút chính ≥ 64px). CSS: `touch-action: none` trong vùng chơi, `user-select: none`,
   `-webkit-touch-callout: none`, `overscroll-behavior: none`; tôn trọng `env(safe-area-inset-*)`.
9. Màu luôn đi kèm **hình dạng/biểu tượng** (hỗ trợ mù màu).
9a. **S Pen**: `pointerType === "pen"` xử lý giống ngón tay (không lọc theo pointerType).
9b. Phản hồi sai/đúng không phụ thuộc rung: luôn có hình + âm; `navigator.vibrate` chỉ là bổ sung.

**Vòng đời & dữ liệu**
10. `visibilitychange`(hidden), `pagehide`, đổi hướng/đổi kích thước (gồm chia đôi màn hình/cửa sổ nổi của Samsung) → **tạm dừng** game. Thoát khi tạm dừng → lượt không được lưu.
10a. Nút/cử chỉ **Quay lại** Android: đang chơi → tạm dừng; màn khác → về màn trước; Home → nhắc “Bấm lần nữa để thoát” (NF10).
11. Mọi truy cập `localStorage` qua `storage.ts`, bọc try/catch; lỗi → chạy bằng bộ nhớ tạm + banner cảnh báo.
12. Có `schemaVersion`; thay đổi cấu trúc dữ liệu phải viết migration + test migration.
13. Không tự reload khi có service worker mới; chỉ hiện nút “Cập nhật” ở Home/khu phụ huynh.
14. Mọi random ảnh hưởng chấm điểm/thưởng dùng `rng.ts` có seed để test được.

**Code**
15. Logic thuần (độ khó, điểm, sinh đề, thưởng) tách khỏi UI và có unit test.
16. Chuỗi giao diện chỉ nằm ở `src/i18n/vi.ts`.
17. 60 fps: không tạo object mới mỗi frame trong vòng lặp game, không đọc layout (getBoundingClientRect) mỗi frame.

## 6. Cách làm việc

1. Đầu phiên: đọc `CLAUDE.md`, `docs/PROGRESS.md`, rồi phần tài liệu TASK yêu cầu.
2. Trước khi code: trình bày **kế hoạch ngắn** (file sẽ tạo/sửa, rủi ro) và **chờ chủ dự án duyệt**.
3. Làm theo từng bước nhỏ; chạy `npm run lint` và `npm run test` sau mỗi bước lớn. Với thay đổi giao diện: tự xem trước bằng Browser pane
   và chụp ảnh Playwright ở 3 khung hình (360×740, 1280×800, 800×1280) để tự kiểm tra trước khi báo xong.
4. Không làm ngoài phạm vi TASK hiện tại; ý tưởng thêm → ghi vào `docs/PROGRESS.md` mục “Đề xuất”.
5. Cuối TASK: cập nhật `docs/PROGRESS.md` (đã làm, còn lại, câu hỏi mở, cách test thủ công), rồi commit
   theo Conventional Commits (`feat: ...`, `fix: ...`, `test: ...`, `docs: ...`).
6. Báo cáo cuối TASK bằng tiếng Việt, ngắn: đã làm gì, cách thử trên điện thoại/tablet, điểm cần chủ dự án quyết định.
7. Thao tác cần chủ dự án tự làm (đăng nhập GitHub, bật Pages, cài app lên máy): hướng dẫn từng bước đánh số, không giả định kiến thức lập trình.

## 7. Definition of Done (mỗi TASK)

- [ ] `npm run lint` và `npm run test` pass; `npm run build` thành công
- [ ] Chạy được ở viewport 360×740 (điện thoại dọc), 1280×800 (tablet Samsung ngang) và 800×1280 (tablet dọc), không vỡ bố cục
- [ ] Không có chuỗi giao diện hard-code ngoài `i18n/vi.ts`
- [ ] Tiêu chí riêng của TASK trong `docs/03_TASKS.md` đạt
- [ ] Test case liên quan trong `docs/04_ACCEPTANCE.md` tự kiểm được (ghi kết quả vào PROGRESS)
- [ ] `docs/PROGRESS.md` đã cập nhật, đã commit
