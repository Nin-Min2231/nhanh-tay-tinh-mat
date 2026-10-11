# HANDOVER – Bàn giao sang phiên làm việc mới

> Viết ngày 2026-10-11, sau khi **làm xong TASK-08 (PWA offline + deploy GitHub Pages)** trên nhánh `claude/handover-file-task-5ad07c`. Đọc file này **sau** `CLAUDE.md` và `docs/PROGRESS.md`.
> Mục đích: để phiên mới (Claude Code Desktop, tab Code, Local) làm tiếp **TASK-07 (khu phụ huynh)** mà không phải đoán lại ngữ cảnh.

---

## 0. Trạng thái git

- **TASK-00 → TASK-06 đều đã ở `main` và `origin/main`** (lịch sử thẳng: `9e27852` docs → `7c69cbc` scaffold → `ab46084` TASK-02 → `76ec054` TASK-03 → `6aa2f82` TASK-04 → `69aa393` TASK-05 → `793d95d` + `daf2e6c` handover → `c73b4a9` TASK-06 `feat: daily missions, gift boxes, 40-sticker album…` → `5fe6d64` handover TASK-08).
- **TASK-08 nằm trên nhánh `claude/handover-file-task-5ad07c`** (1 commit `feat: PWA offline, install icons, update flow, GitHub Pages deploy` đi sau `5fe6d64`). **Có thể chưa gộp vào `main`** – kiểm bằng `git log origin/main --oneline -3`; nếu chưa, hỏi chủ dự án trước khi làm TASK-07 (nhánh TASK-07 nên xuất phát từ `main` đã có TASK-08). Gộp = `git -C <thư mục gốc> merge --ff-only claude/handover-file-task-5ad07c` rồi `git push origin main` – **push `main` kích hoạt workflow Deploy**, nên chủ dự án nên bật Pages trước (hướng dẫn từng bước: PROGRESS, nhật ký TASK-08).
- Các nhánh `claude/handover-next-task-8f81b2`, `claude/handover-continuation-f32d2a`, `claude/task-06-handover-09db84` chỉ còn là bản sao cũ của `main` – không cần dùng; đừng xóa nếu chưa hỏi chủ dự án. **Phiên mới tạo nhánh/worktree mới từ `main`** (gợi ý tên `claude/task-07-parent-area`; worktree mới chưa có `node_modules` → `npm ci`).
- **Máy chủ `npm run dev` của chủ dự án chạy ở thư mục gốc (nhánh `main`, cổng 5173, `--host`, địa chỉ LAN `192.168.1.14`)** và tự cập nhật khi `main` đổi. Khi cần dev server của worktree: dùng **cổng khác** (`npm run dev -- --port 5174 --strictPort`; thêm một mục tạm trong `.claude/launch.json` để dùng `preview_start`, **đừng commit mục này**).
- Việc còn chờ chủ dự án (không chặn TASK-07): **bật GitHub Pages + cài thử PWA lên máy thật** (TC-001/002/012/029); **duyệt icon** (`public/icons/icon-512.png`); **duyệt nội dung mẫu** `docs/samples/G6.md`, `G7.md`, `G7.html`; **duyệt 40 sticker + trang phục + hình nền** (`/?gallery=1` ở bản dev); quyết định **Nhạc Cụ Gõ + Cú Mèo**; thử G1–G7, hộp quà, album trên điện thoại/tablet thật.

---

## 1. Cách bắt đầu phiên mới

Chủ dự án (PM, không phải lập trình viên, xưng “anh”, trao đổi **tiếng Việt**) chỉ cần nhắn:

```
Làm TASK-07
```

(hoặc “Đọc handover và thực hiện task tiếp theo”). Quy trình bắt buộc (CLAUDE.md mục 6) – đã áp dụng ở mọi TASK trước:

1. Đọc `CLAUDE.md`, `docs/PROGRESS.md`, rồi tài liệu TASK yêu cầu (với TASK-07: `docs/01_SPEC.md` mục 5, 6, 9, 10; `docs/03_TASKS.md` mục TASK-07; `docs/04_ACCEPTANCE.md` TC-010, 023, 025, 026, 027; và **mục 6 của file này**).
2. **TASK-07 chưa có kế hoạch nào được duyệt**: trình bày **kế hoạch ngắn** rồi **chờ “Đồng ý”** mới viết code. TASK-07 là TASK lớn nhất (6 tab) nên nên chia bước; đề xuất thứ tự: Khóa PH + khung tab → Cài đặt → Hồ sơ + Thưởng → Dữ liệu (sao lưu/khôi phục) → Tiến bộ (Chart.js) → Bài đo tuần.
3. Làm từng bước nhỏ, chạy `npm run lint` + `npm run test` sau mỗi bước lớn; giao diện thì tự xem bằng ảnh chụp Playwright ở 3 khung hình.
4. Cuối TASK: cập nhật `docs/PROGRESS.md` (trạng thái + nhật ký trên cùng), commit Conventional Commits, push, báo cáo ngắn bằng tiếng Việt (đã làm gì, cách thử trên máy thật, điểm cần quyết định). Gộp vào `main` + push `main` **chỉ khi chủ dự án đồng ý** (cách đã dùng: commit trên nhánh task, `git -C <thư mục gốc> merge --ff-only <nhánh>`, rồi `git push origin main`). **Từ nay push `main` = tự động deploy lên GitHub Pages** (`deploy.yml`): chủ dự án thấy bản mới trên máy sau ~2 phút + bấm “Cập nhật” ở Home.

> Nếu phiên mới chạy trong **git worktree** mới: thư mục chưa có `node_modules` → chạy `npm ci` trước.

---

## 2. Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| TASK-00 → TASK-06 | **Xong**, đã ở `main` và `origin/main` |
| TASK-08 PWA + deploy | **Xong** trên nhánh `claude/handover-file-task-5ad07c` (chờ chủ dự án đồng ý gộp `main`, bật Pages, thử trên máy thật) |
| Tiếp theo | **TASK-07 khu phụ huynh** (mục 6) |
| Sau đó | TASK-09 QA · TASK-10 sửa lỗi |

- **Thứ tự TASK-08 trước TASK-07 là quyết định của chủ dự án (2026-10-10)** sau khi được giải thích 3 hệ quả: (1) bản đưa lên Pages chưa chỉnh được gì vì khu PH vẫn là “Đang xây dựng” (`?debug=1`/`?e2e=1` chỉ chạy ở bản dev: không đổi được độ khó/tùy chọn, không tặng giờ/hộp, giới hạn cố định 15 phút/ngày); (2) chưa có sao lưu nên dữ liệu bé trên bản cài không có lưới an toàn → coi bản Pages là **bản dùng thử, chưa cho bé dùng lâu dài** cho tới khi xong TASK-07; (3) mục “hiện số phiên bản + nút Cập nhật trong khu PH” của TASK-08 dời sang TASK-07 (TASK-08 đã làm nút ở Home + hiện tạm số phiên bản ở trang Khu phụ huynh “Đang xây dựng”).
- Repo: https://github.com/Nin-Min2231/nhanh-tay-tinh-mat (công khai), remote `origin`, địa chỉ Pages dự kiến `https://nin-min2231.github.io/nhanh-tay-tinh-mat/` (`BASE_PATH=/nhanh-tay-tinh-mat/`). Máy đã đăng nhập GitHub sẵn nên `git push` chạy thẳng (dùng `GIT_TERMINAL_PROMPT=0 timeout 90 git push` để không bị treo).
- Git user riêng cho repo: `Nin-Min2231` / `nguyennc1357@gmail.com`. Commit kèm dòng `Co-Authored-By: …` theo nhắc trong phiên.
- Test e2e: hai test cũ phụ thuộc thời gian thực (**G1 TC-004**, **G3 TC-013**) thỉnh thoảng chập chờn khi chạy song song trên máy bận; chạy riêng thì pass. Chạy đủ bộ nên dùng `npx playwright test --workers=3` (≈ 9 phút) và chạy lại riêng test lỗi trước khi kết luận có hồi quy.
- Chất lượng hiện tại (nhánh TASK-08): `npm run lint` pass · **409 unit test** (Vitest; 1 test sinh file mẫu bị bỏ qua khi chạy thường) · `npm run build` OK (JS ≈ 317 KB, **≈ 99 KB gzip**; giới hạn 350 KB; precache 16 mục ≈ 782 KiB) · **291 e2e** Playwright (97 test × 3 khung hình `phone` 360×740 / `tablet` 1280×800 / `tablet-portrait` 800×1280) đều pass.
- Home: **cả 7 game chơi được**; nhiệm vụ 3 nhóm, hộp quà, album, trang phục, hình nền, nghỉ đúng giờ **đã làm** (TASK-06). **PWA đã làm (TASK-08)**: cài được lên màn hình chính, chạy offline (kể cả font), nút “Có bản mới – Cập nhật” ở Home, deploy tự động bằng GitHub Actions.
- Chưa làm: khu phụ huynh + Khóa PH + biểu đồ + sao lưu + bài đo tuần (TASK-07; route `/parent-gate`, `/parent/:tab` hiện là trang “Đang xây dựng” – `UnderConstruction` trong `App.tsx`, đang hiện tạm số phiên bản).

---

## 3. Chủ dự án thích gì / dặn gì (quan trọng)

- **Hình ảnh luôn phải đẹp, chân thật, rực rỡ, nhiều tông màu nổi bật để trẻ thích** (dặn ở TASK-03/04, giữ ở TASK-06). Mọi hình mới phải vẽ chi tiết: chuyển sắc, vệt sáng, đổ bóng, viền mềm – **không dùng hình phẳng đơn điệu**. Chữ vẫn tối trên nền sáng để dễ đọc (tương phản AA); màu luôn kèm hình dạng/hoa văn (mù màu). *(Riêng khu phụ huynh: SPEC ghi “chữ thường, không cần hoạt hình” – giao diện gọn, dễ đọc, không cần trang trí.)*
- Luôn **trình bày kế hoạch và chờ duyệt** trước khi code; hướng dẫn thao tác trên máy thật theo **từng bước đánh số**, không giả định kiến thức lập trình.
- Ghi rõ **quyết định tự chọn** để chủ dự án góp ý; việc ngoài phạm vi → ghi vào mục “Đề xuất” của `docs/PROGRESS.md`.
- Chủ dự án thích **thử bản mới trên máy thật** trước khi làm tiếp – sau mỗi TASK nên cho họ địa chỉ để thử (xem mục 0).
- Không có Excel nào được đẩy lên GitHub (`*.xlsx` bị `.gitignore`); file kế hoạch Excel chỉ ở thư mục gốc máy chủ dự án.

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
    version.ts             # APP_VERSION (từ package.json lúc build) – TASK-07 hiện trong tab Dữ liệu
    rng.ts                 # mulberry32 có seed + randInt, pick, shuffle
  games/
    levels.ts              # import docs/data/levels.json, kiểu an toàn (KHÔNG chép tay số liệu)
    registry.ts            # GAME_GROUPS + MODULES (cả 7 game đã đăng ký)
    common/                # types.ts (GameModule/Context/Result), CanvasStage, PointerInput (PointerGate),
                           # HintBubble, hud.ts, sparkles.ts, Countdown, PauseOverlay
    g1-balls … g7-patterns/   # mỗi game: config.ts · logic.ts (thuần, có test) · view.ts · index.ts (G6/G7 có thêm các file sinh câu hỏi)
    samples.test.ts        # sinh docs/samples/* khi GEN_SAMPLES=1 (`npm run samples`); bình thường bị bỏ qua
  ui/
    App.tsx                # chọn màn hình + redirect hợp lệ; gắn <GiftModal /> ở gốc
    screens/               # Home, GameIntro, Play (vòng đời lượt), Result, Rest, Album, ProfileSelect, ProfileForm, UnderConstruction
    components/            # Button, Mascot (Sóc Bo 5 biểu cảm + prop outfit), Outfits (3 lớp: back/body/head), Scenes (hình nền),
                           # GiftBox (hình hộp + cửa sổ mở hộp), GiftButton, RewardIcons (huy hiệu, Nhạc Cụ Gõ), Avatar (12 + khung Cầu Vồng),
                           # GameIcon, IntroAnimation, DebugPanel, DebugRewards, Confetti, StarBurst, ProgressBar, Overlays…
    stickers/              # Sticker.tsx (khung theo độ hiếm + nền chủ đề) · kit.tsx (Lin, Rad, Shine, Sparkle, Eye, Cheek…) ·
                           #   animals/fruits/space/vehicles.tsx (mỗi file 10 hình `stk-xx`) · Gallery.tsx (chỉ dev)
    theme.css / app.css / games.css / games2.css / rewards.css   # bảng màu rực rỡ + style (rewards.css = TASK-06)
tests/e2e/                 # helpers.ts + framework / games / games2 / games3 / rewards .spec.ts
docs/                      # SPEC, GAMES, TASKS, ACCEPTANCE, PROGRESS, data/levels.json, samples/, HANDOVER (file này)
```

### Hợp đồng game (docs/01_SPEC.md mục 4, đã triển khai)
`GameModule.create(host, ctx) → { start, pause, resume, destroy, finish? }`. `ctx` có: `level`, `options` (tùy chọn PH), `profile` (`grade`, `mathTopics`, `mathFacts`), `rng` (có seed), `audio`, `haptics`, `benchmark`, `timeScale`, `onFinish(result)`. `RoundResult = { score 0–1, durationMs, metrics, extra? }`.
- `finish?()` là phần mở rộng ngoài SPEC: host gọi khi chơi lố giờ quá 90 giây (game tự kết thúc với kết quả hiện có). G6/G7 kết thúc **ngay** (câu đang dở tính chưa làm).
- `timeScale` chỉ >1 khi chạy e2e (`?e2e=1` → 10): game dùng để rút ngắn **độ dài lượt** hoặc **thời gian mỗi câu** (G6/G7), không đổi độ khó thật. **Từ TASK-06 cửa sổ 30 giây “Con nghỉ đây” cũng rút ×10** (`REST_WINDOW_MS` trong `store.ts`).
- `RoundResult.extra` được `recordRound` đọc: **G6 trả `extra.factResults`** → `applyRoundToMath` cập nhật `profile.math.facts`.
- Vòng đời lượt do `ui/screens/Play.tsx` điều phối: đếm ngược 3-2-1 → Running → tạm dừng (ẩn tab/xoay/resize/Quay lại) → kết thúc → `recordRound` (lưu `RoundRecord`, cộng giờ, `applyRound` độ khó, sổ lỗi G6, **nhiệm vụ + sao + hộp + mở khóa qua `applyRoundRewards`**) → `/result`. **`Play.tsx` hiện đặt `benchmark = false` cố định – TASK-07 (bài đo tuần) phải nối luồng benchmark vào đây** (cấp lấy từ `levelsConfig.benchmark`, không tính vào độ khó thích ứng – `countsForAdaptive` đã có `&& !benchmark`).

### Hệ thống thưởng (TASK-06) – cần biết khi làm TASK-07
- Mọi thay đổi sao/hộp đi qua `rewards.ts` (`addStars`, `applyRoundRewards`, `openBox`, `claimRestReward`, `grantParentBoxes`) – **thuần**, test ở `rewards.test.ts`. Store chỉ nối dây. Muốn thêm nguồn sao/hộp mới → thêm hàm thuần + test trước.
- **TASK-07 “Thưởng” (tặng hộp / +5/+10/+15 phút)**: tặng hộp dùng sẵn `grantParentBoxes(profile, n)` (không tính giới hạn hộp/ngày; chưa có trường “lý do” trong dữ liệu – nếu muốn lưu lý do thì thêm cấu trúc + migration + test); cộng thời gian = `DayUsage.bonusMs` (hôm nay). Giới hạn hộp/ngày PH chỉnh: `profile.limits.maxBoxesPerDay` ∈ `MAX_BOXES_PER_DAY_RANGE` (0–5); thời gian/ngày `limits.dailyMinutes` ∈ `levelsConfig.session.dailyMinutesRange` (5–60).
- Hồ sơ lưu: `totalStars`, `unlocked` (id phần thưởng), `outfitId`, `backgroundId`, `stickers`, `boxes {pending, openedTotal, sinceLastRare}`, `days[ngày] {missions, boxesEarned, starsToday, restOnTimeRewarded, playMs, bonusMs}`. **Không đổi cấu trúc ở TASK-06 → không có migration mới** (schemaVersion vẫn 1). Khi mở app, `store.ts` tự mở các phần thưởng đã đủ sao của hồ sơ cũ (`syncUnlocks`).
- Khôi phục từ sao lưu (TASK-07) nên gọi lại đối chiếu `syncUnlocks` để dữ liệu cũ vẫn nhất quán.
- Các nút `?debug=1` mới ở Home (`DebugRewards`): +1 hộp, +10/+15 sao, làm mới ngày hôm nay; giao diện PH thật sẽ thay cho `DebugPanel` (độ khó) – không xóa trước khi PH có đủ chức năng.

### Quy ước làm game (rút từ TASK-03/04/05, nên theo)
1. **Logic thuần tách khỏi view** (`logic.ts`) + unit test; `config.ts` đọc `levelsConfig.games.Gx.levels` và ánh xạ nhãn tiếng Việt trong JSON sang enum/số.
2. Tùy chọn PH đọc qua `readGxOptions(ctx.options)` (bỏ giá trị lạ, mặc định an toàn) → `resolveGxParams(level, options)`.
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
- Việc luôn làm trước khi báo xong: `npm run lint`, `npm test`, `npm run build`, e2e đầy đủ (`npx playwright test --workers=3`); rồi chụp ảnh 3 khung hình để tự xem giao diện (xem “Mẹo công cụ”).
- `npm run samples` sinh lại `docs/samples/G6.md`, `G7.md`, `G7.html` (seed cố định).

---

## 6. Việc cần làm: TASK-07 (khu phụ huynh)

Tài liệu nguồn: `docs/03_TASKS.md` mục TASK-07, `docs/01_SPEC.md` mục 9 (khu PH), 10 (bài đo chuẩn), 5 (dữ liệu: `DailyAggregate`), 6; F06, F08, F10, F11, F12, F15, F16, F17, F18; `docs/04_ACCEPTANCE.md` TC-010, 023, 025, 026, 027 + bảng unit test bắt buộc (`storage.ts`: backup → restore khứ hồi, dọn bản ghi > 120 ngày).

Prompt TASK-07 (tóm tắt):
1. **Khóa PH**: phép nhân a×b (a 12–49, b 3–9), bàn phím số, sai 3 lần khóa 30 giây (sau đó phép tính mới).
2. **Tab Tiến bộ**: Chart.js (đã cài) đường theo ngày + đường cấp; lọc hồ sơ / game / chỉ số / khoảng ngày / thiết bị (phone, tablet); bảng 10 lượt gần nhất. `DailyAggregate` (giữ vĩnh viễn) + dọn `RoundRecord` > 120 ngày.
3. **Tab Bài đo tuần**: luồng chạy 7 game ở cấp benchmark (`levels.json`), thẻ so sánh tuần đầu ↔ tuần gần nhất (chú ý chỉ số “thấp hơn là tốt”), banner “Thử thách tuần” trên Home (`profile.lastBenchmarkAt`).
4. **Tab Cài đặt**: thời gian/ngày, hộp tối đa/ngày, âm thanh/nhạc/rung, cho bé chọn độ khó (`settings.allowKidDifficultyChoice`); từng game Tự động (min–max) / Cố định + tùy chọn riêng (chuyển từ `DebugPanel`); G6 lớp + chủ đề toán.
5. **Tab Hồ sơ** (thêm/sửa/xóa xác nhận 2 bước), **Tab Thưởng** (+5/+10/+15 phút, tặng hộp kèm lý do).
6. **Tab Dữ liệu**: sao lưu JSON (tải về thư mục Tải xuống), khôi phục có xem trước + xác nhận, cảnh báo xóa dữ liệu/ẩn danh, nhắc > 14 ngày chưa sao lưu (`lastBackupAt`), phiên bản app, ghi chú khi nào nên cho bé đi khám (R13).

Điểm kỹ thuật cần lưu ý:
- Giao diện PH theo SPEC: **chữ thường, không cần hoạt hình**, nhưng vẫn vùng chạm ≥ 48px và tiếng Việt trong `vi.ts`.
- Chart.js đóng gói (không CDN), tree-shake (chỉ đăng ký thành phần cần dùng); nên **tải sau** (dynamic import) để không phình gói đầu.
- `DailyAggregate` và dọn bản ghi cần **migration + test** nếu đổi cấu trúc (quy tắc 12); backup/restore phải khứ hồi giữ nguyên **cả** `ntm.state`, `ntm.rounds.<id>`, `ntm.daily.<id>`.
- Tải file sao lưu: `Blob` + `<a download>`; trên Android Chrome vào thư mục Tải xuống. Khôi phục: `<input type=file>` + xem trước tóm tắt trước khi ghi đè (nhớ đối chiếu `syncUnlocks`).
- Hộp quà PH tặng: dùng `grantParentBoxes`; cộng thời gian: tăng `days[hôm nay].bonusMs` (TC-023: hết giờ → +10 phút → Home mở lại thẻ game, đồng hồ còn 10 phút).
- Không giao diện nào được gửi dữ liệu ra mạng (quy tắc 1).
- **Chuyển từ TASK-08 sang đây:** hiện **số phiên bản** (`APP_VERSION` từ `app/version.ts`) và **nút “Có bản mới – Cập nhật”** (cờ `updateAvailable`, hàm `applyUpdate` trong `app/pwa.ts` do TASK-08 tạo) trong khu PH thật (nút Cập nhật **vẫn giữ ở Home**: TASK-08 đã làm; thêm một nút nữa trong tab Dữ liệu); gỡ chỗ hiển thị tạm số phiên bản ở `UnderConstruction` (prop `showVersion`, chuỗi `vi.wip.version`, class `.app-version`, test id `app-version`) khi trang này không còn dùng cho khu PH. TC-029 (cập nhật giữ nguyên dữ liệu, hiện số phiên bản mới) kiểm đầy đủ ở TASK-07.
- Khôi phục sao lưu cần `navigator.storage.persist()` và bối cảnh an toàn (https) để chắc chắn lưu bền – bản GitHub Pages (TASK-08) có https, thử TC-025 trên máy thật ở đó.
- Chart.js nên **tải sau** (`import()`); gói chia nhỏ này đã nằm trong cache offline vì Workbox precache mọi file build.


## 6b. TASK-08 đã làm gì (tóm tắt – để biết khi đụng vào PWA/deploy)

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
- Biến môi trường dạng `/ten-repo/` trong Git Bash có thể bị đổi thành đường dẫn Windows → dùng `cross-env` (đã cài; `build:pages` và `playwright.config.ts` đều dùng, đã kiểm `manifest`/`index.html` ra đúng `/nhanh-tay-tinh-mat/`) hoặc PowerShell.
- **Đường dẫn `/tmp` của Git Bash ≠ `/tmp` mà Node thấy** (Node ghi/đọc `D:\tmp`) → ghi file trung gian vào thư mục scratchpad bằng đường dẫn Windows đầy đủ. **Đừng `cd` vào thư mục con bằng Bash** (làm đổi luôn thư mục làm việc chính của phiên) – dùng đường dẫn tuyệt đối.

---

## 8. Việc cần chủ dự án tự làm / còn chờ (chưa có ai kiểm trên máy thật)

Ghi trong `docs/PROGRESS.md` từng TASK, tóm tắt:
- **Duyệt nội dung G6/G7** bằng `docs/samples/`.
- **Duyệt hình TASK-06**: 40 sticker, 2 trang phục, 2 hình nền (`?gallery=1`); quyết định **Nhạc Cụ Gõ + Cú Mèo** (làm ở TASK-10 hay bỏ).
- Thử trên **điện thoại Android** và **tablet Samsung** (Chrome, cùng wifi): cảm giác chơi G1–G7, **FPS thật** của G1/G3/G5 bằng `?debug=1`, TC-007 (2 ngón vào nốt đôi G5), TC-032, TC-033 (vuốt Quay lại), TC-034 (chia đôi màn hình/cửa sổ nổi), TC-035 (tablet không rung → lắc hình + âm “bụp”), TC-028 (G1 đen trắng); **hộp quà + album + nhiệm vụ + nghỉ đúng giờ** (cách thử từng bước ở PROGRESS, TASK-06).
- Mở bằng `http://192.168.x.x` thì không cài được PWA/offline (cần https – dùng địa chỉ GitHub Pages).
- **TASK-08 – việc GitHub chủ dự án phải bấm** (bật Pages với Source = GitHub Actions, rồi thử cài + máy bay + Samsung Internet; **TC-029 sau lần deploy thứ 2**) – hướng dẫn từng bước đánh số ở `docs/PROGRESS.md`, nhật ký TASK-08. **Duyệt icon** `public/icons/icon-512.png`.

---

## 9. Nợ kỹ thuật / đề xuất đã ghi nhận

- Home tablet ngang phải cuộn (4 cột nhưng mỗi nhóm chỉ 2–3 thẻ) → có thể xếp 3 nhóm cạnh nhau (TASK-10 nếu chủ dự án muốn).
- Biểu tượng thẻ G1, G2 phẳng hơn G3–G7 → nâng cấp cùng phong cách (TASK-10).
- G5: nếu máy yếu, vẽ nền tĩnh (làn, vạch) vào lớp canvas riêng.
- **Kích thước JS** ≈ 99 KB gzip; đã đo khởi động offline FCP ≈ 100 ms (TASK-08) nên **không** tách gói tải sau; riêng Chart.js (TASK-07) nên tải sau.
- Tên sticker trong Album 16px (nhỏ hơn mức 18px của SPEC) – đã có phóng to khi chạm.
- Tỷ lệ độ hiếm thật ≈ 66 / 28,3 / 5,7 do “bảo đảm Hiếm” (SPEC không thể đúng cả 70/25/5 lẫn bảo đảm) – nếu cần chỉnh: `rollRarity` trong `rewards.ts`.
- Bộ âm Nhạc Cụ Gõ + Linh vật Cú Mèo: đã mở khóa nhưng chưa dùng được.
- G6: M11 tìm số thiếu ra số lớn (chủ đề lớp 3, không mặc định); G7 cấp 5 chưa có lời giải thích riêng cho hai nhịp lặp khác nhau.
- Chưa có: `DailyAggregate` + dọn bản ghi > 120 ngày (TASK-07).
- `AppState.installedVersion` chỉ ghi lúc tạo dữ liệu, chưa cập nhật khi app lên phiên bản mới (khu PH dùng `APP_VERSION` từ `version.ts`, không dùng trường này; nếu muốn biết “phiên bản đã từng cài”, thêm cập nhật khi mở app + test).
- Chưa kiểm trên **Samsung Internet** thật (TASK-08 chỉ kiểm bằng Chromium/Playwright); `gh` CLI chưa đăng nhập (chưa cần).
- Thư viện cài ngoài danh sách CLAUDE.md đã được chấp nhận: `@types/node`, `@eslint/js`, `typescript-eslint`, `globals`, `eslint-config-prettier`. Phiên bản mới nhất: Vite 8, Preact 11, TypeScript 6, ESLint 10, Vitest 5, vite-plugin-pwa 2 (chạy ổn).

---

## 10. Lệnh thường dùng

```bash
npm install            # (worktree mới: npm ci)
npm run dev            # http://localhost:5173 (+ địa chỉ Network cho điện thoại/tablet)
npm run lint           # eslint + tsc --noEmit
npm test               # Vitest (409 test)
npm run build          # production
npm run build:pages    # production với BASE_PATH=/nhanh-tay-tinh-mat/ (giống bản deploy)
npm run icons          # vẽ lại icon PWA vào public/icons/ (cần `npx playwright install chromium`)
npm run test:e2e       # Playwright 3 khung hình (tự build dist-e2e + dist-e2e-base)
npm run samples        # sinh docs/samples/G6.md, G7.md, G7.html
npx playwright test rewards --project=phone --reporter=line   # chạy 1 file / 1 khung hình
git add -A && git commit -m "feat: …" && GIT_TERMINAL_PROMPT=0 timeout 90 git push
```
