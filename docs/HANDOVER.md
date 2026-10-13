# HANDOVER – Bàn giao sang phiên làm việc mới

> Viết ngày 2026-10-11, cập nhật 2026-10-13 (sau khi **gộp `main` + deploy TASK-10 đợt 2, v0.9.3**). `main` = **v0.9.3 đang live** (TASK-00 → TASK-10 đợt 2). Việc tiếp theo: **TASK-10 đợt 3** khi anh gửi danh sách lỗi/góp ý từ máy thật (xem **mục 0b** và mục 1). Đọc file này **sau** `CLAUDE.md` và `docs/PROGRESS.md`.
> Mục đích: để phiên mới (Claude Code Desktop, tab Code, Local) biết chính xác đang ở đâu mà không phải đoán lại ngữ cảnh. Phiên mới tạo nhánh/worktree mới **từ `main`** (đã chứa đủ 0.9.3 và file này; nếu `main` cục bộ chưa thấy thì `git fetch origin` trước). Báo cáo QA đầy đủ: **`docs/QA_REPORT.md`**.
> **Phase 2 làm bằng Cowork** (không phải Claude Code) → đọc **`docs/HANDOVER_COWORK.md`** trước. File này là bản kỹ thuật cho Claude Code; mục 7 của `HANDOVER_COWORK.md` có các prompt “cầu nối” để Claude Code kiểm tra, commit và deploy phần Cowork làm.

---

## 0. Trạng thái git

- **TASK-00 → TASK-10 đợt 2 đều đã ở `main` và `origin/main`** (đợt 2 gộp fast-forward ngày 2026-10-13, anh “Đồng ý”: `main` từ `f2af811` lên `a62d692`; `git log origin/main -1` cho commit cuối), **bản 0.9.3 chạy trên GitHub Pages sau lần deploy tự động** (CI + Deploy xanh, đã kiểm trang thật): https://nin-min2231.github.io/nhanh-tay-tinh-mat/ – **mỗi lần push `main` là một lần deploy**, kể cả commit chỉ sửa tài liệu (build không đổi thì `sw.js` không đổi → app đã cài không hiện thêm lần “Cập nhật”). Bản 0.9.2 (`f2af811`) là bản deploy ngay trước đó.
- **Nhánh git (đã dọn ngày 2026-10-13 theo yêu cầu của chủ dự án):** trên GitHub chỉ còn `main`; nhánh nào còn trên máy (gắn với các phiên Claude cũ) chỉ là bản sao của `main`, không cần dùng. **Cách gộp đã dùng (cho đợt sau, chỉ khi chủ dự án đồng ý):** `git -C <thư mục gốc> fetch origin`, `git -C <thư mục gốc> merge --ff-only origin/<nhánh>` (thư mục gốc đang ở nhánh `main`, sạch), rồi `GIT_TERMINAL_PROMPT=0 timeout 90 git -C <thư mục gốc> push origin main`; đợi CI + Deploy xanh qua API công khai Actions, rồi kiểm trang thật (gói chính có chuỗi phiên bản mới). Dùng `git -C`, đừng `cd` vào thư mục gốc.
- **Xóa nhánh hay worktree vẫn phải hỏi chủ dự án trước** (đợt dọn 2026-10-13 làm theo yêu cầu của anh: xóa 7 nhánh cũ trên máy + 6 nhánh trên GitHub, đều đã gộp vào `main`, không có PR nào đang mở). Hai worktree `.claude/worktrees/handover-continuation-f32d2a` và `handover-file-task-5ad07c` (HEAD tách rời) là kho dự phòng do Claude Desktop tự quản – để yên; worktree của phiên đã xong thì để app tự dọn khi anh **lưu trữ (archive)** phiên đó (app chỉ tự dọn phiên không hoạt động ≥ 30 ngày; công cụ lưu trữ của Claude có thể bị bộ phân loại chặn → anh tự lưu trữ trong app). **Việc mới thì tạo nhánh/worktree mới** (từ `main`; gợi ý `claude/task-10-fixes-3`; worktree mới chưa có `node_modules` → `npm ci`).
- **Máy chủ `npm run dev` của chủ dự án chạy ở thư mục gốc (nhánh `main`, cổng 5173, `--host`, địa chỉ LAN `192.168.1.14`)** và tự cập nhật khi `main` đổi. Khi cần dev server của worktree: dùng **cổng khác** (`npm run dev -- --port 5174 --strictPort`; thêm một mục tạm trong `.claude/launch.json` để dùng `preview_start`, **đừng commit mục này**).
- Việc còn chờ chủ dự án (không chặn gì): **toàn bộ danh sách thử trên máy thật ở `docs/QA_REPORT.md` mục 8** (cài PWA, “Cập nhật”, 2 ngón thật G5, cử chỉ Quay lại, chia đôi màn hình, tablet không rung, đen trắng G1, **FPS thật G3/G5 bằng `?debug=1`**, sao lưu → khôi phục thật, Samsung Internet, **phóng to 2 ngón ở Home rồi vào game**); duyệt icon PWA, chữ R13, nội dung mẫu G6/G7, 40 sticker + trang phục + hình nền, **icon thẻ G1/G2 mới**, **bóng G1 mới, hình Cú Mèo, tiếng Nhạc Cụ Gõ (0.9.3)**; **gửi danh sách lỗi/góp ý** từ lần thử máy thật.

---

## 0b. TASK-10 đợt 2 – ĐÃ XONG, ĐÃ GỘP `main` + deploy (v0.9.3, 2026-10-13)

Chủ dự án (2026-10-13) dặn **“thực hiện các việc còn lại cho xong luôn”** → lệnh **“làm luôn”**: không chờ duyệt kế hoạch từng mục (vẫn ghi quyết định tự chọn vào `docs/PROGRESS.md` để anh góp ý), **nhưng gộp/push `main` vẫn phải hỏi** (= deploy công khai). Anh chưa gửi danh sách lỗi từ máy thật nên đợt này làm hết **tồn đọng đã ghi nhận**. Phiên đầu làm A1–D, E1, F rồi bị dừng giữa chừng để bàn giao; phiên sau (cùng ngày) làm nốt **E2 → G → H**.

- **Git / deploy:** đợt 2 đã **gộp fast-forward vào `main`** (2026-10-13, anh “Đồng ý”; `main` `f2af811` → `a62d692`) và **deploy v0.9.3** (CI + Deploy xanh sau ≈ 1 phút). **Đã kiểm trang thật:** gói chính `index-Bqfr354a.js` (397.122 byte, đúng bản build local) có chuỗi 0.9.3, viewport cho phóng to, không có mã trang xem thử; chạy `scripts/qa-axe.mjs` trên trang thật: 46 lượt, 0 vi phạm, 0 lỗi trang. `package.json` / `package-lock.json` **0.9.3**.
- **Việc tiếp theo, theo thứ tự:**
  1. Nhắn anh: mở app đã cài, đợi vài giây rồi bấm **“Cập nhật”** ở Home (Khu phụ huynh → Dữ liệu phải ghi “Phiên bản 0.9.3”), rồi thử máy thật theo “Cách thử thủ công” của TASK-10 đợt 2 (PROGRESS) và `docs/QA_REPORT.md` mục 8 + 10.
  2. Khi anh gửi danh sách lỗi/góp ý từ máy thật → **TASK-10 đợt 3** (mẫu lặp lại ở `docs/03_TASKS.md` mục TASK-10): tìm nguyên nhân → đề xuất → chờ duyệt → sửa + test; xong tăng version patch, ghi Changelog, **hỏi** rồi mới gộp/push `main`.
  3. Mọi lần gộp/push `main` về sau **vẫn phải hỏi** (= deploy công khai).

| # | Việc | Commit | Trạng thái |
|---|---|---|---|
| A1 | Dữ liệu hồ sơ: `Profile.mascotId` + `soundSetId`, **schema 3** + migration 2→3 + `validate.ts` + SPEC mục 5; `canEquip`/`equipReward` cho `soundSet`/`mascot` (mở khóa không tự mặc) | `41467a3` | ☑ |
| A2 | Bộ âm **Nhạc Cụ Gõ** (80 sao): `app/audioSets.ts` (dữ liệu thuần) + `createAudio` đọc bộ đang chọn + “Nghe thử” | `df49ec1` | ☑ |
| A3 | Linh vật **Cú Mèo Thông Thái** (230 sao): `ui/components/Owl.tsx` 5 biểu cảm; `Mascot` chọn Sóc/Cú theo hồ sơ; trang phục chỉ cho Sóc Bo | `d371b89` | ☑ |
| A4 | Album → tab **Đặc biệt**: “Dùng / Đang dùng” + “Nghe thử”; nhắc “Vào Album → Đặc biệt” ở Kết quả/hộp quà | `d371b89` | ☑ |
| B | Bóng/khối **G1** bóng bẩy: sprite vẽ một lần khi đổi cỡ (`games/g1-balls/art.ts`), mỗi khung `drawImage` | `8c06986` | ☑ (đã đo lại 60 fps ở G) |
| C | **G7 cấp 5**: lời giải thích riêng “màu lặp mỗi 2 ô, hình lặp mỗi 3 ô” (`Explain {kind:'dual'}`) | `47a52ee` | ☑ |
| D | **G6 M11**: dạng “tìm số thiếu” không hỏi số > 99 (`MAX_MISSING`) | `8581d54` | ☑ |
| E1 | Khu PH → Dữ liệu: **xuất CSV** (từng lượt + tổng hợp theo ngày; UTF-8 BOM) | `32f5b5d` + `96d36e8` | ☑ |
| E2 | **Chấm đỏ nhắc sao lưu** trên nút Phụ huynh ở Home (chỉ khi có hồ sơ có sao + quá 14 ngày/chưa từng sao lưu; không chữ cho bé) | `8873e6f` | ☑ |
| F | `AppState.installedVersion` theo bản app mở dữ liệu (`app/version.ts`) | `7ec8650` | ☑ |
| G | **QA cuối**: lint, unit, build, e2e đủ bộ, a11y, `perf --gpu`, Lighthouse + axe (số liệu bên dưới và ở `docs/QA_REPORT.md`) | – (không đổi mã) | ☑ |
| H | Version **0.9.3**, docs (SPEC, PROGRESS + Changelog, QA_REPORT, file này), bộ nhớ dự án, push nhánh | commit `docs:` cuối của nhánh | ☑ |

### Kết quả QA cuối của đợt 2 (đo ở mã 0.9.3)

- `npm run lint` pass · **569 unit test** pass (1 bỏ qua có chủ ý; từ 529 ở 0.9.2: +40) · `npm run build` OK: gói chính 397,12 KB = **121,96 KB gzip** (0.9.2: 116,9; giới hạn 350), CSS 14,09 KB gzip, Chart.js tách riêng 56,62 KB gzip, precache 17 mục ≈ 1,0 MB.
- **e2e đủ bộ** trên mã cuối (Playwright, 3 khung hình, `--workers=3`, 12,6 phút): **474 pass + 15 bỏ qua có chủ ý = 489 test (0.9.2: 432), 0 lỗi, 0 chập chờn**. *(lượt đủ bộ đầu tiên trên mã cuối có **1 test đỏ giả** – test xuất CSV ở khung tablet dọc: giờ gieo dữ liệu lấy từ một bộ đếm dùng chung nên hai lượt cùng ngày đảo thứ tự khi bộ đếm quay vòng (lỗi của test, không phải của app); đã sửa test (`aa0d1d3`; chạy lặp 10 lần × 3 khung hình: 30/30 pass) rồi chạy lại đủ bộ: xanh hết.)*
- **FPS G1** (`npm run perf -- --gpu --games=G1`: Chrome 155 có GPU, bản build thật, cấp 10): **60 fps, 0% khung > 20 ms** ở cả 3 khung hình, CPU thường và ×4; main thread bận 5% / 26–30% (0.9.2: 4–5% / 21–26%, tăng nhẹ nhưng còn rất xa giới hạn). G3, G5 không đổi mã nên không đo lại.
- **Lighthouse 13.5** (bản build giống Pages, di động, lần tải đầu; chạy 2 lần): Performance 83–84 · **Accessibility 100** (TASK-08: 93, `meta-viewport` hết) · Best Practices 81 (chỉ thiếu HTTPS vì đo trên localhost) · SEO 60 (cố ý `noindex`).
- **axe-core 4.14** (46 lượt: 23 màn × 2 khung): lượt đầu có **1 lỗi mức vừa `heading-order`** ở Album › Trang phục / Hình nền → **đã sửa** (`3339a5f`: `h2` ẩn mỗi tab + test e2e mới); chạy lại **0 vi phạm**. Hai script chạy lại đã lưu trong repo: `scripts/qa-axe.mjs`, `scripts/qa-lighthouse.mjs`.

### Cạm bẫy đã gặp ở đợt 2 (đừng lặp lại)

1. Commit `32f5b5d` (E1) tự nó có 1 unit test đỏ – quy tắc 16 quét thấy chữ Việt cứng trong `app/csv.ts` – và `96d36e8` mới sửa; hai commit đi cùng nhau (gộp fast-forward nguyên nhánh là ổn). Khi chạy `npm test` hãy lọc `Test Files|Tests |FAIL`, **đừng chỉ nhìn vài dòng cuối**.
2. Công cụ Edit có thể đổi `\uXXXX` trong chuỗi thành ký tự thật → với regex chữ Việt hãy dựng bằng `String.fromCharCode` như `app/csv.ts`.
3. Đừng đặt dấu backtick trong chuỗi lệnh shell (bị hiểu là thay thế lệnh); sửa file bằng Edit/Write.
4. Máy ngủ giữa chừng làm e2e “hết hạn 30 giây” hàng loạt → dùng `request_keep_awake`, chạy lại rồi mới kết luận.
5. **`cd` trong Bash đổi thư mục làm việc của cả phiên** (đã lỡ `cd` vào thư mục công cụ tạm; phải `cd` lại bằng đường dẫn tuyệt đối). Dùng `npm --prefix`, đường dẫn tuyệt đối hoặc `git -C` thay vì `cd`.
6. **Nhánh local `claude/task-10-part2` mở ở worktree khác** nên không `git switch` được: tạo nhánh mới từ `origin/claude/task-10-part2` (`git switch -c <tên> origin/claude/task-10-part2`) và khi push dùng `git push origin <tên>:claude/task-10-part2`.

### Bản đồ mã mới của đợt 2 (để tìm nhanh)

- Dữ liệu / thưởng: `src/app/types.ts`, `profile.ts`, `validate.ts`, `storage.ts` (`CURRENT_SCHEMA = 3`, migration 2→3); `src/app/rewards.ts` (`EquipKind`, `canEquip`, `needsPicking`, `activeMascot`, `activeSoundSet`, `MASCOT_OWL_ID`, `SOUND_PERCUSSION_ID`); `src/app/store.ts` (`equipReward(kind, id)`, signal `mascotKind` đồng bộ bằng `effect`, `createAudio(...)` đọc bộ âm của hồ sơ, `withInstalledVersion` lúc khởi động); `src/app/version.ts`.
- Âm thanh: `src/app/audioSets.ts` (`SOUND_SETS`, `ToneSpec`, `soundSet`, `soundLength`) + `audio.ts` (`AudioApi.preview(id)`).
- Linh vật: `src/app/mascotKind.ts`, `src/ui/components/Owl.tsx` (id SVG `ow-*`), `Mascot.tsx` (prop `kind?`), `src/ui/stickers/Gallery.tsx` (xem Cú ở `?gallery=1&view=rewards`).
- Album / nhắc mở khóa: `src/ui/screens/Album.tsx` (`SpecialTab`, `UseButton`, `data-testid`: `equip-sound-*`, `listen-sound-*`, `equip-mascot-*`, `outfit-owl-note`, `special-grid`), `Result.tsx` + `GiftBox.tsx` (`result-unlock-hint`, `gift-unlock-hint`), `src/ui/rewards.css`.
- Game: `src/games/g1-balls/art.ts` + `view.ts` (sprite bóng; dựng **trước** `createCanvasStage` vì quy tắc TDZ), `src/games/g7-patterns/puzzles.ts` + `view.ts` (`Explain` kind `dual`), `src/games/g6-math/topics.ts` (`MAX_MISSING`) + `question.ts`.
- Khu phụ huynh / sao lưu: `src/app/csv.ts` (+ `csv.test.ts`), `parentStore.ts` (`parentCreateCsv`), `src/ui/parent/DataTab.tsx` (`downloadText`); **Home: `backupReminderDue` (`app/backup.ts`) → chấm `.backup-dot` trên nút Phụ huynh (`Home.tsx`, `data-testid` `open-parent` / `backup-dot`, nhãn `vi.home.parentBackup` luôn bắt đầu bằng `vi.home.parent`; CSS ở `app.css`)**.
- Test mới/đổi: `tests/e2e/special.spec.ts` (mới), `rewards.spec.ts`, `a11y.spec.ts`, `games3.spec.ts`, `parent.spec.ts` (+ 2 test chấm nhắc sao lưu); unit: `audioSets.test.ts`, `rewards.test.ts`, `storage.test.ts`, `backup.test.ts`, `validate.test.ts`, `version.test.ts`, `csv.test.ts`, G6/G7 `logic.test.ts`.

**Việc em không làm thay được (chờ chủ dự án):** thử máy thật (danh sách ở `docs/QA_REPORT.md` mục 8 + “Cách thử thủ công” của TASK-10 trong PROGRESS), Samsung Internet, **gửi danh sách lỗi/góp ý** (→ TASK-10 đợt 3), duyệt hình mới (Cú Mèo, icon G1/G2, bóng G1), nghe thử tiếng Nhạc Cụ Gõ, quyết định gộp/deploy.

**Tiến độ chi tiết + quyết định tự chọn của đợt này:** xem nhật ký mới nhất trong `docs/PROGRESS.md` (“TASK-10 đợt 2”).

---

## 1. Cách bắt đầu phiên mới

Chủ dự án (PM, không phải lập trình viên, xưng “anh”, trao đổi **tiếng Việt**) chỉ cần nhắn:

```
Đọc docs/HANDOVER.md mục 0b rồi làm tiếp
```

(hoặc “Đọc handover và thực hiện task tiếp theo”). Tùy tình hình: 0.9.3 đã gộp + deploy → chờ anh thử máy thật và gửi danh sách lỗi/góp ý → **TASK-10 đợt 3**. Quy trình bắt buộc (CLAUDE.md mục 6) – đã áp dụng ở mọi TASK trước:

1. Đọc `CLAUDE.md`, `docs/PROGRESS.md`, rồi tài liệu TASK yêu cầu (với TASK-10: `docs/03_TASKS.md` mục TASK-10, `docs/QA_REPORT.md` – nhất là mục 8 –, `CLAUDE.md` mục 5 (17 quy tắc) và **mục 6 của file này**).
2. **Trình bày kế hoạch ngắn và chờ “Đồng ý”** rồi mới sửa mã (chủ dự án đã duyệt kế hoạch TASK-09 đúng cách này). *Lưu ý:* ở TASK-07 chủ dự án đã dặn **“làm luôn không cần hỏi”** và **lặp lại ở TASK-10 đợt 2 (2026-10-13: “thực hiện các việc còn lại cho xong luôn”)** nên hai lần đó bỏ bước chờ duyệt kế hoạch; mỗi lần chủ dự án lặp lại thì cứ làm luôn (vẫn ghi rõ các quyết định tự chọn), còn không thì theo CLAUDE.md. **Gộp `main` + push luôn phải hỏi** (push `main` = deploy công khai).
3. Làm từng bước nhỏ, chạy `npm run lint` + `npm run test` sau mỗi bước lớn; giao diện thì tự xem bằng ảnh chụp Playwright ở 3 khung hình.
4. Cuối TASK: cập nhật `docs/PROGRESS.md` (trạng thái + nhật ký trên cùng), commit Conventional Commits, push, báo cáo ngắn bằng tiếng Việt (đã làm gì, cách thử trên máy thật, điểm cần quyết định). Gộp vào `main` + push `main` **chỉ khi chủ dự án đồng ý** (cách đã dùng: commit trên nhánh task, `git -C <thư mục gốc> merge --ff-only <nhánh>`, rồi `git push origin main`). **Từ nay push `main` = tự động deploy lên GitHub Pages** (`deploy.yml`): chủ dự án thấy bản mới trên máy sau ~2 phút + bấm “Cập nhật” ở Home.

> Nếu phiên mới chạy trong **git worktree** mới: thư mục chưa có `node_modules` → chạy `npm ci` trước.

---

## 2. Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| TASK-00 → TASK-08 | **Xong**, đã ở `main`/`origin/main` |
| TASK-07 Khu phụ huynh | **Xong, đã gộp `main`** (chờ chủ dự án thử trên máy thật) |
| TASK-09 QA | **Xong, đã gộp `main`** (v0.9.1, deploy 2026-10-12) |
| TASK-10 đợt 1 | **Xong, đã gộp `main` + deploy v0.9.2** (2026-10-13, chủ dự án “Đồng ý”); chờ chủ dự án thử máy thật |
| TASK-10 đợt 2 (hoàn tất tồn đọng) | **Xong, đã gộp `main` + deploy v0.9.3** (2026-10-13, chủ dự án “Đồng ý”); chờ chủ dự án thử máy thật → mục 0b |
| Tiếp theo | **TASK-10 đợt 3**: sửa lỗi theo góp ý của chủ dự án sau khi thử máy thật (mẫu lặp lại, `docs/03_TASKS.md`); gộp/push `main` luôn phải hỏi |

- Repo: https://github.com/Nin-Min2231/nhanh-tay-tinh-mat (công khai), remote `origin`, Pages `https://nin-min2231.github.io/nhanh-tay-tinh-mat/` (`BASE_PATH=/nhanh-tay-tinh-mat/`). Máy đã đăng nhập GitHub sẵn nên `git push` chạy thẳng (dùng `GIT_TERMINAL_PROMPT=0 timeout 90 git push` để không bị treo). Xem trạng thái workflow không cần `gh`: đọc API công khai `https://api.github.com/repos/Nin-Min2231/nhanh-tay-tinh-mat/actions/runs`.
- Git user riêng cho repo: `Nin-Min2231` / `nguyennc1357@gmail.com`. Commit kèm dòng `Co-Authored-By: …` theo nhắc trong phiên.
- Chất lượng hiện tại (v0.9.3, đang live): `npm run lint` pass · **569 unit test** (Vitest; 1 test sinh file mẫu bị bỏ qua khi chạy thường) · `npm run build` OK (gói chính 397,12 KB = **121,96 KB gzip** theo số Vite báo; 0.9.2 là 116,9; Chart.js tách riêng 56,62 KB gzip; giới hạn 350 KB gzip; precache 17 mục ≈ 1,0 MB) · **e2e Playwright: 474 pass + 15 bỏ qua có chủ ý = 489 test** (project `phone` 360×740 / `tablet` 1280×800 / `tablet-portrait` 800×1280; `zoom.spec.ts` chỉ chạy ở `phone`, `home-layout.spec.ts` chỉ ở khung phù hợp), 0 lỗi, 0 chập chờn, ≈ 13 phút với `--workers=3` (0.9.2: ≈ 12 phút). **Hai test chập chờn cũ (G1 TC-004, G3 TC-013) đã ổn định** từ TASK-09. Nếu thấy vài test “hết hạn 30 giây” **cùng lúc** và thời gian chạy dài bất thường thì nghi **máy ngủ giữa chừng** (đã gặp ở TASK-10): chạy lại rồi mới kết luận; chạy bộ dài nên giữ máy thức (`request_keep_awake`).
- Home: **cả 7 game chơi được**; nhiệm vụ, hộp quà, album, trang phục, hình nền, nghỉ đúng giờ (TASK-06); PWA cài được + offline + nút Cập nhật (TASK-08); khu phụ huynh đầy đủ + bài đo tuần (TASK-07); **QA + sửa lỗi (TASK-09)**.

---

## 3. Chủ dự án thích gì / dặn gì (quan trọng)

- **Hình ảnh luôn phải đẹp, chân thật, rực rỡ, nhiều tông màu nổi bật để trẻ thích** (dặn ở TASK-03/04, giữ ở TASK-06). Mọi hình mới phải vẽ chi tiết: chuyển sắc, vệt sáng, đổ bóng, viền mềm – **không dùng hình phẳng đơn điệu**. Chữ vẫn tối trên nền sáng để dễ đọc (tương phản AA); màu luôn kèm hình dạng/hoa văn (mù màu). *(Riêng khu phụ huynh: SPEC ghi “chữ thường, không cần hoạt hình” – giao diện gọn, dễ đọc, không cần trang trí.)*
- Luôn **trình bày kế hoạch và chờ duyệt** trước khi code; hướng dẫn thao tác trên máy thật theo **từng bước đánh số**, không giả định kiến thức lập trình.
- Ghi rõ **quyết định tự chọn** để chủ dự án góp ý; việc ngoài phạm vi → ghi vào mục “Đề xuất” của `docs/PROGRESS.md`.
- Chủ dự án thích **thử bản mới trên máy thật** trước khi làm tiếp – sau mỗi TASK nên cho họ địa chỉ để thử (xem mục 0).
- Không có Excel nào được đẩy lên GitHub (`*.xlsx` bị `.gitignore`); file kế hoạch Excel `Game_NhanhTayTinhMat_PhanTich_KeHoach_v1.2.xlsx` chỉ có trên máy chủ dự án, ở **`docs/ke-hoach/`** (chuyển từ thư mục gốc ngày 2026-10-13; là **bản duy nhất**, đừng xóa; khi anh đang mở bằng Excel thì file bị khóa – đừng tắt Excel của anh).

---

## 4. Kiến trúc & bản đồ mã (đọc nhanh)

Công nghệ đã chốt: Vite + TypeScript strict + Preact + `@preact/signals`; Canvas 2D cho game động (G1, G3, G5), DOM/SVG/CSS cho game tĩnh (G2, G4, G6, G7); `vite-plugin-pwa`; Chart.js (đã cài, **chưa dùng** – TASK-07 dùng); Nunito; Web Audio tự tổng hợp; `localStorage`; Vitest + Playwright (chỉ Chromium).

```
src/
  main.tsx                 # khởi động: router, back button, mount App (hoặc trang ?gallery=1 ở dev)
  i18n/vi.ts               # TẤT CẢ chuỗi giao diện (quy tắc 16) – kể cả chuỗi vẽ trong canvas/DOM của game, tên 40 sticker, tên phần thưởng
  app/
    types.ts               # AppState, Profile, RoundRecord, DayUsage… (SPEC mục 5)
    storage.ts             # localStorage có try/catch, schemaVersion, migration, bộ nhớ tạm khi lỗi
    store.ts               # signals + addProfile, recordRound (cộng sao/giờ/độ khó/sổ lỗi G6 + THƯỞNG), openGift, equipReward,
                           #   claimRest (+ cửa sổ 30 giây), giftModalOpen, hàm debug*; audio/haptics singleton
    rewards.ts             # THUẦN + test: nhiệm vụ, hộp theo sao, giới hạn ngày, độ hiếm + bảo đảm, trùng, mở khóa theo sao,
                           #   nghỉ đúng giờ, grantParentBoxes (cho TASK-07). Danh mục STICKERS (stk-01…40) và UNLOCKS (8 mốc) ở đây
    session.ts             # RoundClock (chỉ cộng giờ khi Running, nhắc 2 phút, hết giờ +90s) + giờ chơi trong ngày
    adaptive.ts / scoring.ts  # độ khó thích ứng (SPEC mục 6) / sao
    mathFacts.ts           # SỔ LỖI TOÁN (F19) thuần, có test
    router.ts + routes.ts  # ngăn xếp màn hình tự quản + hash route; backButton.ts = nút Quay lại Android
    e2e.ts                 # cờ ?e2e=1 / ?debug=1 / ?freeze=1 / ?gallery=1 / ?update=1 / ?sw=1 (chỉ dev hoặc build VITE_E2E)
    pwa.ts                 # (TASK-08) initPwa(): đăng ký service worker qua virtual:pwa-register, onNeedRefresh → updateAvailable,
                           #   kiểm bản mới mỗi giờ/khi quay lại app (chỉ gọi lại sw.js cùng nguồn); applyUpdate() = nút ở Home
    version.ts             # APP_VERSION (từ package.json lúc build) – hiện trong khu PH, tab Dữ liệu; (0.9.3) withInstalledVersion: ghi AppState.installedVersion lúc mở app
    daily.ts               # (TASK-07) THUẦN + test: DailyAggregate (syncDaily: tính lại ngày có lượt chi tiết, giữ ngày cũ; KHÔNG gồm lượt bài đo),
                           #   pruneRounds (> 120 ngày; giữ lượt bài đo), PROGRESS_METRICS/BENCHMARK_METRIC (khóa chỉ số + “thấp hơn là tốt”),
                           #   buildSeries (dữ liệu biểu đồ: game × chỉ số × thiết bị × khoảng ngày), recentRounds
    benchmark.ts           # (TASK-07) THUẦN + test: hàng đợi bài đo (game chưa làm trong 7 ngày), benchmarkDue, compareBenchmarks (tuần đầu ↔ gần nhất)
    parentGate.ts          # (TASK-07) THUẦN + test: phép nhân a×b, sai 3 lần khóa 30 giây (rng + đồng hồ truyền vào)
    parentOps.ts           # (TASK-07) THUẦN + test: giveBonusTime/giveBoxes (+ rewardLog), setLimits, patchGameSettings, setGameOption, setGrade,
                           #   toggleMathTopic, removeProfileFromState, deleteConfirmed
    backup.ts              # (TASK-07) THUẦN + test: createBackup/parseBackup/stateForRestore/backupOverdue, tên file nhanhtay-backup-YYYYMMDD.json;
                           #   (0.9.3) backupReminderDue = quá hạn VÀ có hồ sơ có sao → chấm đỏ trên nút Phụ huynh ở Home
    csv.ts                 # (0.9.3) THUẦN + test: xuất CSV lịch sử từng lượt / tổng hợp theo ngày (UTF-8 BOM, CRLF, dòng sep=,)
    audioSets.ts           # (0.9.3) THUẦN + test: các bộ âm thanh là DỮ LIỆU (ToneSpec): bộ gốc + Nhạc Cụ Gõ; audio.ts phát theo bộ đang chọn của hồ sơ
    mascotKind.ts          # (0.9.3) signal `mascotKind` (squirrel | owl) do store.ts cập nhật; Mascot đọc nó (không import store)
    parentStore.ts         # (TASK-07) nối thuần ↔ store: parentUnlocked, benchmarkMode, startBenchmark, parentGive*/parentPatch*/parentSet*,
                           #   parentAdd/Edit/DeleteProfile, parentCreateBackup, parentRestore
    rng.ts                 # mulberry32 có seed + randInt, pick, shuffle
    validate.ts            # (TASK-09) THUẦN + test: đọc dữ liệu có kiểm tra – sanitizeRounds/sanitizeDaily, repairProfile/repairState
                           #   (trường thiếu/sai kiểu → mặc định, dữ liệu hợp lệ giữ nguyên). Gắn vào storage.loadState/loadRounds/loadDaily và backup.parseBackup
    today.ts               # (TASK-09) signal `today` (khóa ngày giờ máy) + watchToday(): tự sang ngày mới lúc 00:00 / khi app hiện lại
    zoom.ts                # (TASK-10) THUẦN + test: isZoomed/pageZoomed (visualViewport.scale > 1,02). Play dùng để tạm dừng + nhắc thu nhỏ khi vào game lúc trang đang phóng
  qa/rules.test.ts         # (TASK-09) test quét mã nguồn bảo vệ các quy tắc CLAUDE.md mục 5 (danh sách ngoại lệ ghi rõ trong test);
                           #   (TASK-10) thêm: viewport không chặn phóng to, `.play` có `touch-action: none`, `.play[data-zoomed]` có `manipulation`
  games/
    levels.ts              # import docs/data/levels.json, kiểu an toàn (KHÔNG chép tay số liệu)
    registry.ts            # GAME_GROUPS + MODULES (cả 7 game đã đăng ký)
    common/                # types.ts (GameModule/Context/Result), CanvasStage, PointerInput (PointerGate),
                           # HintBubble, hud.ts, sparkles.ts, Countdown, PauseOverlay
    g1-balls … g7-patterns/   # mỗi game: config.ts · logic.ts (thuần, có test) · view.ts · index.ts (G6/G7 có thêm các file sinh câu hỏi)
                           #   (G5: nền các làn vẽ một lần ở canvas `.g5-underlay` nằm dưới canvas chính – TASK-09)
                           #   (G1, 0.9.3: art.ts vẽ sprite bóng/khối bóng bẩy MỘT LẦN mỗi khi đổi cỡ; view.ts chỉ drawImage)
    samples.test.ts        # sinh docs/samples/* khi GEN_SAMPLES=1 (`npm run samples`); bình thường bị bỏ qua
  ui/
    App.tsx                # chọn màn hình + redirect hợp lệ; gắn <GiftModal /> ở gốc
    screens/               # Home, GameIntro, Play (vòng đời lượt), Result, Rest, Album, ProfileSelect, ProfileForm, ParentGate, ParentArea
                           #   (TASK-10) Home.tsx có 3 khung bao `.home-panels` / `.home-intro` / `.home-groups`: `display: contents` ở điện thoại, tablet dọc và
                           #   ngang < 1200px (bố cục xếp dọc như cũ); ở ngang ≥ 1200px (`@media` trong app.css) = lưới 2 cột + 3 nhóm game đứng cạnh nhau (`--n` = số thẻ của nhóm)
    parent/                # (TASK-07) 6 tab khu PH: ProgressTab (+ chartRender.ts = Chart.js tải sau), BenchmarkTab, SettingsTab (+ gameOptions.ts),
                           #   ProfilesTab, RewardsTab, DataTab + state.ts (hồ sơ đang xem, định dạng số/ngày). Style: ui/parent.css
    components/            # Button, Mascot (Sóc Bo 5 biểu cảm + prop outfit; 0.9.3: chọn Sóc hoặc Owl.tsx = Cú Mèo theo hồ sơ), Outfits (3 lớp: back/body/head), Scenes (hình nền),
                           # GiftBox (hình hộp + cửa sổ mở hộp), GiftButton, RewardIcons (huy hiệu, Nhạc Cụ Gõ), Avatar (12 + khung Cầu Vồng),
                           # GameIcon, IntroAnimation, DebugPanel, DebugRewards, Confetti, StarBurst, ProgressBar, Overlays…
    stickers/              # Sticker.tsx (khung theo độ hiếm + nền chủ đề) · kit.tsx (Lin, Rad, Shine, Sparkle, Eye, Cheek…) ·
                           #   animals/fruits/space/vehicles.tsx (mỗi file 10 hình `stk-xx`) · Gallery.tsx (chỉ dev)
    theme.css / app.css / games.css / games2.css / rewards.css   # bảng màu rực rỡ + style (rewards.css = TASK-06)
tests/e2e/                 # helpers.ts + framework / games / games2 / games3 / rewards / special / parent / pwa / qa / a11y / zoom / home-layout .spec.ts
scripts/                   # make-icons.mjs (icon PWA) · perf-fps.mjs (npm run perf; thêm --gpu để dùng Chrome cài sẵn có GPU) · qa-table.mjs (bảng TC từ báo cáo Playwright)
docs/                      # SPEC, GAMES, TASKS, ACCEPTANCE, PROGRESS, QA_REPORT, data/levels.json, samples/, HANDOVER (file này)
```

### Hợp đồng game (docs/01_SPEC.md mục 4, đã triển khai)
`GameModule.create(host, ctx) → { start, pause, resume, destroy, finish? }`. `ctx` có: `level`, `options` (tùy chọn PH), `profile` (`grade`, `mathTopics`, `mathFacts`), `rng` (có seed), `audio`, `haptics`, `benchmark`, `timeScale`, `onFinish(result)`. `RoundResult = { score 0–1, durationMs, metrics, extra? }`.
- `finish?()` là phần mở rộng ngoài SPEC: host gọi khi chơi lố giờ quá 90 giây (game tự kết thúc với kết quả hiện có). G6/G7 kết thúc **ngay** (câu đang dở tính chưa làm).
- `timeScale` chỉ >1 khi chạy e2e (`?e2e=1` → 10): game dùng để rút ngắn **độ dài lượt** hoặc **thời gian mỗi câu** (G6/G7), không đổi độ khó thật. **Từ TASK-06 cửa sổ 30 giây “Con nghỉ đây” cũng rút ×10** (`REST_WINDOW_MS` trong `store.ts`).
- `RoundResult.extra` được `recordRound` đọc: **G6 trả `extra.factResults`** → `applyRoundToMath` cập nhật `profile.math.facts`.
- Vòng đời lượt do `ui/screens/Play.tsx` điều phối: đếm ngược 3-2-1 → Running → tạm dừng (ẩn tab/xoay/resize/Quay lại) → kết thúc → `recordRound` (lưu `RoundRecord`, cộng giờ, `applyRound` độ khó, sổ lỗi G6, **nhiệm vụ + sao + hộp + mở khóa qua `applyRoundRewards`**) → `/result`. **Từ TASK-07 `Play.tsx` hỗ trợ bài đo tuần**: `pendingPlay.benchmark = true` ⇒ cấp = `levelsConfig.benchmark[game]`, `mode: 'fixed'`, `options {}`, G6 chủ đề mặc định của lớp + sổ lỗi `{}`, `countsForAdaptive = false`, `ctx.benchmark = true`; `recordRound` ghi `benchmark: true` vào `RoundRecord`, cập nhật tổng hợp ngày/dọn lượt cũ (`maintainRounds`) và `lastBenchmarkAt` khi đủ 7 game.

### Hệ thống thưởng (TASK-06; khu PH TASK-07 đã nối tặng hộp/giờ)
- Mọi thay đổi sao/hộp đi qua `rewards.ts` (`addStars`, `applyRoundRewards`, `openBox`, `claimRestReward`, `grantParentBoxes`) – **thuần**, test ở `rewards.test.ts`. Store chỉ nối dây. Muốn thêm nguồn sao/hộp mới → thêm hàm thuần + test trước.
- **Khu PH “Thưởng” (TASK-07)**: `parentOps.giveBoxes` = `grantParentBoxes` + ghi `Profile.rewardLog` (kèm lý do, giữ 50 mục; có từ schema 2); `parentOps.giveBonusTime` tăng `DayUsage.bonusMs` của hôm nay + ghi `rewardLog`. Giới hạn hộp/ngày PH chỉnh: `profile.limits.maxBoxesPerDay` ∈ `MAX_BOXES_PER_DAY_RANGE` (0–5); thời gian/ngày `limits.dailyMinutes` ∈ `levelsConfig.session.dailyMinutesRange` (5–60).
- Hồ sơ lưu: `totalStars`, `unlocked` (id phần thưởng), `outfitId`, `backgroundId`, `stickers`, `boxes {pending, openedTotal, sinceLastRare}`, `days[ngày] {missions, boxesEarned, starsToday, restOnTimeRewarded, playMs, bonusMs}`. (TASK-06 không đổi cấu trúc; **TASK-07 nâng `schemaVersion` lên 2** – thêm `rewardLog`, có migration + test.) Khi mở app, `store.ts` tự mở các phần thưởng đã đủ sao của hồ sơ cũ (`syncUnlocks`).
- Khôi phục từ sao lưu (`parentStore.parentRestore`) gọi lại `reconcileUnlocks` (= `syncUnlocks` cho mọi hồ sơ) để dữ liệu cũ vẫn nhất quán.
- Các nút `?debug=1` mới ở Home (`DebugRewards`): +1 hộp, +10/+15 sao, làm mới ngày hôm nay; khu PH thật (TASK-07) đã có đủ chức năng tương đương `DebugPanel`, nhưng `DebugPanel` vẫn được giữ vì e2e dùng (`?debug=1` chỉ chạy ở dev/build e2e).

### Quy ước làm game (rút từ TASK-03/04/05, nên theo)
1. **Logic thuần tách khỏi view** (`logic.ts`) + unit test; `config.ts` đọc `levelsConfig.games.Gx.levels` và ánh xạ nhãn tiếng Việt trong JSON sang enum/số.
2. Tùy chọn PH đọc qua `readGxOptions(ctx.options)` (bỏ giá trị lạ, mặc định an toàn) → `resolveGxParams(level, options)`. **Thêm tùy chọn mới ⇒ thêm vào `ui/parent/gameOptions.ts` (khu PH) cho khớp.**
3. Nhiều nguồn ngẫu nhiên → tách luồng riêng từ `ctx.rng` (`mulberry32((ctx.rng()*2**32)>>>0)`) để dãy đề không phụ thuộc kích thước màn hình.
4. Canvas: tạo `createCanvasStage`, vẽ sprite/gradient **một lần khi resize** rồi `drawImage`; **không tạo object/chuỗi/gradient mới mỗi khung hình** (quy tắc 17). Game DOM: tính bố cục trong `ResizeObserver` hoặc khi đổi câu, cập nhật thanh thời gian bằng `style.transform`.
5. Chạm: `PointerGate('first')` hoặc `attachPointerInput`. Chạm sai luôn nhẹ nhàng: âm “bụp” + `haptics.wrong(el)` (lắc hình) + lời động viên, **không trừ sao**.
6. **Chống “click-through”**: game kết thúc bằng `pointerdown` thì màn Kết quả khóa nút 0,6 giây đầu (đã làm ở `Result.tsx`).
7. Hook cho e2e: chỉ ghi `host.dataset.*` khi `E2E.hooks`. G6/G7: `data-phase`, `data-q`, `data-stats`; nút đáp án có `data-i` và `data-correct`.
8. Mỗi game có **hình động giới thiệu** (`IntroAnimation.tsx`), **biểu tượng thẻ** (`GameIcon.tsx`), **dòng kết quả** (`vi.games.Gx.lines`), và tùy chọn trong `DebugPanel.tsx`.
9. Game DOM muốn dùng linh vật: `render(h(Mascot, {mood, size}), el)` và **nhớ `render(null, el)` trong `destroy`**. Tránh mood `wave` ở chỗ chật.

---

## 5. Hạ tầng kiểm thử & cờ dev (rất hữu ích)

- Chạy dev: `npm run dev` (cổng 5173, mở ra mạng LAN để thử bằng điện thoại/tablet: `http://192.168.x.x:5173`). `.claude/launch.json` cấu hình cho Browser pane.
- Chạy e2e: `npm run test:e2e` – Playwright tự build **bản riêng cho e2e** vào `dist-e2e/` (`VITE_E2E=true`) rồi `vite preview` cổng 4173; **thêm bản thứ hai build với `BASE_PATH=/nhanh-tay-tinh-mat/` vào `dist-e2e-base/`, cổng 4174** (giống đường dẫn con của GitHub Pages; `pwa.spec.ts` kiểm bản này). Bản deploy thật **không** có các cờ test. Dùng `npx playwright test <tên file> --project=phone --reporter=line` để chạy gọn.
- Cờ trên URL (chỉ hoạt động ở dev / build e2e):
  - `?e2e=1` – rút lượt G1/G3/G5 ×10, thời gian mỗi câu G6/G7 ×10, **cửa sổ nghỉ 30 s → 3 s**, seed cố định (`&seed=N`), game ghi `data-*`. Không có `?e2e=1` thì chạy thời gian thật nhưng vẫn ghi `data-*`.
  - `?debug=1` – bảng chỉnh nhanh độ khó/tùy chọn ở màn Giới thiệu + đồng hồ FPS ở HUD canvas + (Home) công cụ thử thưởng.
  - `?freeze=1` – G3: thú đứng yên.
  - **`?update=1`** – giả lập “có bản mới” (bật `updateAvailable`) để thử nút Cập nhật. **`?sw=1`** – **bản build e2e chỉ đăng ký service worker khi có cờ này** (để 267 test cũ không phải tải lại precache mỗi lần); bản deploy thật luôn đăng ký. Chỉ `pwa.spec.ts` dùng.
  - **`?gallery=1`** (+ `&theme=animal|fruit|space|vehicle` xem to, hoặc `&view=rewards` xem trang phục/hình nền) – trang xem trước hình, tách gói riêng, **không có trong bản deploy** (đã kiểm `dist/`).
- `tests/e2e/helpers.ts`: `seedProfiles`, `makeProfile(name, patchProfile, patchHômNay)`, `withGame`, `startGame`, bot `playG1/playG2/g5Bot`, `readState/readRounds/lastRound`, `hidePage`, `E2E_URL`, `todayKey`; cho G6/G7: `questionState`, `waitForAsk`, `tapSelector`, `solveDisplayedText`. Mẫu hộp quà/album/nghỉ: `rewards.spec.ts`.
- `tests/e2e/parent.spec.ts` (TASK-07) có sẵn mẫu: `solveGate`/`openParent` (đọc phép nhân trên màn hình rồi bấm phím), `seedRounds` + `mkRound(profileId, game, daysAgo, …)` (gieo `RoundRecord` cũ vào localStorage), `chartData` (đọc `data-chart` của biểu đồ – chỉ có ở dev/build e2e), `readKey` (đọc khóa localStorage bất kỳ), tải file sao lưu bằng `page.waitForEvent('download')`, khôi phục bằng `setInputFiles`.
- Việc luôn làm trước khi báo xong: `npm run lint`, `npm test`, `npm run build`, e2e đầy đủ (`npx playwright test --workers=3`); rồi chụp ảnh 3 khung hình để tự xem giao diện (xem “Mẹo công cụ”).
- `npm run samples` sinh lại `docs/samples/G6.md`, `G7.md`, `G7.html` (seed cố định).
- **(TASK-09)** `tests/e2e/helpers.ts` có thêm: `tapEmptySpot` (chờ hết lắc, cách mép 14px; dùng cho G1/G3), `waitShakeEnd`, `EMPTY_SPOT_INSET`, `seedProfiles(page, profiles, activeId, settings)` (tham số thứ 4 bật `sound`/`vibration`… cho test cần nghe âm/đếm rung). `qa.spec.ts` có mẫu chặn `navigator.vibrate`/`OscillatorNode.start`, đọc canvas G1 bằng `getImageData`, đồng hồ giả `page.clock.install/fastForward/setSystemTime`. `a11y.spec.ts` có các hàm quét chạy trong trang (`findSmallTargets`, `findObstructed`, `findInfiniteAnimations`, `findLowContrast`) – dùng lại khi thêm màn hình mới: thêm vào danh sách trong một test của `a11y.spec.ts`.
- **(TASK-09)** `npx playwright test` ở **một thư mục chỉ chạy một lệnh tại một thời điểm**: lệnh thứ hai xóa `test-results/` của lệnh đầu, test đang chạy báo lỗi ENOENT khi lưu trace (làm 3 test “đỏ giả”). Báo cáo JSON: `PLAYWRIGHT_JSON_OUTPUT_NAME=<đường dẫn Windows đầy đủ> npx playwright test --reporter=line,json`, rồi `node scripts/qa-table.mjs <file>`.

---

## 6. TASK-09 đã làm gì (QA) và việc cần làm tiếp: TASK-10

Báo cáo đầy đủ (bảng 35 test case có kết quả thật, lỗi đã sửa, 17 quy tắc, accessibility, FPS, rủi ro): **`docs/QA_REPORT.md`**. Tóm tắt để biết khi đụng vào:

- **Ổn định test chập chờn**: nguyên nhân là test (chạm cách mép 5px lúc khung đang lắc `.shake` ±6px). Helper `tapEmptySpot` (chờ hết lắc + cách mép `EMPTY_SPOT_INSET` = 14px), `playG1` chạm bóng trước rồi mới chạm chỗ trống và chờ số liệu `emptyTaps` tăng.
- **`playwright.config.ts` đặt `screen` = viewport** cho từng khung hình (trước đó cả 3 khung bị app coi là `tablet` vì `screen` mặc định 1920×1080 → nhánh điện thoại chưa từng được kiểm). Từ nay `phone` = điện thoại thật sự (có rung, ngưỡng “cửa sổ nhỏ” của điện thoại).
- **Test mới**: `tests/e2e/qa.spec.ts` (TC-028 đọc hình bóng G1 từ kênh alpha canvas; TC-035 không rung ở tablet + lắc + âm “bụp”; qua nửa đêm bằng đồng hồ giả `page.clock`), `tests/e2e/a11y.spec.ts` (vùng chạm ≥ 48px + **không bị nút khác đè lên**, không hoạt ảnh lặp vô hạn khi `prefers-reduced-motion`, tương phản AA tính từ màu thật; có test tự kiểm chứng bộ quét), `src/qa/rules.test.ts` (quét mã nguồn bảo vệ các quy tắc 1, 5, 6, 8, 9a, 9b, 10, 11, 13, 14, 16, 17 – muốn ngoại lệ phải sửa danh sách cho phép trong test và nói rõ lý do), `src/app/validate.test.ts`, `src/app/today.test.ts`.
- **Lỗi app đã sửa**: (1) app mở qua đêm vẫn hiện “hết giờ”/nhiệm vụ hôm qua → `app/today.ts` (signal `today`, `watchToday()` gọi ở `main.tsx`; **màn hình mới đọc “hôm nay” để phản ứng khi qua nửa đêm thì dùng `today.value`, không dùng `dateKey(new Date())` lúc vẽ**); (2) dữ liệu hỏng/file sao lưu sửa tay → `app/validate.ts` (`sanitizeRounds/Daily`, `repairProfile/State`; **thêm trường mới vào `Profile`/`RoundRecord`/`DayUsage` ⇒ cập nhật `validate.ts` + test, nếu không trường mới sẽ bị bỏ khi đọc**); (3) G5 vẽ nền làn một lần ở canvas dưới (`.g5-underlay`, `games.css`) – FPS G5 ở tablet dọc (CPU ×4) 29 → 59; (4) accessibility: nút “Dễ” `min-width: 52px` (chỉ nút này! đặt `min-width` cho mọi `.segment` làm chữ “★ Tự động” tràn đè nút “Khó”), `animation-iteration-count: 1` khi giảm chuyển động, nút hộp quà không đặt `aria-label` khi đã có chữ hiển thị.
- **Công cụ**: `npm run perf` (`scripts/perf-fps.mjs`: build bản **thật** vào `dist-perf`, đo FPS G1/G3/G5 cấp 10 ở 3 khung × CPU ×1/×4; lọc `-- --games=G5 --viewports=tablet-portrait --cpu=4 --no-build`), `scripts/qa-table.mjs` (bảng TC từ báo cáo JSON của Playwright). axe-core đã chạy **một lần** (ngoài dự án): chỉ còn `user-scalable=no` (chờ quyết định của chủ dự án).

### TASK-10 đợt 1 đã làm gì (mục tồn đọng đã biết, v0.9.2)
Chủ dự án chưa gửi danh sách lỗi từ máy thật nên chọn “làm các mục tồn đọng đã biết” và duyệt kế hoạch 4 mục:
- **Cho phóng to bằng 2 ngón** (`index.html` bỏ `user-scalable=no`): màn chơi vẫn chặn phóng – `.play` (cả thanh trên, lề, lớp phủ) có `touch-action: none` (trước đây chỉ `.game-host`). `Play.tsx` nghe `visualViewport` `resize` và kiểm lúc mở màn: nếu `pageZoomed()` (`app/zoom.ts`) → `doPause()` + `data-zoomed` trên `.play` (CSS `.play[data-zoomed] { touch-action: manipulation }` để còn chụm lại được) + `PauseOverlay zoomed` (hiện `vi.play.zoomHint`, khóa nút “Chơi tiếp” tới khi thu nhỏ). **Đã thử và loại:** đổi `<meta viewport>` lúc chạy (`maximum-scale=1` / `user-scalable=no`) **không** đưa trang đang phóng về 1× nên không dùng làm cách “reset”. `window.innerWidth` không đổi khi phóng (màn “cửa sổ quá nhỏ” không bật nhầm). Test: `tests/e2e/zoom.spec.ts` (cử chỉ 2 ngón thật, 5 test, chỉ khung `phone`), `src/qa/rules.test.ts`, `src/app/zoom.test.ts`.
- **Home tablet ngang ≥ 1200px**: nửa trên 2 cột (lời chào + giờ | nhiệm vụ + hộp quà), 7 thẻ trên một hàng chia 3 nhóm (3 : 2 : 2), khung rộng tối đa 1240px → ở 1280×800 chiều cao Home **1502 → 766px** (vừa một màn, kể cả khi banner “Thử thách tuần” đang hiện). Dưới 1200px (kể cả điện thoại ngang ~900px) giữ bố cục cũ vì thẻ sẽ quá hẹp (chip “Cấp n · ★☆☆” tràn thẻ ở ~1100px). Điện thoại và tablet dọc **không đổi một pixel** (đã đo). Test: `tests/e2e/home-layout.spec.ts`.
- **Icon thẻ G1 và G2** (`GameIcon.tsx`) vẽ lại có chuyển sắc, vệt sáng, đổ bóng: G1 = bóng xanh mặt cười + khối đỏ dấu ✕ + ngôi sao lấp lánh; G2 = bảng 3×3 dùng **đúng 5 màu ô của game** (`g2-c0…c4`), số xáo trộn, ô “1” viền vàng. Màu vẫn kèm hình dạng/số. Id gradient `gi1g`, `gi1r`, `gi20…gi24`.
- **G3 FPS**: **không sửa mã** – số 44–57 fps ở CPU ×4 là do **Chromium của Playwright không có GPU** (vẽ canvas bằng phần mềm: hồ sơ CPU cho thấy ~87% thời gian main thread ở “(program)”, JS chỉ ~10%). Đo bằng Chrome cài sẵn có GPU (`npm run perf -- --gpu`): G3 **60 fps ở CPU ×4, ×6 và ×8** (tablet ngang/dọc, điện thoại; main thread bận 30% ở ×4, 65% ở ×8) – tương đương G1/G5. `scripts/perf-fps.mjs` nay có `--gpu` / `--chrome=<đường dẫn>` / `CHROME_PATH` và cột “main thread bận %”.

### TASK-10 đợt 2 đã làm gì (hoàn tất tồn đọng, v0.9.3 – đã gộp `main` + deploy 2026-10-13)
Chi tiết từng mục + commit ở **mục 0b**; nhật ký và quyết định tự chọn ở `docs/PROGRESS.md`. Tóm tắt để biết khi đụng vào: **Nhạc Cụ Gõ + Cú Mèo dùng được** (Album → Đặc biệt, lưu theo hồ sơ `soundSetId`/`mascotId`, schema 3; **không tự mặc khi mở khóa**; trang phục chỉ cho Sóc Bo); **bóng/khối G1 bóng bẩy** (sprite vẽ một lần); **G7 cấp 5** có lời giải thích riêng; **G6 M11** không hỏi số thiếu > 99; **khu PH xuất CSV**; **chấm đỏ nhắc sao lưu** trên nút Phụ huynh ở Home; **`installedVersion`** theo bản app. QA cuối: số liệu ở mục 0b và `docs/QA_REPORT.md`.

### Việc cần làm: TASK-10 đợt 3
Chủ dự án thử trên máy thật rồi gửi góp ý/lỗi (mẫu trong `docs/03_TASKS.md` mục TASK-10). Với mỗi lỗi: tìm nguyên nhân → đề xuất → chờ duyệt → sửa + thêm test để không lặp lại; góp ý độ khó → sửa `docs/data/levels.json` (không sửa số trong code) và ghi lý do vào PROGRESS; xong tăng version patch + CHANGELOG trong PROGRESS + deploy (hỏi trước). Ứng viên đã biết (chưa ai yêu cầu): **FPS thật G3/G5/G1 trên Galaxy Tab** bằng `?debug=1`; **trang phục cho Cú Mèo** (hiện chỉ Sóc Bo mặc được); nếu thử máy thật thấy bé hay phóng nhầm ở Home thì chuyển sang chặn phóng ở các màn của bé (`touch-action: pan-x pan-y`) và chỉ cho phóng ở khu phụ huynh (nhớ xử lý trạng thái “đang phóng mà đổi màn”); so sánh nhiều bé trong khu phụ huynh; tách gói `ui/parent/*` tải sau nếu gói chính quá nặng.

## 6b. TASK-07 đã làm gì (khu phụ huynh – để biết khi đụng vào)

- **Luồng vào**: Home → nút ổ khóa → `#/parent-gate` (`ParentGate.tsx`) → giải đúng → `parentUnlocked = true` → `replace('/parent/progress')` (hoặc `/parent/data` nếu máy chưa có hồ sơ). `App.tsx` `redirectFor`: route `parent` mà chưa mở khóa → về `/parent-gate`; cả hai route **dùng được khi chưa có hồ sơ nào** (để khôi phục sao lưu). `ParentArea` khóa lại khi unmount (rời khu). Khóa PH **không** tự khóa khi ẩn tab (cửa sổ chọn file trên Android có thể làm trang bị ẩn). Khi `?e2e=1` thời gian khóa 30 giây rút ×10.
- **Dữ liệu** (xem `docs/01_SPEC.md` mục 5): `schemaVersion` **2** (thêm `Profile.rewardLog`, migration 1 → 2 trong `storage.ts` + test); `ntm.daily.<id>` = `DailyAggregate[]` **dựng từ `RoundRecord` còn giữ** mỗi khi mở app và sau mỗi lượt (`maintainRounds` trong `store.ts`; **không gồm lượt bài đo**); lượt chi tiết > 120 ngày bị dọn **trừ lượt bài đo (`benchmark: true`, giữ mãi)**. `storage.snapshot/restoreAll` cho sao lưu/khôi phục.
- **Bài đo tuần**: `parentStore.startBenchmark(profileId?)` đặt `benchmarkMode`, vào `/play/<game đầu tiên chưa làm trong 7 ngày>/intro`. `GameIntro` (khi `benchmarkMode`) ẩn Dễ/Vừa/Khó + `DebugPanel`, bắt đầu với `pendingPlay = { …, benchmark: true }`; `Play.tsx` khi `benchmark`: cấp = `levels.json → benchmark`, `mode: 'fixed'`, tùy chọn `{}`, G6 dùng chủ đề mặc định của lớp + sổ lỗi `{}`, không tính adaptive. `recordRound` trả `benchmarkNext/benchmarkLeft` và ghi `lastBenchmarkAt` khi đủ 7 game; `Result.tsx` hiện tiến độ + nút “Game tiếp theo”. `Home` đặt `benchmarkMode = false` mỗi lần hiện.
- **Tab Cài đặt** đọc/ghi qua `parentOps` (thuần): bảng tùy chọn riêng từng game ở `ui/parent/gameOptions.ts` (**phải khớp `readGxOptions` trong `games/*/config.ts`**); `'auto'`/giá trị mặc định ⇒ xóa khóa khỏi `options`. G6: lớp = `profile.grade` + chủ đề `profile.math.topics`; G7: `options.groups`.
- **Biểu đồ**: `ui/parent/chartRender.ts` (Chart.js, chỉ đăng ký thành phần cần dùng) được `import()` trong `ProgressTab` ⇒ gói riêng `chartRender-*.js`. E2E đọc dữ liệu qua `data-chart` (không đọc canvas).
- **Còn có thể làm (đề xuất)**: xuất CSV; so sánh nhiều bé; biểu đồ theo tuần; nhắc sao lưu ngay ở Home (hiện chỉ trong khu PH).

## 6c. TASK-08 đã làm gì (tóm tắt – để biết khi đụng vào PWA/deploy)

- **Icon**: `scripts/make-icons.mjs` (`npm run icons`, cần `npx playwright install chromium`) vẽ Sóc Bo (cùng nét với `Mascot.tsx`, có gradient + vệt sáng, nền trời xanh, 3 ngôi sao lấp lánh) → `public/icons/icon.svg` (favicon), `icon-192.png`, `icon-512.png`, `maskable-512.png` (hình nằm trong vòng an toàn 80%). **PNG được commit** (GitHub Actions không phải cài trình duyệt). Muốn đổi icon: sửa script rồi chạy lại.
- **`vite.config.ts`**: manifest đầy đủ (`id`, `lang: vi`, `description`, `categories`, 3 icon), `registerType: 'prompt'`, `injectRegister: false` (tự đăng ký trong `app/pwa.ts`), `includeManifestIcons: false`, `workbox.globPatterns` gồm `woff2,svg,png,webmanifest` (**trước TASK-08 font Nunito/icon không nằm trong cache offline**; nay precache 16 mục ≈ 782 KiB), `cleanupOutdatedCaches`. `index.html`: favicon, `description`, `robots noindex`.
- **Luồng cập nhật**: `app/pwa.ts` + nút `data-testid="update-button"` ở Home (`updateAvailable` bật khi có service worker chờ). Chỉ bấm nút mới tải lại trang (`updateSW(true)`); Play/Result/Rest không có đường nào tự reload. Phiên bản hiện tạm ở trang Khu phụ huynh “Đang xây dựng” (`data-testid="app-version"`, TASK-07 chuyển vào tab Dữ liệu). SW chỉ coi là “có bản mới” khi byte `sw.js` đổi = khi nội dung build đổi (đổi số phiên bản trong `package.json` cũng làm đổi gói JS nên đủ để kích hoạt).
- **Deploy**: `.github/workflows/deploy.yml` (push `main` + chạy tay → `npm ci` → lint → test → `npm run build:pages` → Pages). `build:pages` = `cross-env BASE_PATH=/nhanh-tay-tinh-mat/ npm run build` (đổi tên repo ⇒ sửa `build:pages`, `SUB_PATH` trong `playwright.config.ts`, `SUB_BASE` trong `pwa.spec.ts`). `package.json` ở **0.8.0**.
- **Test** `tests/e2e/pwa.spec.ts` (8 test × 3 khung hình): manifest + icon (kích thước PNG thật), SW đúng phạm vi + precache có font/icon/gói chính, **offline** sau lần tải đầu (gốc `/`: cả 7 game khởi động + 1 lượt G2 lưu tiến độ; đường dẫn con: 1 lượt G2), không request ra ngoài/không lỗi console/FCP < 2 giây, nút Cập nhật chỉ ở Home, **luồng cập nhật thật** bằng máy chủ tĩnh tự dựng trong test (đổi `sw.js` giữa chừng ⇒ “deploy lần 2”; **`context.route` KHÔNG chặn được lần kiểm tra cập nhật của sw.js** nên phải dùng cách này).
- **Số đo**: khởi động offline FCP ≈ 90–120 ms trên máy dev (mục tiêu < 2 s, còn dư rất xa nên **không tách gói tải sau**); JS ≈ 99 KB gzip. **Lighthouse 13 (di động, 4G chậm mô phỏng, lần tải đầu)**: Performance 83 · Accessibility 93 · Best Practices 81 (chỉ mất điểm “không https” vì đo trên localhost) · SEO 60 (cố ý `noindex`); a11y mất điểm vì `user-scalable=no` trong viewport (hỏi chủ dự án nếu muốn cho phóng to). Chạy lại: build `BASE_PATH=/nhanh-tay-tinh-mat/`, `vite preview`, `npx lighthouse <url>` với `CHROME_PATH` = Chrome cài sẵn (Chromium của Playwright báo `spawn UNKNOWN`); chạy bằng **PowerShell** để `BASE_PATH` không bị Git Bash đổi.
- **Chưa kiểm được (cần máy thật)**: TC-001/002 cài bằng Chrome Android, TC-012 máy bay trên máy thật, TC-029 qua 2 lần deploy thật, mở bằng Samsung Internet.

---

## 7. Điều đã học – bẫy hay gặp (đừng lặp lại)

**Môi trường công cụ**
- Lệnh Bash chứa **heredoc nhiều dòng có dấu nháy đơn `'`** (kể cả `python3 - <<'PY'`) thường bị lỗi “unexpected EOF”. Cách ổn định: dùng công cụ **Write** để tạo file (kể cả script Python vào thư mục scratchpad rồi `python3 file.py`; trong script dùng `'''…'''` hoặc dấu nháy kép bao ngoài). Tool **Write/Edit yêu cầu Read file trước** (đặc biệt sau khi prettier sửa file – prettier chạy sau mỗi lần sửa nên chuỗi cần thay có thể đã đổi cách xuống dòng).
- `rm -f "$BIẾN"/*.png` bị chặn bởi kiểm tra an toàn. Dùng đường dẫn cố định hoặc bỏ qua việc xóa.
- Chạy `npx prettier --write "src/**/*.{ts,tsx,css}" "tests/**/*.ts"` trước khi lint (nó đổi file nên các Edit sau phải Read lại).
- Windows: dùng `cross-env`, đường dẫn bằng `path.join`; import JSON luôn kèm `with { type: 'json' }`. In tiếng Việt từ Python cần `PYTHONIOENCODING=utf-8`.
- Dev server tạm: dùng `preview_start` (cấu hình trong `.claude/launch.json`) và `preview_stop`; hoặc tắt bằng PowerShell `Get-NetTCPConnection -LocalPort … | Stop-Process`. **Cổng 5173 thường đang bị dev server của chủ dự án (thư mục gốc, nhánh main) chiếm** – đừng tắt; dùng cổng khác.
- Pane trình duyệt nhúng có khung hình 780×450 không khớp viewport giả lập → **chụp ảnh bằng Playwright** (spec tạm `tests/e2e/tmp-*.spec.ts` ghi ảnh vào thư mục scratchpad qua biến `SHOT_DIR`, **xóa spec tạm trước khi commit**) rồi đọc ảnh bằng Read. Chụp 1 URL nhanh: viết script Node dùng `createRequire(<package.json của dự án>)('@playwright/test').chromium`. Ảnh `fullPage` của cửa sổ phủ (modal) chỉ phủ phần đầu – là hiện tượng của ảnh chụp, không phải lỗi.
- **Giao việc vẽ hình cho agent chạy nền** hiệu quả (TASK-06: 4 agent vẽ 4 chủ đề sticker song song, mỗi agent chỉ sửa file của mình, xem bằng `?gallery=1` + script chụp ảnh). Lưu ý: mọi agent dùng chung dev server nên **một file lỗi cú pháp làm hỏng trang xem trước của tất cả**; id gradient trong từng sticker do `Sticker.tsx` đã dùng `bg`, `ring`, `gl`, `clip` – hình vẽ đừng đặt trùng các tên này.
- Vitest mặc định timeout 5 giây; đã nâng lên 30 giây cho các test sinh 1.000 câu.

**Kỹ thuật**
- **TDZ**: callback `onResize` của `createCanvasStage` chạy đồng bộ lúc tạo → mọi biến nó dùng phải khai báo **trước** `createCanvasStage`.
- Nút Quay lại Android: lịch sử trình duyệt chỉ được “gài” sau **tương tác đầu tiên**; `hashchange` do popstate phải bị bỏ qua. Cửa sổ phủ (hộp quà) đóng bằng nút Quay lại qua `setBackInterceptor`.
- Game kết thúc bằng `pointerdown` → click giả rơi vào nút màn Kết quả (đã chặn 0,6 s).
- Banner nhắc giờ trong lúc chơi phải là **lớp phủ** (không đẩy bố cục). **Banner “Còn 2 phút” hiện ngay khi còn < 2 phút** – test chờ hết giờ phải chờ đúng chữ `vi.play.timeUp`, không chỉ “có banner”.
- `noUncheckedIndexedAccess` bật: mọi truy cập mảng/record cần `?? …` hoặc `as T`.
- Test e2e có thời gian: dùng bot chạy **trong trang** hoặc `expect.poll` theo `data-phase`; với G6/G7 chờ `waitForAsk` thay vì `waitForTimeout`.
- **SVG chỉ có `viewBox` mà CSS để `width:auto` sẽ co về 0** khi nằm trong flex: luôn đặt `width`. Gradient/pattern dùng chung: id có tiền tố riêng; id trùng trong cùng trang chỉ an toàn khi nội dung giống hệt, và **không được nằm trong svg `display:none`**.
- **Hooks Preact phải khai báo trước mọi `return null` có điều kiện** (xem `Rest.tsx`, `Album.tsx`).
- Hoạt ảnh `infinite` + `prefers-reduced-motion`: quy tắc chung chỉ rút thời lượng (gây chớp rất nhanh) → hoạt ảnh lặp mới phải có `animation: none` trong media query riêng (đã làm cho hộp quà).
- Thanh đầu Home dùng `flex-wrap` vì 3 chữ số sao + huy hiệu + 3 nút không vừa 360px.
- CSS: dùng thuộc tính riêng `translate` (vị trí cố định) và `transform` (hiệu ứng) để hai thứ không đè nhau; nút chạm giữ nguyên kích thước khi hiệu ứng.
- Sinh câu hỏi “đúng 1 đáp án”: **đừng chỉ kiểm bằng chính bộ sinh** – dùng bộ giải độc lập.
- Tỷ lệ ngẫu nhiên có “bảo đảm” (pity) không còn đúng bằng tỷ lệ gốc: test hai tầng (lần tung gốc ±2% và phân tích Markov cho tỷ lệ thật).
- `vite-plugin-pwa` (generateSW) mặc định chỉ precache `js,css,html` → font/icon/svg phải thêm vào `workbox.globPatterns` (đã làm ở TASK-08). `registerType: 'prompt'` đăng ký qua `virtual:pwa-register` (`onNeedRefresh`), `injectRegister: false` để không đăng ký hai lần. Ở `npm run dev`, `registerSW` là hàm rỗng (dev không có service worker); `initPwa` còn chặn bằng `import.meta.env.PROD`. Chrome/Samsung Internet hỗ trợ woff2 nên không cần precache woff.
- **Service worker + Playwright**: (1) `context.route('**/sw.js')` **không** chặn được lần kiểm tra cập nhật của chính `sw.js` → muốn giả lập “deploy lần 2” phải tự dựng máy chủ tĩnh (xem `startStaticServer` trong `pwa.spec.ts`); (2) mở app lần đầu thì service worker kích hoạt nhưng **chưa kiểm soát trang** (không `clientsClaim`) → test cần `reload()` một lần nếu muốn kiểm tra sự kiện `controlling`; điều hướng mới (kể cả offline) thì đã đi qua service worker; (3) `navigator.serviceWorker.ready` chỉ xong khi precache xong (kích hoạt xảy ra sau khi cài + precache) nên dùng làm mốc “đã sẵn sàng offline”.
- Bản build e2e chỉ đăng ký service worker khi URL có `?sw=1` (xem `E2E.serviceWorker`); đừng bỏ cờ này kẻo 267 test cũ chậm lại và dễ chập chờn.
- Lighthouse ≥ 12 không còn nhóm điểm PWA (chỉ còn Performance/Accessibility/Best Practices/SEO). GitHub Pages cache `sw.js` ~10 phút.
- **Preact + checkbox/radio “điều khiển” (controlled)**: nếu trình xử lý `onChange` **từ chối** thay đổi (vd không cho tắt nhóm cuối cùng) mà dữ liệu không đổi, Preact không vẽ lại ⇒ ô hiện sai trạng thái. Phải tự trả lại `el.checked` (xem `GroupsPanel` trong `SettingsTab.tsx`). Playwright `check()/uncheck()` sẽ báo lỗi nếu trạng thái không đổi – dùng `click()` khi muốn thử chính trường hợp bị từ chối.
- **E2E gieo dữ liệu**: `seedProfiles/seedRounds` dùng `page.addInitScript` và chỉ ghi khi khóa còn trống, **chạy lại ở mọi lần điều hướng** của trang đó ⇒ muốn thử “xóa dữ liệu trình duyệt” hãy dùng `context.newPage()` (không có init script) rồi `localStorage.clear()` (xem TC-025 trong `parent.spec.ts`). `readState` trả `null` khi chưa từng ghi (dùng `?.`). Có nhiều hồ sơ thì app vào `/profiles` chứ không phải Home → vào khu PH bằng `location.hash = '#/parent-gate'`.
- `RoundRecord.startedAt` là ISO; “ngày” luôn lấy theo **giờ máy** (`dateKey(new Date(startedAt))`) – khi gieo dữ liệu thử dùng giờ địa phương giữa ngày (vd 8–17h) để không lệch ngày vì múi giờ.
- Chart.js vẽ lên canvas – test kiểm **dữ liệu** (`data-chart`) và kích thước canvas, không so điểm ảnh.
- Biến môi trường dạng `/ten-repo/` trong Git Bash có thể bị đổi thành đường dẫn Windows → dùng `cross-env` (đã cài; `build:pages` và `playwright.config.ts` đều dùng, đã kiểm `manifest`/`index.html` ra đúng `/nhanh-tay-tinh-mat/`) hoặc PowerShell.
- **Đường dẫn `/tmp` của Git Bash ≠ `/tmp` mà Node thấy** (Node ghi/đọc `D:\tmp`) → ghi file trung gian vào thư mục scratchpad bằng đường dẫn Windows đầy đủ. **Đừng `cd` vào thư mục con bằng Bash** (làm đổi luôn thư mục làm việc chính của phiên) – dùng đường dẫn tuyệt đối.
**(TASK-09) Điều mới học**
- **Playwright mặc định `screen` = 1920×1080** ⇒ app (phân loại thiết bị theo `window.screen`) coi mọi khung là tablet. Luôn đặt `screen` trong `use` của project (đã làm).
- **Điểm chạm sát mép khung chơi + hiệu ứng `.shake` = chập chờn** (khung dịch ±6px trong ~150–200 ms). Chạm cách mép ≥ 14px và chờ `.shake` biến mất trước khi chạm tiếp.
- **Đặt `min-width` cho flex item thay thế mức tối thiểu theo nội dung (`min-width: auto`)** ⇒ nhãn dài co lại, chữ `white-space: nowrap` tràn và **đè lên nút bên cạnh** (nút đang chọn có `transform` nên nằm trên các nút sau nó). Kiểm bằng `document.elementFromPoint` tại tâm nút, không chỉ bằng kích thước. Bộ quét `findObstructed` trong `a11y.spec.ts` bắt được loại lỗi này.
- Chrome không tính phần tử trong `<details>` đóng là `display: none` (vẫn có `getBoundingClientRect`) ⇒ khi quét layout phải bỏ qua nội dung của `details:not([open])`.
- G3 ở **bản e2e/dev** gọi `publish()` mỗi khung hình (ghi `data-*`) ⇒ đo FPS phải dùng **bản build thật** (`npm run perf` đã làm vậy).
- `ResizeObserver` gọi lần đầu sau khi observe và `createCanvasStage.resize()` **xóa canvas** (đặt lại `canvas.width`) mà không có gì vẽ lại cho tới khi vòng lặp chạy ⇒ thứ cần hiện lúc đếm ngược phải vẽ trong callback `onResize` (như `drawUnderlay` của G5) chứ không chỉ trong `draw()`.
- **Python trong Bash của môi trường này** làm hỏng `\n`/`\b` trong chuỗi thay thế khi chèn mã (ra xuống dòng thật/ký tự lùi) – dùng công cụ **Edit** cho chuỗi có `\n`, hoặc `chr(92)`. Sau khi sửa bằng Python luôn chạy `npx tsc --noEmit`.
- Thư viện tải ngoài (axe-core…) cài vào **thư mục riêng ngoài dự án** (`npm install --ignore-scripts`), không thêm vào `package.json`.

**(TASK-10) Điều mới học**
- **Cử chỉ 2 ngón thật trong Playwright**: dùng CDP `Input.dispatchTouchEvent` (2 `touchPoints` có `id` khác nhau → vài `touchMove` → `touchEnd` với `touchPoints: []`), chạy được ở project `phone` (có `isMobile: true`; mẫu `pinch()` trong `zoom.spec.ts`). `Input.synthesizePinchGesture` **không** phóng được trong cấu hình này; `Emulation.setPageScaleFactor` chỉ là ghi đè giả lập (không chịu ràng buộc của viewport). Đọc mức phóng bằng `visualViewport.scale`. `touch-action: none` chặn pinch thật **kể cả phần tử con** (hiệu lực = giao các tổ tiên); `manipulation` vẫn cho pinch. Khi trang đang phóng, tọa độ chuột của Playwright bấm trượt → bấm bằng `el.evaluate((e) => e.click())`.
- **Đổi `<meta viewport>` lúc chạy KHÔNG đưa trang đang phóng về 1×** (thử `maximum-scale=1` và `user-scalable=no` trên Chromium giả lập di động) → đừng dùng làm cách “reset zoom”; cách đã chọn: tạm dừng game + nhắc chụm lại.
- **Chromium của Playwright (headless shell) không có GPU** → canvas 2D rasterize bằng phần mềm trên main thread (hồ sơ CPU: ~87% “(program)”, JS ~10%) nên FPS ở CPU ×4 của game canvas **bi quan** (G3 44–57 fps là giả). Dùng Chrome cài sẵn: `npm run perf -- --gpu` (G3 60 fps tới CPU ×8). `Performance.getMetrics` → `TaskDuration` cho biết main thread bận bao nhiêu % – bền hơn fps vì fps bị chặn ở 60.
- **Khung bao chỉ dành cho một breakpoint**: bọc phần tử bằng `div` rồi đặt `display: contents` ở mặc định, chỉ cho thành grid/flex trong `@media` → các màn khác không đổi (đã đo `scrollHeight` điện thoại/tablet dọc giữ nguyên từng pixel). Preact nhận `style` dạng chuỗi (`style="--n:3"`) để đặt custom property mà không phải ép kiểu TS; chia cột theo số thẻ bằng `flex: var(--n, 1) 1 0%`.
- Chip/thẻ hẹp (~150px): `white-space: nowrap` + `padding-inline` nhỏ + `min-height: 2.4em` cho tên để các biểu tượng thẳng hàng; kiểm bằng e2e “không tràn thẻ” ở 1200px (hẹp nhất còn xếp 3 cột).
- **Máy ngủ giữa lượt chạy dài làm test “đỏ giả”**: lượt e2e đầy đủ đầu tiên của TASK-10 có đúng 3 test (đang chạy song song trên 3 luồng) cùng kéo dài ≈ 3380 giây rồi báo hết hạn 30 giây, trong khi 414 test còn lại bình thường → đồng hồ nhảy vì máy ngủ, không phải lỗi mã (chạy lại riêng 3 test pass, chạy lại toàn bộ pass). Cách nhận biết: phân tích `duration` từng test trong báo cáo JSON (`PLAYWRIGHT_JSON_OUTPUT_NAME`). Phòng ngừa: gọi công cụ **`request_keep_awake`** của Claude Desktop (công cụ hoãn tải: `ToolSearch select:mcp__ccd_host__request_keep_awake`) trước khi chạy bộ dài (e2e đầy đủ ≈ 12 phút, `npm run perf` ≈ 15–20 phút).
- Trong PowerShell, `… | Select-String -Pattern "…"` làm đầu ra hiện **từng đợt** và **mất các dòng không khớp** (vd dòng `JSON:`) – khi cần chờ một dòng cụ thể thì đừng lọc nó đi, hoặc ghi ra file rồi đọc.

**(TASK-10 đợt 2) Điều mới học**
- **Chấm/biểu tượng phụ chỉ có nghĩa nhờ nhãn truy cập:** chấm đỏ nhắc sao lưu là `aria-hidden`, còn nghĩa nằm ở `aria-label` của nút. Chuỗi nhãn mới phải **bắt đầu bằng đúng tên cũ** (`vi.home.parentBackup` bắt đầu bằng `vi.home.parent`) để mọi chỗ tìm nút theo tên cũ (test `getByRole('button', { name })` khớp chuỗi con, trình đọc màn hình) vẫn thấy. Kiểm bằng `toHaveAccessibleName(chuỗi)` (khớp CHÍNH XÁC).
- **Logic phụ thuộc thời gian ("quá 14 ngày") → hàm thuần nhận `nowMs`** (`backupReminderDue(state, nowMs)`): unit test kiểm hết các ranh giới, còn e2e chỉ cần hai trạng thái chắc chắn (chưa từng sao lưu / vừa sao lưu) mà không phải giả đồng hồ.
- **`a11y.spec.ts` chỉ quét đúng trạng thái mà hồ sơ gieo đang có:** Home được quét với hồ sơ 130 sao chưa sao lưu nên tự phủ cả chấm nhắc. Khi thêm trạng thái mới của Home, đảm bảo hồ sơ trong test quét đang ở trạng thái đó (hoặc thêm một lượt quét riêng).
- **Công cụ QA ngoài dự án (axe-core, Lighthouse):** cài vào một thư mục tạm riêng bằng `npm install --ignore-scripts axe-core lighthouse` (**không** thêm vào `package.json`). Hai script chạy lại đã nằm trong repo: **`scripts/qa-axe.mjs`** (46 lượt: 23 màn × 2 khung) và **`scripts/qa-lighthouse.mjs`** (cách chạy ở đầu mỗi file và `docs/QA_REPORT.md` mục 9). Chạy trên bản build giống Pages: `npm run build:pages`, rồi **trong PowerShell** `$env:BASE_PATH='/nhanh-tay-tinh-mat/'; npx vite preview --port 4190 --strictPort --host 127.0.0.1` — **đừng chạy bằng Git Bash**: nó đổi `/nhanh-tay-tinh-mat/` thành đường dẫn Windows và máy chủ trả 404. `TaskStop` chỉ dừng lớp vỏ lệnh; tiến trình `vite preview` con vẫn giữ cổng → tắt bằng `Stop-Process` theo PID lấy từ `Get-NetTCPConnection -LocalPort 4190`. Lighthouse cần `CHROME_PATH` (Chrome cài sẵn).
- **Chờ lệnh chạy lâu:** trong môi trường này lệnh foreground bắt đầu bằng `sleep`/`Start-Sleep` bị chặn → chạy lệnh dài bằng `run_in_background` rồi chờ thông báo, hoặc dùng công cụ **Monitor** với vòng `until`.
- **Nghe thử âm thanh tuân theo cài đặt `sound` chung** (`audio.preview` đi qua `play()` như mọi âm khác): phụ huynh đã tắt âm thanh thì “Nghe thử” cũng im lặng.

---

## 8. Việc cần chủ dự án tự làm / còn chờ (chưa có ai kiểm trên máy thật)

Ghi trong `docs/PROGRESS.md` từng TASK, tóm tắt:
- **TASK-07** (đã gộp + deploy 0.9.0): thử khu PH trên máy thật (khóa, biểu đồ, bài đo tuần, cài đặt, thưởng, **sao lưu → xóa dữ liệu trang → khôi phục**); **duyệt chữ R13**.
- **TASK-08**: cài thử PWA lên điện thoại/Galaxy Tab bằng Chrome + chế độ máy bay (TC-001, 002, 012), mở thử bằng Samsung Internet; **TC-029** (mở app đã cài → “Có bản mới – Cập nhật” → thấy “Phiên bản 0.9.0”, dữ liệu còn nguyên); **duyệt icon**.
- **Duyệt nội dung G6/G7** bằng `docs/samples/`.
- **Duyệt hình TASK-06**: 40 sticker, 2 trang phục, 2 hình nền (`?gallery=1`); **(0.9.3)** hình **Cú Mèo** + nghe thử **Nhạc Cụ Gõ** (đã làm, chờ duyệt – xem mục “TASK-10 đợt 2” bên dưới).
- Thử trên **điện thoại Android** và **tablet Samsung**: cảm giác chơi G1–G7, **FPS thật** của G1/G3/G5 bằng `?debug=1`, TC-007 (2 ngón vào nốt đôi G5), TC-032, TC-033 (vuốt Quay lại), TC-034 (chia đôi màn hình/cửa sổ nổi), TC-035 (tablet không rung → lắc hình + âm “bụp”), TC-028 (G1 đen trắng); **hộp quà + album + nhiệm vụ + nghỉ đúng giờ** (cách thử từng bước ở PROGRESS, TASK-06).
- **(TASK-09)** Danh sách đầy đủ, đánh số, kèm lý do vì sao cần máy thật: `docs/QA_REPORT.md` mục 8. Nổi bật: **bấm “Cập nhật” ở app đã cài (TC-029, bản 0.9.1 là lần deploy thứ 3)**, **FPS thật G3/G5 trên Galaxy Tab bằng `?debug=1`**.
- **(TASK-10 đợt 1, 0.9.2)** Thử trên máy thật: **Home xoay ngang trên Galaxy Tab** (3 nhóm game cạnh nhau, 7 thẻ một hàng, gần như không phải cuộn; xoay dọc về 3 cột như cũ), **icon thẻ G1/G2 mới**, **phóng to 2 ngón ở Home** (được) → vào một game khi đang phóng (game tạm dừng + nhắc thu nhỏ, nút “Chơi tiếp” mờ) → chụm lại (nút sáng) → chơi tiếp; **đang chơi chụm 2 ngón (không phóng)**, G5 bằng 2 ngón vẫn bình thường.
- **(TASK-10 đợt 2, 0.9.3 – đã deploy)** Thử trên máy thật: **Album → tab Đặc biệt** (Nhạc Cụ Gõ: “Nghe thử” rồi “Dùng”, chơi nghe tiếng đúng/sai/được sao; Cú Mèo: “Dùng” → Home, G6, G7 hiện Cú; mỗi bé một lựa chọn riêng, thoát hẳn app mở lại vẫn giữ), **bóng/khối G1 mới** (vẫn thấy rõ ✕ / ! / ~, chơi mượt; FPS bằng `?debug=1`), **G7 cấp 5** (cố ý chọn sai → lời giải thích “màu lặp… hình lặp…”), **Khu phụ huynh → Dữ liệu → xuất CSV** (mở bằng Excel / Google Trang tính: tiếng Việt đúng dấu), **chấm đỏ nhỏ trên nút Phụ huynh ở Home** khi chưa sao lưu > 14 ngày (bấm vào vẫn ra khóa phụ huynh; sao lưu xong thì chấm biến mất). Muốn thử nhanh sao: bản dev `?debug=1` → “+15 sao”.

---

## 9. Nợ kỹ thuật / đề xuất đã ghi nhận

- ~~Home tablet ngang phải cuộn~~ → **đã làm ở TASK-10** (3 nhóm cạnh nhau từ 1200px, vừa một màn ở 1280×800). Ngang hẹp 900–1199px vẫn 4 cột và phải cuộn (cố ý).
- ~~Biểu tượng thẻ G1, G2 phẳng hơn G3–G7~~ → **đã làm ở TASK-10**. ~~Còn lại: bóng/khối G1 trong game vẽ phẳng~~ → **đã làm ở TASK-10 đợt 2** (sprite vẽ một lần, `games/g1-balls/art.ts`; đo lại 60 fps).
- ~~G5: vẽ nền tĩnh (làn, vạch) vào lớp canvas riêng~~ → **đã làm ở TASK-09** (`.g5-underlay`).
- **Kích thước JS** ≈ 99 KB gzip; đã đo khởi động offline FCP ≈ 100 ms (TASK-08) nên **không** tách gói tải sau; riêng Chart.js (TASK-07) nên tải sau.
- Tên sticker trong Album 16px (nhỏ hơn mức 18px của SPEC) – đã có phóng to khi chạm.
- Tỷ lệ độ hiếm thật ≈ 66 / 28,3 / 5,7 do “bảo đảm Hiếm” (SPEC không thể đúng cả 70/25/5 lẫn bảo đảm) – nếu cần chỉnh: `rollRarity` trong `rewards.ts`.
- ~~Bộ âm Nhạc Cụ Gõ + Linh vật Cú Mèo: đã mở khóa nhưng chưa dùng được~~ → **đã làm ở TASK-10 đợt 2** (Album → Đặc biệt). Còn lại: **Cú Mèo chưa có trang phục** (chỉ Sóc Bo mặc được; thêm nếu anh muốn).
- ~~G6: M11 tìm số thiếu ra số lớn; G7 cấp 5 chưa có lời giải thích riêng~~ → **đã làm ở TASK-10 đợt 2** (M11 ≤ 99; G7 cấp 5 giải thích “màu lặp… hình lặp…”).
- Khu PH: ~~xuất CSV~~ và ~~nhắc sao lưu ở Home~~ → **đã làm ở TASK-10 đợt 2** (nút CSV ở tab Dữ liệu; chấm đỏ trên nút Phụ huynh); còn: so sánh nhiều bé; bộ đếm “sai 3 lần” nằm trong bộ nhớ (tải lại trang là thử lại được); `ParentArea` dùng nav + `aria-current` (chưa có điều hướng bằng phím mũi tên kiểu tablist).
- Gói chính tăng lên ≈ 114 KB gzip vì giao diện khu PH (6 tab) nằm cùng gói; có thể tách `ui/parent/*` thành gói tải sau nếu TASK-09 thấy cần (Chart.js đã tách).
- ~~`AppState.installedVersion` chỉ ghi lúc tạo dữ liệu~~ → **đã làm ở TASK-10 đợt 2** (`withInstalledVersion`, cập nhật khi mở app lên bản mới; khu PH vẫn hiện `APP_VERSION`).
- Chưa kiểm trên **Samsung Internet** thật (TASK-08 chỉ kiểm bằng Chromium/Playwright); `gh` CLI chưa đăng nhập (chưa cần).
- Thư viện cài ngoài danh sách CLAUDE.md đã được chấp nhận: `@types/node`, `@eslint/js`, `typescript-eslint`, `globals`, `eslint-config-prettier`. Phiên bản mới nhất: Vite 8, Preact 11, TypeScript 6, ESLint 10, Vitest 5, vite-plugin-pwa 2 (chạy ổn).
- ~~**(TASK-09)** G3 ở tablet khi giả lập CPU ×4: 44–57 fps~~ → **đã điều tra ở TASK-10**: do Chromium thử nghiệm không có GPU; Chrome có GPU cho 60 fps tới CPU ×8, main thread bận 30% ở ×4 (xem mục 6 và `docs/QA_REPORT.md` mục 6). Vẫn cần xem FPS thật bằng `?debug=1` trên Galaxy Tab.
- ~~**(TASK-09)** `user-scalable=no` trong viewport~~ → **đã bỏ ở TASK-10** (màn chơi vẫn chặn phóng, vào game khi đang phóng thì tạm dừng + nhắc). Cần thử máy thật; **axe + Lighthouse đã chạy lại ở 0.9.3**: Accessibility 93 → 100, mục `meta-viewport` hết (xem `docs/QA_REPORT.md` mục 5).
- **(TASK-09)** ~~`installedVersion` chưa cập nhật; chưa có xuất CSV~~ → đã làm ở TASK-10 đợt 2; bộ đếm “sai 3 lần” vẫn nằm trong bộ nhớ.
- ~~**(TASK-09)** Chưa chạy lại Lighthouse sau TASK-09~~ → **đã chạy lại ở TASK-10 đợt 2 (0.9.3)**: Lighthouse 13.5 Performance 83 · Accessibility **100** · Best Practices 81 (chỉ thiếu HTTPS vì đo trên localhost) · SEO 60 (cố ý `noindex`); axe-core 4.14: **0 vi phạm / 46 lượt** (sau khi sửa `heading-order` ở Album). Chi tiết `docs/QA_REPORT.md` mục 5.

---

## 10. Lệnh thường dùng

```bash
npm install            # (worktree mới: npm ci)
npm run dev            # http://localhost:5173 (+ địa chỉ Network cho điện thoại/tablet)
npm run lint           # eslint + tsc --noEmit
npm test               # Vitest (569 test ở 0.9.3)
npm run build          # production
npm run build:pages    # production với BASE_PATH=/nhanh-tay-tinh-mat/ (giống bản deploy)
npm run icons          # vẽ lại icon PWA vào public/icons/ (cần `npx playwright install chromium`)
npm run test:e2e       # Playwright 3 khung hình, 489 test (474 chạy + 15 bỏ qua có chủ ý; tự build dist-e2e + dist-e2e-base)
npm run samples        # sinh docs/samples/G6.md, G7.md, G7.html
npm run perf           # đo FPS G1/G3/G5 (build bản thật vào dist-perf); lọc: -- --games=G5 --viewports=tablet-portrait --cpu=4 --no-build
npm run perf -- --gpu  # như trên nhưng bằng Chrome/Edge cài sẵn CÓ GPU (sát thiết bị thật; Chromium của Playwright không GPU nên fps ở CPU ×4 bi quan)
node scripts/qa-axe.mjs <url> <thư mục cài axe-core> [kq.json]          # axe-core trên 23 màn × 2 khung (bản build giống Pages; xem đầu file script)
node scripts/qa-lighthouse.mjs <url> <thư mục cài lighthouse> [kq.json]  # Lighthouse di động (cần biến CHROME_PATH)
node scripts/qa-table.mjs <kq.json>   # bảng TC từ báo cáo JSON của Playwright
npx playwright test rewards --project=phone --reporter=line   # chạy 1 file / 1 khung hình
git add -A && git commit -m "feat: …" && GIT_TERMINAL_PROMPT=0 timeout 90 git push
```
