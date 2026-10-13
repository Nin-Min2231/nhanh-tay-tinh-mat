# QA_REPORT – TASK-09 (kiểm thử tự động & rà soát chất lượng)

> Phiên bản app khi viết báo cáo: **0.9.1** · Ngày: 2026-10-11 · Làm trên nhánh `claude/handover-task-continuation-aaaede` (xuất phát từ `main` = `cd9aa62`, v0.9.0). *Các đoạn “Cập nhật sau TASK-10” bên dưới bổ sung số liệu cho **0.9.2** và **0.9.3** (2026-10-13).*
> Báo cáo này viết cho chủ dự án: phần 1 là kết luận, phần 2 là bảng 35 test case, phần 8 là **việc anh cần tự thử trên máy thật**.

## 1. Kết luận ngắn

| Hạng mục | Kết quả |
|---|---|
| `npm run lint` · `npm run build` | Pass |
| Unit test (Vitest) | **523** pass, 1 bỏ qua (tăng từ 470: +53 test mới) |
| E2E (Playwright, 3 khung hình: điện thoại 360×740, tablet ngang 1280×800, tablet dọc 800×1280) | **408 pass, 0 lỗi, 0 chập chờn (136 test × 3 khung hình)** |
| Test chập chờn (G1 TC-004, G3 TC-013) | **Đã ổn định**: trước khi sửa hỏng 11/96 lần, sau khi sửa **0/144 lần** (mỗi test lặp 12 lần × 3 khung hình × 4 luồng) |
| 35 test case | **35/35 có test tự động Pass ở cả 3 khung hình**: 23 TC kiểm được hoàn toàn bằng máy, 12 TC ở mức mô phỏng/cần thêm bước trên máy thật (cột cuối bảng mục 2) |
| Lỗi thật của app tìm thấy và đã sửa | **4** (mục 3, #3–#4, #7–#8) + 2 lỗi về test/cấu hình + 3 lỗi accessibility (#5, #6, #9) |
| Rủi ro còn lại | Mục 8 – chủ yếu là việc cần máy thật (cài PWA, 2 ngón thật, FPS thật, Samsung Internet) |

**Cập nhật sau TASK-10 (v0.9.2):** unit **529** pass (+6) · e2e **417 pass + 15 bỏ qua có chủ ý** (432 test; `zoom.spec.ts` chỉ chạy ở khung `phone`, `home-layout.spec.ts` chỉ ở khung phù hợp), **0 lỗi, 0 chập chờn** (một lượt chạy bị 3 test hỏng vì **máy ngủ giữa chừng**, đã chạy lại toàn bộ pass) · 35 TC không đổi kết quả · chi tiết ở `docs/PROGRESS.md` (nhật ký TASK-10).

**Cập nhật sau TASK-10 đợt 2 (v0.9.3, 2026-10-13):** unit **569** pass, 1 bỏ qua (+40 so với 0.9.2) · e2e **474 pass + 15 bỏ qua có chủ ý = 489 test** (từ 432: +57, gồm `special.spec.ts` mới), **0 lỗi, 0 chập chờn** (12,6 phút, `--workers=3`; lượt đủ bộ đầu tiên trên mã cuối có **1 test đỏ giả** – test xuất CSV ở khung tablet dọc: giờ gieo dữ liệu lấy từ một bộ đếm dùng chung nên hai lượt cùng ngày đảo thứ tự khi bộ đếm quay vòng (lỗi của test, không phải của app); đã sửa test (`aa0d1d3`; chạy lặp 10 lần × 3 khung hình: 30/30 pass) rồi chạy lại đủ bộ: xanh hết) · 35 TC không đổi kết quả (TC-028 vẫn pass sau khi bóng G1 chuyển sang sprite) · gói chính **121,9 KB gzip** (0.9.2: 116,9) · FPS G1 vẫn 60 (mục 6) · Lighthouse + axe đã chạy lại (mục 5) · chi tiết ở `docs/PROGRESS.md` (nhật ký TASK-10 đợt 2).

**v1.0.0 (2026-10-13):** chỉ đổi số phiên bản so với 0.9.3 (anh thử máy thật OK nên phát hành chính thức). Em chạy lại lint, 569 unit test, build và 165 e2e (PWA, khu phụ huynh, khung app) – đều xanh; các số liệu ở đoạn trên (e2e 489, FPS, Lighthouse, axe) đo ở 0.9.3 vẫn áp dụng.

**Có thể cho bé dùng bản 0.9.1 không?** Về mặt kiểm thử tự động: có – không còn test đỏ, không có lỗi chặn. Trước khi giao cho bé dùng lâu dài nên làm hết mục 8 (đặc biệt: sao lưu → khôi phục thật, cài PWA, thử G5/G3 trên Galaxy Tab).

## 2. Bảng 35 test case

Cột “Tự động” là kết quả chạy thật của Playwright (số trong ngoặc = số test gắn mã TC đó). Cột “Cần anh thử” = phần mà môi trường giả lập **không thay được máy thật**.

| TC | Nội dung | Loại kiểm | Tự động: điện thoại | tablet ngang | tablet dọc | Cần anh thử máy thật |
|---|---|---|---|---|---|---|
| TC-001 | Cài PWA lên điện thoại, mở toàn màn hình | Mô phỏng (manifest, icon, service worker đủ điều kiện cài) | Pass (2) | Pass (2) | Pass (2) | Có: cài thật bằng Chrome Android |
| TC-002 | Cài PWA lên Galaxy Tab, xoay ngang/dọc | Mô phỏng (cùng test TC-001 + 3 khung hình) | Pass (2) | Pass (2) | Pass (2) | Có: cài thật + xoay máy |
| TC-003 | Tạo hồ sơ, linh vật chào, mở lại vẫn nhớ | Tự động | Pass (2) | Pass (2) | Pass (2) | Không |
| TC-004 | G1: chạm xanh / đỏ / chỗ trống | Tự động | Pass (1) | Pass (1) | Pass (1) | Không (cảm giác chơi thì có) |
| TC-005 | G2: chạm 1→9; chạm sai ghi 1 lỗi | Tự động | Pass (2) | Pass (2) | Pass (2) | Không |
| TC-006 | G4: đúng dài thêm, sai thử lại 1 lần | Tự động | Pass (4) | Pass (4) | Pass (4) | Không |
| TC-007 | G5: 2 ngón cùng lúc vào nốt đôi | Mô phỏng (2 ngón qua giao thức CDP) | Pass (1) | Pass (1) | Pass (1) | Có: 2 ngón thật trên tablet |
| TC-008 | Xoay máy / ẩn app → tự tạm dừng; Thoát không lưu | Tự động | Pass (2) | Pass (2) | Pass (2) | Không |
| TC-009 | 3 lượt ≥ 85% → lên cấp, “Lên cấp!” | Tự động | Pass (1) | Pass (1) | Pass (1) | Không |
| TC-010 | Khu PH: biểu đồ đúng số liệu theo ngày + cấp độ | Tự động | Pass (5) | Pass (5) | Pass (5) | Không |
| TC-011 | Giới hạn 15 phút: nhắc còn 2 phút, hết giờ khóa thẻ | Tự động | Pass (2) | Pass (2) | Pass (2) | Không |
| TC-012 | Offline: mở app, chơi đủ 7 game, lưu tiến độ | Tự động (tắt mạng thật của trình duyệt) | Pass (2) | Pass (2) | Pass (2) | Có: chế độ máy bay trên máy thật |
| TC-013 | G3: chạm thú / Nhím / chỗ trống | Tự động | Pass (3) | Pass (3) | Pass (3) | Không |
| TC-014 | G1: số màu bóng = 4, mỗi màu hình riêng | Tự động | Pass (2) | Pass (2) | Pass (2) | Không |
| TC-015 | G2 Cố định cấp 5: chơi 3 lượt vẫn cấp 5 | Tự động | Pass (2) | Pass (2) | Pass (2) | Không |
| TC-016 | Bé chọn Dễ → cấp 3, cấp tự động giữ nguyên | Tự động | Pass (2) | Pass (2) | Pass (2) | Không |
| TC-017 | 2 lượt < 50% → giảm cấp nhẹ nhàng | Tự động | Pass (1) | Pass (1) | Pass (1) | Không |
| TC-018 | G6 lớp 2: 10 câu đúng chủ đề, sai → hình minh họa + hỏi lại | Tự động | Pass (1) | Pass (1) | Pass (1) | Không (duyệt nội dung mẫu thì có) |
| TC-019 | G6: hết giờ câu = chưa đúng, không lời chê | Tự động | Pass (1) | Pass (1) | Pass (1) | Không |
| TC-020 | G7 cấp 1–5: sai → tô sáng quy luật, đúng lần 2 được ½ điểm | Tự động | Pass (1) | Pass (1) | Pass (1) | Không |
| TC-021 | 3 nhiệm vụ → 1 hộp quà, mở hộp, sticker vào album | Tự động | Pass (2) | Pass (2) | Pass (2) | Không |
| TC-022 | Giới hạn hộp/ngày: “Mai con nhận tiếp nhé!” | Tự động | Pass (2) | Pass (2) | Pass (2) | Không |
| TC-023 | Hết giờ → PH +10 phút → thẻ mở lại | Tự động | Pass (3) | Pass (3) | Pass (3) | Không |
| TC-024 | Hai hồ sơ A/B độc lập | Tự động | Pass (2) | Pass (2) | Pass (2) | Không |
| TC-025 | Sao lưu → xóa dữ liệu → khôi phục đủ | Tự động (+ unit test khứ hồi) | Pass (4) | Pass (4) | Pass (4) | Có: tải/chọn file trên Android thật |
| TC-026 | Khóa PH: sai 3 lần → khóa 30 giây → phép tính mới | Tự động | Pass (2) | Pass (2) | Pass (2) | Không |
| TC-027 | So sánh tuần đầu ↔ gần nhất, đủ 7 game, mũi tên | Tự động | Pass (5) | Pass (5) | Pass (5) | Không |
| TC-028 | G1 cấp ≥ 8: 4 loại bóng phân biệt được khi đen trắng | Mô phỏng (đọc hình bóng từ canvas, không dùng màu) | Pass (1) | Pass (1) | Pass (1) | Có: đen trắng thật |
| TC-029 | Cập nhật: nút chỉ ở Home, không giữa lượt, dữ liệu giữ nguyên | Mô phỏng (máy chủ tĩnh đổi sw.js giữa chừng) | Pass (2) | Pass (2) | Pass (2) | Có: 2 lần deploy thật (bản 0.9.1 là lần thử) |
| TC-030 | “Con nghỉ đây” +2 sao một lần/ngày | Tự động | Pass (4) | Pass (4) | Pass (4) | Không |
| TC-031 | 2 ngón cùng lúc: chỉ ngón đầu được tính (G1, G2) | Mô phỏng (2 ngón qua CDP) | Pass (2) | Pass (2) | Pass (2) | Có (cùng lần thử 2 ngón) |
| TC-032 | Điện thoại dọc, G5: 4 làn ≥ 48px, nốt đôi | Mô phỏng (kích thước làn + TC-007) | Pass (1) | Pass (1) | Pass (1) | Có: 2 ngón cái thật |
| TC-033 | Quay lại: đang chơi → tạm dừng; Home → nhắc thoát | Mô phỏng (`page.goBack()`) | Pass (2) | Pass (2) | Pass (2) | Có: vuốt cử chỉ thật |
| TC-034 | Chia đôi màn hình / cửa sổ nổi: tạm dừng + “Mở toàn màn hình” | Mô phỏng (đổi cỡ cửa sổ) | Pass (1) | Pass (1) | Pass (1) | Có: Galaxy Tab thật |
| TC-035 | Tablet không rung: lắc hình + âm “bụp”, không báo lỗi | Mô phỏng (không gọi rung; có lắc + âm) | Pass (1) | Pass (1) | Pass (1) | Có: tablet Samsung thật |

Chú thích loại: **Tự động** = test chạy được hoàn toàn bằng máy; **Mô phỏng** = test tự động dựng lại tình huống (vd 2 ngón qua giao thức CDP, đổi cỡ cửa sổ) nhưng chưa phải thiết bị thật nên **vẫn cần anh thử**.

## 3. Lỗi và vi phạm đã tìm thấy – đã sửa

| # | Loại | Phát hiện | Nguyên nhân | Cách sửa | Bằng chứng |
|---|---|---|---|---|---|
| 1 | Test chập chờn | G1 TC-004 và G3 TC-013 thỉnh thoảng đỏ ở khung tablet (11/96 lần) | **Lỗi của test, không phải của game.** Test chạm “chỗ trống” ở điểm cách mép 5px; sau mỗi lần chạm sai khung chơi **lắc ±6px trong ~150 ms** (`.shake`), điểm chạm trượt ra ngoài khung → bị tính là chạm vào nền, không phải vùng chơi | Chờ hết lắc rồi chạm cách mép 14px; bot G1 chạm bóng trước rồi mới chạm chỗ trống và **chờ số liệu của game tăng** thay vì chờ cố định 40 ms | Chạy lặp 144 lần: **0 lỗi** |
| 2 | Cấu hình test | Khung `phone` của e2e thực ra bị app coi là **tablet** | Playwright mặc định `screen` = 1920×1080; app phân loại điện thoại/tablet theo `window.screen` → mọi khung đều là “tablet”: nhánh điện thoại (rung, ngưỡng “cửa sổ nhỏ”) chưa từng được kiểm | `playwright.config.ts`: đặt `screen` = viewport cho từng khung | TC-035 giờ kiểm cả hai nhánh: điện thoại có gọi rung, tablet thì không |
| 3 | **Lỗi app** | App để mở qua đêm: sau 00:00 Home vẫn **khóa thẻ game “hết giờ” và nhiệm vụ của hôm qua** cho tới khi có thao tác (rủi ro ghi ở TASK-07) | Home tính “hôm nay” một lần lúc vẽ | `app/today.ts`: tín hiệu `today` tự làm mới lúc 00:00 và mỗi khi app hiện lại/lấy lại tiêu điểm (máy ngủ qua đêm) | 2 test e2e dùng đồng hồ giả: **đỏ trước khi sửa, xanh sau** |
| 4 | **Lỗi app (tiềm ẩn)** | Dữ liệu hỏng/thiếu trường hoặc **file sao lưu bị sửa tay** có thể làm sập tab Tiến bộ/Home (`parseBackup` và các hàm đọc chỉ kiểm hình dạng ngoài cùng, không kiểm từng phần tử) | Không có lớp kiểm tra khi đọc | `app/validate.ts`: loại phần tử sai, thay trường thiếu/sai kiểu bằng mặc định (**dữ liệu hợp lệ giữ nguyên 100%** – có test), gắn vào `storage` và `backup`; hồ sơ không nhận ra được → bản gốc giữ ở `ntm.state.bak` (mở app) hoặc từ chối cả file (khôi phục) | 25 unit test, gồm phá hỏng ngẫu nhiên 500 hồ sơ; test này còn lòi ra lỗi nhỏ: tùy chọn game chứa `NaN` biến thành `null` sau khi lưu → đã lọc |
| 5 | Accessibility | Nút **“Dễ” rộng 43px** (< 48px) ở màn Giới thiệu trên tablet | Nút co về bằng chữ | `.seg-easy { min-width: 52px }` – **chỉ nút này**: lần sửa đầu (min-width cho mọi `.segment`) làm chữ “★ Tự động” tràn **đè lên nút “Khó”** (chạm “Khó” lại chọn “Tự động”) và bị test e2e cũ (G4 chọn “Khó”) bắt được ngay; đã sửa lại và thêm bộ quét “nút bị nút khác đè lên” | Quét 48px + quét đè nút trên mọi màn hình: **0 vi phạm**; bộ quét mới bắt đúng lỗi khi cố ý đặt lại bản sửa sai |
| 6 | Accessibility | Với `prefers-reduced-motion`, **31 hoạt ảnh lặp vô hạn** vẫn chạy (vẫy đuôi Sóc Bo, hình động giới thiệu, nhịp G7…) | Quy tắc chung chỉ rút thời lượng còn 0,01 ms → lặp lại liên tục = chớp | `animation-iteration-count: 1` trong quy tắc giảm chuyển động | Quét `document.getAnimations()` trên mọi màn hình: **0 hoạt ảnh lặp vô hạn** |
| 7 | Hiệu năng | G5 chậm ở màn hình lớn khi CPU yếu (CPU ×4, tablet dọc: **29 fps**) | Mỗi khung hình tô lại 4 dải gradient cao ~1000px | Nền các làn vẽ **một lần** vào canvas riêng nằm dưới (vẽ lại khi đổi kích thước) | CPU ×4: điện thoại 57 → **60**, tablet ngang 40 → **59**, tablet dọc 29 → **59 fps**; so điểm ảnh trước/sau: lệch tối đa 2/255 |
| 8 | Lỗi nhỏ | G5: lúc đếm ngược 3-2-1 **không thấy làn nào** (canvas trống) dù mã ghi “hiện sẵn làn” | Lần đặt lại kích thước đầu tiên xóa canvas mà không vẽ lại | Đã hết nhờ canvas nền ở #7 | Ảnh chụp trước/sau |
| 9 | Accessibility | Nút hộp quà ở Home: tên truy cập (“Con có 1 hộp quà đang chờ!”) không chứa chữ hiển thị (WCAG 2.5.3, axe: mức nghiêm trọng) | `aria-label` khác chữ hiển thị | Có chữ hiển thị thì không đặt `aria-label` (trình duyệt lấy tên từ nội dung); biến thể chỉ có biểu tượng vẫn giữ | axe-core: hết vi phạm này |
| 10 | Accessibility (v0.9.3) | axe-core 4.14 chạy lại ở 0.9.3 báo mức vừa **`heading-order`** ở Album › **Trang phục** và **Hình nền** (tên thẻ là `h3` ngay sau `h1`, nhảy qua `h2`) | Hai tab này không có tiêu đề nhóm nên tên thẻ nối thẳng vào tiêu đề trang (có từ trước đợt này; tab Đặc biệt có tiêu đề nhóm `h2` nên không bị) | Mỗi tab Album có một `h2` ẩn (`.visually-hidden`) trùng tên tab | Test e2e mới ở `a11y.spec.ts` kiểm thứ bậc tiêu đề ở cả 4 tab (**đỏ khi bỏ bản sửa**); axe chạy lại: 0 vi phạm / 46 lượt |

## 4. Rà soát 17 quy tắc (CLAUDE.md mục 5)

Từ nay các quy tắc quét được bằng mã được **bảo vệ bằng test tự động** `src/qa/rules.test.ts` (26 test) nên vi phạm mới sẽ làm test đỏ ngay.

| Quy tắc | Cách kiểm | Kết quả |
|---|---|---|
| 1 Không quảng cáo/mạng/liên kết ngoài | Test quét mã: không `fetch`/`XMLHttpRequest`/`WebSocket`/URL http(s)/thẻ `<a>`; e2e NF05 + `pwa.spec` (không request ra ngoài, kể cả khu phụ huynh) | **Đạt** |
| 2 Hộp quà không mua bằng tiền | Đọc/grep: không có mua bán/thanh toán/gói trả phí; hộp chỉ từ nhiệm vụ, mốc sao, phụ huynh tặng (unit test `rewards`) | **Đạt** |
| 3 Sai thì nhẹ nhàng, không trừ sao | Âm thanh chỉ có 4 loại (ding, “bụp” nhẹ, sao, lên cấp); không có phép trừ sao trong mã; e2e TC-017 kiểm “sao không bị trừ” | **Đạt** |
| 4 Hình/nhạc tự thiết kế | `public/` chỉ có icon tự vẽ; không file âm thanh/ảnh/video; âm thanh tổng hợp Web Audio (ngũ cung) | **Đạt** |
| 5 Pointer Events, `timeStamp − onset` | Test quét: game không dùng `touchstart`/`mousedown`/`click`; mọi game nhận `pointerdown` | **Đạt** |
| 6 Chạm đầu tiên (G5 đa điểm) | Test quét (chỉ G5 dùng chế độ `multi`) + e2e TC-031, TC-007 | **Đạt** |
| 7 Chạm trống/sai bị tính lỗi (G1, G3) | e2e TC-004, TC-013 | **Đạt** |
| 8 Vùng chạm ≥ 48px, CSS vùng chơi | Quét mọi màn hình ở 3 khung hình (a11y.spec); test quét CSS (`touch-action`, `user-select`, `-webkit-touch-callout`, `overscroll-behavior`, `safe-area`) | **Đạt** (sau khi sửa nút “Dễ”) |
| 9 Màu kèm hình dạng/biểu tượng | G1: 4 hình bóng khác nhau (TC-028 đọc hình bóng từ canvas, không dùng màu); G4: biểu tượng trong ô; G7: mỗi màu một hoa văn; khu phụ huynh: mũi tên ▲▼ + chữ. **Ghi chú G5:** màu viên ngọc chỉ là trang trí – làn xác định bằng **vị trí cột**, không cần phân biệt màu | **Đạt** |
| 9a S Pen như ngón tay | Test quét: không lọc theo `pointerType` | **Đạt** |
| 9b Đúng/sai không phụ thuộc rung | TC-035: tablet không gọi rung nhưng vẫn lắc + âm “bụp”; test quét: `navigator.vibrate` chỉ ở `haptics.ts`, luôn kèm lắc hình | **Đạt** |
| 10 Tạm dừng khi ẩn/đổi hướng/đổi cỡ | e2e TC-008, NF11/TC-034; test quét: `visibilitychange`, `pagehide`, `resize` ở `Play.tsx` | **Đạt** |
| 10a Nút Quay lại Android | e2e TC-033 (`page.goBack()`) | **Đạt** (vuốt thật: mục 8) |
| 11 `localStorage` chỉ qua `storage.ts` | Test quét: `localStorage`/`sessionStorage`/`indexedDB` chỉ có ở `app/storage.ts` | **Đạt** |
| 12 `schemaVersion` + migration + test | `storage.test.ts` (migration 1→2, dữ liệu mới hơn, JSON hỏng) + 25 test `validate` | **Đạt** |
| 13 Không tự tải lại khi có SW mới | Test quét: không `location.reload/assign/replace`, `applyUpdate` chỉ gắn vào nút ở Home và tab Dữ liệu; e2e `pwa.spec` (luồng cập nhật thật) | **Đạt** |
| 14 Random ảnh hưởng điểm/thưởng dùng `rng.ts` | Test quét: `Math.random` chỉ ở `device.ts` (id dự phòng), `rng.ts` (hạt giống), `Rest.tsx` (chọn gợi ý vận động – không ảnh hưởng điểm/thưởng) | **Đạt** |
| 15 Logic thuần có unit test | 7 game đều có `logic.test.ts`; `adaptive`, `scoring`, `rewards`, `session`, `mathFacts`, `daily`, `benchmark`, `parentGate`, `parentOps`, `backup`, `storage`, `validate`, `today`, `rng`, `device`, `routes`, `profile` đều có test | **Đạt** |
| 16 Chuỗi giao diện chỉ ở `i18n/vi.ts` | Test quét chữ có dấu tiếng Việt ngoài `vi.ts`: chỉ còn thông báo lỗi nội bộ, so khớp nhãn dữ liệu `levels.json` và chẩn đoán bộ kiểm câu G7 (danh sách cho phép ghi rõ trong test) | **Đạt** |
| 17 60 fps, không tạo object/đọc layout mỗi khung | Test quét: `getBoundingClientRect` chỉ ở `CanvasStage`/`PointerInput`/G6; G1/G3/G5 `view.ts` không đọc layout; **đo FPS** (mục 6) | **Đạt** (G3 trên tablet khi CPU ×4: xem mục 6 và 8) |

## 5. Accessibility

Kiểm tự động (`tests/e2e/a11y.spec.ts`, 3 khung hình, bật `prefers-reduced-motion`) trên **mọi màn hình**: tạo hồ sơ, chọn người chơi, Home (bình thường + hết giờ), Album (4 tab), hộp quà, Giới thiệu 7 game, đang chơi 6 game + tạm dừng, Kết quả, Nghỉ, khóa phụ huynh, 6 tab khu phụ huynh.

- **Vùng chạm ≥ 48px:** 0 vi phạm (sau khi sửa nút “Dễ”).
- **Giảm chuyển động:** 0 hoạt ảnh lặp vô hạn đang chạy (trước đó 31).
- **Tương phản chữ/nền (WCAG AA, tính từ màu thật đang hiển thị, nền gradient lấy trường hợp xấu nhất):** 0 vi phạm. Bộ quét đo **4–151 chữ mỗi màn hình** (có test chống “xanh giả”); sát ngưỡng nhất: chữ lớn 3,5:1 (yêu cầu 3:1), chữ thường 4,6:1 (yêu cầu 4,5:1). Chữ “muted” `#4d6270` trên trắng ≈ 6,4:1.
- **axe-core 4.14** (chạy **một lần** bằng gói tải riêng, **không thêm vào dự án**) trên các màn hình chính ở 360×740 và 1280×800: **42 lượt quét** (21 màn hình × 2 khung hình) lúc đầu có **2 loại vi phạm**: (1) `meta-viewport` – `user-scalable=no` (ở cả 42 lượt, mức vừa; **chờ anh quyết định**, xem dưới); (2) `label-content-name-mismatch` mức nghiêm trọng ở **nút hộp quà trên Home** (tên đọc cho người khiếm thị không chứa chữ “Hộp quà” hiển thị) → **đã sửa**. Sau khi sửa chỉ còn mục (1).
- **~~Đã biết, chưa đổi~~ → đã xử lý ở TASK-10 (v0.9.2):** viewport từng có `user-scalable=no` (từ TASK-01, để bé không lỡ phóng to khi chạm nhanh) nên Lighthouse/axe trừ điểm. Nay viewport **cho phóng to bằng 2 ngón** ở mọi màn trừ màn chơi: cả màn chơi (`.play`) có `touch-action: none`; nếu bé phóng to ở màn khác rồi vào game thì game **tự tạm dừng và nhắc chụm 2 ngón để thu nhỏ**. Kiểm bằng cử chỉ 2 ngón thật (CDP) ở `tests/e2e/zoom.spec.ts` và test quét viewport ở `src/qa/rules.test.ts`. (Đã chạy lại axe-core + Lighthouse ở v0.9.3: xem ngay dưới.)
- **Cập nhật TASK-10 đợt 2 (v0.9.3) – Lighthouse + axe chạy lại sau khi bỏ `user-scalable=no`** (bản build giống GitHub Pages: `BASE_PATH=/nhanh-tay-tinh-mat/`, `vite preview`, công cụ cài **ngoài dự án** trong thư mục tạm, không đụng `package.json`):
  - **Lighthouse 13.5.0** (di động, 4G chậm mô phỏng, lần tải đầu – màn tạo hồ sơ): Performance **83–84** (2 lần đo) · **Accessibility 100** (TASK-08: 93; mục `meta-viewport` đã đạt nhờ bỏ `user-scalable=no`) · Best Practices **81** (chỉ còn “không dùng HTTPS” vì đo trên localhost; bản Pages có HTTPS) · SEO **60** (chỉ còn `is-crawlable` vì cố ý `noindex`). Lighthouse 13 có thêm nhóm “Agentic Browsing”: 100.
  - **axe-core 4.14.0**: 46 lượt quét (23 màn × 2 khung 360×740 và 1280×800: tạo hồ sơ, Home có chấm nhắc sao lưu (Sóc Bo), Home với Cú Mèo + Nhạc Cụ Gõ, Album 4 tab, Giới thiệu 7 game, đang chơi G2, tạm dừng, khóa phụ huynh, 6 tab khu phụ huynh). Lượt đầu có **1 loại vi phạm mức vừa: `heading-order`** (tên thẻ `h3` ngay sau `h1` ở Album › Trang phục và Hình nền, 4 lượt) → **đã sửa** (mỗi tab Album có tiêu đề `h2` ẩn; test e2e mới kiểm thứ bậc tiêu đề ở cả 4 tab, và đã thử bỏ bản sửa thì test đỏ); chạy lại: **0 vi phạm / 46 lượt**. Mục `meta-viewport` (còn lại của TASK-09) không còn xuất hiện.

## 6. Hiệu năng và kích thước

**Kích thước (bản build thật):** gói chính `index-*.js` 366,8 KB = **112,1 KB gzip**; Chart.js tách riêng (chỉ tải khi mở tab Tiến bộ) 54,7 KB gzip; CSS 13,2 KB gzip. Tổng JS gzip ≈ 169 KB (**giới hạn 350 KB gzip: đạt**). Precache 17 mục ≈ 1,08 MB. Khởi động offline (TASK-08): FCP ≈ 100 ms. *(TASK-10, v0.9.2: gói chính 378,6 KB = 116,9 KB gzip theo số Vite báo; dựng lại 0.9.1 bằng đúng cách đó cho 375,6 KB = 116,2 KB gzip, nên số 112,1 KB ở trên là đo ở thời điểm/cách khác – mức tăng thật của 0.9.2 chỉ ≈ 0,7 KB gzip.)*

**FPS của game canvas** (`npm run perf`: bản build thật, cấp 10 = nặng nhất, lấy mẫu 6 giây đầu của lượt thật × 2 lượt; Chromium không có GPU nên chỉ để **so sánh/phát hiện hồi quy**, không thay được số đo trên máy thật):

| Khung hình | Game | CPU thường (khung/giây · khung > 20 ms) | CPU chậm ×4 (khung/giây · khung > 20 ms) |
|---|---|---|---|
| Điện thoại 360×740 | G1 | 60,1 · 0% | 60,1 · 0% |
| | G3 | 60,1 · 0% | 59,9 · 0,1% |
| | G5 | 60,1 · 0% | 60,1 · 0% |
| Tablet ngang 1280×800 | G1 | 60,1 · 0% | 60,1 · 0% |
| | G3 | 60,1 · 0% | **50,9** · 17,5% |
| | G5 | 60,1 · 0% | 59,1 · 1,7% |
| Tablet dọc 800×1280 | G1 | 60,1 · 0% | 60,1 · 0% |
| | G3 | 60,1 · 0% | **56,5** · 6,2% |
| | G5 | 60,0 · 0% | 59,1 · 1,8% |

*Trước khi sửa G5 (CPU ×4): điện thoại 57,0 · tablet ngang 40,1 · tablet dọc 28,6 fps.* Số đo dao động ±10% giữa các lần chạy (G3 tablet dọc có lần ra 44 fps).

- Với CPU bình thường của máy dev: cả 3 game **60 fps, 0% khung > 20 ms** ở cả 3 khung hình.
- Giả lập CPU chậm ×4 là mức **bi quan** (canvas trên Android chạy bằng GPU nên khác). G1 vẫn 60 fps; G5 sau khi sửa (#7) đạt 59–60 fps; **G3 ở tablet còn 44–57 fps** (dao động giữa các lần đo) – đã thử loại chữ “z” của Nhím (không phải điểm nghẽn); ~~chưa tìm ra nguyên nhân chắc chắn~~ → **đã điều tra ở TASK-10, xem ngay dưới**.

**Cập nhật TASK-10 – nguyên nhân G3 thấp là do môi trường đo, không phải lỗi của game.** Hồ sơ CPU (CDP `Profiler`) của G3 trên Chromium của Playwright (tablet ngang, CPU ×4): main thread bận **96,6%** nhưng JS chỉ **10,2%**; **87% mẫu nằm ở “(program)”** = việc gốc của trình duyệt, tức rasterize canvas bằng phần mềm (Chromium của Playwright **không có GPU**, WebGL báo SwiftShader). Cùng bản build, đo lại bằng **Chrome 155 cài sẵn có GPU (Intel Iris Xe)** (`npm run perf -- --gpu`; cột “bận” = % thời gian main thread làm việc):

| Khung hình | Game | CPU thường (fps · bận) | CPU ×4 (fps · bận) |
|---|---|---|---|
| Điện thoại 360×740 | G1 | 60,1 · 5% | 60,1 · 21% |
| | G3 | 60,1 · 6% | 60,1 · 30% |
| | G5 | 60,1 · 5% | 60,1 · 24% |
| Tablet ngang 1280×800 | G1 | 60,1 · 4% | 60,2 · 25% |
| | G3 | 60,1 · 6% | 60,1 · 37% |
| | G5 | 60,2 · 5% | 60,1 · 27% |
| Tablet dọc 800×1280 | G1 | 60,2 · 4% | 60,2 · 26% |
| | G3 | 60,1 · 7% | 60,2 · 30% |
| | G5 | 60,2 · 6% | 60,2 · 30% |

Cả 18 tổ hợp: **60 fps, 0% khung > 20 ms**. Đo thêm riêng G3 với CPU chậm hơn nữa: **×6 và ×8 vẫn 60 fps** ở tablet ngang và tablet dọc (main thread bận 47–53% ở ×6, 63–65% ở ×8) và điện thoại ×4 60 fps (bận 30–34%). Kết luận: **không có điểm nghẽn riêng của G3 trong mã** (ở ×4 G3 chiếm main thread 30–37%, hơn G1 khoảng 5–12 điểm phần trăm và gần mức G5 24–30%), nên **không sửa game**. Lưu ý: GPU Intel Iris Xe mạnh hơn GPU của Galaxy Tab dòng A rất nhiều, nên đây là bằng chứng “mã không lãng phí”, **không thay được số đo thật** trên máy anh (`?debug=1`).

**Cập nhật TASK-10 đợt 2 (v0.9.3) – đo lại G1 sau khi bóng/khối chuyển sang sprite bóng bẩy** (`npm run perf -- --gpu --games=G1`: cùng Chrome 155 có GPU, bản build thật, cấp 10, 6 giây × 2 lượt; cột “bận” = % thời gian main thread làm việc; trong ngoặc là số của 0.9.2 để so):

| Khung hình | G1: CPU thường (fps · bận) | G1: CPU ×4 (fps · bận) |
|---|---|---|
| Điện thoại 360×740 | 60,1 · 5% (0.9.2: 60,1 · 5%) | 60,2 · 26% (60,1 · 21%) |
| Tablet ngang 1280×800 | 60,1 · 5% (60,1 · 4%) | 60,1 · 28% (60,2 · 25%) |
| Tablet dọc 800×1280 | 60,2 · 5% (60,2 · 4%) | 60,1 · 30% (60,2 · 26%) |

Cả 6 tổ hợp: **60 fps, 0% khung > 20 ms** (p99 ≈ 17 ms, lâu nhất 17,5 ms). Main thread bận tăng nhẹ ở CPU ×4 (+3 đến +5 điểm phần trăm; hình bóng chi tiết hơn) nhưng vẫn rất xa giới hạn → **không cần tối ưu thêm**. G3 và G5 không đổi mã ở 0.9.3 nên không đo lại (số ở trên của 0.9.2 vẫn đúng). Vẫn cần xem FPS thật bằng `?debug=1` trên Galaxy Tab.

## 7. Độ bền dữ liệu

- Đọc `ntm.rounds.*`, `ntm.daily.*`, `ntm.state` và file sao lưu đều qua `validate.ts` (mục 3 #4).
- 6.000 lượt (5 hồ sơ × 120 ngày × 10 lượt) kiểm trong vài chục ms (có test giới hạn 500 ms).
- Các tình huống đã có test: JSON hỏng, thiếu `days`/`rewardLog`/`games`/`boxes`, `metrics: null`, ngày/game lạ, `NaN` trong tùy chọn, hồ sơ trùng `id` hoặc thiếu `name`, dữ liệu từ phiên bản mới hơn (không ghi đè), sao lưu → xóa → khôi phục khứ hồi giữ nguyên (TC-025).

## 8. Rủi ro còn lại và việc anh cần làm trên máy thật

| # | Việc | Vì sao cần máy thật | Liên quan |
|---|---|---|---|
| 1 | Cài PWA lên điện thoại/Galaxy Tab bằng Chrome, mở từ icon, thử máy bay (mở app đã cài, chơi vài game, tắt mở lại) | Bản kiểm tự động chỉ chứng minh manifest/icon/service worker/offline đủ điều kiện; việc cài thật do Chrome Android thực hiện | TC-001, 002, 012 |
| 2 | Bấm **“Cập nhật”** trên app đã cài (bản 0.9.1 là lần deploy thứ 3) rồi vào Khu phụ huynh → Dữ liệu xem “Phiên bản 0.9.1”, hồ sơ còn nguyên | Cần 2 lần deploy thật | TC-029 |
| 3 | Chơi G5 bằng **2 ngón thật** (tablet cấp ≥ 4 và điện thoại dọc): nốt đôi tính đủ, 4 làn dễ chạm | Mô phỏng 2 ngón qua CDP khác ngón tay thật | TC-007, 032 |
| 4 | Vuốt cử chỉ Quay lại của Android khi đang chơi và ở Home; chia đôi màn hình/cửa sổ nổi trên Galaxy Tab | Mô phỏng bằng `page.goBack()` và đổi cỡ cửa sổ | TC-033, 034 |
| 5 | Tablet Samsung: chạm bóng đỏ G1 → khung lắc + âm “bụp” | Mô phỏng chỉ kiểm không gọi rung | TC-035 |
| 6 | Chụp màn hình G1 cấp ≥ 8, chuyển ảnh đen trắng (hoặc bật bộ lọc thang xám của Android) | Mô phỏng đọc hình bóng từ canvas | TC-028 |
| 7 | Bật `?debug=1` trên máy thật xem FPS G1/G3/G5 (G3 đã đo lại ở TASK-10 bằng Chrome có GPU: 60 fps tới CPU ×8; **G1 sau khi đổi sang bóng bóng bẩy ở 0.9.3 cũng đã đo lại: 60 fps**) | GPU máy dev mạnh hơn nhiều so với Galaxy Tab dòng A; chỉ máy thật mới cho số cuối cùng | NF Hiệu năng |
| 8 | **Sao lưu → xóa dữ liệu trang → khôi phục** trên bản Pages thật; thử Samsung Internet | Lưu/mở file trên Android, trình duyệt khác | TC-025, NF07 |
| 9 | ~~Quyết định giữ/bỏ `user-scalable=no`~~ → **đã bỏ ở 0.9.2**: thử trên máy thật: phóng to ở Home bằng 2 ngón (được), vào một game khi đang phóng (game tạm dừng + nhắc thu nhỏ), đang chơi chụm 2 ngón (không phóng) | Cử chỉ thật của Chrome Android/Samsung Internet có thể khác Chromium giả lập | – |
| 10 | **(0.9.3)** Album → tab **Đặc biệt**: “Nghe thử” rồi “Dùng” **Nhạc Cụ Gõ** (nghe tiếng đúng/sai/được sao), “Dùng” **Cú Mèo** (Home, G6, G7 hiện Cú); **chấm đỏ** trên nút Phụ huynh ở Home khi chưa sao lưu; **xuất CSV** mở bằng Excel/Google Trang tính; bóng/khối G1 mới vẫn thấy rõ ✕ / ! / ~ | Tiếng, hình và Excel thật chỉ anh nghe/nhìn/mở được | – |

Rủi ro kỹ thuật còn lại (không chặn): (a) ~~G3 trên tablet 44–57 fps khi giả lập CPU ×4~~ → là do Chromium thử nghiệm không có GPU, đã đo lại 60 fps bằng Chrome có GPU (mục 6, TASK-10); chỉ còn việc xem FPS thật trên Galaxy Tab; (b) ~~khu phụ huynh chưa có xuất CSV~~ → đã làm ở 0.9.3 (dòng đầu `sep=,` của file CSV giúp Excel tách cột đúng, **chưa kiểm bằng Google Trang tính thật**); (c) bộ đếm “sai 3 lần” của khóa phụ huynh nằm trong bộ nhớ (tải lại trang là thử lại được); (d) ~~`AppState.installedVersion` chưa cập nhật~~ → đã làm ở 0.9.3.

## 9. Cách chạy lại

```bash
npm run lint && npm test                          # lint + 500+ unit test (gồm test quét 17 quy tắc)
npx playwright test --workers=3                   # e2e đầy đủ, 3 khung hình (~12 phút)
npx playwright test a11y --workers=3              # chỉ accessibility
npm run perf                                      # đo FPS G1/G3/G5 (build bản thật vào dist-perf) bằng Chromium của Playwright (KHÔNG GPU → fps ở CPU ×4 bi quan)
npm run perf -- --gpu                             # như trên nhưng dùng Chrome/Edge cài sẵn có GPU (sát thiết bị thật hơn); hoặc --chrome=<đường dẫn> / biến CHROME_PATH
npm run perf -- --games=G5 --cpu=4 --no-build     # lọc: --games, --viewports, --cpu
PLAYWRIGHT_JSON_OUTPUT_NAME=kq.json npx playwright test --reporter=line,json && node scripts/qa-table.mjs kq.json   # bảng TC
# axe-core + Lighthouse: KHÔNG nằm trong package.json – cài vào một thư mục tạm riêng bằng: npm install --ignore-scripts axe-core lighthouse
npm run build:pages   # rồi (PowerShell): $env:BASE_PATH='/nhanh-tay-tinh-mat/'; npx vite preview --port 4190 --strictPort --host 127.0.0.1
node scripts/qa-axe.mjs http://127.0.0.1:4190/nhanh-tay-tinh-mat/ <thư mục cài> [kq.json]   # axe-core, 46 lượt (23 màn × 2 khung)
$env:CHROME_PATH='C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'; node scripts/qa-lighthouse.mjs http://127.0.0.1:4190/nhanh-tay-tinh-mat/ <thư mục cài> [kq.json]
```

Lưu ý: **không chạy hai lệnh Playwright cùng lúc trong một thư mục** (lệnh sau xóa `test-results` của lệnh trước làm test đang chạy báo lỗi “không mở được file trace”).
