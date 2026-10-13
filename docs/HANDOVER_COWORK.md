# HANDOVER_COWORK – Bàn giao cho phiên Cowork làm Phase 2

> Viết ngày 2026-10-13 (bản **0.9.3** đang live). **Đọc file này đầu tiên.** Dành cho Claude chạy trong **Cowork** và cho anh (chủ dự án).
> Bản kỹ thuật chi tiết cho Claude Code: `docs/HANDOVER.md` – chỉ tra khi cần, **đừng đọc hết**. Luật dự án đầy đủ: `CLAUDE.md`.

---

## 0. Tóm tắt 1 phút

- **Dự án:** “Nhanh Tay Tinh Mắt” – web app dạng PWA gồm **7 mini-game** giúp bé lớp 2 (8 tuổi) tăng tập trung, phản xạ ngón tay, tính nhẩm, tư duy logic. Chạy trên Chrome Android (điện thoại, tablet Samsung Galaxy Tab); **không** hỗ trợ iPhone/iPad.
- **Hiện trạng:** **Phase 1 (TASK-00 → TASK-10) đã đóng ngày 2026-10-13.** Bản 0.9.3 chạy thật tại https://nin-min2231.github.io/nhanh-tay-tinh-mat/ . Repo công khai: https://github.com/Nin-Min2231/nhanh-tay-tinh-mat (chỉ còn nhánh `main`; **mỗi lần push `main` = một lần deploy công khai**).
- **Phase 2:** chưa có tài liệu. Anh sẽ **nêu yêu cầu bằng lời**; Cowork cùng anh làm rõ, soạn tài liệu Phase 2 (mục 2), rồi thực hiện (mục 1 và 7).
- **Chủ dự án:** PM, **không phải lập trình viên**. Trao đổi **tiếng Việt**: gọi “anh”, xưng “em”. Giải thích ngắn gọn; việc anh phải tự làm thì hướng dẫn **từng bước đánh số**, không giả định kiến thức lập trình.
- **Ba quy tắc vàng**
  1. **Không gộp/đẩy `main` khi chưa hỏi anh** (= deploy công khai, bé dùng thật).
  2. **Kế hoạch ngắn → chờ “Đồng ý” → mới làm.** Chỉ bỏ bước chờ khi anh nói rõ “làm luôn”.
  3. **An toàn trẻ em & riêng tư** (mục 4) không đổi, dù yêu cầu mới có vẻ thuận tiện.
- **Từ khóa của anh:** “Đồng ý” = duyệt kế hoạch vừa nêu · “làm luôn” = làm cả loạt, không chờ duyệt từng mục (**vẫn phải hỏi trước khi gộp/đẩy `main`**) · “commit lên GIT” = đồng ý đẩy commit đã chuẩn bị · “anh sẽ tự làm …” = đừng làm thay.

---

## 1. Cowork khác Claude Code ở đâu – đọc kỹ trước khi động vào thư mục

Phase 1 làm hoàn toàn bằng **Claude Code** (tab Code của Claude Desktop) trên Windows. **Cowork** thường chạy trong một **sandbox/máy ảo Linux riêng** và nhìn thư mục dự án như một ổ được gắn vào. Vì vậy:

### 1.1 Đầu phiên: tự kiểm rồi báo anh bảng 5 dòng (chưa sửa gì)

| Câu hỏi | Cách kiểm |
|---|---|
| Đang chạy hệ điều hành nào? | `uname -a` hoặc `node -p process.platform` |
| Có Node / npm / git? phiên bản? | `node -v`, `npm -v`, `git --version` |
| Ghi được vào thư mục dự án? | tạo thử rồi xóa 1 file tạm trong `docs/phase2/` |
| Có mạng không? | thử tải một trang bất kỳ |
| Cài được trình duyệt Playwright? | chỉ thử **trong bản sao tạm** (xem 1.2) |

### 1.2 Điều cấm (làm hỏng máy của anh)

1. **KHÔNG chạy `npm install` / `npm ci` trong thư mục dự án từ sandbox Linux.** `node_modules` hiện là bản **Windows** (≈ 193 MB); cài từ Linux sẽ ghi đè và làm hỏng `npm run dev` của anh. Muốn chạy test: chép dự án (bỏ `node_modules`, `.git`, `.claude`) sang thư mục tạm của sandbox rồi cài ở đó.
2. **KHÔNG chạy lệnh git ghi** (commit, merge, push, switch, branch, worktree, stash…) từ sandbox. `.git` do Windows tạo (có worktree, đường dẫn kiểu `D:/…`); sandbox cũng không có đăng nhập GitHub. Cowork chỉ **sửa file**; commit/đẩy do Claude Code làm (mục 7). Được đọc: `git --no-optional-locks status`, `git diff`, `git log` (cờ `--no-optional-locks` để `status` không ghi lại chỉ mục).
3. **Không đụng:** `node_modules/`, `.git/`, `.claude/` (kể cả `.claude/worktrees/` – do Claude Desktop tự quản), `dist*/`, `playwright-report/`, `test-results/`.
4. **Excel kế hoạch** `docs/ke-hoach/Game_NhanhTayTinhMat_PhanTich_KeHoach_v1.2.xlsx` là **bản duy nhất** (bị `.gitignore`, không có trên GitHub). Muốn sửa: **copy sang tên mới** (`…_v1.3.xlsx`), không ghi đè v1.2. Khi anh đang mở bằng Excel thì file bị khóa – đừng ép.
5. Không xóa/di chuyển file ngoài phạm vi yêu cầu; xóa thứ gì cũng **hỏi anh trước**.

### 1.3 Hai giai đoạn làm việc (đề xuất – anh đổi được)

| Giai đoạn | Việc | Làm ở đâu | Rủi ro |
|---|---|---|---|
| **A – Soạn tài liệu Phase 2** | Làm rõ yêu cầu, viết `docs/phase2/*` | Thư mục gốc `D:\01_NguyenNC\10_Claude\07_Tap_trung_G`, **chỉ tạo/sửa file trong `docs/phase2/`** (+ ghi chú vào `docs/PROGRESS.md`) | Không đụng mã → gần như không có |
| **B – Triển khai** (sửa mã, dữ liệu, nội dung game) | Sửa `src/`, `tests/`, `docs/data/levels.json`… | **Thư mục làm việc riêng cho Cowork** (mục 7-A), **không** làm ở thư mục gốc | Tách khỏi `main` và khỏi `npm run dev` của anh |

Giai đoạn B ở thư mục riêng vì thư mục gốc là nhánh `main` đang chạy `npm run dev` của anh; sửa mã dở tay ở đó làm hỏng bản xem thử và vướng các lần gộp khác.

### 1.4 Hai đường kiểm tra (Cowork chọn sau 1.1, nói rõ với anh)

- **Đường A – Cowork chạy được npm/test (trên bản sao tạm):** tự chạy lint, unit test, (e2e nếu cài được trình duyệt) rồi báo kết quả. Vẫn không commit/push.
- **Đường B – Cowork chỉ sửa file (mặc định an toàn):** Cowork soạn/sửa; **Claude Code** chạy kiểm tra, commit, gộp, deploy (mục 7).

> **Khi `CLAUDE.md` mâu thuẫn với mục 1 này** (vd bảo chạy `npm`/`git`/Browser pane mà Cowork không cho hoặc bị cấm ở 1.2): **làm theo mục 1**; phần việc đó chuyển cho Claude Code (mục 7). `CLAUDE.md` viết cho Claude Code nên các chỉ dẫn về công cụ trong đó không áp dụng nguyên văn cho Cowork; **quy tắc về sản phẩm (mục 4 file này) thì áp dụng đầy đủ**.

### 1.5 Ai làm gì (mặc định)

| Loại yêu cầu | Ví dụ | Làm bởi |
|---|---|---|
| Tài liệu / nội dung | tài liệu Phase 2, bảng độ khó `levels.json`, câu chữ, tên sticker, nội dung câu hỏi | Cowork làm trực tiếp |
| Sửa mã nhỏ | đổi hằng số, thêm chuỗi `vi.ts`, chỉnh bố cục | Cowork sửa → Claude Code kiểm tra |
| Tính năng / game mới, đổi cấu trúc dữ liệu | thêm game, thêm loại phần thưởng, đổi `schemaVersion` | Cowork soạn spec + kế hoạch; mã theo đường A hoặc B |
| Sửa lỗi sau khi anh thử máy thật (“TASK-10 đợt 3”) | “G3 cấp 2 quá nhanh” | **Claude Code**, như Phase 1 |

> Nếu không ghi được trực tiếp vào thư mục dự án, soạn ở nơi Cowork cho phép rồi nhờ Claude Code chép vào `docs/phase2/`.

---

## 2. Quy trình nhận yêu cầu Phase 2 (áp dụng cho từng yêu cầu)

1. **Nhắc lại bằng lời của mình** (3–5 dòng) + hỏi những điều còn mơ hồ (vài câu mỗi lượt, đừng hỏi dồn).
2. **Đối chiếu** SPEC và mục 4. Nếu yêu cầu **va chạm quy tắc** (tài khoản đăng nhập, đồng bộ đám mây, thông báo đẩy, quảng cáo, thư viện/CDN bên ngoài, thu thập dữ liệu…) → **dừng, nói rõ vì sao và hỏi anh**; chỉ làm khi anh chốt **và** đã sửa quy tắc tương ứng trong `CLAUDE.md`.
3. **Phân loại** (nhỏ / tính năng / game mới) và đề xuất số phiên bản (mục 6).
4. **Kế hoạch ngắn:** file sẽ sửa/tạo · ảnh hưởng dữ liệu (cần migration?) · rủi ro · cách kiểm · cách anh thử trên điện thoại/tablet. **Chờ “Đồng ý”.**
5. Làm từng bước nhỏ; mỗi bước có kiểm tra.
6. **Cập nhật tài liệu cùng lúc** với thay đổi (SPEC / GAMES / ACCEPTANCE / PROGRESS).
7. **Báo cáo ngắn bằng tiếng Việt:** đã làm gì · cách thử trên điện thoại/tablet (đánh số) · điểm cần anh quyết.

### Soạn tài liệu Phase 2 (gợi ý – anh đổi được)

- Thư mục **`docs/phase2/`**: `P2_SPEC.md` (mục tiêu · phạm vi trong/ngoài · **yêu cầu mới** · **thay đổi so với Phase 1** · dữ liệu & migration · câu hỏi mở) · `P2_GAMES.md` (chỉ khi có game/độ khó mới) · `P2_TASKS.md` (mỗi TASK một khối **Prompt** như `docs/03_TASKS.md`: file đọc trước, việc cần làm, “Không làm”, “Hoàn thành khi”, “Trước khi làm: trình bày kế hoạch và chờ tôi duyệt”) · `P2_ACCEPTANCE.md` (test case mới).
- **Đánh số tiếp, không trùng Phase 1:** yêu cầu **F21, NF12, UI05…** · test case **TC-036…** · task **TASK-11…** (Phase 1 dùng đến F20, NF11, UI04, TC-035, TASK-10).
- **Không viết lại tài liệu Phase 1**: nó là nền (baseline). Chỉ sửa SPEC/GAMES cho đúng thực tế **sau khi** triển khai xong, và ghi vào Changelog.
- **Một nhật ký chung:** tiếp tục `docs/PROGRESS.md` (mọi phiên đọc nó đầu tiên): trạng thái, nhật ký, Changelog.
- Muốn bản Excel: làm trên bản sao `…_v1.3.xlsx` (Excel gốc có 8 sheet: 1 Tổng quan · 2 Phân tích game · 3 Yêu cầu · 4 Kế hoạch · 5 Test case · 6 Rủi ro & mơ hồ · 7 Thiết lập độ khó · 8 Tài liệu Claude Code; anh ghi kết quả thử máy thật ở sheet 5).

---

## 3. Hiện trạng sản phẩm (2026-10-13, bản 0.9.3)

| Game | Tên | Nhóm | Vẽ bằng |
|---|---|---|---|
| G1 | Bóng Xanh – Bóng Đỏ (Go/No-Go) | Phản xạ | Canvas |
| G2 | Bảng Số Thần Kỳ (Schulte) | Tập trung & Trí nhớ | DOM/SVG |
| G3 | Đuổi Bắt Thú Cưng | Phản xạ | Canvas |
| G4 | Chuỗi Ánh Sáng (Simon/Corsi) | Tập trung & Trí nhớ | DOM |
| G5 | Nốt Nhạc Rơi (đa điểm chạm) | Phản xạ | Canvas |
| G6 | Hái Táo Tính Nhẩm (toán lớp 1–3, 14 chủ đề M01–M14) | Học mà chơi | DOM |
| G7 | Tìm Quy Luật (logic) | Học mà chơi | DOM/SVG |

**Tính năng nền (đã xong, đã có test):**
- Hồ sơ tối đa 5 bé; mỗi game 10 cấp độ, độ khó **thích ứng tự động** (hoặc cố định); bé chọn nhanh Dễ/Vừa/Khó nếu phụ huynh cho phép.
- Sao 1–3/lượt · **nhiệm vụ hôm nay** (3 nhóm) → **hộp quà** · album **40 sticker** · trang phục, hình nền · linh vật **Sóc Bo** (và **Cú Mèo** ở 230 sao) · bộ âm **Nhạc Cụ Gõ** (80 sao) · “Nghỉ đúng giờ” +2 sao.
- **Giới hạn thời gian/ngày** (mặc định 15 phút), nhắc còn 2 phút, hết giờ → góc nghỉ.
- **Khu phụ huynh** (khóa bằng phép nhân): tiến bộ (biểu đồ), bài đo tuần, cài đặt độ khó/tùy chọn từng game, hồ sơ, thưởng (tặng thời gian/hộp quà), dữ liệu (sao lưu/khôi phục, xuất CSV).
- **PWA:** cài được lên màn hình chính, chạy offline hoàn toàn; nút “Cập nhật” chỉ ở Home/khu phụ huynh, không bao giờ tự tải lại giữa lượt.
- Tablet Samsung: đa cửa sổ, S Pen, nút Quay lại Android; Home xếp 3 nhóm cạnh nhau khi màn ngang ≥ 1200px.

**Công nghệ (đã chốt, không tự đổi):** Vite + TypeScript strict · Preact + `@preact/signals` · Canvas 2D (G1/G3/G5) · `vite-plugin-pwa` · Chart.js (tải sau) · font Nunito · Web Audio tự tổng hợp · `localStorage` (khóa `ntm.state`, `ntm.rounds.<id>`, `ntm.daily.<id>`, **schema 3** có migration) · Vitest · Playwright Chromium · ESLint + Prettier · GitHub Actions → GitHub Pages. **Không có máy chủ, không tài khoản:** mọi dữ liệu nằm trong trình duyệt của máy bé.

**Chất lượng lúc bàn giao:** 569 unit test · 489 e2e (474 chạy + 15 bỏ qua có chủ ý) ở 3 khung hình (điện thoại 360×740, tablet ngang 1280×800, tablet dọc 800×1280) · lint + `tsc` sạch · 60 fps G1/G3/G5 (đo bằng Chrome có GPU) · gói chính ≈ 122 KB gzip (giới hạn 350) · Lighthouse Accessibility 100 · axe-core 0 vi phạm · 35 test case nghiệm thu đều có test tự động (12 cái cần thêm máy thật – mục 8).

---

## 4. Quy tắc bất biến (tóm tắt `CLAUDE.md` mục 5 – đọc bản đầy đủ trước khi sửa mã)

| Nhóm | Quy tắc (số trong `CLAUDE.md`) |
|---|---|
| **An toàn trẻ em & riêng tư** | 1: không quảng cáo, không mua hàng, không link ra ngoài, không analytics, **không gửi dữ liệu ra mạng** · 2: hộp quà chỉ nhận bằng nỗ lực/phụ huynh tặng, không tiền thật · 3: sai thì nhẹ nhàng, không âm chê, **không trừ sao** · 4: hình/nhân vật/nhạc **tự thiết kế**, không bản quyền |
| **Thiết bị cảm ứng** | 5–9b: Pointer Events; chạm đầu tiên (G5 đa điểm); chạm vào chỗ trống/vật sai bị tính lỗi (G1, G3); vùng chạm ≥ 48px (nút chính ≥ 64px); màu luôn kèm hình dạng; S Pen như ngón tay; đúng/sai không phụ thuộc rung |
| **Vòng đời & dữ liệu** | 10–14: tạm dừng khi ẩn app/xoay/đổi cỡ; nút Quay lại Android; mọi truy cập `localStorage` qua `storage.ts`; đổi cấu trúc dữ liệu = `schemaVersion` + migration + test; không tự reload khi có bản mới; random ảnh hưởng điểm/thưởng phải dùng `rng.ts` có seed |
| **Code** | 15–17: logic thuần có unit test; **chuỗi giao diện chỉ ở `src/i18n/vi.ts`**; 60 fps (không tạo object/đọc layout mỗi khung hình) |

- Công nghệ đã chốt: **không thêm thư viện, không CDN** nếu chưa hỏi anh (ngoại lệ đã chấp nhận: `cross-env`, `@playwright/test`, plugin ESLint/Prettier chuẩn).
- Các quy tắc 1, 5, 6, 8, 9a, 9b, 10, 11, 13, 14, 16, 17 có **test quét mã tự động** (`src/qa/rules.test.ts`): vi phạm làm test đỏ.
- **Không tự quyết** (luôn hỏi anh): thêm thư viện · đổi công nghệ · gộp/đẩy `main` · xóa dữ liệu/nhánh/worktree/Excel · gửi dữ liệu ra mạng · nới quy tắc an toàn trẻ em · deploy.

**Checklist trước khi báo “xong” một thay đổi về mã/dữ liệu:**
- [ ] Chuỗi giao diện chỉ ở `vi.ts` · số liệu độ khó chỉ ở `docs/data/levels.json`
- [ ] Random dùng `rng.ts` · không `fetch` ra ngoài · không thư viện mới
- [ ] Dữ liệu mới → `validate.ts` + migration + `CURRENT_SCHEMA` + test (xem `docs/HANDOVER.md` mục 6/7)
- [ ] Vùng chạm ≥ 48px · màu kèm hình · phản hồi sai nhẹ nhàng
- [ ] Logic thuần có unit test · giao diện có e2e ở 3 khung hình
- [ ] Đã cập nhật SPEC / GAMES / ACCEPTANCE / PROGRESS

---

## 5. Bản đồ tài liệu & mã (đọc theo nhu cầu)

| Cần gì | Mở file |
|---|---|
| Yêu cầu, màn hình, dữ liệu, độ khó, thưởng, khu phụ huynh, PWA | `docs/01_SPEC.md` (nguồn sự thật; mục 2 = bảng yêu cầu F/NF/UI) |
| Luật chơi từng game, bảng 10 cấp, unit test cần có | `docs/02_GAMES.md` |
| **Bảng cấp độ dạng dữ liệu (sửa số ở đây, không sửa trong code)** | `docs/data/levels.json` |
| Mẫu Prompt cho từng TASK Phase 1 (khuôn cho Phase 2) | `docs/03_TASKS.md` |
| 35 test case nghiệm thu | `docs/04_ACCEPTANCE.md` |
| Nhật ký, Changelog, trạng thái, mục “Đề xuất” | `docs/PROGRESS.md` |
| Kết quả QA, danh sách việc cần thử máy thật, rủi ro còn lại | `docs/QA_REPORT.md` |
| Kiến trúc/mã, cờ dev (`?e2e=1` `?debug=1` `?gallery=1`…), bẫy công cụ | `docs/HANDOVER.md` (Claude Code) |
| Mẫu câu hỏi G6/G7 để duyệt nội dung | `docs/samples/` |
| Excel kế hoạch gốc (ngoài git, bản duy nhất) | `docs/ke-hoach/` |

Mã: `src/app/` (logic thuần: độ khó, điểm, thưởng, lưu trữ…) · `src/games/g1-…g7-…/` (mỗi game: `config.ts` · `logic.ts` · `view.ts`) · `src/ui/` (màn hình, linh vật, sticker) · `src/i18n/vi.ts` (**mọi chuỗi giao diện**) · `tests/e2e/` · `scripts/`.

**Điểm mở rộng thường gặp** (xem `docs/HANDOVER.md` mục 4 “Quy ước làm game”):
| Muốn… | Chạm vào |
|---|---|
| Thêm game mới | `docs/02_GAMES.md` + `docs/data/levels.json` + `src/games/<game>/` + `src/games/registry.ts` + icon/hình động giới thiệu + `vi.ts` + tùy chọn khu PH (`ui/parent/gameOptions.ts`) |
| Chỉnh độ khó | chỉ `docs/data/levels.json` (+ ghi lý do vào PROGRESS) |
| Thêm chủ đề toán G6 / dạng câu G7 | `src/games/g6-math/` · `src/games/g7-patterns/` (có test 1.000 câu “đúng 1 đáp án”) |
| Thêm sticker / mốc mở khóa | `src/app/rewards.ts` (danh mục) + `src/ui/stickers/` |
| Thêm bộ âm / linh vật | `src/app/audioSets.ts` · `src/ui/components/Owl.tsx` (mẫu) |

---

## 6. Phiên bản & phát hành

- Hiện **0.9.3** (Phase 1 phát hành dưới 1.0 để chờ anh thử máy thật). **Câu hỏi cho anh:** khi nào gọi là **1.0.0**? *Đề xuất:* sau khi anh thử máy thật xong và không còn lỗi chặn → 1.0.0; mỗi đợt tính năng Phase 2 → 1.1.0, 1.2.0…; sửa lỗi nhỏ → tăng số cuối.
- Mỗi lần gộp vào `main` = một phiên bản: tăng `package.json` (+ `package-lock.json` dòng 3 và 9) và ghi một dòng **Changelog** trong `docs/PROGRESS.md`.
- Quy trình gộp/deploy (**Claude Code** làm, **chỉ khi anh đồng ý**): chạy lint + unit + build + e2e đầy đủ (≈ 13 phút, giữ máy thức) → `git merge --ff-only` ở thư mục gốc → `git push origin main` → GitHub Actions (CI + Deploy ≈ 2 phút) → kiểm trang thật → ghi “đã gộp” vào tài liệu. Chi tiết: `docs/HANDOVER.md` mục 0.
- Commit theo Conventional Commits, **tiếng Anh** (`feat:`, `fix:`, `docs:`, `test:`, `chore:`); tài liệu và giao diện: tiếng Việt.

---

## 7. Cầu nối sang Claude Code (copy–paste vào tab Code, Local, thư mục dự án)

**7-A. Tạo thư mục làm việc riêng cho Cowork** (một lần, trước giai đoạn B):
```
Tạo bản làm việc riêng cho Cowork làm Phase 2, không đụng main:
1. git -C D:\01_NguyenNC\10_Claude\07_Tap_trung_G worktree add D:\01_NguyenNC\10_Claude\07_Tap_trung_G_P2 -b phase2/work main
2. Trong thư mục mới chạy npm ci, rồi npm run lint và npm test để chắc môi trường tốt.
3. Báo lại đường dẫn. Không push, không gộp.
```
Sau đó anh chọn **thư mục `07_Tap_trung_G_P2`** làm thư mục làm việc của Cowork. (Excel gốc không nằm trong thư mục này vì bị `.gitignore`; cần thì cấp thêm quyền đọc `docs\ke-hoach` của thư mục gốc hoặc chép file sang.)

**7-B. Commit tài liệu Phase 2 do Cowork soạn** (giai đoạn A, làm ở thư mục gốc):
```
Cowork vừa tạo/sửa tài liệu Phase 2 trong D:\01_NguyenNC\10_Claude\07_Tap_trung_G (chưa commit; chỉ trong docs/phase2/ và có thể docs/PROGRESS.md).
1. git -C <thư mục gốc> status --short: liệt kê cho tôi.
2. git -C <thư mục gốc> switch -c docs/phase2-spec (mang theo thay đổi), add đúng các file đó, commit "docs: phase 2 spec and tasks (draft)".
3. Chưa push. Hỏi tôi có gộp vào main và đẩy lên GitHub không.
```

**7-C. Kiểm tra thay đổi do Cowork sửa** (giai đoạn B):
```
Cowork vừa sửa file trong D:\01_NguyenNC\10_Claude\07_Tap_trung_G_P2 (nhánh phase2/work, chưa commit). Đọc CLAUDE.md và docs/HANDOVER.md mục 5, 7, 10.
1. git -C <thư mục đó> status và diff: tóm tắt thay đổi cho tôi bằng tiếng Việt.
2. Chạy npm run lint, npm test, npm run build; nếu có đổi giao diện/game thì chạy thêm npx playwright test --workers=3 (giữ máy thức).
3. Báo kết quả. Lỗi nhỏ trong phạm vi thay đổi: sửa luôn; lỗi lớn: hỏi tôi.
4. Commit lên nhánh phase2/work (Conventional Commits, tiếng Anh). Chưa gộp/push main.
```

**7-D. Gộp + deploy** (chỉ khi anh đã đồng ý):
```
Tôi đồng ý gộp nhánh phase2/work vào main và deploy. Làm theo docs/HANDOVER.md mục 0 (“Cách gộp đã dùng”): nếu main đã đi tiếp thì đưa main vào phase2/work trước; tăng version + Changelog trong docs/PROGRESS.md và commit; git -C <thư mục gốc> merge --ff-only phase2/work; push origin main; đợi CI + Deploy xanh; kiểm trang thật; đánh dấu “đã gộp” trong tài liệu. Sau đó cho phase2/work khớp lại với main để làm tiếp.
```

**7-E. Xem thử trên điện thoại/tablet:** nhắn Claude Code “Chạy npm run dev --host ở <thư mục>, cho tôi địa chỉ IP” (thư mục gốc dùng cổng 5173; thư mục P2 dùng cổng khác, vd 5174). Thêm `?debug=1` vào địa chỉ để hiện FPS và công cụ thử thưởng.

> Sửa lỗi từ lần thử máy thật (TASK-10 đợt 3) vẫn do Claude Code làm song song và gộp vào `main` như Phase 1; nhánh `phase2/work` chỉ cần được Claude Code cập nhật từ `main` trước mỗi lần gộp.

---

## 8. Việc đang chờ anh (không chặn Phase 2)

1. **Thử máy thật** (danh sách đầy đủ: `docs/QA_REPORT.md` mục 8 và 10): cài app + chế độ máy bay (TC-001, 002, 012) · G5 bằng 2 ngón thật (TC-007, 032) · vuốt Quay lại, chia đôi màn hình, tablet không rung (TC-033, 034, 035) · G1 ở chế độ đen trắng (TC-028) · bấm “Cập nhật” (TC-029) · sao lưu → khôi phục trên Android (TC-025) · Samsung Internet · FPS thật bằng `?debug=1` · Album → Đặc biệt (Nhạc Cụ Gõ, Cú Mèo) · chấm đỏ nhắc sao lưu · mở file CSV bằng Excel/Google Trang tính.
2. **Duyệt nội dung/hình:** mẫu G6/G7 (`docs/samples/`) · 40 sticker, trang phục, hình nền · icon · Cú Mèo · tiếng Nhạc Cụ Gõ · đoạn chữ “khi nào nên cho bé đi khám” (`vi.parent.data.note`).
3. **Ghi kết quả vào Excel sheet 5**; lỗi nào gặp thì chuyển thành yêu cầu sửa lỗi (Claude Code, TASK-10 đợt 3).

**Cách anh cập nhật app đã cài trên điện thoại/tablet:**
1. Mở app khi có wifi, đợi vài giây.
2. Ở Home bấm nút **“Có bản mới – Cập nhật”**.
3. Vào Khu phụ huynh → tab Dữ liệu, kiểm tra thấy đúng số phiên bản. Dữ liệu của bé vẫn nguyên. (GitHub Pages có thể giữ bản cũ ≈ 10 phút; chưa thấy nút thì đóng hẳn app, đợi rồi mở lại.)

---

## 9. Đầu vào có sẵn cho Phase 2 (đã ghi trong tài liệu, **chưa ai yêu cầu làm**)

- Khu phụ huynh: **so sánh nhiều bé**; bộ đếm “sai 3 lần” của khóa chỉ nằm trong bộ nhớ (tải lại trang là thử lại được); điều hướng tab bằng phím mũi tên.
- **Cú Mèo chưa có trang phục** (chỉ Sóc Bo mặc được).
- Kiểm file CSV bằng Google Trang tính thật (dòng đầu `sep=,` dành cho Excel); Excel Việt Nam có thể đọc số thập phân thành chữ.
- Chữ tên sticker trong Album 16px (SPEC ghi 18px) – đã có phóng to khi chạm.
- Tỷ lệ độ hiếm thật ≈ 66 / 28,3 / 5,7 (do “bảo đảm Hiếm”), không đúng 70/25/5 – chỉnh ở `rollRarity` (`src/app/rewards.ts`) nếu anh muốn.
- G6: hình minh họa khi sai hiện 1,5 giây (`SHOW_MS`); tăng nếu bé chưa kịp nhìn.
- Nếu bé hay phóng to nhầm ở Home: đổi sang chặn phóng ở màn của bé, chỉ cho phóng ở khu phụ huynh.
- Tách gói `ui/parent/*` tải sau nếu gói chính phình (hiện ≈ 122 KB gzip, giới hạn 350).
- Chưa kiểm **Samsung Internet** thật; Home màn ngang hẹp 900–1199px vẫn 4 cột và phải cuộn (cố ý).
- **Ranh giới thiết kế cần anh quyết nếu Phase 2 chạm tới:** tài khoản, đồng bộ nhiều máy, thông báo, chia sẻ, mua hàng, nhiều ngôn ngữ, hỗ trợ iPhone/iPad – tất cả đang **ngoài phạm vi** (xem mục 4); cần sửa `CLAUDE.md` và SPEC trước khi làm.

---

## 10. Bẫy đã gặp ở Phase 1 (liên quan khi Cowork sửa file)

- **Chuỗi tiếng Việt chỉ ở `src/i18n/vi.ts`:** có test quét chữ có dấu ngoài file này; công cụ sửa file có thể đổi `\uXXXX` thành ký tự thật làm test đỏ – dựng regex chữ Việt bằng `String.fromCharCode` (xem `src/app/csv.ts`).
- **Thêm trường vào dữ liệu** (`Profile`, `RoundRecord`, `DayUsage`) mà quên `validate.ts` → trường mới bị bỏ khi đọc lại.
- **Test có dùng thời gian/đếm chung:** hai lượt cùng ngày có thể đảo thứ tự nếu không ghi rõ giờ (đã gặp ở `parent.spec.ts`).
- **Chạy hai lệnh Playwright cùng lúc trong một thư mục** làm test báo lỗi giả; máy ngủ giữa lượt chạy dài làm vài test “hết hạn 30 giây” cùng lúc → chạy lại trước khi kết luận.
- **Windows:** mọi npm script phải chạy được trên PowerShell (dùng `cross-env`); Git Bash đổi `/ten-repo/` thành đường dẫn Windows.
- **GitHub Pages** giữ `sw.js` ≈ 10 phút → app đã cài thấy bản mới chậm một chút.
- Excel đang mở thì file bị khóa; tệp `~$…xlsx` do Excel quản – đừng xóa khi Excel còn chạy.

---

## 11. Prompt khởi động phiên Cowork (anh copy–paste)

```
Bạn là Cowork, tiếp nhận Phase 2 của dự án "Nhanh Tay Tinh Mắt" (PWA 7 mini-game cho bé lớp 2). Thư mục làm việc: <đường dẫn anh đã chọn>.
Làm theo thứ tự:
1. Đọc toàn bộ docs/HANDOVER_COWORK.md, rồi CLAUDE.md, rồi phần đầu docs/PROGRESS.md.
2. Làm mục 1.1 của HANDOVER_COWORK.md: kiểm môi trường và báo tôi bảng kết quả 5 dòng. Chưa sửa gì.
3. Tóm tắt dự án 5 dòng để tôi xác nhận bạn hiểu đúng.
4. Sau đó tôi sẽ nêu yêu cầu Phase 2. Với mỗi yêu cầu, làm theo mục 2: nhắc lại → hỏi điều còn mơ hồ → đối chiếu quy tắc mục 4 → kế hoạch ngắn → chờ tôi "Đồng ý".
Luôn trả lời tiếng Việt, ngắn gọn; thao tác tôi phải tự làm thì hướng dẫn từng bước đánh số. Không gộp/đẩy main, không npm install và không chạy lệnh git ghi từ sandbox.
```
