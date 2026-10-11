# 04_ACCEPTANCE – Tiêu chí nghiệm thu (v1.2)

> Đồng bộ Excel sheet 5 (35 TC). Cột “Kiểm thử” cho Claude Code biết TC nào phải viết test tự động (TASK-09).
> Phụ huynh ghi Actual Result / Status trong Excel.

| ID | Precondition | Steps | Expected Result | Priority | Liên quan | Kiểm thử |
|---|---|---|---|---|---|---|
| TC-001 | Đã có link GitHub Pages; Android + Chrome, có mạng | 1. Mở link<br>2. Menu ⋮ → Thêm vào màn hình chính / Cài đặt ứng dụng<br>3. Mở từ icon | App mở toàn màn hình (không thanh địa chỉ), hiện màn hình chọn hồ sơ / màn hình chính | Cao | NF01, NF06 | Thủ công (thiết bị thật) |
| TC-002 | Tablet Samsung Galaxy Tab + Chrome, có mạng | 1. Mở link<br>2. Menu ⋮ → Cài đặt ứng dụng<br>3. Mở từ icon<br>4. Xoay ngang/dọc | App mở toàn màn hình, bố cục vừa màn hình tablet cả ngang và dọc, chữ và nút không quá nhỏ | Cao | NF01, NF02 | Thủ công (thiết bị thật) |
| TC-003 | Lần đầu mở app | 1. Nhập tên bé<br>2. Chọn avatar, chọn Lớp 2<br>3. Lưu<br>4. Tắt hẳn app, mở lại | Linh vật chào bé bằng tên; mở lại vẫn nhớ hồ sơ | Cao | F02 | Tự động (e2e/unit) |
| TC-004 | Đang chơi G1 cấp 1 | 1. Chạm bóng xanh<br>2. Chạm bóng đỏ<br>3. Bấm liên tục vào chỗ trống | Xanh: +điểm; Đỏ: tính lỗi, phản hồi nhẹ; bấm chỗ trống bị tính lỗi; điểm không tăng khi bấm bừa | Cao | G1, R04 | Tự động (e2e/unit) |
| TC-005 | Đang chơi G2 (3×3) | 1. Chạm 1→9 đúng thứ tự<br>2. Chơi lại, cố ý chạm sai 1 số | Lần 1 hiện thời gian hoàn thành; lần 2 ô sai rung nhẹ, ghi nhận 1 lỗi | Cao | G2 | Tự động (e2e/unit) |
| TC-006 | Đang chơi G4 | 1. Xem chuỗi 3 ô<br>2. Lặp lại đúng<br>3. Lặp lại sai | Đúng: chuỗi dài thêm 1; sai: được thử lại 1 lần cùng độ dài, sai lần 2 thì kết thúc | Cao | G4 | Tự động (e2e/unit) |
| TC-007 | Đang chơi G5 trên tablet Samsung, cấp ≥ 4 | 1. Chạm 2 làn cùng lúc khi có nốt đôi | Cả 2 nốt được tính (đa điểm chạm) | Trung bình | G5, R05 | Thủ công (thiết bị thật) |
| TC-008 | Đang giữa lượt chơi | 1. Xoay máy<br>2. Bấm Home rồi quay lại<br>3. Bấm “Chơi tiếp” | Game tự tạm dừng, bố cục cập nhật, chơi tiếp được; nếu chọn Thoát thì lượt không được tính | Trung bình | F09, R06 | Tự động (e2e/unit) |
| TC-009 | Chế độ Tự động; bé đã chơi 3 lượt liên tiếp điểm ≥ 85% | 1. Chơi lượt thứ 4 | Độ khó tăng 1 cấp, có thông báo vui “Lên cấp!” | Cao | F04 | Tự động (e2e/unit) |
| TC-010 | Đã chơi ít nhất 2 ngày | 1. Vào khu phụ huynh, giải phép nhân 2 chữ số × 1 chữ số<br>2. Mở Tiến bộ | Biểu đồ hiện đúng số liệu theo ngày từng game, kèm cấp độ | Cao | F06, F08 | Tự động (e2e/unit) |
| TC-011 | Giới hạn 15 phút; đã chơi 13 phút | 1. Tiếp tục chơi đến hết giờ | Phút 13: nhắc nhẹ còn 2 phút; hết giờ: lượt đang chơi kết thúc → màn hình nghỉ, thẻ game khóa | Cao | F07 | Tự động (e2e/unit) |
| TC-012 | Đã cài app lên màn hình chính và mở ít nhất 1 lần | 1. Bật chế độ máy bay<br>2. Mở app từ icon<br>3. Chơi đủ 7 game | App mở và chạy đủ 7 game; tiến độ vẫn lưu; không có lỗi tải | Cao | NF06, R14 | Tự động + Thủ công |
| TC-013 | Đang chơi G3 cấp ≥ 5 | 1. Chạm thú cưng<br>2. Chạm bạn Nhím đang ngủ<br>3. Chạm chỗ trống | 1: +điểm, thú chạy chỗ khác; 2 và 3: tính lỗi, phản hồi nhẹ | Trung bình | G3, R04 | Tự động (e2e/unit) |
| TC-014 | Khu PH: G1 → Số màu bóng = 4 | 1. Chơi 1 lượt G1 | Xuất hiện bóng xanh, đỏ, vàng, nâu; mỗi màu có hình dạng riêng; chỉ chạm xanh được điểm | Cao | F11, R01 | Tự động (e2e/unit) |
| TC-015 | Khu PH: G2 chế độ Cố định cấp 5 | 1. Chơi 3 lượt thật tốt | Cấp giữ nguyên 5, không tự tăng | Trung bình | F11 | Tự động (e2e/unit) |
| TC-016 | Cấp G1 hiện tại = 5; PH cho phép bé chọn độ khó | 1. Ở màn giới thiệu G1 chọn “Dễ”<br>2. Chơi 1 lượt<br>3. Quay lại chọn “Tự động” | Lượt chơi ở cấp 3; cấp tự động vẫn là 5 sau lượt “Dễ” | Trung bình | F12 | Tự động (e2e/unit) |
| TC-017 | Chế độ Tự động, cấp ≥ 2 | 1. Cố tình chơi 2 lượt liên tiếp điểm < 50% | Độ khó giảm 1 cấp, lời động viên nhẹ nhàng | Cao | F04, R11 | Tự động (e2e/unit) |
| TC-018 | Hồ sơ Lớp 2, chủ đề mặc định | 1. Chơi 1 lượt G6<br>2. Cố ý trả lời sai 1 câu | 10 câu thuộc chủ đề đã bật; mỗi câu đúng 1 đáp án; câu sai hiện đáp án đúng có hình minh họa và được hỏi lại sau 2–4 câu | Cao | G6, F17, F19 | Tự động (e2e/unit) |
| TC-019 | Đang chơi G6 | 1. Không chạm gì đến hết giờ của câu | Câu tính là chưa đúng, hiện đáp án, chuyển câu mới; không có lời chê | Trung bình | G6, UI02 | Tự động (e2e/unit) |
| TC-020 | Đang chơi G7 cấp 1–5 | 1. Chọn sai 1 câu<br>2. Chọn lại đúng | Hiện gợi ý quy luật (tô sáng phần lặp lại); chọn lại đúng được ½ điểm câu đó | Trung bình | G7 | Tự động (e2e/unit) |
| TC-021 | Ngày mới, chưa làm nhiệm vụ | 1. Chơi 1 lượt G1, 1 lượt G2, 1 lượt G6<br>2. Mở hộp quà | 3 ô nhiệm vụ được đánh dấu; nhận 1 hộp quà; mở hộp có hoạt ảnh, sticker vào album | Cao | F13, F14 | Tự động (e2e/unit) |
| TC-022 | Giới hạn hộp quà = 3/ngày; đã nhận 3 hộp | 1. Đạt thêm 15 sao | Không nhận thêm hộp; thông báo “Mai con nhận tiếp nhé!” | Trung bình | F14, R15 | Tự động (e2e/unit) |
| TC-023 | Đã hết giờ chơi hôm nay | 1. Vào khu PH → Thưởng → +10 phút<br>2. Quay lại màn hình chính | Thẻ game mở lại; đồng hồ còn 10 phút | Cao | F07, F15 | Tự động (e2e/unit) |
| TC-024 | Có 2 hồ sơ A và B | 1. Chơi bằng A<br>2. Đổi sang B | Sao, cấp độ, thời gian chơi, album của B không đổi | Cao | F02, R03 | Tự động (e2e/unit) |
| TC-025 | Có dữ liệu ≥ 1 ngày | 1. Khu PH → Sao lưu (lưu file)<br>2. Xóa dữ liệu trang web<br>3. Mở app → Khôi phục từ file | Hồ sơ, sao, album, lịch sử, cài đặt quay lại đầy đủ | Trung bình | F10, R07 | Tự động (e2e/unit) |
| TC-026 | Ở màn hình khóa phụ huynh | 1. Nhập sai 3 lần | Khóa 30 giây, đếm ngược; sau đó hiện phép tính mới | Thấp | F08 | Tự động (e2e/unit) |
| TC-027 | Đã làm bài đo chuẩn ở 2 tuần khác nhau | 1. Khu PH → Tiến bộ → So sánh tuần | Bảng so sánh tuần đầu và tuần gần nhất cho đủ 7 game, có mũi tên tăng/giảm | Cao | F16, R16 | Tự động (e2e/unit) |
| TC-028 | Đang chơi G1 cấp ≥ 8 | 1. Chụp màn hình, chuyển ảnh đen trắng | Vẫn phân biệt được 4 loại bóng nhờ hình dạng/biểu tượng | Trung bình | UI03 | Tự động (mô phỏng: hình bóng từ canvas, không dùng màu) + Thủ công (đen trắng thật) |
| TC-029 | App đã cài; có bản mới được deploy | 1. Mở app khi có mạng<br>2. Bấm “Cập nhật” ở màn hình chính | Thông báo không xuất hiện giữa lượt chơi; sau cập nhật hiện số phiên bản mới, dữ liệu giữ nguyên | Trung bình | NF07, R18 | Thủ công (thiết bị thật) |
| TC-030 | Vừa hết giờ chơi | 1. Bấm “Con nghỉ đây” trong 30 giây | Được +2 sao “Nghỉ đúng giờ”, màn hình nghỉ gợi ý vận động | Trung bình | F20 | Tự động (e2e/unit) |
| TC-031 | Đang chơi G1 hoặc G2 | 1. Chạm 2 ngón cùng lúc vào 2 vị trí | Chỉ lần chạm đầu được tính | Trung bình | R05 | Tự động (e2e/unit) |
| TC-032 | Điện thoại dọc, G5 cấp ≥ 4 | 1. Chơi 1 lượt bằng 2 ngón cái | 4 làn vừa màn hình, mỗi làn ≥ 48px; nốt đôi tính đủ | Trung bình | G5, NF04 | Thủ công (thiết bị thật) |
| TC-033 | Đang chơi một game bất kỳ | 1. Vuốt từ cạnh màn hình (cử chỉ Quay lại)<br>2. Bấm “Chơi tiếp”<br>3. Về màn hình chính, vuốt Quay lại 1 lần | Bước 1: game tạm dừng, không thoát; bước 2: chơi tiếp được; bước 3: hiện nhắc “Bấm lần nữa để thoát”, app chưa thoát | Cao | NF10, R23 | Tự động + Thủ công |
| TC-034 | Tablet Samsung, đang chơi G3 | 1. Mở chia đôi màn hình / cửa sổ nổi<br>2. Thu cửa sổ thật nhỏ<br>3. Trở lại toàn màn hình | Game tạm dừng, bố cục sắp lại; cửa sổ quá nhỏ hiện “Mở toàn màn hình để chơi”; trở lại toàn màn hình chơi tiếp được | Trung bình | NF11, R24 | Thủ công (thiết bị thật) |
| TC-035 | Tablet Samsung (không có rung), đang chơi G1 | 1. Chạm bóng đỏ | Bóng/khung chơi lắc nhẹ + âm “bụp” nhẹ; không báo lỗi | Thấp | F09, R25 | Tự động (mô phỏng: không gọi rung, có lắc + âm bụp) + Thủ công (tablet thật) |

## Unit test bắt buộc (Vitest)

| Module | Nội dung kiểm |
|---|---|
| `app/adaptive.ts` | Tăng cấp khi TB 3 lượt ≥ 0,85; giảm khi ≤ 0,55 hoặc 2 lượt < 0,5; fixed không đổi; giới hạn min/max; Dễ/Vừa/Khó không tính |
| `app/scoring.ts` | Ngưỡng sao 0,70 / 0,90; luôn ≥ 1 sao khi hoàn thành |
| `app/rewards.ts` | Nhiệm vụ 3 nhóm; hộp mỗi 15 sao; giới hạn/ngày; tỷ lệ 70/25/5 (±2% trên 10.000 hộp); bảo đảm sau 5 hộp; trùng → +3 sao |
| `app/storage.ts` | Đọc/ghi lỗi → fallback; migration; backup → restore khứ hồi giữ nguyên; dọn bản ghi > 120 ngày |
| `app/session.ts` | Chỉ cộng thời gian khi Running; nhắc trước 2 phút; hết giờ cho kết thúc lượt; tặng thêm giờ |
| `app/device.ts` | deviceClass theo kích thước màn hình (không theo cửa sổ chia đôi) |
| `games/*/logic.ts` | Theo mục “Unit test” của từng game trong `02_GAMES.md` (G6, G7: 1.000 câu/chủ đề, đúng 1 đáp án) |

## E2E bắt buộc (Playwright Chromium – project phone 360×740, tablet 1280×800, tablet-portrait 800×1280, `hasTouch`)

1. Tạo hồ sơ → Home hiện lời chào (TC-003)
2. Chơi 1 lượt mỗi game với `?e2e=1` → màn Kết quả → RoundRecord được lưu
3. Tạm dừng khi `visibilitychange` → chơi tiếp (TC-008)
4. Hết giờ → màn hình nghỉ → PH tặng giờ → mở lại (TC-011, TC-023)
5. Khu PH: khóa phép tính, biểu đồ có dữ liệu (TC-010, TC-026)
6. Sao lưu → xóa storage → khôi phục (TC-025)
7. Offline sau lần tải đầu (TC-012)
8. Quay lại (`page.goBack()`) khi đang chơi → tạm dừng; ở Home → toast nhắc, chưa thoát (TC-033)
9. Thu nhỏ viewport < 360px khi đang chơi → tạm dừng + overlay “Mở toàn màn hình” (TC-034, phần mô phỏng)
