# PROGRESS – Nhật ký tiến độ

> Claude Code: đọc file này đầu mỗi phiên; cập nhật cuối mỗi TASK (ghi mới lên trên cùng của mục Nhật ký).

## Trạng thái hiện tại

| TASK | Trạng thái | Ngày | Ghi chú |
|---|---|---|---|
| TASK-00 Môi trường + Git/GitHub | Xong | 2026-10-10 | Repo: https://github.com/Nin-Min2231/nhanh-tay-tinh-mat |
| TASK-01 Khởi tạo dự án | Xong | 2026-10-10 | lint/test/build/e2e đều pass |
| TASK-02 Khung app | Xong | 2026-10-10 | lint, 42 unit test, build, 51 e2e (17 × 3 khung hình) đều pass; cần anh thử TC-034/035 trên tablet Samsung |
| TASK-03 G1 + G2 + độ khó | Xong | 2026-10-10 | lint, 100 unit test, build, 90 e2e (30 × 3 khung hình) đều pass; kèm bảng màu mới rực rỡ; cần anh thử cảm giác chơi + FPS trên tablet |
| TASK-04 G3 + G4 + G5 | Chưa bắt đầu | | |
| TASK-05 G6 + G7 | Chưa bắt đầu | | |
| TASK-06 Thưởng | Chưa bắt đầu | | |
| TASK-07 Khu phụ huynh | Chưa bắt đầu | | |
| TASK-08 PWA + deploy | Chưa bắt đầu | | |
| TASK-09 QA | Chưa bắt đầu | | |
| TASK-10 Sửa lỗi | Chưa bắt đầu | | |

## Câu hỏi mở (chờ chủ dự án)

- Không còn câu hỏi chặn. R23–R25 (mới v1.2) áp dụng theo đề xuất; chủ dự án có thể góp ý trong quá trình làm.

## Đề xuất (ngoài phạm vi, để sau)

- Home tablet ngang: xếp 3 nhóm game cạnh nhau để đỡ phải cuộn (TASK-10 nếu anh thấy cần).

## Nhật ký

### 2026-10-10 – TASK-03 (+ đổi bảng màu)
- Đã làm:
  - `adaptive.ts` đầy đủ (`levelForRound`, `applyRound`/`afterRound`, ngưỡng đọc từ `levels.json`) + `scoring.ts`, có test (tăng/giảm cấp, 2 lượt < 0,5, Cố định, min/max, Dễ/Vừa/Khó không tính, ngưỡng sao).
  - **G1 Bóng Xanh – Bóng Đỏ** (`games/g1-balls`): canvas 60 giây, 10 cấp, 4 loại bóng (xanh tròn + mặt cười, đỏ vuông + ✕, vàng tam giác + !, nâu thoi + ~), RT = `event.timeStamp − onset`, RT < 120ms không tính vào trung bình, chỉ nhận chạm đầu, chạm chỗ trống/bóng sai bị tính lỗi, 2 bóng cùng lúc ≥ 50% nhóm có bóng xanh, tùy chọn `colors`/`simultaneous`, pool bóng + hạt (không tạo object mỗi khung hình).
  - **G2 Bảng Số Thần Kỳ** (`games/g2-schulte`): DOM/CSS grid 3×3–5×5, 1 màu / nhiều màu / đổi màu mỗi 3 giây, số xoay (gạch chân số có chữ số 6/9), thứ tự ngược, gợi ý nhấp nháy, tùy chọn `grid`/`order`/`hint`.
  - Màn Kết quả: sao bay, pháo giấy (3 sao hoặc lên cấp), lời khen nỗ lực, chỉ số chính (G1: số bóng xanh + phản xạ trung bình; G2: thời gian), “Lên cấp!” + âm fanfare; xuống cấp đổi lặng lẽ.
  - Hình động giới thiệu riêng cho G1, G2; bong bóng lời động viên khi chạm sai.
  - `?debug=1` (chỉ khi `npm run dev`): bảng chỉnh Tự động/Cố định, cấp, min/max, tùy chọn từng game + đồng hồ FPS ở G1. `?e2e=1` (dev hoặc build e2e): lượt G1 rút còn 6 giây, seed cố định (`&seed=N`), game ghi trạng thái ra `data-*`. Bản deploy thật không bật được hai cờ này.
  - Gỡ game thử G0; Home: G1, G2 chơi được, G3–G7 “Sắp có”.
  - **Bảng màu mới** theo yêu cầu: nền chuyển sắc trời → kem → hồng, mỗi game một tông thẻ riêng, nút “kẹo” có bóng đổ, nhóm game có nhãn màu, avatar/ô số G2/bóng G1 đậm màu hơn; chữ vẫn tối để dễ đọc. Đã cập nhật `docs/01_SPEC.md` mục 12.
- Test case tự kiểm (Playwright, phone + tablet + tablet-portrait): TC-004 Pass · TC-005 Pass · TC-009 Pass · TC-014 Pass (qua `?debug=1`) · TC-015 Pass (3 lượt, cấp vẫn 5) · TC-016 Pass · TC-017 Pass · TC-031 Pass (G1 và G2, 2 ngón qua CDP). Cộng thêm: G2 gạch chân 6/9, thứ tự ngược, gợi ý; chạm lại ô đã đúng không lỗi.
- **TC-028 (đen trắng):** tự kiểm bằng ảnh chuyển xám – 4 loại bóng vẫn phân biệt rõ nhờ hình (tròn+mặt cười / vuông+✕ / tam giác+! / thoi+~). Anh nên xem lại trên máy thật.
- **60 fps G1:** không mở được bảng Performance của DevTools từ môi trường này. Đo thay bằng script lấy mẫu `requestAnimationFrame` trong Chromium (cấp 10, 5 giây): trung bình 16,7 ms/khung, p99 ≤ 16,8 ms (riêng tablet dọc có 4/300 khung ≈ 33 ms), 0 khung > 34 ms; bật CPU throttle ×4 không khác (headless vẫn khóa 60 Hz nên chỉ là ước lượng thô). **Số liệu thật: bật `?debug=1` khi chạy `npm run dev` rồi xem số “fps” ở góc phải dưới thanh HUD khi chơi G1 trên tablet Galaxy Tab dòng A.**
- Cách thử thủ công (điện thoại/tablet cùng wifi, địa chỉ `http://192.168.x.x:5173/` như ở TASK-02):
  1. Mở Home → thẻ “Bóng Xanh – Bóng Đỏ” → Bắt đầu. Chạm bóng xanh; thử chạm bóng đỏ và chỗ trống (phải lắc nhẹ + âm “bụp” + lời động viên).
  2. Thêm `?debug=1` vào địa chỉ để đổi cấp/số màu: ví dụ đặt Số màu bóng = 4 và cấp 8–10 để thấy đủ 4 loại bóng; kiểm tra TC-028 bằng cách chụp màn hình rồi chuyển ảnh đen trắng.
  3. “Bảng Số Thần Kỳ”: chạm 1 → 9; thử cấp 5, 8 (số xoay, 6 và 9 có gạch chân), cấp 9 (ngược từ 25).
  4. Chơi G1 ba lượt thật tốt ở chế độ “Tự động” để thấy “Lên cấp!”; hai lượt cố tình bấm bừa để thấy cấp giảm nhẹ nhàng.
- Quyết định khi làm (anh góp ý nếu không đồng ý):
  - “Lên cấp!” hiện ngay ở Kết quả của lượt làm đổi cấp (lượt kế tiếp chơi ở cấp mới).
  - G1: hết 60 giây thì không ra bóng mới nhưng chờ nhóm bóng đang hiện xong; chạm trước khi bóng kịp hiện hình tính là chạm chỗ trống.
  - G2: lượt bị buộc kết thúc vì quá giờ thì điểm nhân thêm tỷ lệ số đã tìm được. Đổi cỡ bảng bằng tùy chọn thì thời gian mục tiêu đổi theo số ô.
  - `levelForRound` ở chế độ Tự động kẹp cấp trong min–max của phụ huynh (SPEC chưa nói rõ).
  - Các luồng ngẫu nhiên của G1 (loại bóng / vị trí / khoảng nghỉ / hiệu ứng) tách riêng từ `ctx.rng` nên dãy bóng không phụ thuộc kích thước màn hình.
- Còn lại / nợ kỹ thuật: Album/Khu phụ huynh vẫn “Đang xây dựng”; hình động giới thiệu G3–G7 làm cùng từng game; chưa có nhiệm vụ/hộp quà (TASK-06); hạng mục “debug panel” sẽ thay bằng khu phụ huynh ở TASK-07.
- Commit: `feat: G1, G2, adaptive difficulty, result screen, vivid color theme`

### 2026-10-10 – TASK-02
- Đã làm:
  - Logic thuần có test: `storage.ts` (try/catch, schemaVersion, khung migration, bộ nhớ tạm + banner khi lỗi; dữ liệu hỏng được giữ bản `.bak`; dữ liệu từ phiên bản mới hơn không bị ghi đè), `session.ts` (`RoundClock`: chỉ cộng giờ khi Running, nhắc còn 2 phút, hết giờ cho chơi nốt tối đa +90s), `rng.ts` (mulberry32), `device.ts`, `routes.ts`, `profile.ts`, `adaptive.ts` (chỉ `levelForRound`), `scoring.ts` (chỉ `starsForScore`).
  - `router.ts` + `backButton.ts` (NF10), `viewport.ts` (cửa sổ nhỏ), `audio.ts` (Web Audio), `haptics.ts` (rung điện thoại + luôn lắc hình), `store.ts` (signals).
  - Màn hình: Chọn người chơi, Tạo hồ sơ (12 avatar SVG, lớp 1–3, tối đa 5), Home (Sóc Bo SVG 5 biểu cảm, 3 ô nhiệm vụ tĩnh, thẻ game 3 nhóm, thanh thời gian, tổng sao), Giới thiệu game (hình động CSS + Dễ/Vừa/Tự động/Khó), Chơi (đếm ngược, tạm dừng, nhắc giờ), Kết quả (sao bay), Nghỉ. Album/Khu phụ huynh/Khóa PH: trang “Đang xây dựng”.
  - `games/common`: GameModule/GameContext/RoundResult, `PointerInput` (chạm đầu / đa điểm, nhận cả S Pen), `CanvasStage` (DPR + ResizeObserver), `Countdown`, `PauseOverlay`. Game thử G0 (`games/g0-demo`, thẻ “Game thử (tạm)” trên Home) – sẽ gỡ ở TASK-03.
- Test case tự kiểm (Playwright, cả phone / tablet / tablet-portrait): TC-003 Pass · TC-008 Pass · TC-011 Pass (nhắc 13 phút; hết giờ → chơi nốt → nghỉ → thẻ khóa) · TC-024 Pass · TC-031 Pass (2 ngón, CDP) · TC-033 Pass (phần tự động: `goBack` khi chơi, ở Home, màn khác) · TC-034 mô phỏng Pass (thu nhỏ cửa sổ) · NF04 Pass (vùng chạm) · NF05 Pass (không request ra ngoài). **TC-034 và TC-035 cần anh thử trên tablet Samsung thật.** TC-033 nên thử thật bằng cử chỉ vuốt cạnh trên Android.
- Cách thử thủ công trên điện thoại/tablet cùng wifi:
  1. Máy tính và điện thoại/tablet cùng mạng wifi. Chạy `npm run dev` trong thư mục dự án.
  2. Terminal in ra dòng `Network: http://192.168.x.x:5173/`. Gõ đúng địa chỉ đó vào Chrome trên điện thoại/tablet.
  3. Nếu không mở được: Windows hỏi quyền tường lửa thì chọn “Cho phép” (mạng riêng); hoặc tắt VPN.
  4. Thử: tạo hồ sơ → bấm thẻ “Game thử (tạm)” → chơi → xoay máy giữa lượt (phải tự tạm dừng) → vuốt Quay lại (phải tạm dừng, không thoát) → Home vuốt Quay lại (phải hiện “Bấm lần nữa để thoát”). TC-035: chạm ra ngoài vòng tròn trên tablet → khung chơi lắc nhẹ + âm “bụp”.
  5. Lưu ý: mở bằng địa chỉ http (không phải https) nên chưa cài được PWA và chưa có chế độ offline; phần đó ở TASK-08.
- Quyết định khi làm (anh có thể góp ý):
  - Hết giờ giữa lượt: sau khi lưu, hiện màn Kết quả (để bé thấy sao) với nút “Tiếp tục” → màn nghỉ (SPEC ghi “lưu rồi chuyển #/rest”).
  - Thoát khi tạm dừng: lượt không lưu, nhưng thời gian đã chơi vẫn trừ vào giới hạn ngày (tránh lách giới hạn).
  - Cửa sổ “quá nhỏ”: tablet theo SPEC (rộng < 360 hoặc cao < 480); điện thoại chỉ khi cạnh ngắn < 300 để không chặn điện thoại xoay ngang (cao ~360).
  - Thêm `finish?()` tùy chọn vào `GameInstance` (SPEC chỉ có start/pause/resume/destroy): host gọi khi chơi lố quá 90 giây.
  - Nút ở màn Kết quả bị chặn 0,6 giây đầu để tránh “click-through” (game kết thúc bằng `pointerdown`, cú click giả sau đó có thể trúng nút “Về nhà”). Bug này tìm ra nhờ e2e; mọi màn kế tiếp sau một game kết thúc bằng chạm cần giữ quy tắc này.
  - Gài lịch sử cho nút Quay lại chỉ sau lần chạm đầu tiên (Chrome Android bỏ qua mục lịch sử tạo khi chưa có thao tác của người dùng).
  - Thanh nhắc giờ trong lúc chơi là lớp phủ (không đẩy vùng chơi), để vùng chơi không đổi kích thước giữa lượt.
  - Thêm `with { type: 'json' }` cho import `levels.json` và `package.json`.
- Còn lại / nợ kỹ thuật: Home tablet ngang còn phải cuộn (4 cột nhưng mỗi nhóm chỉ 2–3 thẻ); ba nút phụ huynh/album chưa có chức năng; hình động giới thiệu của G1–G7 làm cùng từng game; chưa đo 60 fps (G0 chỉ là demo).
- Commit: `feat: app shell (profiles, home, router, session, back button, demo game)`

### 2026-10-10 – TASK-01
- Đã làm: khởi tạo Vite + TypeScript strict + Preact/signals; ESLint + Prettier; Vitest; Playwright Chromium (3 project `phone` 360×740, `tablet` 1280×800, `tablet-portrait` 800×1280, đều cảm ứng); vite-plugin-pwa cấu hình tạm (`registerType: 'prompt'`, `base` từ `BASE_PATH`); font Nunito (latin + vietnamese, đóng gói sẵn); `theme.css` theo SPEC mục 12; trang Hello; khung thư mục theo CLAUDE.md mục 4; `src/games/levels.ts` import trực tiếp `docs/data/levels.json` (kiểu an toàn, 1 nguồn duy nhất); 1 unit test + 1 e2e; `.github/workflows/ci.yml`; `.claude/launch.json`.
- Kết quả: `npm run lint`, `test` (3 test), `build`, `test:e2e` (3/3 trên 3 khung hình) đều pass. Đã chụp ảnh kiểm tra tiếng Việt có dấu với font Nunito.
- Thư viện thêm ngoài danh sách: `@types/node` (chỉ kiểu dữ liệu, cần để `vite.config.ts` dùng `process.env`), `@eslint/js`, `typescript-eslint`, `globals`, `eslint-config-prettier` (plugin ESLint/Prettier chuẩn). Phiên bản cài là mới nhất lúc này (Vite 8, Preact 11, TypeScript 6, ESLint 10, Vitest 5, vite-plugin-pwa 2).
- Cách thử thủ công: `npm run dev`, mở http://localhost:5173 (hoặc địa chỉ mạng LAN in ra, dùng cho điện thoại/tablet cùng wifi) → thấy "Nhanh Tay Tinh Mắt".
- Còn lại / nợ kỹ thuật: manifest PWA chưa có icon (TASK-08); `gh` CLI chưa đăng nhập (chưa cần).
- Commit: `chore: scaffold project`

### 2026-10-10 – TASK-00
- Đã làm: kiểm tra môi trường (node v24.18.0, npm 11.16.0, git 2.55.0 – đạt); `git init` nhánh `main`; tạo `.gitignore` (Node/Vite, bỏ qua `*.xlsx`); cấu hình git user riêng cho repo (Nin-Min2231 / nguyennc1357@gmail.com); thêm remote `origin`; commit đầu tiên và push thành công.
- Test case tự kiểm: không áp dụng.
- Cách thử thủ công: mở https://github.com/Nin-Min2231/nhanh-tay-tinh-mat, thấy `CLAUDE.md` và thư mục `docs/`.
- Còn lại / nợ kỹ thuật: `gh` CLI chưa đăng nhập (chưa cần; sẽ cần ở TASK-08 nếu muốn bật Pages bằng dòng lệnh). File Excel kế hoạch không đưa lên GitHub.
- Commit: `docs: add project specs`

<!-- Mẫu mỗi lần cập nhật:
### YYYY-MM-DD – TASK-0x
- Đã làm:
- Test case tự kiểm: TC-xxx Pass/Fail (ghi chú)
- Cách thử thủ công trên điện thoại:
- Còn lại / nợ kỹ thuật:
- Commit:
-->
