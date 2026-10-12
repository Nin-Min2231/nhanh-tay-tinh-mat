# PROGRESS – Nhật ký tiến độ

> Claude Code: đọc file này đầu mỗi phiên; cập nhật cuối mỗi TASK (ghi mới lên trên cùng của mục Nhật ký).

## Trạng thái hiện tại

| TASK | Trạng thái | Ngày | Ghi chú |
|---|---|---|---|
| TASK-00 Môi trường + Git/GitHub | Xong | 2026-10-10 | Repo: https://github.com/Nin-Min2231/nhanh-tay-tinh-mat |
| TASK-01 Khởi tạo dự án | Xong | 2026-10-10 | lint/test/build/e2e đều pass |
| TASK-02 Khung app | Xong | 2026-10-10 | lint, 42 unit test, build, 51 e2e (17 × 3 khung hình) đều pass; cần anh thử TC-034/035 trên tablet Samsung |
| TASK-03 G1 + G2 + độ khó | Xong | 2026-10-10 | lint, 100 unit test, build, 90 e2e (30 × 3 khung hình) đều pass; kèm bảng màu mới rực rỡ; cần anh thử cảm giác chơi + FPS trên tablet |
| TASK-04 G3 + G4 + G5 | Xong | 2026-10-10 | lint, 170 unit test, build, 135 e2e (45 × 3 khung hình) đều pass; cần anh thử TC-007 (2 ngón thật), TC-032 và cảm giác chơi/FPS trên tablet |
| TASK-05 G6 + G7 | Xong | 2026-10-10 | lint, 373 unit test, build, 204 e2e (68 × 3 khung hình) đều pass; cần anh **duyệt nội dung mẫu** `docs/samples/` + thử cảm giác chơi trên máy thật |
| TASK-06 Thưởng | Xong | 2026-10-10 | lint, 409 unit test, build, 267 e2e (89 × 3 khung hình) đều pass; **đã gộp vào `main`**; cần anh **duyệt 40 sticker + trang phục/hình nền** và thử hộp quà/album trên máy thật |
| TASK-07 Khu phụ huynh | Xong, **đã gộp `main`, v0.9.0 đang live** | 2026-10-11 | lint, 470 unit test, build, 375 e2e (125 × 3 khung hình) đều pass; TC-010/023/025/026/027 tự kiểm Pass; **cần anh thử trên máy thật** + duyệt chữ R13 |
| TASK-08 PWA + deploy | Xong, **đã gộp `main`, Pages đang chạy** | 2026-10-11 | Pages: https://nin-min2231.github.io/nhanh-tay-tinh-mat/ ; còn chờ anh thử cài + máy bay trên máy thật (TC-001/002/012) và TC-029 sau bản 0.9.0 |
| TASK-09 QA | **Xong, đã gộp `main`, v0.9.1 live** (anh đồng ý 2026-10-12) | 2026-10-11 | lint, **523 unit test**, build, **408** e2e (3 khung hình) đều pass; test chập chờn đã ổn định; báo cáo `docs/QA_REPORT.md`; **cần anh thử trên máy thật** (QA_REPORT mục 8) |
| TASK-10 Sửa lỗi & tinh chỉnh | **Đợt 1 xong, đã gộp `main` + deploy v0.9.2** (anh “Đồng ý” 2026-10-13) | 2026-10-12 | Mục tồn đọng đã biết: cho phóng to bằng 2 ngón (màn chơi vẫn chặn), Home tablet ngang xếp 3 nhóm cạnh nhau (vừa một màn), icon thẻ G1/G2 mới, điều tra G3; chi tiết ở nhật ký. **Chưa có danh sách lỗi từ máy thật** → đợt 2 khi anh gửi |

## Câu hỏi mở (chờ chủ dự án)

- Không còn câu hỏi chặn. R23–R25 (mới v1.2) áp dụng theo đề xuất; chủ dự án có thể góp ý trong quá trình làm.
- ~~**Quyết định (TASK-09):** có bỏ `user-scalable=no`?~~ → **Đã bỏ ở 0.9.2** (anh đồng ý kế hoạch TASK-10): viewport cho phóng to, màn chơi vẫn chặn; xem nhật ký TASK-10. Nếu thử máy thật thấy bé hay phóng nhầm ở Home thì báo, em đổi sang chặn phóng ở màn của bé và chỉ cho phóng ở khu phụ huynh.
- **Việc anh cần làm cho TASK-10 đợt 1:** (1) ~~cho phép gộp nhánh vào `main`~~ → **đã gộp + deploy 0.9.2 (2026-10-13)**: mở app đã cài, đợi vài giây rồi bấm **“Cập nhật”** ở Home; (2) thử máy thật theo “Cách thử thủ công” ở nhật ký TASK-10 (Home xoay ngang trên Galaxy Tab, icon mới, phóng to 2 ngón); (3) **gửi danh sách lỗi/góp ý** từ lần thử máy thật (mẫu: `docs/03_TASKS.md` mục TASK-10) để làm đợt 2; (4) quyết định **Nhạc Cụ Gõ + Cú Mèo** (làm hay bỏ).
- **Việc anh cần làm cho TASK-09 (còn lại; 0.9.1 đã deploy):** thử máy thật theo **`docs/QA_REPORT.md` mục 8** (9 việc, mỗi việc ghi rõ vì sao cần máy thật) – quan trọng nhất: bấm “Cập nhật” trên app đã cài, G5 bằng 2 ngón thật, **FPS thật G3/G5 trên Galaxy Tab bằng `?debug=1`**, sao lưu → khôi phục thật.
- **Duyệt nội dung mẫu G6/G7** trong `docs/samples/` (câu nào quá khó/dễ với bé lớp 2?).
- **Duyệt hình thưởng TASK-06**: 40 sticker (tên + độ hiếm), 2 trang phục, 2 hình nền – xem bằng `npm run dev` rồi mở `http://localhost:5173/?gallery=1` (thêm `&theme=animal|fruit|space|vehicle` để xem to) và `?gallery=1&view=rewards`. Hình nào chưa ưng thì báo số `stk-xx` để em vẽ lại.
- **Hai phần thưởng mốc sao chưa dùng được** (đã mở khóa và hiện trong Album, tab Đặc biệt, ghi “Dùng được ở bản sau”): **Bộ âm thanh Nhạc Cụ Gõ** (80 sao) và **Linh vật Cú Mèo** (230 sao). Anh muốn làm ở TASK-10 hay bỏ?

- **Việc anh cần làm cho TASK-08 (còn lại)**: cài thử lên điện thoại/Galaxy Tab + chế độ máy bay (TC-001, 002, 012), mở thử bằng Samsung Internet; **duyệt icon** (`public/icons/icon-512.png`). Hướng dẫn từng bước ở nhật ký TASK-08.
- **Việc anh cần làm cho TASK-07** (đã gộp + deploy 0.9.0): (1) thử khu phụ huynh trên máy thật theo “Cách thử thủ công” ở nhật ký TASK-07 (khóa, biểu đồ, bài đo tuần, cài đặt, thưởng, **sao lưu → khôi phục**) và **bấm “Cập nhật” trên app đã cài** (TC-029); (2) **duyệt chữ “khi nào nên cho bé đi khám” (R13)** do em tự soạn (`vi.parent.data.note`); (3) quyết định có bỏ `user-scalable=no` ở viewport (Lighthouse trừ điểm accessibility) hay không.

## Đề xuất (ngoài phạm vi, để sau)

- **Bộ âm thanh Nhạc Cụ Gõ + Linh vật Cú Mèo** (mốc 80 và 230 sao): cần tổng hợp âm mới (`audio.ts` có thêm “bộ âm” để chọn) và vẽ Cú Mèo 5 biểu cảm như Sóc Bo → TASK-10 nếu anh muốn. Hiện chỉ mở khóa + hiện trong Album.
- **Kích thước JS** tăng lên ≈ 98 KB gzip (từ ≈ 64 KB): 40 sticker + 2 hình nền + trang phục ≈ +33 KB. Vẫn thấp hơn nhiều giới hạn 350 KB. **Đã đo ở TASK-08: khởi động offline ≈ 100 ms → không tách gói tải sau** (toàn bộ đã nằm trong cache offline); chỉ Chart.js (TASK-07) nên tải sau.
- Chữ tên sticker dưới mỗi ô Album đang 16px (nhỏ hơn mức 18px của SPEC) để vừa 4 cột trên điện thoại 360px; nếu anh thấy khó đọc thì chuyển sang bấm vào ô để xem tên (đã có).
- Tỷ lệ độ hiếm thật sau “bảo đảm Hiếm” là ≈ **66 / 28,3 / 5,7** (Thường / Hiếm / Siêu hiếm), không phải đúng 70/25/5 (xem nhật ký TASK-06). Muốn đúng 70/25/5 thì phải bỏ bảo đảm; muốn giữ bảo đảm mà gần 70/25/5 hơn thì hạ xác suất Hiếm ở lần tung gốc – chỉnh trong `rollRarity` (`rewards.ts`) nếu anh muốn.

- ~~Home tablet ngang: xếp 3 nhóm game cạnh nhau~~ → **đã làm ở TASK-10 (0.9.2)**.
- **Bóng/khối của G1 trong game** (canvas) vẫn vẽ phẳng (màu + viền) trong khi icon thẻ G1 nay bóng bẩy; có thể vẽ sprite bóng một lần (như G3/G5) cho khớp – cần giữ 60 fps và quy tắc 17 (không tạo gradient mỗi khung hình).
- Kích thước JS tăng từ ≈ 33 KB lên ≈ 64 KB (gzip) vì có thêm bộ sinh câu G6/G7: có thể tách mỗi game thành gói tải sau (dynamic import) nếu TASK-08 đo thấy lần mở đầu chậm (mặc định không tách).
- G6: M11 (nhân/chia số 2–3 chữ số) ở dạng tìm số thiếu ra số khá lớn (vd `? : 5 = 57`); đây là chủ đề lớp 3, không bật mặc định – nếu anh thấy khó quá thì giới hạn dạng tìm số thiếu cho M11 ở TASK-10.
- G7 cấp 5 (mẫu 2 thuộc tính): khi sai hiện tô sáng cả dãy 6 ô; có thể làm lời giải thích riêng “màu lặp 2 nhịp, hình lặp 3 nhịp” nếu anh muốn (TASK-10).
- G6 hình minh họa khi sai hiện 1,5 giây đúng SPEC; nếu thấy bé chưa kịp nhìn thì tăng hằng số `SHOW_MS` (`games/g6-math/view.ts`).
- ~~Hai test e2e chập chờn (G1 TC-004, G3 TC-013)~~ → **đã sửa ở TASK-09** (nguyên nhân là test, không phải game).
- ~~**G3 trên tablet khi giả lập CPU ×4: 44–57 fps**~~ → **đã điều tra ở TASK-10: không phải lỗi của G3** mà do Chromium của Playwright vẽ canvas bằng phần mềm (xem nhật ký TASK-10; đo lại bằng Chrome có GPU: 60 fps kể cả CPU ×8). Vẫn nên xem FPS thật bằng `?debug=1` trên Galaxy Tab.
- Khu phụ huynh: xuất CSV, so sánh nhiều bé; nhắc sao lưu ngay ở Home (chưa làm).

## Changelog (theo phiên bản; mỗi lần gộp `main` = một phiên bản)

| Phiên bản | Ngày | Nội dung |
|---|---|---|
| **0.9.2** | 2026-10-13 (gộp `main` + deploy) | TASK-10 đợt 1: cho phóng to bằng 2 ngón (màn chơi vẫn chặn; vào game khi đang phóng thì tạm dừng + nhắc thu nhỏ); Home tablet ngang (≥ 1200px) xếp 3 nhóm game cạnh nhau, vừa một màn; icon thẻ G1/G2 mới; script `npm run perf` có `--gpu` + cột “main thread bận”; không sửa G3 (xem nhật ký) |
| 0.9.1 | 2026-10-12 (deploy) | TASK-09 QA: ổn định 2 test chập chờn; sửa app mở xuyên đêm, dữ liệu hỏng/file sao lưu sửa tay, G5 nền làn vẽ một lần, accessibility (nút “Dễ” 48px, hoạt ảnh lặp khi giảm chuyển động, tên nút hộp quà) |
| 0.9.0 | 2026-10-11 | TASK-07: khu phụ huynh (khóa, tiến bộ + biểu đồ, bài đo tuần, cài đặt, hồ sơ, thưởng, sao lưu/khôi phục), schema dữ liệu 2 |
| 0.8.0 | 2026-10-11 | TASK-08: PWA (cài được, offline, nút Cập nhật), deploy GitHub Pages |

## Nhật ký

### 2026-10-12 – TASK-10 đợt 1 (mục tồn đọng đã biết) – v0.9.2
- Bối cảnh: anh đồng ý gộp TASK-09 vào `main` (0.9.1 đã deploy, CI + Deploy xanh) và chọn **“làm các mục tồn đọng đã biết”** vì chưa có danh sách lỗi từ máy thật; anh “Đồng ý” kế hoạch 4 mục. Việc còn lại của TASK-10 (đợt 2) chờ anh thử máy thật và gửi lỗi/góp ý.
- Đã làm:
  1. **Cho phóng to bằng 2 ngón** (mục duy nhất axe còn báo): bỏ `user-scalable=no` ở `index.html`. Màn chơi vẫn **không** phóng được: cả màn chơi (`.play`: thanh trên, lề, lớp phủ, không chỉ vùng chơi) có `touch-action: none`. Nếu bé phóng to ở màn khác rồi mới vào game thì game **tự tạm dừng, hiện “Màn hình đang bị phóng to. Con chụm 2 ngón tay lại để thu nhỏ rồi chơi tiếp nhé!”** và nút “Chơi tiếp” bị khóa cho tới khi thu nhỏ (nếu không, bé kẹt trong game bị phóng mà không chụm lại được). Mã: `app/zoom.ts`, `Play.tsx`, `PauseOverlay.tsx`, `app.css`. **Đã thử rồi loại bỏ:** đổi `<meta viewport>` lúc chạy để “reset” zoom (không có tác dụng). Kiểm bằng **cử chỉ 2 ngón thật** (CDP) ở `tests/e2e/zoom.spec.ts` + em đã thử bỏ quy tắc `touch-action` thì test đỏ đúng chỗ (không phải test xanh giả).
  2. **Home tablet ngang (≥ 1200px)**: nửa trên chia 2 cột (lời chào + thời gian | nhiệm vụ + hộp quà), 7 thẻ game trên **một hàng** chia 3 nhóm; khung rộng tối đa 1240px. Chiều cao Home ở 1280×800: **1502 → 766px** (vừa một màn, kể cả khi banner “Thử thách tuần” đang hiện; không có banner ≈ 665px). Điện thoại (1931px) và tablet dọc (1502px) **không đổi một pixel**. Tablet ngang hẹp hơn 1200px giữ lưới 4 cột như cũ (thẻ sẽ quá hẹp: chip “Cấp 1 · ★☆☆” tràn thẻ ở ~1100px). Đã xem ảnh 3 trường hợp: mặc định, có hình nền + trang phục, hết giờ.
  3. **Icon thẻ G1 và G2** vẽ lại cho khớp phong cách G3–G7 (chuyển sắc, vệt sáng, đổ bóng): G1 = bóng xanh mặt cười (mắt có ánh sáng, má hồng) + khối đỏ dấu ✕ trắng + ngôi sao lấp lánh; G2 = bảng 3×3 dùng **đúng 5 màu ô của game** (hồng, vàng, xanh lá, xanh trời, tím), số xáo trộn, ô “1” viền vàng. Màu vẫn kèm hình dạng/số (mù màu).
  4. **G3 FPS (44–57 fps ở CPU ×4)**: điều tra bằng hồ sơ CPU (CDP) → **không phải lỗi của G3**: Chromium của Playwright không có GPU nên vẽ canvas bằng phần mềm trên main thread (~87% thời gian ở “(program)”, JS chỉ ~10%). Đo lại bằng **Chrome cài sẵn có GPU** (Intel Iris Xe): **G3 60 fps ở CPU ×4, ×6 và ×8**, ở cả 3 khung hình (main thread bận 30% ở ×4, 65% ở ×8) – giống G1/G5. **Không sửa mã game.** Em nâng `scripts/perf-fps.mjs`: `--gpu` (tự tìm Chrome/Edge) / `--chrome=<đường dẫn>` / `CHROME_PATH`, và thêm cột “main thread bận %” (bền hơn fps vì fps bị chặn ở 60).
  - Tài liệu: `docs/01_SPEC.md` mục 12b (Home tablet ngang + phóng to bằng 2 ngón), `docs/QA_REPORT.md` (mục 5, 6, 8, 9), `docs/HANDOVER.md`, Changelog ở trên. Version **0.9.2**.
- Test: `npm run lint` pass · **529 unit test** pass (+6: `zoom.test.ts` 3, `rules.test.ts` 3; 1 test sinh file mẫu bị bỏ qua khi chạy thường) · `npm run build` OK · **e2e đủ bộ: 417 pass, 0 lỗi, 0 chập chờn, 15 bỏ qua có chủ ý** (11,6 phút, `--workers=3`). Test e2e mới: `zoom.spec.ts` (5 test, chỉ khung `phone` vì cử chỉ 2 ngón thật cần chế độ di động giả lập) và `home-layout.spec.ts` (3 test, mỗi test chỉ chạy ở khung phù hợp) → 432 test, 15 cái “bỏ qua” là các khung không áp dụng. 35 TC trong `docs/04_ACCEPTANCE.md` không đổi kết quả.
  - **Lưu ý về lượt chạy đầu tiên:** có 3 test hỏng ở khung `tablet` (TC-015, TC-016 ×2) nhưng đó là do **máy ngủ giữa chừng** (3 test đang chạy song song cùng kéo dài ≈ 3380 giây rồi hết hạn 30 giây; 414 test còn lại chạy bình thường, chậm nhất 35 giây). Chạy lại riêng 3 test: pass (42 giây); chạy lại **toàn bộ** (có giữ máy thức): 417 pass. Không phải lỗi mã.
- Số đo: gói chính 378,6 KB = **116,9 KB gzip** (Vite báo; dựng lại bản 0.9.1 bằng đúng cách đó cho 375,6 KB = 116,2 KB gzip → **tăng ≈ 0,7 KB gzip**; CSS 13,86 KB gzip, +0,17); Chart.js tách riêng 56,6 KB gzip; giới hạn 350 KB gzip. **FPS** (Chrome có GPU, bản build thật, cấp 10, 6 giây × 2 lượt): G1/G3/G5 **60 fps, 0% khung > 20 ms** ở cả 3 khung hình, CPU thường và CPU ×4 (main thread bận 4–7% / 21–37%); G3 còn 60 fps ở CPU ×6 và ×8 (tablet ngang/dọc). Bảng đầy đủ: `docs/QA_REPORT.md` mục 6.
- **Gộp `main` + deploy:** anh “Đồng ý” ngày 2026-10-13; em gộp kiểu fast-forward (`main` từ `ac285bc` lên đầu nhánh task, 6 commit) rồi push → GitHub Pages tự deploy (~2 phút).
- Cách thử thủ công (Galaxy Tab/điện thoại: mở app đã cài, đợi vài giây rồi bấm **“Cập nhật”** ở Home, vào Khu phụ huynh → Dữ liệu xem “Phiên bản 0.9.2”):
  1. **Home xoay ngang (Galaxy Tab):** 3 nhóm “Phản xạ / Tập trung & Trí nhớ / Học mà chơi” đứng cạnh nhau, 7 thẻ trên một hàng, tên game 2 dòng, biểu tượng thẳng hàng; gần như không phải cuộn. Xoay dọc: về 3 cột như cũ. Điện thoại: không đổi.
  2. **Icon mới:** nhìn thẻ “Bóng Xanh – Bóng Đỏ” và “Bảng Số Thần Kỳ” ở Home và ở ô Nhiệm vụ (Phản xạ / Tập trung). Anh thấy có ưng không? (Nếu muốn chỉnh màu/hình, báo em.)
  3. **Phóng to ở Home:** dùng 2 ngón dang ra → phóng được (và chụm lại thì về như cũ). Khu phụ huynh cũng phóng được.
  4. **Vào game khi đang phóng:** phóng to Home → bấm một game → Bắt đầu → game hiện **“Đã tạm dừng”** + dòng nhắc chụm 2 ngón, nút “Chơi tiếp” **mờ** → chụm lại → nút sáng lên, bấm chơi tiếp được.
  5. **Đang chơi:** thử dang 2 ngón (ở thanh tiêu đề và giữa vùng chơi): **không** bị phóng. G5 (2 ngón vào 2 làn) vẫn chơi bình thường.
  6. **FPS thật:** mở `http://192.168.1.14:5173/?debug=1` (bản dev trên máy anh, sau khi `main` có 0.9.2) trên Galaxy Tab, chơi G3 và G5 cấp cao, nhìn số fps ở góc HUD.
- Quyết định khi làm (anh góp ý nếu không đồng ý):
  - **Vẫn cho phóng ở Home/Giới thiệu/Kết quả…** (đúng kế hoạch đã duyệt). Nếu thử máy thật thấy bé hay phóng nhầm thì em chuyển sang **chặn phóng ở các màn của bé và chỉ cho phóng ở khu phụ huynh** (cách này cần xử lý thêm trường hợp “phóng ở khu phụ huynh rồi về Home”).
  - Game đang bị phóng thì **không cho “Chơi tiếp”** (khóa nút) thay vì cho chơi trong màn hình bị phóng – tránh bé kẹt.
  - Ngưỡng bố cục mới là **1200px** (không phải 1100px): ở ~1100px chip cấp độ tràn thẻ.
  - Điện thoại ngang (~900px) **không** dùng bố cục mới (thẻ quá hẹp).
  - **Không sửa G3** vì chưa có bằng chứng nghẽn; nếu máy thật vẫn giật, đo bằng `?debug=1` rồi hồ sơ hóa trên máy đó.
  - **Nhạc Cụ Gõ + Cú Mèo**: chưa làm (anh chưa quyết định); bóng/khối G1 trong game vẫn phẳng (xem “Đề xuất”).
- Còn lại / nợ kỹ thuật: danh sách thử máy thật (mục “Cách thử thủ công” + `QA_REPORT.md` mục 8); chưa chạy lại axe-core/Lighthouse sau khi bỏ `user-scalable=no` (quy tắc `meta-viewport` đã được test quét giữ đúng); Samsung Internet chưa kiểm cử chỉ phóng; TASK-10 đợt 2 chờ lỗi/góp ý của anh.
- Commit: `feat: allow pinch zoom outside games; pause and prompt when a game starts zoomed` · `feat: tablet-landscape Home (>= 1200px) with the 3 game groups side by side` · `feat: glossy G1 and G2 card icons` · `perf: perf script can use a GPU Chrome (--gpu) and reports main-thread busy %; chore: 0.9.2` · `docs: …`.

### 2026-10-11 – TASK-09 (kiểm thử tự động & rà soát chất lượng)
- Anh đã “Đồng ý” kế hoạch 8 bước + 4 quyết định mặc định (axe-core chạy một lần bằng gói riêng; sửa test chứ không đổi game; lỗi nhỏ sửa luôn, lỗi lớn ghi “Đề xuất”; version 0.9.1). Báo cáo đầy đủ: **`docs/QA_REPORT.md`**.
- Đã làm:
  - **Test chập chờn G1 TC-004 / G3 TC-013 → ổn định.** Nguyên nhân là **test**: chạm “chỗ trống” cách mép 5px lúc khung đang lắc ±6px (`.shake`) nên điểm chạm trượt ra ngoài khung. Sửa helper (chờ hết lắc, cách mép 14px, bot chạm bóng trước rồi chạm chỗ trống và chờ số liệu tăng). Trước: hỏng 11/96 lần; sau: **0/144 lần** (12 lần × 3 khung hình × 4 luồng).
  - **`playwright.config.ts` đặt `screen` = viewport:** trước đó cả 3 khung hình bị app coi là “tablet” (Playwright mặc định screen 1920×1080) nên nhánh điện thoại chưa từng được kiểm.
  - **Test mới:** `qa.spec.ts` (TC-028 đọc hình bóng từ canvas, TC-035 không rung ở tablet + lắc + âm “bụp”, 2 test qua nửa đêm bằng đồng hồ giả), `a11y.spec.ts` (7 test × 3 khung: vùng chạm ≥ 48px + nút không bị nút khác đè, không hoạt ảnh lặp vô hạn khi giảm chuyển động, tương phản AA từ màu thật), `src/qa/rules.test.ts` (26 test quét mã nguồn bảo vệ các quy tắc 1, 5, 6, 8, 9a, 9b, 10, 11, 13, 14, 16, 17), `validate.test.ts` (25), `today.test.ts` (2).
  - **Lỗi thật của app đã sửa:** (1) app mở qua đêm vẫn khóa “hết giờ”/nhiệm vụ của hôm qua → `app/today.ts`; (2) dữ liệu hỏng / file sao lưu bị sửa tay có thể làm sập biểu đồ → `app/validate.ts` (loại phần tử sai, thay trường thiếu/sai bằng mặc định; dữ liệu hợp lệ giữ nguyên 100%; hồ sơ không nhận ra được → khôi phục từ chối cả file, mở app thì giữ bản gốc `ntm.state.bak`); (3) G5 tô lại 4 làn mỗi khung hình → vẽ một lần ở canvas dưới (FPS G5 ở tablet dọc, CPU ×4: 29 → 59); lúc đếm ngược G5 giờ hiện sẵn 4 làn (trước đó canvas trống); (4) accessibility: nút “Dễ” rộng 43px, 31 hoạt ảnh lặp vô hạn khi giảm chuyển động, nút hộp quà sai tên truy cập.
  - **Một lần tự gây lỗi rồi tự bắt:** lần sửa nút “Dễ” đầu tiên làm chữ “★ Tự động” tràn đè nút “Khó” trên tablet; test e2e cũ bắt được, em sửa lại và thêm bộ quét “nút bị nút khác đè lên”.
  - **Công cụ:** `npm run perf` (đo FPS bản thật), `scripts/qa-table.mjs` (bảng TC từ báo cáo Playwright). axe-core chạy một lần ngoài dự án: chỉ còn `user-scalable=no`.
  - Cập nhật `docs/01_SPEC.md` (đọc dữ liệu có kiểm tra, đổi ngày khi app mở), `docs/04_ACCEPTANCE.md` (TC-028/035 có bản mô phỏng), `docs/HANDOVER.md`, version **0.9.1**.
- Test case tự kiểm: **35/35 TC có ít nhất một test tự động Pass ở cả 3 khung hình** (408 e2e + 523 unit); bảng chi tiết ở `docs/QA_REPORT.md` mục 2. TC-028 và TC-035 (trước đây chỉ “Thủ công”) nay có bản mô phỏng.
- Số đo: gói chính 366,8 KB = **112,1 KB gzip** (Chart.js tách riêng 54,7 KB gzip; giới hạn 350 KB gzip); precache 17 mục ≈ 1,08 MB. FPS (bản thật, CPU thường): G1/G3/G5 **60 fps, 0% khung > 20 ms** ở cả 3 khung hình; CPU ×4: G1 60, G5 59–60, G3 44–57 (tablet).
- Cách thử thủ công (sau khi anh cho phép gộp `main` và Pages deploy xong, ~2 phút):
  1. Mở app đã cài từ icon khi có mạng, đợi vài giây → Home hiện **“Có bản mới – Cập nhật”** → bấm → vào Khu phụ huynh → Dữ liệu: “Phiên bản 0.9.1”, hồ sơ/sao còn nguyên (**TC-029**).
  2. Mở màn Giới thiệu bất kỳ game: 4 nút **Dễ / Vừa / ★ Tự động / Khó** nằm cùng hàng, chạm “Khó” chọn đúng “Khó” (không bị “Tự động” đè).
  3. Chơi **G5** trên tablet: lúc đếm ngược đã thấy 4 làn; chơi mượt. Bật `?debug=1` xem FPS (G3 và G5 là hai game cần kiểm FPS thật).
  4. Để app mở Home qua đêm rồi sáng hôm sau mở lại: thẻ game phải mở khóa và nhiệm vụ mới (không cần chạm gì trước).
  5. Các việc còn lại (2 ngón thật, Quay lại, chia đôi màn hình, tablet không rung, đen trắng G1, sao lưu → khôi phục thật, Samsung Internet): theo **`docs/QA_REPORT.md` mục 8**.
- Quyết định khi làm (anh góp ý nếu không đồng ý):
  - Dữ liệu hỏng: lượt/tổng hợp thiếu thông tin cốt lõi (game, thời điểm, điểm) bị **bỏ**, trường phụ sai kiểu thì **thay bằng mặc định**; khi khôi phục từ file có hồ sơ không nhận ra được thì **từ chối cả file** thay vì lặng lẽ bỏ hồ sơ.
  - `activeProfileId` trỏ vào hồ sơ không tồn tại: giữ nguyên (app đã coi là “chưa chọn”).
  - Chỉ đặt `min-width` cho nút “Dễ” (nhãn ngắn), không đặt cho mọi nút lựa chọn.
  - G5: sửa hiệu năng bằng canvas nền riêng (không đổi hình; so điểm ảnh lệch tối đa 2/255). **G3 chưa tối ưu** vì chưa rõ điểm nghẽn và số đo giả lập bi quan.
  - `user-scalable=no` giữ nguyên chờ anh quyết định.
  - Không chạy lại Lighthouse (không thêm vào dự án); axe-core chỉ chạy một lần ngoài dự án.
- Còn lại / nợ kỹ thuật: danh sách thử máy thật (QA_REPORT mục 8); G3 FPS thật; `user-scalable`; khu phụ huynh chưa có xuất CSV; `AppState.installedVersion` chưa cập nhật khi lên bản mới.
- Commit: `test: …`, `fix: data repair …`, `perf(G5): …`, `fix(a11y): …`, `docs: …` (xem `git log`).

### 2026-10-11 – TASK-07 gộp `main` + lập kế hoạch TASK-09 (chưa sửa mã)
- Chủ dự án đồng ý gộp: `main` = `cd9aa62`, CI + Deploy xanh, **bản 0.9.0 đang chạy trên Pages** (đã kiểm: trang trả 200, bản live có mã khu phụ huynh và gói Chart.js trong precache).
- Đã đọc tài liệu TASK-09 và **rà soát sơ bộ, chưa sửa gì**: 2 test chập chờn ≈ 8% (chỉ ở khung tablet, lỗi của test), nút “Dễ” ở màn Giới thiệu trên tablet rộng 43px (< 48px), TC-028/035 chưa có test tự động, `parseBackup` chưa kiểm từng phần tử → rủi ro khi khôi phục file sửa tay. **Kế hoạch 8 bước + 4 quyết định mặc định + số đo đã trình bày cho chủ dự án, chờ “Đồng ý”** – toàn bộ ở `docs/HANDOVER.md` mục 6. Nhánh `claude/task-09-qa` (từ `main`) đã tạo.

### 2026-10-11 – TASK-07 (Khu phụ huynh)
- Anh đã dặn “làm luôn không cần hỏi” nên em bỏ bước chờ duyệt kế hoạch (CLAUDE.md mục 6.2) ở TASK này; các quyết định tự chọn ghi bên dưới để anh góp ý.
- Đã làm:
  - **Khóa phụ huynh** (`screens/ParentGate.tsx`, `app/parentGate.ts` thuần + test): phép nhân a × b (a 12–49, b 3–9), bàn phím số to (≥ 56px; gõ bằng bàn phím máy tính cũng được), sai 3 lần → khóa 30 giây có đếm ngược rồi ra **phép tính mới**. Vào khu PH phải qua khóa mỗi lần; rời khu là khóa lại (kể cả gõ thẳng địa chỉ `#/parent/...`).
  - **Khu phụ huynh** (`screens/ParentArea.tsx` + `ui/parent/*`, 6 tab, chữ thường, gọn): chọn hồ sơ của bé ở đầu trang; **nhắc sao lưu** ở mọi tab khi chưa sao lưu hoặc > 14 ngày.
  - **Tiến bộ** (F06, F18): lọc game (7) × chỉ số (2–4 chỉ số/game, có “thấp hơn là tốt”) × khoảng ngày (7/30/tất cả) × thiết bị (điện thoại/máy tính bảng/tất cả); biểu đồ **Chart.js** (đường chỉ số + đường cấp độ nét đứt, trục phải 0–10), bảng **10 lượt gần nhất**. Chart.js được nạp **sau** (tách gói riêng ≈ 57 KB gzip, chỉ tải khi mở tab Tiến bộ, vẫn nằm trong cache offline). **`DailyAggregate`** (`app/daily.ts`) dựng/cập nhật khi mở app và sau mỗi lượt; lượt chi tiết cũ hơn **120 ngày bị dọn** (tổng hợp theo ngày giữ mãi).
  - **Bài đo tuần** (F16): banner **“Thử thách tuần”** ở Home (khi chưa làm đủ bộ hoặc ≥ 7 ngày; hiện “đã làm n/7” nếu làm dở), nút **“Bắt đầu bài đo cho bé”** ở tab. Luồng: Giới thiệu (nhãn “Thử thách tuần”, không có Dễ/Vừa/Khó) → chơi ở **cấp cố định `levels.json → benchmark`**, tùy chọn mặc định, G6 dùng chủ đề mặc định của lớp → Kết quả “Thử thách tuần: n/7” + nút **Game tiếp theo** → xong 7 game thì ghi `lastBenchmarkAt` và tắt banner. Không tính độ khó thích ứng; có +sao như thường; thời gian bài đo tính vào giới hạn ngày. Tab hiện **so sánh tuần đầu ↔ tuần gần nhất** cho đủ 7 game dạng thẻ (mũi tên ▲▼ + chữ “Tiến bộ/Giảm/Như nhau” + viền màu; chiều “thấp hơn là tốt” cho thời gian phản ứng, thời gian hoàn thành).
  - **Cài đặt** (F07, F09, F11, F12, F17): thời gian/ngày (5–60, bước 5), hộp tối đa/ngày (0–5); âm thanh/nhạc/rung; “cho bé chọn độ khó”; **từng game**: Tự động (cấp thấp nhất–cao nhất) hoặc Cố định (chọn cấp) + tùy chọn riêng (G1 số màu/bóng cùng lúc, G2 cỡ bảng/thứ tự/gợi ý, G3 tốc độ/Nhím, G4 số ô/tốc độ/độ dài, G5 tốc độ rơi/nốt đôi, G6/G7 đồng hồ); **G6**: lớp + chủ đề M01–M14 (luôn còn ≥ 1); **G7**: nhóm dạng câu Hình/Số/Ma trận (luôn còn ≥ 1).
  - **Hồ sơ** (F02): thêm/sửa (tên, hình, lớp); **xóa phải gõ đúng tên** (xác nhận 2 bước), xóa luôn lượt chơi + tổng hợp của hồ sơ đó. Tối đa 5 hồ sơ.
  - **Thưởng** (F15): +5/+10/+15 phút cho hôm nay, tặng 1/2/3 hộp quà (không tính giới hạn hộp/ngày), kèm **lý do** (Học tốt/Ngoan/Giúp việc nhà/Khác) và nhật ký 10 lần gần nhất.
  - **Dữ liệu** (F10, NF07): **Sao lưu** ra `nhanhtay-backup-YYYYMMDD.json` (Blob + `a[download]` → thư mục Tải xuống); **Khôi phục** (chọn file → **xem trước** số hồ sơ/lượt/khoảng ngày/phiên bản → xác nhận ghi đè); cảnh báo xóa dữ liệu trình duyệt/ẩn danh/Chrome ≠ Samsung Internet; trạng thái lưu trữ bền; số phiên bản + nút Cập nhật; ghi chú “khi nào nên cho bé đi khám”. Máy **chưa có hồ sơ nào** (vừa xóa dữ liệu) có nút **“Khôi phục dữ liệu”** ngay trên màn tạo hồ sơ đầu tiên (đi qua khóa PH) và khôi phục xong về thẳng Home.
  - **Dữ liệu/cấu trúc**: `schemaVersion` **1 → 2** (thêm `Profile.rewardLog`, có **migration + test**); `storage.snapshot/restoreAll`; `docs/01_SPEC.md` mục 5 đã cập nhật.
  - Dọn: bỏ trang “Đang xây dựng” (`UnderConstruction`). Phiên bản app **0.9.0**.
- Test case tự kiểm (Playwright 3 khung hình + unit): **TC-010 Pass** (biểu đồ đúng số liệu theo ngày từng game kèm cấp độ, lọc thiết bị/khoảng ngày, dựng tổng hợp từ lượt cũ) · **TC-023 Pass** (hết giờ → +10 phút → thẻ game mở lại, đồng hồ còn đúng 10 phút) · **TC-025 Pass** (sao lưu → xóa localStorage → khôi phục từ file: hồ sơ, sao, sticker, lịch sử, cài đặt quay lại đủ) · **TC-026 Pass** (sai 3 lần → khóa + đếm ngược → phép tính mới) · **TC-027 Pass** (so sánh tuần đầu/gần nhất đủ 7 game, mũi tên, chiều “thấp hơn là tốt”) · **TC-015 Pass qua giao diện khu PH** (G2 Cố định cấp 5, chơi 3 lượt vẫn cấp 5). Thêm: bài đo chạy trọn vẹn (cấp cố định, không tính adaptive, sang game kế tiếp, đủ bộ → tắt banner), dọn lượt > 120 ngày (lượt bài đo giữ lại), 5 hồ sơ tối đa, file sao lưu sai báo lỗi và không ghi đè, nhắc sao lưu, nút Quay lại, không tràn ngang + vùng chạm ≥ 48px ở cả 3 khung hình.
- Unit test: **470** (+61: `daily`, `benchmark`, `parentGate`, `backup` (gồm **sao lưu → khôi phục khứ hồi giữ nguyên dữ liệu**), `parentOps`, migration schema 1 → 2). E2E: **375** (125 test × 3 khung hình; +28 test mới ở `parent.spec.ts` × 3 khung hình = +84).
- Số đo: gói chính **≈ 114 KB gzip** (+15 KB so với 99 KB; giới hạn 350 KB), Chart.js tách riêng ≈ 57 KB gzip.
- Cách thử thủ công (điện thoại/tablet; bản Pages sau khi anh gộp, hoặc `npm run dev -- --host`):
  1. **Khóa:** Home → icon ổ khóa → giải phép nhân bằng bàn phím trên màn hình → vào khu PH. Thử sai 3 lần (khóa 30 giây, rồi phép tính mới).
  2. **Tiến bộ:** cho bé (hoặc anh) chơi vài lượt G1/G2 trong 2 ngày liền (hoặc cả điện thoại lẫn tablet) → tab Tiến bộ → đổi game/chỉ số/khoảng ngày/thiết bị, xem biểu đồ và “10 lượt gần nhất”.
  3. **Bài đo tuần:** Home → banner “Thử thách tuần” → chơi lần lượt 7 game (≈ 8–10 phút; có thể dừng giữa chừng và làm tiếp). Tuần sau làm lại rồi xem tab “Bài đo tuần” có so sánh. Để xem nhanh: dùng `?debug=1` không thay được – cần 2 tuần dữ liệu thật hoặc để em seed dữ liệu thử.
  4. **Cài đặt:** đổi thời gian/ngày xuống 5 phút rồi chơi để thấy nhắc “Còn 2 phút”/hết giờ; đặt G1 “Cố định” cấp 3; tắt “cho bé chọn độ khó” rồi mở màn Giới thiệu.
  5. **Thưởng (TC-023):** để hết giờ chơi → Khu PH → Thưởng → +10 phút → về Home: thẻ game mở lại, còn 10 phút. Tặng 1 hộp quà → bé mở ở Home.
  6. **Dữ liệu (TC-025):** Sao lưu → kiểm tra file trong thư mục **Tải xuống** → (thử trên bản Pages) xóa dữ liệu trang web: Chrome ⋮ → Cài đặt → Cài đặt trang web → Lưu trữ → xóa dữ liệu của `nin-min2231.github.io` → mở app: màn tạo hồ sơ có nút “Đã có file sao lưu? Khôi phục dữ liệu” → chọn file → xem trước → Khôi phục.
  7. **Cập nhật (TC-029):** đây là bản deploy thứ 2 sau TASK-08 → mở app đã cài khi có mạng, đợi vài giây → Home hiện “Có bản mới – Cập nhật” → bấm → vào Khu PH → tab Dữ liệu thấy “Phiên bản 0.9.0”, hồ sơ còn nguyên.
- Quyết định khi làm (anh góp ý nếu không đồng ý):
  - Khóa PH **không tự khóa khi ẩn tab** (cửa sổ chọn file sao lưu trên Android có thể làm trang bị ẩn) – chỉ khóa khi rời khu PH. Bộ đếm “sai 3 lần” nằm trong bộ nhớ: tải lại trang là được thử lại.
  - **Lượt bài đo không tính vào `DailyAggregate`/biểu đồ tiến bộ** (cấp cố định làm lệch đường cấp độ); chúng hiện ở bảng “10 lượt gần nhất” (nhãn “Bài đo”) và tab Bài đo tuần. **Lượt bài đo được giữ mãi** (không dọn sau 120 ngày) để còn so với tuần đầu – SPEC chỉ nói chung “120 ngày”.
  - “Tuần” của bài đo = các khoảng 7 ngày tính từ ngày đo đầu tiên; “tuần gần nhất” = khoảng chứa lần đo mới nhất; nhiều lượt cùng tuần/game lấy trung bình. `lastBenchmarkAt` chỉ ghi khi làm **đủ 7 game** trong 7 ngày (làm dở thì banner vẫn hiện và nhớ đã làm mấy game).
  - Banner “Thử thách tuần” ở Home bấm là chạy luôn (**không cần qua khóa PH**), vì mục đích là để bé tự làm; bé không chọn được độ khó, không có “Chơi lại” trong bài đo.
  - Bài đo G6 dùng chủ đề mặc định của lớp hồ sơ và **sổ lỗi trống** (để đề giống nhau giữa các tuần); kết quả bài đo G6 vẫn cập nhật sổ lỗi như lượt thường.
  - Cài đặt G6: “Lớp” chính là lớp của hồ sơ (đổi lớp → chủ đề toán về mặc định của lớp mới). Tùy chọn `topics`/`grade` kiểu cũ của bảng `?debug=1` vẫn ghi đè nếu có (chỉ dev).
  - Thưởng: **lý do** áp dụng cho cả tặng giờ lẫn tặng hộp (SPEC chỉ ghi lý do cho hộp) để nhật ký thống nhất; lưu 50 mục mới nhất ở `rewardLog` (schema 2).
  - Thêm hồ sơ từ khu PH **không đổi người đang chơi**. Khôi phục giữ `deviceId` của **máy đang khôi phục** (lượt mới không gán nhầm sang máy cũ).
  - **Chữ “khi nào nên cho bé đi khám” (R13) do em tự soạn** vì file Excel gốc không có trong repo – anh xem lại nội dung ở `vi.parent.data.note` (`src/i18n/vi.ts`) và sửa theo ý anh.
  - Khu PH dùng chữ ≥ 16px (bảng) và ≥ 17–18px (thân), tiêu đề 24px – nhỏ hơn mức 28px của giao diện bé (SPEC: “chữ thường”); vùng chạm ≥ 48px.
  - `DebugPanel` (`?debug=1`) vẫn giữ để test e2e dùng; khu PH thật đã có đủ chức năng tương đương.
- Còn lại / nợ kỹ thuật: chưa kiểm trên máy thật (tải file về thư mục Tải xuống trên Android Chrome, cửa sổ chọn file, FPS); khu PH chưa có “xuất CSV”; biểu đồ chưa có tooltip bằng tiếng Việt cho trục ngày dài; `AppState.installedVersion` vẫn chưa cập nhật khi lên bản mới; hai test e2e thời gian thực cũ (G1 TC-004, G3 TC-013) có thể chập chờn (TASK-09).
- Commit: `feat: parent area (gate, progress charts, benchmark flow, settings, profiles, rewards, backup/restore) with e2e`

### 2026-10-11 – TASK-08 (PWA offline + deploy GitHub Pages)
- Đã làm:
  - **Icon** (`scripts/make-icons.mjs`, chạy tay `npm run icons`): Sóc Bo cười, có chuyển sắc + vệt sáng, nền trời xanh, 3 ngôi sao lấp lánh. Xuất `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png` (hình nằm trọn vòng an toàn 80% nên không bị cắt khi Android bo tròn) và `icon.svg` (favicon). PNG đã commit sẵn.
  - **Manifest + precache** (`vite.config.ts`, `index.html`): manifest đầy đủ (tên, tên ngắn, mô tả, `lang: vi`, `standalone`, `orientation: any`, màu nền/chủ đề, `id`/`start_url`/`scope` theo `BASE_PATH`, 3 icon); **sửa lỗi cũ: trước đây cache offline chỉ có JS/CSS/HTML nên font Nunito và icon không chạy offline** – nay precache 16 mục ≈ 782 KiB gồm cả 6 file font woff2, icon, manifest. `noindex` + favicon + mô tả trong `index.html`.
  - **Đăng ký service worker + luồng cập nhật** (`src/app/pwa.ts`): bản build thật luôn đăng ký; bản mới chỉ bật cờ `updateAvailable` → ở **Home** hiện nút “Có bản mới – Cập nhật” (≥ 48px). Chỉ bấm nút mới tải lại trang; **đang chơi / Kết quả / Nghỉ không có nút và không có đường nào tự tải lại**. App tự kiểm tra bản mới mỗi giờ và khi bé quay lại app (chỉ gọi lại `sw.js` cùng nguồn, không request ra ngoài).
  - **Số phiên bản**: `package.json` = **0.8.0**; hiện tạm ở trang Khu phụ huynh (“Phiên bản 0.8.0”) để anh kiểm TC-029. Khu PH thật ở TASK-07 sẽ có mục riêng.
  - **Deploy** (`.github/workflows/deploy.yml`): push `main` (hoặc bấm chạy tay) → `npm ci` → lint → test → `npm run build:pages` (`BASE_PATH=/nhanh-tay-tinh-mat/`) → GitHub Pages. `npm run build:pages` thử chạy được trên Windows (đã kiểm manifest + index.html ra đúng đường dẫn con).
  - **Test e2e mới** `tests/e2e/pwa.spec.ts` (8 test × 3 khung hình = 24): manifest + 3 icon hợp lệ (kích thước PNG thật) · service worker đăng ký đúng phạm vi + precache có font/icon/gói chính · **offline sau lần tải đầu** (tắt mạng hẳn rồi mở lại: **cả 7 game khởi động được, 1 lượt G2 chơi xong và lưu tiến độ**, font Nunito nạp từ cache, không request ra ngoài, không lỗi console, khởi động nhanh) · chạy được **dưới đường dẫn con `/nhanh-tay-tinh-mat/`** như GitHub Pages (thêm máy chủ thử thứ 2 cổng 4174) · nút Cập nhật chỉ hiện ở Home · **luồng cập nhật thật** (giả lập “deploy lần 2” bằng máy chủ tĩnh tự dựng: phát hiện bản mới → chỉ hiện nút, không tự tải lại → bấm mới cập nhật, service worker mới nhận quyền, dữ liệu còn nguyên).
- Test case tự kiểm: **TC-012 Pass (tự động, 3 khung hình)** – offline sau lần tải đầu, 7 game + lưu tiến độ; **TC-001/TC-002 Pass ở mức mô phỏng** (manifest/icon/service worker đủ điều kiện cài đặt + mở lại offline ở 360×740 / 1280×800 / 800×1280; cài thật bằng Chrome cần anh thử); **TC-029 Pass ở mức mô phỏng** (nút chỉ ở Home, không giữa lượt, bấm mới cập nhật, dữ liệu giữ nguyên, bản mới thay bản cũ). **Chưa kiểm được (cần máy thật):** cài từ Chrome Android/Galaxy Tab, máy bay trên máy thật, TC-029 qua 2 lần deploy thật, mở bằng Samsung Internet.
- Số đo: **khởi động offline (FCP) ≈ 90–120 ms** trên máy dev ở cả 3 khung hình (mục tiêu < 2 giây; máy yếu như Galaxy Tab dòng A có thể chậm hơn 5–10 lần nhưng vẫn dư xa) → quyết định **không tách gói tải sau**; JS 317 KB ≈ **99 KB gzip** (giới hạn 350 KB). 
  - **Lighthouse 13 (chạy một lần bằng `npx lighthouse`, bản di động mô phỏng 4G chậm, lần tải đầu chưa có cache, bản build thật phục vụ dưới `/nhanh-tay-tinh-mat/`): Performance 83 · Accessibility 93 · Best Practices 81 · SEO 60.** Lighthouse bản mới **không còn nhóm điểm “PWA”** nên không đo được mục “PWA ≥ 90” của TASK; thay bằng test tự động về cài đặt/offline ở trên. Giải thích các mục chưa đạt: (1) *Best Practices* chỉ mất điểm ở “không dùng HTTPS” vì em đo trên `http://localhost` – trên GitHub Pages là https nên mục này sẽ đạt; (2) *SEO* 60 do **cố ý** `noindex` (không cho Google lập chỉ mục app của bé); (3) *Accessibility* 93 (≥ 90 ✓) – chỉ trừ điểm vì viewport có `user-scalable=no` (có từ TASK-01 để bé không lỡ phóng to khi chạm nhanh; nếu anh muốn cho phóng to thì báo, em bỏ ở TASK-10); (4) *Performance* 83: FCP 3,2 s / LCP 3,7 s là **chỉ lần tải đầu tiên qua mạng 4G chậm mô phỏng** (CSS + gói JS 99 KB gzip chặn hiển thị, báo “JS chưa dùng 195 KiB” vì cả 7 game nằm trong một gói); từ lần mở thứ hai trở đi app chạy từ cache nên nhanh ≈ 100 ms. Không tối ưu thêm ở TASK-08; nếu anh thấy lần tải đầu chậm trên máy thật thì tách gói theo game ở TASK-10.
- Unit test: 409 (không đổi; TASK-08 chủ yếu là cấu hình + e2e). E2E: **291** (97 test × 3 khung hình; +8 test mới).
- **Việc anh cần tự làm (từng bước):**
  1. Trên máy tính, mở https://github.com/Nin-Min2231/nhanh-tay-tinh-mat → thẻ **Settings** → cột trái **Pages** → mục *Build and deployment* → ô **Source** chọn **GitHub Actions** (không cần bấm gì thêm, GitHub tự lưu).
  2. Nhắn em **“Gộp TASK-08 vào main”** → em gộp và đẩy lên GitHub. (Hoặc nếu anh đã gộp: sang bước 3.)
  3. Vào thẻ **Actions** → chọn dòng **Deploy** mới nhất → đợi khoảng 2 phút tới khi có dấu ✓ xanh. Nếu báo lỗi đỏ ở bước “configure-pages” (do bước 1 làm sau): bấm **Re-run all jobs**.
  4. Địa chỉ app: **https://nin-min2231.github.io/nhanh-tay-tinh-mat/** – mở thử trên máy tính trước.
  5. **Trên điện thoại/Galaxy Tab (TC-001, TC-002):** mở **Chrome** → gõ địa chỉ ở bước 4 → bấm menu **⋮** → **Cài đặt ứng dụng** (hoặc **Thêm vào Màn hình chính**) → Cài đặt. Ra màn hình chính, bấm **icon Sóc Bo** để mở: phải mở toàn màn hình, không có thanh địa chỉ. Xoay máy ngang/dọc (tablet) xem bố cục.
  6. **Thử offline (TC-012):** mở app từ icon ít nhất 1 lần khi có mạng → bật **chế độ máy bay** → đóng hẳn app (vuốt bỏ khỏi danh sách ứng dụng gần đây) → mở lại từ icon → chơi thử vài game, tắt rồi mở lại xem tiến độ còn không.
  7. **Samsung Internet (tùy chọn):** mở cùng địa chỉ bằng Samsung Internet, thử chơi 1–2 game (không bắt buộc cài; lưu ý dữ liệu của Chrome và Samsung Internet là **tách riêng**, nên chọn một trình duyệt để cài và dùng).
  8. **Thử cập nhật (TC-029):** sau khi có bản deploy thứ 2 (ví dụ sau TASK-07): mở app từ icon khi có mạng → đợi vài giây (hoặc đóng mở lại app) → ở Home hiện nút **“Có bản mới – Cập nhật”** → bấm → app tải lại; vào **Khu phụ huynh** xem số phiên bản mới, kiểm tra hồ sơ/sao còn nguyên. (GitHub Pages có thể mất ~10 phút mới đưa `sw.js` mới ra.)
  - **Lưu ý:** địa chỉ Pages có dữ liệu **tách riêng** với bản thử trên wifi `192.168.x.x` (hồ sơ tạo ở bản thử không sang bản cài). Bản Pages hiện là **bản dùng thử**: khu phụ huynh/sao lưu chưa có (TASK-07) nên chưa nên cho bé dùng lâu dài.
- Quyết định khi làm (anh góp ý nếu không đồng ý):
  - Icon tạo bằng **script chạy tay** và **commit PNG** (không tạo lúc build) để GitHub Actions không phải cài trình duyệt; Lighthouse chỉ chạy một lần, không thêm vào dự án; không tách gói tải sau; thêm `noindex` (Google không lập chỉ mục app của bé) – đúng 4 quyết định mặc định đã trình bày.
  - Bản build e2e chỉ đăng ký service worker khi URL có `?sw=1` (để 267 test cũ không phải tải lại toàn bộ precache mỗi lần); **bản deploy thật luôn đăng ký**. Cờ `?update=1` giả lập “có bản mới” (chỉ dev/e2e).
  - Nút “Cập nhật” là **nút lớn** ở Home thay cho dòng chữ cũ (SPEC: “Home/khu PH hiện nút”); nút trong khu PH thật làm ở TASK-07.
  - Service worker **không** `clientsClaim`/`skipWaiting`: lần cài đầu, app chỉ được cache sẵn cho **lần mở kế tiếp** (đủ cho TC-012 vì cache được nạp lúc cài); bản mới chờ tới khi bấm “Cập nhật” hoặc đóng hẳn app.
  - Số phiên bản đặt **0.8.0** (khớp TASK-08); mỗi TASK sau nên tăng số này khi gộp vào `main` để TC-029 thấy số mới.
- Còn lại / nợ kỹ thuật: khu phụ huynh + nút Cập nhật + số phiên bản trong khu PH thật (TASK-07); chưa kiểm Samsung Internet và cài đặt thật trên máy (anh thử theo hướng dẫn trên); `AppState.installedVersion` chưa được cập nhật khi lên phiên bản mới (không cần cho TASK-08).
- Commit: `feat: PWA offline, install icons, update flow, GitHub Pages deploy`

### 2026-10-10 – Chốt thứ tự: TASK-08 trước TASK-07 (chưa code)
- Chủ dự án hỏi “làm TASK-08 trước TASK-07 có ảnh hưởng gì không” → trả lời: **không phụ thuộc kỹ thuật** (TASK-08 không cần khu PH; TASK-07 không cần PWA; Chart.js sau này vẫn nằm trong cache offline vì Workbox precache mọi file build). Ba hệ quả đã báo: (1) bản Pages chưa chỉnh được gì (khu PH còn “Đang xây dựng”; `?debug=1`/`?e2e=1` chỉ chạy ở bản dev; giới hạn cố định 15 phút/ngày); (2) chưa có sao lưu → bản cài chỉ để dùng thử, chưa cho bé dùng lâu dài; (3) “số phiên bản + nút Cập nhật trong khu PH” dời sang TASK-07 (TASK-08 làm nút ở Home + hiện tạm số phiên bản ở trang Khu phụ huynh placeholder). Chủ dự án chọn **làm TASK-08 trước**.
- Đã khảo sát mã cho TASK-08 và lập kế hoạch (đã trình bày, **chưa được duyệt**, chưa sửa mã). Phát hiện chính: chưa có đăng ký service worker nào; `icons: []`; **precache chỉ có js/css/html nên font Nunito không chạy offline**; `updateAvailable` chưa ai bật; chưa có `deploy.yml`. Kế hoạch 7 bước, rủi ro (Lighthouse bản mới không còn nhóm PWA; luồng cập nhật cần 2 lần deploy mới thử thật; dữ liệu Pages tách riêng với bản thử LAN) và các bước chủ dự án phải tự bấm trên GitHub: xem `docs/HANDOVER.md` mục 6.
- Việc kế tiếp: phiên mới đọc `docs/HANDOVER.md`, trình bày lại kế hoạch ngắn, chờ “Đồng ý”, rồi làm TASK-08 trên nhánh mới từ `main`.

### 2026-10-10 – TASK-06
- Đã làm:
  - **Logic thuần `app/rewards.ts` + 36 unit test** (`rewards.test.ts`): nhiệm vụ 3 nhóm/ngày (`missionGroupOf`, khớp registry) → 1 hộp; hộp mỗi lần `totalStars` vượt bội số 15 (`addStars`, cũng áp cho +3 sao sticker trùng và +2 sao nghỉ đúng giờ); giới hạn hộp/ngày (`maxBoxesPerDay` 0–5, hộp nhiệm vụ + hộp theo sao đều tính, hộp vượt giới hạn **mất luôn**, báo “Mai con nhận tiếp nhé!”); hộp PH tặng (`grantParentBoxes`, cho TASK-07) không tính giới hạn; `rollRarity` 70/25/5 + bảo đảm Hiếm khi `sinceLastRare ≥ 5`; trùng → +3 sao và `×2`; 8 mốc mở khóa theo sao (`syncUnlocks`, đọc mốc từ `levels.json`); `claimRestReward` (+2 sao, 1 lần/ngày). Danh mục 40 sticker `stk-01…stk-40` (4 chủ đề × 10: 6 Thường, 3 Hiếm, 1 Siêu hiếm → 24/12/4 khớp JSON).
  - **Kiểm tỷ lệ** (mô phỏng 10.000 hộp, RNG có seed): lần tung gốc đúng 70/25/5 (±2%); tỷ lệ thật **sau “bảo đảm Hiếm” là ≈ 66,0 / 28,3 / 5,7** – khớp phân tích Markov trong test (±2%) và chuỗi Thường liên tiếp không bao giờ quá 5. Hai yêu cầu của SPEC (“70/25/5” và “bảo đảm Hiếm sau 5 hộp”) không thể cùng đúng tuyệt đối; em giữ cả hai và ghi tỷ lệ thật (xem “Đề xuất”).
  - **Store** (`store.ts`): `recordRound` gọi `applyRoundRewards` (nhiệm vụ + sao + hộp + mở khóa) và trả `rewards` cho màn Kết quả; mới: `openGift` (lưu ngay khi mở, seed theo `openedTotal` khi chạy e2e), `equipReward`, `claimRest` + cửa sổ 30 giây (`restPending`/`startRestWindow`, rút ×10 khi `?e2e=1`), `giftModalOpen`, các hàm thử `debug*`. Khi mở app, hồ sơ có sẵn sao được đối chiếu mốc mở khóa và lưu lại (không cần migration: cấu trúc dữ liệu không đổi).
  - **Home**: 3 ô nhiệm vụ đánh dấu thật; hàng **Hộp quà** (số hộp đang chờ, thanh “còn N sao nữa có hộp”, hoặc “Hôm nay con nhận đủ hộp quà rồi. Mai con nhận tiếp nhé!”); Sóc Bo mặc trang phục + **hình nền** sau lưng; khung avatar Cầu Vồng (10 sao); huy hiệu vàng (300 sao). Sửa luôn lỗi cũ: thanh đầu Home tràn ngang 13px ở 360px khi tổng sao 3 chữ số (nay xuống dòng).
  - **Kết quả**: “Xong nhiệm vụ …! Nhiệm vụ hôm nay: n/3”, “Con mở khóa: …!”, biểu ngữ **“Con nhận được hộp quà!” + nút Mở hộp quà**, hoặc “Mai con nhận tiếp nhé!” khi vượt giới hạn.
  - **Cửa sổ mở hộp** (`GiftBox.tsx`, dùng chung Home/Kết quả/Nghỉ/Album): hộp quà SVG bóng bẩy lắc nhẹ → bé **chạm để mở** → nắp bật, tỏa sáng → sticker xoay hiện ra kèm nhãn Thường/Hiếm/Siêu hiếm, “Sticker mới!” hoặc “×2 +3 sao”, thông báo mở khóa; Hiếm/Siêu hiếm có tia sáng quay + pháo giấy + fanfare; “Mở tiếp (còn n)”, “Xem Album”, “Xong”; Esc / ✕ / nút Quay lại Android đều đóng. **Mở được cả khi đã hết giờ.**
  - **Album** (`screens/Album.tsx`): 4 tab – Sticker (40 ô, ô chưa có là bóng mờ, “×n”, chạm để phóng to), Trang phục, Hình nền, Đặc biệt; dòng “Còn N sao nữa để mở: …”.
  - **Hình vẽ mới (đều tự thiết kế, chuyển sắc + vệt sáng + viền INK như phong cách cũ)**: 40 sticker (`ui/stickers/*`: khung theo độ hiếm – trắng ngọc / bạc xanh / vàng lấp lánh; nền theo chủ đề; 4 file vẽ riêng), trang phục **Mũ Phi Công** (mũ da + kính + khăn) và **Áo Siêu Nhân Sóc** (mặt nạ + áo xanh có huy hiệu hạt dẻ + áo choàng đỏ) tách 3 lớp trong `Mascot` (`components/Outfits.tsx`), hình nền **Rừng Kẹo** và **Đáy Biển** (`components/Scenes.tsx`), huy hiệu vàng, biểu tượng Nhạc Cụ Gõ.
  - **Màn nghỉ**: nút **“Con nghỉ đây!”** + thanh đếm 30 giây (+2 sao, 1 lần/ngày), hết 30 giây thì nút biến mất lặng lẽ (không lời chê), mở hộp quà còn lại, Xem Album, gợi ý vận động giữ nguyên.
  - Công cụ dev: `?gallery=1[&theme=…|&view=rewards]` xem toàn bộ sticker/trang phục/hình nền (không có trong bản deploy – đã kiểm `dist/`); bảng `?debug=1` ở Home có **+1 hộp quà, +10 sao, +15 sao, Làm mới ngày hôm nay** để thử không phải chơi nhiều lượt.
- Test case tự kiểm (Playwright 3 khung hình + unit): **TC-021 Pass** (G1 + G2 + G6 → 3 ô tick, 1 hộp, mở hộp có hoạt ảnh, sticker vào album) · **TC-022 Pass** (đã 3 hộp → 15 sao không thêm hộp, “Mai con nhận tiếp nhé!”; giới hạn 0 → không hộp) · **TC-030 Pass** (“Con nghỉ đây” +2 sao một lần/ngày; để quá 30 giây → không nhận, không phạt; vào góc nghỉ từ Home → không có nút). Thêm: bảo đảm Hiếm sau 5 hộp; sticker trùng +3 sao; hết giờ vẫn mở hộp; lưu ngay khi mở (tải lại vẫn còn); hộp/album tách riêng từng hồ sơ; mở khóa 10 sao → khung Cầu Vồng; hồ sơ cũ có sẵn 130 sao tự mở khóa; mặc/cởi trang phục, đặt/bỏ hình nền, mục bị khóa không chọn được; không tràn ngang ở cả 3 khung hình.
- Unit test: **409 test** (+36 ở `rewards.test.ts`). E2E: **267** (89 × 3 khung hình; +21 test mới ở `rewards.spec.ts`; test TC-033 cũ được sửa vì Album không còn là trang “Đang xây dựng”). Một lần chạy đầy đủ `--workers=3` ≈ 9 phút, không có test chập chờn.
- Cách thử thủ công (điện thoại/tablet cùng wifi, `npm run dev`, địa chỉ `http://192.168.x.x:5173/?debug=1`):
  1. **Xem hình:** thêm `?gallery=1` (bản dev) – duyệt 40 sticker; hoặc mở Album sau khi dùng nút debug.
  2. **Hộp quà:** Home (có `?debug=1`) → cuộn xuống cuối → bấm **+1 hộp quà** → chạm nút **Hộp quà** → chạm hộp để mở → thử **Mở tiếp**, **Xem Album**, vuốt Quay lại (phải đóng hộp, chưa mở thì hộp vẫn còn).
  3. **Nhiệm vụ thật:** chơi 1 lượt G1, 1 lượt G2, 1 lượt G6 → xem 3 ô tick và hộp quà ở màn Kết quả; “Làm mới ngày hôm nay” để thử lại.
  4. **Giới hạn ngày:** bấm “+15 sao” liên tục → sau 3 hộp trong ngày, Home báo “Hôm nay con nhận đủ hộp quà rồi”.
  5. **Mốc sao:** bấm “+10 sao” vài lần: 10 sao (khung Cầu Vồng), 25 (Mũ Phi Công tự mặc), 50 (Rừng Kẹo tự đặt), 120 (Áo Siêu Nhân), 170 (Đáy Biển), 300 (huy hiệu). Vào Album → Trang phục/Hình nền để đổi.
  6. **Nghỉ đúng giờ:** cần hết 15 phút chơi (hoặc đặt giới hạn thấp ở khu PH khi có – TASK-07). Khi hết giờ giữa lượt: Kết quả → Tiếp tục → màn Nghỉ → bấm **Con nghỉ đây!** trong 30 giây (+2 sao).
  7. **Tablet Samsung:** kiểm Album 40 ô (nhiều cột), cửa sổ hộp quà, hình nền ở Home có che mất tên/linh vật không.
- Quyết định khi làm (anh góp ý nếu không đồng ý):
  - Hộp vượt giới hạn ngày **mất luôn** (không để dành); hộp nhiệm vụ **đã hoàn thành nhưng vượt giới hạn** vẫn được đánh dấu “đã thưởng” (không báo lại).
  - Sticker trùng (+3 sao) và nghỉ đúng giờ (+2 sao) có thể đẩy tổng sao qua bội số 15 → có thêm hộp (vẫn theo giới hạn ngày).
  - Cửa sổ 30 giây của “Con nghỉ đây” **bắt đầu khi bé vào màn Nghỉ ngay sau khi hết giờ** (đi qua Kết quả → Tiếp tục). Vào góc nghỉ từ Home thì không có nút thưởng. Tải lại trang giữa chừng thì mất cửa sổ (không lưu).
  - Ô trang phục / hình nền đang trống thì **tự mặc** món vừa mở khóa đầu tiên (bé thấy ngay); không đè lên thứ bé đã chọn.
  - Bé phải **chạm hộp để mở** (không tự mở). Hộp lưu ngay khi chạm, không phụ thuộc hoạt ảnh.
  - Khung avatar Cầu Vồng và Huy hiệu Vàng **tự áp dụng** (không có nút bật/tắt). Bộ âm Nhạc Cụ Gõ và Cú Mèo: chỉ mở khóa + hiện ở Album (xem “Câu hỏi mở”).
  - Hình nền chỉ hiện sau lưng linh vật ở Home (không phủ cả trang) để chữ vẫn dễ đọc.
  - 4 chủ đề sticker: Động vật · Trái cây · Vũ trụ · Phương tiện; mỗi chủ đề 6 Thường (đơn giản), 3 Hiếm (nhiều chi tiết + lấp lánh), 1 Siêu hiếm (công phu nhất, viền vàng phát sáng).
- Còn lại / nợ kỹ thuật: Khu phụ huynh/Khóa PH vẫn “Đang xây dựng” (TASK-07: nút tặng hộp/thời gian dùng `grantParentBoxes`, đã có sẵn + test); `updateAvailable`/SW (TASK-08); Cú Mèo + Nhạc Cụ Gõ (xem “Đề xuất”); tách gói tải sau (xem “Đề xuất”).
- Commit: `feat: daily missions, gift boxes, 40-sticker album, outfits and backgrounds, rest-on-time reward`

### 2026-10-10 – TASK-05
- Đã làm:
  - **G6 Hái Táo Tính Nhẩm** (`games/g6-math`, DOM thuần): bộ sinh câu cho **M01–M14** (`topics.ts`; mỗi chủ đề có `gen` + `inRange`), cấp 1–3 dùng phạm vi “nửa dễ”, từ cấp 8 có dạng **tìm số thiếu** (20/30/40% câu; M13 luôn tìm số thiếu; M03, M14 không có), M03 luôn 3 quả `>` `<` `=`. **Đáp án nhiễu** (`question.ts`): ±1, ±2, ±10 (quên nhớ), đảo chữ số, phép tính nhầm (cộng ↔ trừ), `a×(b±1)` cho phép nhân; lọc ≥ 0, không trùng, bổ sung số gần nếu thiếu. **Hình minh họa khi sai** (`illustrations.ts`): khung 10 ô chấm tròn (cộng/trừ ≤ 20), lưới chấm hàng × cột (nhân/chia), đặt tính dọc có chip “nhớ” màu cam (số lớn; phép chia lớn hiện dạng kiểm tra bằng phép nhân), khối chục/đơn vị (so sánh). Cây táo, táo 4 màu bóng bẩy, giỏ đan, Sóc Bo (cười / reo) tự vẽ SVG/CSS; táo đung đưa (chỉ thân hình động, nút chạm giữ nguyên ≥ 72px); thanh thời gian `secPerQ` chạy theo `dt` (tạm dừng chuẩn), chế độ `timer: off`; đúng → táo rơi vào giỏ, sai/hết giờ → táo đúng phát sáng + hình minh họa 1,5 giây (không âm chê; hết giờ im lặng).
  - **Sổ lỗi (F19)** (`app/mathFacts.ts`, dùng chung với `store.recordRound`): khóa `"8+7"`, `"15-9"`, `"7x8"`, `"35:5"`, `"47?74"`; câu sai chèn lại **sau 2–4 câu** trong lượt (thay một ô còn lại nên lượt vẫn đủ 10 câu, tối đa 1 lần/phép tính/lượt), tối đa **2 câu đầu lượt sau** lấy từ phép tính từng sai chưa thuộc (ưu tiên streak thấp, lâu chưa gặp); đúng liên tiếp 3 lần → `mastered`; sai lại → bỏ trạng thái thuộc. `profile.math.facts` được cập nhật sau mỗi lượt G6 (`lastSeenRound` = số thứ tự lượt G6), giữ tối đa 300 phép tính. Metrics: `accuracy`, `avgTimeMs`, `timeouts`, `masteredCount` (+ `correct`).
  - **G7 Tìm Quy Luật** (`games/g7-patterns`, DOM + SVG): 18 dạng câu trải 10 cấp (AB màu · AB/AAB/ABB · ABC, to–nhỏ · dãy số +1/+2/+5/+10, mũi tên xoay 90° · mẫu 2 thuộc tính · dãy giảm, đếm cách 3/4, tăng dần chấm · ma trận 2×2 · ma trận 3×3 · khác loại, ×2 · xen kẽ, ma trận 3×3 hai quy luật); ô “?” có thể ở giữa dãy từ cấp 5. **Bộ giải độc lập** (`solve.ts`) liệt kê mọi phần tử lấp được vào ô “?”; câu chỉ được dùng khi tập đó có **đúng 1 phần tử** và đúng 1 thẻ đáp án thỏa quy luật. Đáp án nhiễu khác đáp án đúng **đúng 1 thuộc tính**. Phần tử vẽ SVG (5 hình + mũi tên, cỡ S/M/L, xoay 0/90/180/270, 1–6 chấm), **mỗi màu có hoa văn riêng** (sọc chéo, chấm, lưới, sọc ngang, lượn sóng). Sai: **tô sáng đơn vị lặp** / mũi tên bước (`+2`, `×2`, `↻90°`) / hàng chứa “?” / ba hình cùng thuộc tính; cấp 1–5 cho **thử lại, đúng lần 2 được ½ điểm**, cấp 6+ hiện đáp án. Tùy chọn phụ huynh: `groups` (Hình/Số/Ma trận), `timer` (không giới hạn / 30 giây).
  - Dùng chung: `shuffle` (rng.ts), Home mở khóa thẻ G6/G7 (biểu tượng táo/hình khối bóng bẩy), hình động giới thiệu riêng cho G6 (chạm táo → rơi vào giỏ) và G7 (chạm hình → lấp vào ô “?”), dòng kết quả (`vi.games.G6/G7.lines`), tùy chọn trong `?debug=1`, CSS mới `ui/games2.css`.
  - **Mẫu nội dung để anh duyệt:** `npm run samples` sinh `docs/samples/G6.md` (14 chủ đề × 25 câu: 10 nửa dễ + 10 đầy đủ + 5 tìm số thiếu), `docs/samples/G7.md` (18 dạng × 20 câu, ghi bằng chữ) và `docs/samples/G7.html` (cùng nội dung có **hình thật**, bấm đúp để mở bằng trình duyệt; thẻ viền xanh lá là đáp án đúng).
  - `docs/HANDOVER.md` (bàn giao sang phiên sau) được đưa vào repo và cập nhật.
- Test case tự kiểm (Playwright 3 khung hình + unit): **TC-018 Pass** (Lớp 2 mặc định: 10 câu thuộc M02/M05/M06/M07/M08, 4 táo không trùng, mỗi câu đúng 1 đáp án đúng; sai 1 câu → hình minh họa + táo đúng phát sáng; được hỏi lại sau 2–4 câu; sổ lỗi ghi `seen 2 · correct 1 · streak 1`) · **TC-019 Pass** (không chạm đến hết giờ: tính chưa đúng, hiện đáp án + hình minh họa, sang câu 2, lời nhắc trung tính, giỏ vẫn 0) · **TC-020 Pass** (G7 cấp 3: sai → tô sáng phần lặp + thẻ sai mờ đi, chọn lại đúng → câu đó ½ điểm, cả lượt 7,5/8). Thêm: tạm dừng thì đồng hồ câu dừng; chế độ không giới hạn thời gian; sổ lỗi → `mastered` + dòng “Con thuộc thêm 1 phép tính rồi!”; cấp 10 có 6 táo đung đưa, nút không đổi kích thước; M03 luôn 3 quả; G7 cấp 6+ không thử lại; G7 hết 30 giây; nhóm Số/Ma trận của phụ huynh; chạm ngoài thẻ đáp án không bị tính; bố cục các cấp 2, 5, 8, 10 không tràn màn hình, thẻ ≥ 64px.
- Unit test: **373 test** (+203): G6 115 (**1.000 câu mỗi chủ đề × phạm vi dễ/đủ**, **1.000 câu × 3/4/6 đáp án**: đúng 1 đáp án thỏa phép tính, nhiễu không trùng, ≥ 0, trong phạm vi chủ đề, không số âm, chia hết, tỷ lệ tìm số thiếu, vị trí đáp án đều, luật chèn lại/sổ lỗi, hình minh họa, đặt tính dọc) · G7 78 (**1.000 câu × 18 dạng × 2 số đáp án**: đúng 1 lời giải, đúng 1 thẻ thỏa quy luật, nhiễu khác đúng 1 thuộc tính, dãy số không âm, ≤ 7 ô, “?” giữa dãy chỉ từ cấp 5, bộ giải loại câu mơ hồ như `1 2 4 ?`, thử lại ½ điểm, nhóm bị tắt) · sổ lỗi 10.
- Cách thử thủ công (điện thoại/tablet cùng wifi, `npm run dev`, địa chỉ `http://192.168.x.x:5173/`; thêm `?debug=1` để chọn chủ đề/cấp/đồng hồ):
  1. **Duyệt nội dung (việc quan trọng nhất):** mở `docs/samples/G6.md` và `docs/samples/G7.html`; đánh dấu câu nào quá khó/dễ hay lạ với bé lớp 2 rồi báo tôi (chủ đề mặc định lớp 2: M02, M05, M06, M07, M08).
  2. Home → “Hái Táo Tính Nhẩm” → Bắt đầu: chạm quả táo đúng (táo rơi vào giỏ); cố ý chạm sai 1 câu (táo đúng phát sáng + hình minh họa, rồi câu đó quay lại sau 2–4 câu); để im một câu cho hết giờ (không lời chê).
  3. `?debug=1`: chọn Cố định, Cấp 8–10 (6 táo, có `? + 8 = 15`, táo đung đưa → thử chạm vào táo khi đang đung đưa), chọn chủ đề M06/M09/M10 để xem đặt tính dọc có chữ số nhớ và lưới chấm.
  4. Chơi 2–3 lượt G6 liền với vài câu sai, rồi xem lượt sau: tối đa 2 câu đầu là phép tính đã sai (sổ lỗi). Đúng 3 lần liên tiếp thì Kết quả hiện “Con thuộc thêm … phép tính rồi!”.
  5. “Tìm Quy Luật”: cấp 1–5 chọn sai (phải tô sáng phần lặp và cho chọn lại, đúng lần 2 vẫn được sao nhưng ít điểm hơn); cấp 6+ chọn sai (hiện đáp án rồi sang câu sau); cấp 7–8 ma trận; cấp 9 “khác loại”. Màn hình tablet ngang: ma trận ở bên trái, thẻ đáp án 2×2 bên phải.
  6. Hình ảnh: kiểm tra mỗi màu có hoa văn riêng (sọc/chấm/lưới/ngang/lượn sóng) – chụp màn hình đổi sang đen trắng vẫn phân biệt được.
- Quyết định khi làm (anh góp ý nếu không đồng ý):
  - Câu hỏi lại **thay thế** một câu chưa làm (lượt vẫn đủ 10 câu, tính điểm bình thường); sai ở 2 câu cuối thì không còn chỗ chèn (phép tính đó vẫn nằm trong sổ lỗi và quay lại đầu lượt sau). Phép tính đang là câu hỏi lại mà sai tiếp thì không chèn lần nữa.
  - Sổ lỗi chỉ ghi phép tính **từng sai** (làm đúng ngay lần đầu thì không lưu) và giữ tối đa 300 phép tính để không làm phình `localStorage`; câu hỏi từ sổ lỗi chỉ lấy khi còn thuộc chủ đề đang bật.
  - So sánh (M03) có thêm hình **khối chục / đơn vị** (SPEC chưa nêu hình cho M03).
  - Đáp án nhiễu “phép tính nhầm” (vd cộng thay vì trừ) chỉ được dùng khi không quá xa đáp án (tránh `138` cho `72 − 66`).
  - G6 hết giờ: không phát âm “bụp” (chỉ chạm sai mới có âm nhẹ); nhịp phản hồi giữ nguyên 1,5 giây (`SHOW_MS`).
  - G6/G7 `finish()` (hết giờ trong ngày quá 90 giây): kết thúc **ngay** với kết quả hiện có, câu đang dở tính chưa làm (để bé không bị kẹt ở câu G7 không giới hạn thời gian).
  - G7 hết 30 giây: tính sai, hiện đáp án, không cho thử lại. `accuracy` = số câu đúng **ngay lần đầu** / 8; `highestTypeCorrect` = cấp cao nhất của dạng câu đã giải đúng (kể cả đúng sau khi thử lại); thêm `firstTry`, `correct`.
  - G7: mỗi cấp chỉ dùng đúng các dạng ghi trong bảng cấp độ; nếu phụ huynh tắt nhóm có dạng đó thì dùng dạng của nhóm còn bật có cấp gần nhất (ưu tiên cấp thấp hơn). Thêm hình **mũi tên** (hình thứ 6) chỉ để làm dạng “xoay 90°”.
  - G7 xem đáp án + giải thích khi hết cơ hội: 2,8 giây (đủ để bé đọc); khen khi đúng: 1 giây.
  - Giỏ táo đặt ở **chân cây** (táo rơi xuống giỏ), bóng nói + Sóc Bo ở trên; màn hình thấp (điện thoại nằm ngang) tự thu gọn: ẩn bớt linh vật, thu nhỏ thẻ minh họa vừa khung.
  - Khi chạy e2e (`?e2e=1`): thời gian mỗi câu G6/G7 rút ×10, nhịp phản hồi chỉ rút xuống tối thiểu 40% để test còn kịp kiểm tra hình minh họa.
- Còn lại / nợ kỹ thuật: Album/Khu phụ huynh vẫn “Đang xây dựng”; chưa có nhiệm vụ/hộp quà (TASK-06); biểu tượng thẻ G1, G2 vẫn phẳng hơn G3–G7; chưa tách gói tải sau cho từng game (xem “Đề xuất”).
- Commit: `feat: G6 apple math with error book, G7 pattern puzzles with unique-answer solver`

### 2026-10-10 – TASK-04
- Đã làm:
  - **G3 Đuổi Bắt Thú Cưng** (`games/g3-pets`): canvas 60 giây, 10 cấp. 4 thú (thỏ, mèo, cún, gà con) + Nhím ngủ (có “zzz”) **vẽ tự thiết kế bằng mã canvas**: chuyển sắc, vệt sáng, mắt bóng, má hồng, viền mềm, mèo có vòng cổ + chuông, cún có thẻ tên; mỗi con có bản “hú” (mắt cười, miệng há). Sprite vẽ sẵn 1 lần rồi `drawImage` (không tạo object mỗi khung hình). Nảy mép (góc bật ≥ 20°), đổi hướng bất ngờ mỗi 1–2,5 giây, cấp 10 có cú tăng tốc ×1,5 trong 0,5 giây, Nhím chậm ½. Chạm trúng → “Hú!” + hạt lấp lánh, thú hiện lại chỗ khác sau 300ms; chạm Nhím/chỗ trống → lỗi nhẹ nhàng.
  - **G4 Chuỗi Ánh Sáng** (`games/g4-lights`): lưới 4 / 6 (2×3 dọc, 3×2 ngang) / 9 ô (Corsi, cùng màu xanh dịu, sáng vàng). Ô 4–6 có màu + biểu tượng ● ▲ ■ ★ ♥ ◆ + nốt nhạc riêng, bóng bẩy như nút kẹo. Luật: đúng → chuỗi mới dài thêm 1; sai → “Thử lại nhé!” phát lại cùng chuỗi; sai lần thứ 2 trong lượt → kết thúc. Khóa chạm khi đang phát, nhắc nhẹ sau 8 giây không chạm.
  - **G5 Nốt Nhạc Rơi** (`games/g5-notes`): 4 làn, vạch đích 80%, lưới móc đơn theo BPM 90–140, mật độ đúng bảng (±10%), nốt đôi, giai điệu ngũ cung tự sinh. Chạm **đa điểm** theo `pointerId`. Vị trí nốt tính theo **thời gian** (offset đồng hồ; tạm dừng thì dịch offset nên lịch nốt không lệch). Tuyệt / Tốt / Trượt, combo, extraTaps. Viên nhạc là gem bóng bẩy có quầng sáng, nền đêm sao. Tablet ngang: khung tối đa 640px, canh giữa.
  - Dùng chung: `common/hud.ts` (HUD sao + thanh thời gian, G1 đã chuyển sang dùng), `common/sparkles.ts` (hạt lấp lánh).
  - Hình động giới thiệu riêng cho G3 (mèo bị chạm “Hú!”, Nhím ngủ không chạm), G4 (ô sáng lần lượt rồi chạm lại), G5 (nốt rơi → chạm → “Tuyệt!”). Biểu tượng thẻ G3/G4/G5 trên Home nâng cấp cùng phong cách.
  - Bảng gỡ lỗi `?debug=1` thêm tùy chọn của G3/G4/G5; cờ test `?e2e=1&freeze=1` (G3: thú đứng yên) và các thuộc tính `data-*` (chỉ dev / bản build e2e).
- Test case tự kiểm (Playwright, phone + tablet + tablet-portrait): **TC-006 Pass** (G4: đúng → +1; sai → thử lại cùng chuỗi; sai lần 2 → kết thúc; chạm lúc đang phát bị bỏ qua) · **TC-013 Pass** (G3: chạm thú +điểm và thú hiện lại chỗ khác; Nhím và chỗ trống tính lỗi; điểm đúng công thức) · **TC-007 Pass ở mức mô phỏng** (G5: 2 ngón thật qua CDP vào nốt đôi, cả 2 nốt được tính) · **TC-032 Pass ở mức mô phỏng** (mỗi làn ≥ 48px; tablet ngang khung ≤ 640px, canh giữa). Thêm: bot chơi đúng nhịp cả lượt G5 → ≥ 95% Tuyệt/Tốt, 3 sao; tạm dừng giữa lượt G5 rồi tiếp tục vẫn đúng nhịp; chạm làn trống → extraTaps; G3/G4 chạm 2 ngón chỉ tính 1; Dễ/Khó và tùy chọn phụ huynh hoạt động trên game mới.
- **60 fps:** vẫn không mở được bảng Performance của DevTools. Đo bằng script (bọc `requestAnimationFrame` để đo thời gian JS mỗi khung, cấp 10, 5 giây): bình thường **G1 0,17 ms · G3 0,4 ms · G5 0,3 ms mỗi khung** (ngân sách 16,6 ms), p95 < 1 ms, nhịp khung 16,7 ms (60 Hz). Khi giả lập CPU chậm ×4, trình duyệt headless (render bằng phần mềm) rớt khung nhưng thời gian JS trung bình vẫn chỉ 1–2 ms → phần nặng là vẽ pixel của trình duyệt giả lập, không phải mã game. **Anh xem số FPS thật bằng `?debug=1` (góc phải dưới HUD) khi chơi G1/G3/G5 trên Galaxy Tab dòng A**; nếu dưới 50 fps, báo tôi để giảm hiệu ứng (đã có sẵn phương án vẽ nền tĩnh vào lớp riêng).
- Cách thử thủ công (điện thoại/tablet cùng wifi, `npm run dev`, thêm `?debug=1` để xem FPS và đổi cấp):
  1. **G3:** cấp 1 thú to, chạy chậm; chuyển cấp 5–6 để có Nhím ngủ (chạm Nhím phải lắc nhẹ + “Shh!”); cấp 7+ thú đổi hướng bất ngờ; cấp 10 có cú tăng tốc.
  2. **G4:** cấp 1 (4 ô) xem hết chuỗi rồi chạm lại; cố ý chạm sai 1 lần (phải “Thử lại nhé!” và phát lại cùng chuỗi), sai lần 2 → kết thúc. Cấp 4 (6 ô), cấp 8 (9 ô Corsi).
  3. **G5:** chạm nốt khi chạm vạch (không cần chạm đúng chỗ, chạm cả làn). **TC-007 trên tablet Samsung:** từ cấp 4 trở lên có nốt đôi – chạm 2 ngón cùng lúc, cả 2 nốt phải được tính. **TC-032 trên điện thoại dọc:** chơi bằng 2 ngón cái, 4 làn phải vừa màn hình.
- Quyết định khi làm (anh góp ý nếu không đồng ý):
  - Thú vẽ bằng mã canvas (không phải file SVG): cùng hình, nhanh hơn, không cần tải ảnh.
  - G3: Nhím không biến mất khi bị chạm (chỉ lắc, “Shh!”, tính lỗi). Vùng tâm thú co vào bên trong khung để không bị cắt tai/gai ở mép.
  - G4: “sai lần thứ 2” tính trong cả lượt (không cần liên tiếp). Chuỗi tối đa 12 ô (đạt thì kết thúc) để lượt không kéo dài vô hạn. Khi chạy e2e (`?e2e=1`) nhịp phát được tua nhanh ×10.
  - G5: chạm lệch quá “Tốt” nhưng còn trong ±1,5 × “Tốt” chỉ sáng nhẹ, không tính điểm, không phạt; mật độ nốt tính cả nốt đôi; nốt đầu tiên xuất hiện ở đỉnh màn hình lúc bắt đầu (có khoảng chờ ≈ thời gian rơi); lượt kết thúc sau nốt cuối (≈ 75 giây + vài giây).
  - Màu sắc: sân cỏ xanh cho G3, ô kẹo cho G4, bầu trời đêm tím cho G5 (nối tiếp yêu cầu “rực rỡ, nhiều tone màu”).
- Còn lại / nợ kỹ thuật: Album/Khu phụ huynh vẫn “Đang xây dựng”; G6, G7 “Sắp có”; chưa có nhiệm vụ/hộp quà (TASK-06); một số biểu tượng thẻ G1, G2 vẫn phẳng hơn G3–G5 (có thể nâng cấp cùng đợt ở TASK-10); G5 có thể vẽ lớp nền tĩnh vào canvas riêng nếu tablet yếu.
- Commit: `feat: G3, G4, G5 with illustrated pets, glossy pads and rhythm gems`

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
