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
| TASK-06 Thưởng | Chưa bắt đầu | | |
| TASK-07 Khu phụ huynh | Chưa bắt đầu | | |
| TASK-08 PWA + deploy | Chưa bắt đầu | | |
| TASK-09 QA | Chưa bắt đầu | | |
| TASK-10 Sửa lỗi | Chưa bắt đầu | | |

## Câu hỏi mở (chờ chủ dự án)

- Không còn câu hỏi chặn. R23–R25 (mới v1.2) áp dụng theo đề xuất; chủ dự án có thể góp ý trong quá trình làm.
- **Duyệt nội dung mẫu G6/G7** trong `docs/samples/` (câu nào quá khó/dễ với bé lớp 2?).

## Đề xuất (ngoài phạm vi, để sau)

- Home tablet ngang: xếp 3 nhóm game cạnh nhau để đỡ phải cuộn (TASK-10 nếu anh thấy cần).
- Kích thước JS tăng từ ≈ 33 KB lên ≈ 64 KB (gzip) vì có thêm bộ sinh câu G6/G7: nên tách mỗi game thành gói tải sau (dynamic import) khi làm PWA (TASK-08) để lần mở đầu nhẹ hơn.
- G6: M11 (nhân/chia số 2–3 chữ số) ở dạng tìm số thiếu ra số khá lớn (vd `? : 5 = 57`); đây là chủ đề lớp 3, không bật mặc định – nếu anh thấy khó quá thì giới hạn dạng tìm số thiếu cho M11 ở TASK-10.
- G7 cấp 5 (mẫu 2 thuộc tính): khi sai hiện tô sáng cả dãy 6 ô; có thể làm lời giải thích riêng “màu lặp 2 nhịp, hình lặp 3 nhịp” nếu anh muốn (TASK-10).
- G6 hình minh họa khi sai hiện 1,5 giây đúng SPEC; nếu thấy bé chưa kịp nhìn thì tăng hằng số `SHOW_MS` (`games/g6-math/view.ts`).
- Hai test e2e cũ phụ thuộc thời gian thực – G1 TC-004 và G3 TC-013 – thỉnh thoảng chập chờn khi máy bận và chạy 4 luồng song song (một lần chạy đầy đủ có 2 lỗi, chạy riêng từng test đều pass; chạy đầy đủ lại bằng `--workers=3` được 204/204). TASK-09 (QA) nên ổn định hóa (nới dung sai hoặc hạ số luồng trong `playwright.config.ts`).

## Nhật ký

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
