# 02_GAMES – Đặc tả 7 game (v1.2)

> Bảng cấp độ bên dưới sinh từ cùng nguồn với Excel sheet 7 và `docs/data/levels.json`. Giá trị là **ban đầu**,
> sẽ tinh chỉnh sau tuần test (TASK-10). Khi code, đọc cấu hình từ `levels.json`, không chép tay số liệu.
>
> Quy ước chung cho mọi game:
> - Đếm ngược 3-2-1 trước khi bắt đầu; nút tạm dừng ở góc trên (≥ 48px).
> - `score` ∈ [0, 1]; sao theo `docs/01_SPEC.md` mục 7. Các tên chỉ số (metric key) dưới đây là khóa lưu trong `RoundRecord.metrics`.
> - Chạm đúng: hiệu ứng sao nhỏ + âm “ding”. Chạm sai: rung nhẹ + âm “bụp” trầm + lời động viên ngẫu nhiên (“Gần đúng rồi!”, “Bình tĩnh nhé!”).
> - Mọi random dùng `ctx.rng` (có seed).

---

## G1 – Bóng Xanh – Bóng Đỏ (Go/No-Go) · nhóm Phản xạ

**Mục tiêu**: phản xạ nhanh + kiềm chế bấm bừa.

**Luật**: Trong 60 giây, bóng xuất hiện ở vị trí ngẫu nhiên. **Chỉ chạm bóng XANH**. Bóng đỏ/vàng/nâu: không chạm, chờ nó tự biến mất.

**Hiển thị**
- Bóng đường kính ≈ 18% cạnh ngắn màn hình (≥ 64px), không chồng lên HUD, cách mép ≥ 16px; 2 bóng cùng lúc không chồng nhau.
- Mã hóa màu + hình (bắt buộc): xanh = tròn + mặt cười; đỏ = vuông bo góc + ✕; vàng = tam giác + !; nâu = thoi + ~.
- Bóng hiện trong `displayMs` rồi thu nhỏ biến mất; nghỉ ngẫu nhiên trong khoảng `gapMs` rồi bóng tiếp theo.
- `simultaneous = 2`: mỗi lần hiện 2 bóng, mỗi bóng độc lập theo `goRatio`, bảo đảm ít nhất 1 bóng xanh trong 50% số lần.

**Nhận chạm**: chỉ chạm đầu (bỏ pointer thứ 2). Vùng trúng = bán kính + 8px.

| Sự kiện | Ghi nhận |
|---|---|
| Chạm bóng xanh | `hits` +1, ghi RT = `event.timeStamp − onset` (RT < 120ms coi là đoán trước, không tính vào trung bình) |
| Bóng xanh hết giờ không chạm | `misses` +1 |
| Chạm bóng màu khác | `falseAlarms` +1 |
| Bóng màu khác tự biến mất | `correctRejections` +1 |
| Chạm chỗ trống | `emptyTaps` +1 |

**score** = (hits + correctRejections) / (tổng số bóng + emptyTaps)

**Metrics**: `rtMeanMs`, `rtMedianMs`, `accuracy`, `hits`, `misses`, `falseAlarms`, `correctRejections`, `emptyTaps`

**Tùy chọn PH**: `colors` = auto | 2 | 3 | 4 (ghi đè cột Số màu bóng); `simultaneous` = auto | 1 | 2.

**Bảng cấp độ G1**

| Cấp | Thời gian hiện bóng (ms) | Số màu bóng | Bóng cùng lúc | Tỷ lệ bóng xanh | Khoảng nghỉ giữa bóng (ms) | Bài đo |
|---|---|---|---|---|---|---|
| 1 | 1200 | 2 | 1 | 75% | 900–1300 |  |
| 2 | 1100 | 2 | 1 | 75% | 900–1300 |  |
| 3 | 1000 | 2 | 1 | 70% | 900–1300 |  |
| 4 | 950 | 3 | 1 | 70% | 750–1100 | ✓ |
| 5 | 875 | 3 | 1 | 70% | 750–1100 |  |
| 6 | 800 | 3 | 1 | 65% | 750–1100 |  |
| 7 | 725 | 3 | 2 | 65% | 600–900 |  |
| 8 | 650 | 4 | 2 | 65% | 600–900 |  |
| 9 | 575 | 4 | 2 | 60% | 600–900 |  |
| 10 | 500 | 4 | 2 | 60% | 600–900 |  |

**Edge case**: bóng xuất hiện đúng chỗ ngón tay đang đặt → chỉ nhận `pointerdown` mới sau onset; bé không chạm gì cả lượt → score theo công thức (≈ goRatio thấp) và vẫn được 1 sao nỗ lực.

**Unit test**: công thức score; phân bố go/no-go theo seed; RT bỏ giá trị < 120ms; không sinh vị trí chồng HUD.

---

## G2 – Bảng Số Thần Kỳ (Schulte) · nhóm Tập trung & Trí nhớ

**Luật**: Chạm các số theo thứ tự 1 → N (hoặc N → 1 khi thứ tự Ngược). Một lượt = 1 bảng.

**Hiển thị**
- Lưới vuông vừa `min(rộng, cao) − lề`; ô ≥ 56px (5×5 trên màn 360px ≈ 65px). Số cỡ ≈ 45% ô.
- `Nhiều màu`: nền ô 5 màu pastel ngẫu nhiên, chữ luôn tối. `Số xoay`: mỗi số xoay 0/90/180/270°; **6 và 9 luôn có gạch chân**.
- `Màu ô đổi mỗi 3s` (cấp 10): chỉ đổi màu nền, không đổi vị trí số.
- Ô đã chạm đúng: mờ đi + dấu ✓. Thanh trên: “Tìm số: **7**”.

**Ghi nhận**: chạm đúng số tiếp theo → tiến; chạm sai → ô rung, `errors` +1. Gợi ý: sau `hintAfterSec` không tiến, số cần tìm nhấp nháy nhẹ (chỉ cấp có gợi ý hoặc PH bật).

**score** = clamp(targetSec / timeSec, 0, 1) × max(0, 1 − 0,05 × errors)

**Metrics**: `timeSec`, `errors`, `gridSize`

**Tùy chọn PH**: `grid` = auto | 3 | 4 | 5; `order` = forward | backward; `hint` = on | off.

**Bảng cấp độ G2**

| Cấp | Bảng | Màu ô | Số xoay | Thứ tự | Thời gian mục tiêu (giây) | Gợi ý sau (giây) | Bài đo |
|---|---|---|---|---|---|---|---|
| 1 | 3×3 | 1 màu | Không | Xuôi | 20 | 4 |  |
| 2 | 3×3 | Nhiều màu | Không | Xuôi | 15 | 6 |  |
| 3 | 4×4 | 1 màu | Không | Xuôi | 40 | Tắt | ✓ |
| 4 | 4×4 | Nhiều màu | Không | Xuôi | 35 | Tắt |  |
| 5 | 4×4 | Nhiều màu | Có | Xuôi | 35 | Tắt |  |
| 6 | 5×5 | 1 màu | Không | Xuôi | 70 | Tắt |  |
| 7 | 5×5 | Nhiều màu | Không | Xuôi | 60 | Tắt |  |
| 8 | 5×5 | Nhiều màu | Có | Xuôi | 60 | Tắt |  |
| 9 | 5×5 | Nhiều màu | Không | Ngược 25→1 | 70 | Tắt |  |
| 10 | 5×5 | Màu ô đổi mỗi 3s | Có | Xuôi | 60 | Tắt |  |

**Edge case**: chạm lại ô đã đúng → bỏ qua (không lỗi); xoay máy giữa chừng → tạm dừng, sắp xếp lại lưới giữ nguyên vị trí số.

**Unit test**: sinh bảng đủ 1..N không trùng; score; thứ tự ngược.

---

## G3 – Đuổi Bắt Thú Cưng · nhóm Phản xạ

**Luật**: 60 giây. Thú cưng (thỏ, mèo, cún, gà con – SVG tự vẽ) chạy quanh màn hình; chạm trúng → thú “hú” vui, biến mất và xuất hiện lại chỗ khác sau 300ms. **Không chạm Nhím đang ngủ** (có “zzz”, di chuyển chậm bằng ½ tốc độ).

**Chuyển động**: vận tốc = `speedPctW`% chiều rộng/giây, nảy khi chạm mép. `erratic`: đổi hướng ngẫu nhiên mỗi 1–2,5s; cấp 10 thêm cú tăng tốc ×1,5 trong 0,5s. Kích thước = `sizePct`% cạnh ngắn, **tối thiểu 48px**.

**Nhận chạm**: chỉ chạm đầu; vùng trúng = bán kính + 8px; nếu trúng nhiều vật chọn vật gần tâm nhất.

**score** = 0,6 × accuracy + 0,4 × min(1, hits / targetHits); accuracy = hits / (hits + emptyTaps + decoyTaps); targetHits = 20 + 2 × cấp

**Metrics**: `hits`, `emptyTaps`, `decoyTaps`, `accuracy`, `hitsPerMin`

**Tùy chọn PH**: `speed` = auto | slow (cấp 2) | medium (cấp 5) | fast (cấp 8) – chỉ ghi đè tốc độ; `decoys` = auto | off | on.

**Bảng cấp độ G3**

| Cấp | Tốc độ (% chiều rộng/giây) | Kích thước (% cạnh ngắn) | Số con | Con không được bắt | Đổi hướng bất ngờ | Bài đo |
|---|---|---|---|---|---|---|
| 1 | 15 | 22 | 1 | 0 | Không |  |
| 2 | 20 | 20 | 1 | 0 | Không |  |
| 3 | 25 | 18 | 2 | 0 | Không |  |
| 4 | 30 | 17 | 2 | 0 | Không | ✓ |
| 5 | 35 | 16 | 2 | 1 | Không |  |
| 6 | 40 | 15 | 3 | 1 | Không |  |
| 7 | 45 | 14 | 3 | 1 | Có |  |
| 8 | 50 | 13 | 3 | 2 | Có |  |
| 9 | 55 | 12 | 4 | 2 | Có |  |
| 10 | 60 | 11 | 4 | 2 | Có + tăng tốc |  |

**Edge case**: bấm bừa liên tục → accuracy giảm nên score không tăng (R04); thú bị kẹt góc → luôn bật ra với góc ngẫu nhiên ≥ 20°.

**Unit test**: va chạm mép; hit-test; công thức score; bấm bừa 100 lần không cho score > 0,5.

---

## G4 – Chuỗi Ánh Sáng (Simon/Corsi) · nhóm Tập trung & Trí nhớ

**Luật**: Các ô sáng lần lượt (kèm âm), bé chạm lại đúng thứ tự. Đúng → chuỗi dài thêm 1 (chuỗi mới ngẫu nhiên). Sai → “Thử lại nhé!”, phát lại **cùng chuỗi** 1 lần; sai lần thứ 2 trong lượt → kết thúc.

**Bố cục**: 4 ô = lưới 2×2; 6 ô = 2×3 (dọc) / 3×2 (ngang); 9 ô = 3×3 (kiểu Corsi, tất cả cùng màu xanh dịu, sáng vàng – chỉ khác vị trí). 4 và 6 ô: mỗi ô màu + biểu tượng riêng (★ ● ▲ ■ ♥ ◆) + nốt nhạc riêng.

**Nhịp**: sáng `flashMs`, nghỉ `gapMs`. Trong lúc phát chuỗi khóa chạm. Chạm của bé: ô sáng 200ms + âm. Không chạm 8s → linh vật nhắc nhẹ (không tính sai).

**score** = clamp((maxSpan − (startLen − 1)) / 4, 0, 1) với `maxSpan` = chuỗi dài nhất bé lặp đúng.

**Metrics**: `maxSpan`, `correctSequences`, `pads`

**Tùy chọn PH**: `pads` = auto | 4 | 6 | 9; `speed` = auto | slow (×1,3 thời gian) | medium | fast (×0,8); `startLen` = 2–5.

**Bảng cấp độ G4**

| Cấp | Số ô | Độ dài bắt đầu | Thời gian sáng (ms) | Nghỉ giữa 2 ô (ms) | Bài đo |
|---|---|---|---|---|---|
| 1 | 4 | 2 | 900 | 400 |  |
| 2 | 4 | 3 | 800 | 350 |  |
| 3 | 4 | 3 | 700 | 300 |  |
| 4 | 6 | 3 | 800 | 350 | ✓ |
| 5 | 6 | 3 | 700 | 300 |  |
| 6 | 6 | 4 | 650 | 250 |  |
| 7 | 6 | 4 | 550 | 220 |  |
| 8 | 9 | 3 | 650 | 250 |  |
| 9 | 9 | 4 | 550 | 200 |  |
| 10 | 9 | 4 | 450 | 180 |  |

**Edge case**: chuỗi cấp 1–3 không lặp 1 ô 2 lần liên tiếp; chạm khi đang phát chuỗi → bỏ qua.

**Unit test**: sinh chuỗi theo seed; luật 2 lần sai; công thức score.

---

## G5 – Nốt Nhạc Rơi · nhóm Phản xạ

**Luật**: 75 giây. Nốt rơi trong 4 làn tới vạch đích (80% chiều cao). Chạm vào **làn** đó khi nốt chạm vạch.

**Sinh nốt**: lưới nhịp móc đơn, BPM 90–140 (tăng theo cấp), mật độ trung bình `density` nốt/giây, giai điệu ngũ cung tự sinh (không dùng bài hát có sẵn). Nốt đôi theo `doubleRatio` (2 làn bất kỳ cùng lúc). Mỗi nốt có `hitTime` trên trục `performance.now()`.

**Chấm**: |tapTime − hitTime| ≤ `perfectMs` → **Tuyệt** (1,0) · ≤ `goodMs` → **Tốt** (0,6) · nốt qua vạch quá `goodMs` → **Trượt**. Chạm làn không có nốt trong ±1,5 × `goodMs` → `extraTaps` (chống bấm bừa). Combo +1 khi Tuyệt/Tốt, về 0 khi Trượt.

**Nhận chạm**: **đa điểm** (theo `pointerId`), làn = toàn bộ cột; mỗi làn ≥ 48px rộng.

**score** = (perfect + 0,6 × good) / (totalNotes + 0,5 × extraTaps)

**Metrics**: `perfectPct`, `goodPct`, `missPct`, `maxCombo`, `extraTaps`

**Tùy chọn PH**: `fall` = auto | slow (cấp 2) | medium (cấp 5) | fast (cấp 8) – chỉ ghi đè `fallMs`; `doubles` = auto | off.

**Bảng cấp độ G5**

| Cấp | Thời gian rơi (ms) | Mật độ (nốt/giây) | Tỷ lệ nốt đôi | Cửa sổ Tuyệt (± ms) | Cửa sổ Tốt (± ms) | Bài đo |
|---|---|---|---|---|---|---|
| 1 | 2600 | 0.8 | 0% | 120 | 220 |  |
| 2 | 2400 | 1.0 | 0% | 120 | 220 |  |
| 3 | 2200 | 1.2 | 0% | 110 | 200 | ✓ |
| 4 | 2000 | 1.4 | 5% | 100 | 180 |  |
| 5 | 1900 | 1.6 | 10% | 100 | 180 |  |
| 6 | 1750 | 1.9 | 10% | 90 | 165 |  |
| 7 | 1600 | 2.2 | 15% | 90 | 165 |  |
| 8 | 1500 | 2.5 | 15% | 80 | 150 |  |
| 9 | 1350 | 2.8 | 20% | 80 | 150 |  |
| 10 | 1200 | 3.0 | 20% | 80 | 150 |  |

**Edge case**: điện thoại dọc dùng 2 ngón cái – làn chiếm toàn chiều ngang; tablet Samsung ngang – khung làn tối đa 640px giữa màn hình, chơi 2 tay; frame rơi rớt → vị trí nốt tính theo thời gian, không theo frame.

**Unit test**: cửa sổ chấm điểm; combo; extraTaps; sinh nốt đúng mật độ ±10%.

---

## G6 – Hái Táo Tính Nhẩm (toán lớp 1–3) · nhóm Học mà chơi

**Luật**: 10 câu. Bóng nói của Sóc Bo hiện phép tính; trên cây có `options` quả táo ghi số; chạm táo đúng trước khi thanh thời gian (`secPerQ`) hết. Đúng → táo rơi vào giỏ. Sai/hết giờ → táo đúng phát sáng + **hình minh họa** 1,5s, sang câu sau.

**Chủ đề** (PH bật/tắt; mặc định theo lớp hồ sơ – Lớp 2: M02, M05, M06, M07, M08):

| Mã | Lớp | Chủ đề | Ví dụ | Mặc định Lớp 2 |
|---|---|---|---|---|
| M01 | 1 | Cộng, trừ trong phạm vi 10 | 3 + 4 = ? |  |
| M02 | 1 | Cộng, trừ trong phạm vi 20 (không nhớ) | 12 + 5 = ? | ✓ |
| M03 | 1 | So sánh số trong phạm vi 100 (>, <, =) | 47 ? 74 |  |
| M04 | 1 | Cộng, trừ số tròn chục; trong 100 không nhớ | 40 + 30 = ?; 56 − 23 = ? |  |
| M05 | 2 | Cộng, trừ qua 10 trong phạm vi 20 (có nhớ) | 8 + 7 = ?; 15 − 9 = ? | ✓ |
| M06 | 2 | Cộng, trừ có nhớ trong phạm vi 100 | 38 + 27 = ?; 72 − 45 = ? | ✓ |
| M07 | 2 | Bảng nhân 2 và 5 | 5 × 7 = ? | ✓ |
| M08 | 2 | Bảng chia 2 | 14 : 2 = ? | ✓ |
| M09 | 3 | Cộng, trừ trong phạm vi 1000 (nhớ tối đa 1 lần) | 352 + 129 = ? |  |
| M10 | 3 | Bảng nhân, chia 3 → 9 | 7 × 8 = ?; 54 : 6 = ? |  |
| M11 | 3 | Nhân, chia số 2–3 chữ số với số 1 chữ số | 23 × 4 = ?; 84 : 4 = ? |  |
| M12 | 3 | Cộng, trừ trong phạm vi 10 000 | 2 450 + 1 300 = ? |  |
| M13 | 3 | Tìm thành phần chưa biết | ? × 6 = 42 |  |
| M14 | 3 | Gấp / giảm một số lần | Gấp 4 lên 3 lần = ? |  |

**Chỉnh nội dung Lớp 2 (2026-10-13, theo yêu cầu chủ dự án):** (1) **bỏ phép chia cho 5**: M08 chỉ còn bảng chia 2 (`2 : 2` … `20 : 2`; cấp 1–3 chỉ đến `10 : 2`) và dạng tìm số thiếu của M08 chỉ ẩn số bị chia (`? : 2 = 6`), không ẩn số chia (`20 : ? = 10` luôn có đáp án 2); bảng nhân 2 và 5 (M07) giữ nguyên; (2) **M09 (cộng, trừ trong phạm vi 1000) chuyển từ Lớp 2 sang Lớp 3** – vẫn là chủ đề mặc định của Lớp 3, phụ huynh vẫn bật được cho bé Lớp 2 ở khu phụ huynh. Mã chủ đề giữ nguyên (không đánh số lại). Sổ lỗi cũ có `35:5` tự bị bỏ qua (không thuộc chủ đề nào của Lớp 2).

**Độ lớn số**: cấp 1–3 dùng “nửa dễ” của chủ đề (số hạng nhỏ hơn, vd M06 chỉ cộng có nhớ với số hạng ≤ 50); cấp 4+ dùng toàn bộ phạm vi.
**Tìm số thiếu**: từ cấp 8, một phần câu đổi dạng `? + 8 = 15`, `4 × ? = 28`. **M11 giới hạn (TASK-10):** chỉ ra dạng tìm số thiếu khi số cần tìm ≤ 99; nếu lớn hơn (vd `? : 5 = 57` → 285) thì hỏi dạng thường `285 : 5 = ?`. **M08 (chỉ chia cho 2):** không bao giờ ẩn số chia – số chia bị ẩn được đổi sang ẩn số bị chia nên tỷ lệ dạng tìm số thiếu vẫn đúng bảng cấp độ (thuộc tính `fixedDivisor` ở `topics.ts`).
**M03 So sánh**: đáp án luôn là 3 quả `>`, `<`, `=`.

**Đáp án nhiễu** (bắt buộc hợp lý, không đoán mò được): ứng viên = đáp án ±1, ±2, ±10 (lỗi nhớ), đảo chữ số, kết quả của phép tính ngược (cộng ↔ trừ), với phép nhân: a × (b ± 1). Lọc: ≥ 0, khác nhau, khác đáp án; thiếu thì bổ sung số gần. Vị trí đáp án đúng ngẫu nhiên.

**Hình minh họa khi sai**: cộng/trừ ≤ 20 → khung 10 ô chấm tròn; nhân/chia → lưới chấm hàng × cột; số lớn → đặt tính dọc có tô chữ số nhớ.

**Sổ lỗi (F19)**: khóa phép tính chuẩn hóa (`"8+7"`, `"15-9"`, `"7x8"`); câu sai được chèn lại sau 2–4 câu trong lượt và chiếm tối đa 2 câu đầu lượt sau; `streak ≥ 3` → `mastered`.

**score** = số câu đúng / 10 (hết giờ = sai). Chế độ “Không giới hạn thời gian” (PH bật) vẫn tính score như thường.

**Metrics**: `accuracy`, `avgTimeMs` (câu đúng), `timeouts`, `masteredCount`

**Tùy chọn PH**: `grade` = 1 | 2 | 3; `topics` = danh sách M01–M14; `timer` = auto | off.

**Bảng cấp độ G6**

| Cấp | Thời gian/câu (giây) | Số đáp án | Táo đung đưa | Dạng tìm số thiếu | Độ lớn số trong chủ đề | Bài đo |
|---|---|---|---|---|---|---|
| 1 | 15 | 3 | Không | Không | Nhỏ (nửa dễ) |  |
| 2 | 13 | 3 | Không | Không | Nhỏ (nửa dễ) |  |
| 3 | 12 | 3 | Không | Không | Nhỏ (nửa dễ) |  |
| 4 | 11 | 4 | Không | Không | Đầy đủ | ✓ |
| 5 | 10 | 4 | Không | Không | Đầy đủ |  |
| 6 | 9 | 4 | Không | Không | Đầy đủ |  |
| 7 | 8 | 4 | Có | Không | Đầy đủ |  |
| 8 | 7 | 6 | Không | 20% câu | Đầy đủ |  |
| 9 | 6 | 6 | Có | 30% câu | Đầy đủ |  |
| 10 | 5 | 6 | Có | 40% câu | Đầy đủ |  |

**Edge case**: phép trừ không ra số âm; phép chia luôn chia hết; táo đung đưa nhưng vùng chạm cố định đủ lớn (≥ 72px).

**Unit test** (bắt buộc, chạy 1.000 câu/chủ đề với seed khác nhau): đúng 1 đáp án đúng; nhiễu không trùng; kết quả trong phạm vi chủ đề; không số âm; chia hết.

---

## G7 – Tìm Quy Luật (logic) · nhóm Học mà chơi

**Luật**: 8 câu. Hiện một dãy (hoặc ma trận) có ô “?”, chọn 1 trong `options` thẻ đáp án. Mặc định **không giới hạn thời gian** (tư duy không nên bị ép); PH có thể bật 30s/câu.

**Phần tử**: đối tượng SVG `{ shape: circle|square|triangle|star|heart, color: 5 màu, size: S|M|L, rotation: 0|90|180|270, count: 1–6 }` hoặc số.
Mỗi màu đi kèm hình/hoa văn riêng để không phụ thuộc màu.

**Dạng câu** theo cấp (cột “Dạng câu”): dãy lặp AB/AAB/ABB/ABC; thay đổi kích thước; xoay; dãy số cộng/trừ/nhân 2; mẫu tăng dần số chấm; ma trận 2×2 (A:B = C:?); ma trận 3×3 (quy luật theo hàng: không đổi / tăng dần / mỗi hàng đủ 3 loại); tìm hình khác loại (4 hình, 3 cùng thuộc tính).
Từ cấp 5, ô “?” có thể ở giữa dãy.

**Đáp án nhiễu**: khác đáp án đúng **đúng 1 thuộc tính** (để buộc quan sát), không trùng nhau; bộ kiểm tra bảo đảm chỉ 1 đáp án thỏa quy luật.

**Phản hồi sai**: tô sáng đơn vị lặp lại / hiện mũi tên “+2” giữa các số, rồi cho thử lại (cấp 1–5, đúng lần 2 được ½ điểm) hoặc hiện đáp án (cấp 6+). **Cấp 5 (mẫu 2 thuộc tính)** có lời giải thích riêng (TASK-10): hai thanh – thanh dưới nhóm theo chu kỳ **màu**, thanh trên nhóm theo chu kỳ **hình** (nhóm kề nhau đổi nét liền/nét sọc) – kèm câu “Thanh dưới: màu lặp mỗi N ô. Thanh trên: hình lặp mỗi M ô.”.

**score** = tổng điểm câu / 8

**Metrics**: `accuracy`, `avgTimeMs`, `highestTypeCorrect`

**Tùy chọn PH**: `groups` = shapes | numbers | matrix (bật/tắt); `timer` = off | 30s.

**Bảng cấp độ G7**

| Cấp | Dạng câu | Số đáp án | Được thử lại | Bài đo |
|---|---|---|---|---|
| 1 | AB (màu) | 3 | Có (½ điểm) |  |
| 2 | AB, AAB, ABB (hình + màu) | 3 | Có (½ điểm) |  |
| 3 | ABC; to – nhỏ | 3 | Có (½ điểm) |  |
| 4 | Dãy số +1, +2, +5, +10; mũi tên xoay 90° | 4 | Có (½ điểm) | ✓ |
| 5 | Mẫu 2 thuộc tính (màu và hình đổi độc lập) | 4 | Có (½ điểm) |  |
| 6 | Dãy số giảm, đếm cách 3/4; mẫu tăng dần (1, 2, 3 chấm) | 4 | Không |  |
| 7 | Ma trận 2×2 (tương tự) | 4 | Không |  |
| 8 | Ma trận 3×3 (quy luật theo hàng) | 4 | Không |  |
| 9 | Tìm hình khác loại; dãy ×2 (1, 2, 4, 8) | 4 | Không |  |
| 10 | Dãy xen kẽ (+1, +2, +1…); ma trận 3×3 hai quy luật | 4 | Không |  |

**Unit test** (1.000 câu/dạng): đúng 1 đáp án thỏa luật; nhiễu khác đúng 1 thuộc tính; không trùng; dãy số không âm.

---

## Bài đo chuẩn (F16)

| Game | Cấp cố định |
|---|---|
| G1 – Bóng Xanh – Bóng Đỏ | 4 |
| G2 – Bảng Số Thần Kỳ | 3 |
| G3 – Đuổi Bắt Thú Cưng | 4 |
| G4 – Chuỗi Ánh Sáng | 4 |
| G5 – Nốt Nhạc Rơi | 3 |
| G6 – Hái Táo Tính Nhẩm | 4 |
| G7 – Tìm Quy Luật | 4 |
