# 03_TASKS – Kế hoạch triển khai bằng Claude Code Desktop

> **Phase 1 đã xong (2026-10-13).** File này giữ nguyên làm **khuôn mẫu và lịch sử Phase 1**. Phase 2: anh nêu yêu cầu và làm bằng **Cowork** → xem `docs/HANDOVER_COWORK.md`; task Phase 2 sẽ nằm ở `docs/phase2/P2_TASKS.md` (khuôn giống file này, đánh số tiếp từ TASK-11).

> Cách dùng (tab **Code** trong app Claude Desktop, Environment = Local, Project folder = thư mục `nhanh-tay-tinh-mat`):
> 1. Mỗi TASK = 1 phiên mới (**Ctrl+N**). Chọn chế độ **Plan** → dán nguyên khối **Prompt** → gửi.
> 2. Claude đưa kế hoạch → anh góp ý hoặc đồng ý → đổi chế độ sang **Accept edits** → nhắn “Đồng ý, làm theo kế hoạch”.
> 3. Claude code, chạy test, xem trước ở **Browser pane**, cập nhật `docs/PROGRESS.md`, commit, báo cáo.
> Làm **lần lượt** TASK-00 → TASK-10. Chi tiết thao tác: `HUONG_DAN_CLAUDE_CODE.md` (thư mục cha).
> Mapping với Excel sheet 4: P1 = TASK-00 · P2 = TASK-01, 02 · P3 = TASK-03 · P4 = TASK-04 · P5 = TASK-05 · P6 = TASK-06 · P7 = TASK-07 · P8 = TASK-08 · P9 = TASK-09 · P11 = TASK-10.

| TASK | Nội dung | Yêu cầu chính | Test case | Ước lượng |
|---|---|---|---|---|
| TASK-00 | Kiểm tra môi trường, Git, kết nối GitHub (không viết code) | – | – | 15–30 phút |
| TASK-01 | Khởi tạo dự án, công cụ, CI | NF08 | – | 1 buổi |
| TASK-02 | Khung app: hồ sơ, Home, router, lưu trữ, thời gian chơi, tạm dừng, nút Quay lại, đa cửa sổ, khung game | F01, F02, F05, F07, F09, NF02–NF04, NF09–NF11, UI01–UI04 | TC-003, 008, 011, 024, 033, 034, 035 | 1–2 buổi |
| TASK-03 | G1 + G2 + độ khó thích ứng + kết quả/sao | F03, F04, F11, F12 | TC-004, 005, 009, 014–017, 028, 031 | 1 buổi |
| TASK-04 | G3 + G4 + G5 | – | TC-006, 007, 013, 032 | 1–2 buổi |
| TASK-05 | G6 + G7 | F17, F19 | TC-018, 019, 020 | 1–2 buổi |
| TASK-06 | Nhiệm vụ, hộp quà, album, mở khóa, nghỉ đúng giờ | F13, F14, F20 | TC-021, 022, 030 | 1 buổi |
| TASK-07 | Khu phụ huynh | F06, F08, F10, F15, F16, F18 | TC-010, 023, 025, 026, 027 | 1–2 buổi |
| TASK-08 | PWA offline + deploy GitHub Pages | NF01, NF06, NF07 | TC-001, 002, 012, 029 | 1 buổi |
| TASK-09 | Kiểm thử tự động + rà soát | toàn bộ | toàn bộ (35 TC) | 1 buổi |
| TASK-10 | Sửa lỗi & tinh chỉnh sau khi anh test | – | – | lặp lại |

---

## TASK-00 – Kiểm tra môi trường & Git/GitHub

**Prompt**
```
Đây là TASK-00 trong docs/03_TASKS.md. Chưa viết code ứng dụng.
1. Đọc CLAUDE.md và tóm tắt dự án trong 5 dòng để tôi xác nhận bạn hiểu đúng.
2. Kiểm tra máy Windows của tôi: phiên bản node, npm, git. Thiếu hoặc quá cũ (node < 20) thì hướng dẫn tôi cài, không tự cài.
3. Nếu thư mục chưa là git repo: git init (nhánh main), tạo .gitignore cho Node/Vite (node_modules, dist, coverage, playwright-report, test-results, .env).
4. Kiểm tra git user.name/user.email; nếu chưa có thì hỏi tôi để cấu hình.
5. Hỏi tôi URL repo GitHub (đã tạo trống tên nhanh-tay-tinh-mat), thêm remote origin. Commit đầu tiên "docs: add project specs" gồm CLAUDE.md và docs/, rồi push. Nếu cần đăng nhập GitHub, hướng dẫn tôi từng bước (Git Credential Manager sẽ mở trình duyệt).
6. Cập nhật docs/PROGRESS.md (TASK-00 xong) và báo cáo ngắn bằng tiếng Việt.
Trước khi làm: trình bày kế hoạch và chờ tôi duyệt.
```

---

## TASK-01 – Khởi tạo dự án

**Prompt**
```
Đọc CLAUDE.md và docs/01_SPEC.md (mục 11, 13). Đây là TASK-01 trong docs/03_TASKS.md.

Mục tiêu: khởi tạo dự án theo đúng công nghệ trong CLAUDE.md mục 2 và cấu trúc mục 4 (chỉ tạo khung thư mục, file rỗng có TODO).
Cần làm:
1. Vite + TypeScript strict + Preact + @preact/signals; ESLint + Prettier; Vitest; Playwright Chromium (project "phone" 360x740, "tablet" 1280x800, "tablet-portrait" 800x1280, đều hasTouch). Không cài WebKit (không hỗ trợ iOS).
2. Scripts: dev (--host), build, preview, test, test:e2e, lint (eslint + tsc --noEmit).
3. vite-plugin-pwa cấu hình tạm (registerType 'prompt'), base đọc từ biến môi trường BASE_PATH (mặc định '/').
4. Font @fontsource/nunito (subset vietnamese), file src/ui/theme.css với biến màu theo SPEC mục 12.
5. Trang Hello hiển thị "Nhanh Tay Tinh Mắt" bằng font Nunito để kiểm tra tiếng Việt có dấu.
6. Sao chép docs/data/levels.json thành nguồn cấu hình: tạo src/games/levels.ts import JSON có type an toàn.
7. 1 unit test mẫu + 1 e2e test mẫu (mở trang, thấy tiêu đề).
8. .github/workflows/ci.yml chạy lint + test khi push.
9. Tạo .claude/launch.json để Browser pane của Claude Desktop chạy được "npm run dev" (cổng 5173) và tự xem trước.
10. Mọi npm script phải chạy được trên Windows (dùng cross-env cho biến môi trường, không dùng lệnh chỉ có ở bash như rm -rf).
Không làm: màn hình hay game thật.
Hoàn thành khi: npm run lint, test, build, test:e2e đều pass. Cập nhật docs/PROGRESS.md, commit "chore: scaffold project".
Trước khi làm: trình bày kế hoạch ngắn và chờ tôi duyệt.
```

---

## TASK-02 – Khung app

**Prompt**
```
Đọc CLAUDE.md, docs/PROGRESS.md, docs/01_SPEC.md (mục 1, 3, 4, 5, 8, 12, 12b). Đây là TASK-02.

Mục tiêu: khung app chạy được trên điện thoại Android và tablet Samsung (ngang + dọc), chưa có game thật.
Cần làm:
1. storage.ts: AppState/Profile/RoundRecord theo SPEC mục 5, try/catch, schemaVersion + khung migration, fallback bộ nhớ tạm + banner cảnh báo; storage.persist(). Unit test.
2. store.ts (signals), router.ts (hash routes theo SPEC mục 1), device.ts (deviceId, deviceClass), rng.ts (mulberry32 + test).
3. Màn hình: Chọn người chơi, Tạo/sửa hồ sơ (tên, 12 avatar SVG tự vẽ đơn giản, lớp 1/2/3, tối đa 5 hồ sơ), Home (linh vật Sóc Bo SVG chào "Chào {tên}!", 3 ô Nhiệm vụ hôm nay (tĩnh), 7 thẻ game chia 3 nhóm, thanh thời gian còn lại, tổng sao), Giới thiệu game (khung hình động 5s + nút chọn độ khó), Màn hình nghỉ.
4. games/common: GameModule/GameContext/RoundResult theo SPEC mục 4; PauseOverlay; Countdown 3-2-1; PointerInput (chế độ chạm đầu / đa điểm); CanvasStage (DPR, resize).
5. backButton.ts: xử lý nút/cử chỉ Quay lại Android theo SPEC mục 12b (NF10); xử lý chia đôi màn hình/cửa sổ nhỏ, S Pen (NF11).
6. session.ts: chỉ cộng thời gian khi Running; nhắc khi còn 2 phút; hết giờ → kết thúc lượt (tối đa +90s) → #/rest; tạm dừng khi visibilitychange/pagehide/resize; thoát khi tạm dừng không lưu lượt.
7. 1 game giả "G0 demo" (chạm vòng tròn 10 lần) để thử toàn luồng: Intro → chơi → Kết quả → lưu RoundRecord.
8. audio.ts (Web Audio tổng hợp: ding, bụp, sao) + haptics.ts (vibrate trên điện thoại + luôn kèm lắc hình, vì tablet Samsung không có rung).
9. Mọi chuỗi trong src/i18n/vi.ts. Tôn trọng CLAUDE.md mục 5 (touch-action, safe-area, ≥ 48px).
Không làm: game G1–G7, thưởng, khu phụ huynh (chỉ nút dẫn tới trang "Đang xây dựng").
Hoàn thành khi: DoD trong CLAUDE.md mục 7; tự kiểm TC-003, TC-008, TC-011, TC-024, TC-033, TC-034, TC-035 ở docs/04_ACCEPTANCE.md (ghi kết quả vào PROGRESS). Hướng dẫn tôi cách mở bằng điện thoại/tablet cùng wifi (npm run dev).
Trước khi làm: trình bày kế hoạch và chờ tôi duyệt.
```

---

## TASK-03 – G1, G2, độ khó thích ứng, kết quả

**Prompt**
```
Đọc CLAUDE.md, docs/PROGRESS.md, docs/01_SPEC.md (mục 6, 7 phần Sao), docs/02_GAMES.md (G1, G2). Đây là TASK-03.

Cần làm:
1. adaptive.ts + scoring.ts đúng SPEC mục 6–7, unit test đầy đủ (tăng cấp, giảm cấp, 2 lượt < 0,5, chế độ fixed, min/max, lựa chọn Dễ/Vừa/Khó không tính adaptive).
2. G1 Bóng Xanh – Bóng Đỏ: canvas, bảng cấp từ levels.json, tùy chọn colors/simultaneous, mã hóa màu + hình, đo RT bằng event.timeStamp, chạm đầu, chống bấm bừa. logic.ts tách riêng + test.
3. G2 Bảng Số Thần Kỳ: DOM/CSS grid, 10 cấp, số xoay (gạch chân 6/9), thứ tự ngược, gợi ý. logic.ts + test.
4. Màn hình Kết quả: sao bay, lời khen nỗ lực, chỉ số chính dễ hiểu, "Lên cấp!".
5. Lưu cài đặt game tạm trong store (UI cài đặt sẽ làm ở TASK-07), nhưng thêm cách bật nhanh khi dev (?debug=1) để thử tùy chọn.
6. Thay G0 demo bằng G1, G2 thật trên Home; các game khác hiện "Sắp có".
Hoàn thành khi: DoD; tự kiểm TC-004, 005, 009, 014, 015, 016, 017, 028, 031. Kiểm tra 60fps G1 bằng Performance panel (ghi nhận vào PROGRESS).
Trước khi làm: trình bày kế hoạch và chờ tôi duyệt.
```

---

## TASK-04 – G3, G4, G5

**Prompt**
```
Đọc CLAUDE.md, docs/PROGRESS.md, docs/02_GAMES.md (G3, G4, G5). Đây là TASK-04.

Cần làm:
1. G3 Đuổi Bắt Thú Cưng (canvas): 4 thú + Nhím ngủ SVG tự vẽ, chuyển động nảy/đổi hướng, hit-test bán kính + 8px, score chống bấm bừa.
2. G4 Chuỗi Ánh Sáng (DOM): 4/6/9 ô, màu + biểu tượng + nốt riêng, luật sai 2 lần, nhắc khi 8s không chạm.
3. G5 Nốt Nhạc Rơi (canvas): sinh nốt theo nhịp + giai điệu ngũ cung tự sinh, đa điểm chạm theo pointerId, cửa sổ Tuyệt/Tốt/Trượt, combo, extraTaps; vị trí nốt tính theo thời gian.
4. logic.ts + unit test cho cả 3 game theo mục "Unit test" trong 02_GAMES.md.
Hoàn thành khi: DoD; tự kiểm TC-006, 007, 013, 032 (TC-007 dùng Playwright touch 2 điểm hoặc ghi chú để tôi thử trên tablet Samsung).
Trước khi làm: trình bày kế hoạch và chờ tôi duyệt.
```

---

## TASK-05 – G6, G7 (học mà chơi)

**Prompt**
```
Đọc CLAUDE.md, docs/PROGRESS.md, docs/02_GAMES.md (G6, G7), docs/01_SPEC.md (F17, F19, mục 5 MathFact). Đây là TASK-05.

Cần làm:
1. G6 Hái Táo Tính Nhẩm: bộ sinh câu cho M01–M14 (theo lớp + chủ đề bật), "nửa dễ" cấp 1–3, dạng tìm số thiếu từ cấp 8, đáp án nhiễu hợp lý, hình minh họa khi sai (khung 10 ô / lưới chấm / đặt tính dọc), sổ lỗi + mastered, thanh thời gian, chế độ không giới hạn thời gian.
2. G7 Tìm Quy Luật: phần tử SVG (shape, color+hoa văn, size, rotation, count), các dạng câu theo 10 cấp, bộ kiểm tra "đúng 1 đáp án", nhiễu khác đúng 1 thuộc tính, phản hồi giải thích quy luật, thử lại ½ điểm ở cấp 1–5.
3. Unit test 1.000 câu/chủ đề và 1.000 câu/dạng như 02_GAMES.md yêu cầu.
4. Kiểm tra bằng mắt: in ra 20 câu mẫu mỗi chủ đề/dạng vào docs/samples/G6.md, docs/samples/G7.md để tôi duyệt nội dung có phù hợp bé lớp 2 không.
Hoàn thành khi: DoD; tự kiểm TC-018, 019, 020.
Trước khi làm: trình bày kế hoạch và chờ tôi duyệt.
```

---

## TASK-06 – Nhiệm vụ, hộp quà, album

**Prompt**
```
Đọc CLAUDE.md, docs/PROGRESS.md, docs/01_SPEC.md (mục 7, 8; F13, F14, F20). Đây là TASK-06.

Cần làm:
1. rewards.ts (thuần + rng seed): nhiệm vụ 3 nhóm/ngày, hộp theo nhiệm vụ và mỗi 15 sao, giới hạn hộp/ngày, độ hiếm 70/25/5, bảo đảm Hiếm sau 5 hộp, trùng → +3 sao, mốc mở khóa theo tổng sao. Unit test (gồm mô phỏng 10.000 hộp kiểm tra tỷ lệ ±2%).
2. UI: 3 ô nhiệm vụ trên Home (đánh dấu khi xong), modal mở hộp quà (lắc → bung → sticker), Album 40 sticker SVG tự vẽ đơn giản + tab Trang phục/Hình nền, áp dụng trang phục cho linh vật.
3. Màn hình nghỉ: nút "Con nghỉ đây" thưởng +2 sao trong 30s (1 lần/ngày), gợi ý vận động, mở hộp còn lại.
Không làm: khu phụ huynh (phần tặng hộp/thời gian ở TASK-07).
Hoàn thành khi: DoD; tự kiểm TC-021, 022, 030.
Trước khi làm: trình bày kế hoạch và chờ tôi duyệt.
```

---

## TASK-07 – Khu phụ huynh

**Prompt**
```
Đọc CLAUDE.md, docs/PROGRESS.md, docs/01_SPEC.md (mục 9, 10; F06, F08, F10, F11, F12, F15, F16, F17, F18). Đây là TASK-07.

Cần làm:
1. Khóa PH: a×b (a 12–49, b 3–9), bàn phím số, sai 3 lần khóa 30s.
2. Tab Tiến bộ: Chart.js đường theo ngày + đường cấp, lọc hồ sơ/game/chỉ số/khoảng ngày/thiết bị; bảng 10 lượt gần nhất. DailyAggregate + dọn RoundRecord > 120 ngày.
3. Tab Bài đo tuần: luồng chạy 7 game ở cấp benchmark (levels.json), thẻ so sánh tuần đầu ↔ tuần gần nhất (chú ý chỉ số "thấp hơn là tốt"), banner "Thử thách tuần" trên Home.
4. Tab Cài đặt: thời gian/ngày, hộp tối đa/ngày, âm thanh/nhạc/rung, cho bé chọn độ khó; từng game Tự động (min–max) / Cố định + tùy chọn riêng; G6 lớp + chủ đề.
5. Tab Hồ sơ (thêm/sửa/xóa xác nhận 2 bước), Tab Thưởng (+5/+10/+15 phút, tặng hộp kèm lý do).
6. Tab Dữ liệu: sao lưu JSON (tải về thư mục Tải xuống), khôi phục có xem trước + xác nhận, cảnh báo xóa dữ liệu/ẩn danh, nhắc > 14 ngày, phiên bản app, ghi chú khi nào nên cho bé đi khám (R13).
Hoàn thành khi: DoD; tự kiểm TC-010, 023, 025, 026, 027; test backup → restore khứ hồi giữ nguyên dữ liệu (unit test).
Trước khi làm: trình bày kế hoạch và chờ tôi duyệt.
```

---

## TASK-08 – PWA offline + deploy GitHub Pages

**Prompt**
```
Đọc CLAUDE.md, docs/PROGRESS.md, docs/01_SPEC.md (mục 11). Đây là TASK-08.

Cần làm:
1. Hoàn thiện vite-plugin-pwa: manifest đầy đủ, icon 192/512/maskable (vẽ từ linh vật SVG, xuất PNG bằng script build), precache toàn bộ asset, không request mạng khi chạy.
2. Luồng cập nhật: SW mới → cờ updateAvailable → nút "Có bản mới – Cập nhật" chỉ ở Home/khu PH; không reload giữa lượt. Hiện số phiên bản (từ package.json) trong khu PH.
3. .github/workflows/deploy.yml: push main → npm ci → lint/test → build với BASE_PATH=/<tên repo>/ → deploy Pages.
4. Kiểm tra offline bằng Playwright (context.setOffline(true) sau lần tải đầu) mở app và chơi 1 lượt.
5. Viết hướng dẫn ngắn vào docs/PROGRESS.md: các bước tôi cần bấm trên GitHub (Settings → Pages → Source: GitHub Actions).
Hoàn thành khi: DoD; Lighthouse PWA ≥ 90; tự kiểm TC-001, 002 (mô phỏng), 012, 029. Kiểm tra thêm: mở được bằng Samsung Internet (không lỗi, chơi được).
Trước khi làm: trình bày kế hoạch và chờ tôi duyệt.
```

---

## TASK-09 – Kiểm thử tự động & rà soát chất lượng

**Prompt**
```
Đọc CLAUDE.md, docs/PROGRESS.md, docs/04_ACCEPTANCE.md. Đây là TASK-09.

Cần làm:
1. Bổ sung e2e Playwright (phone + tablet) cho các TC đánh dấu "Tự động" trong 04_ACCEPTANCE.md, dùng ?e2e=1 (tăng tốc ×10, seed cố định).
2. Rà soát theo CLAUDE.md mục 5 (17 quy tắc): liệt kê vi phạm và sửa.
3. Rà soát accessibility: tương phản, vùng chạm, prefers-reduced-motion, màu + hình.
4. Kiểm tra bundle size, 60fps G1/G3/G5 (ghi số liệu).
5. Xuất báo cáo docs/QA_REPORT.md: bảng 35 TC (Tự động: Pass/Fail; Thủ công: cần tôi test), lỗi đã sửa, rủi ro còn lại.
Hoàn thành khi: toàn bộ test pass, QA_REPORT.md hoàn chỉnh, đã deploy bản mới.
Trước khi làm: trình bày kế hoạch và chờ tôi duyệt.
```

---

## TASK-10 – Sửa lỗi & tinh chỉnh (mẫu dùng lặp lại)

**Prompt** (anh điền phần trong ngoặc vuông)
```
Đọc CLAUDE.md, docs/PROGRESS.md. Đây là TASK-10 – sửa lỗi sau khi phụ huynh test.

Danh sách lỗi/góp ý (từ Excel sheet 5, cột Status = Fail):
- [TC-0xx] [Thiết bị: điện thoại Android / tablet Samsung] [Mô tả lỗi, ảnh chụp nếu có]
- [Góp ý độ khó: vd G1 cấp 1 bé thấy quá nhanh]

Yêu cầu:
1. Với mỗi lỗi: tìm nguyên nhân, đề xuất cách sửa, chờ tôi duyệt rồi sửa; thêm test để lỗi không lặp lại.
2. Góp ý độ khó: sửa docs/data/levels.json (không sửa số trong code), ghi lý do vào docs/PROGRESS.md.
3. Tăng version (patch), cập nhật CHANGELOG trong PROGRESS, deploy.
```

---

## Mẹo dùng Claude Code Desktop

| Tình huống | Cách làm |
|---|---|
| Muốn Claude lên kế hoạch trước | Chọn chế độ **Plan** (ô cạnh nút Gửi hoặc **Ctrl+Shift+M**), duyệt xong đổi **Accept edits** |
| Sang TASK mới | **Ctrl+N** mở phiên mới (CLAUDE.md và PROGRESS.md giữ trí nhớ) |
| Claude làm sai hướng | Bấm **Stop**, mô tả lại; hoặc nhắn “Hoàn tác thay đổi vừa rồi bằng git” |
| Xem trước app | **Ctrl+Shift+B** mở Browser pane (Claude tự chạy dev server) |
| Xem trên điện thoại/tablet | Nhắn “Chạy npm run dev --host, cho tôi địa chỉ IP” → mở bằng Chrome cùng wifi |
| Xem/góp ý code đã sửa | Bấm chỉ số `+x −y` mở diff, bấm dòng để góp ý, **Ctrl+Enter** gửi |
| Hỏi nhanh không sửa code | **Ctrl+;** (side chat) hoặc bắt đầu bằng “Chỉ trả lời, không sửa file: …” |
| Phiên dài | Gõ `/compact` |
