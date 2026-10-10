# HANDOVER – Bàn giao sang phiên làm việc mới

> Viết ngày 2026-10-10, sau khi hoàn thành TASK-06. Đọc file này **sau** `CLAUDE.md` và `docs/PROGRESS.md`.
> Mục đích: để phiên mới (Claude Code Desktop, tab Code, Local) làm tiếp **TASK-07 (khu phụ huynh)** mà không phải đoán lại ngữ cảnh.

---

## 0. Trạng thái git

- **TASK-00 → TASK-05 đã ở `main` và `origin/main`** (lịch sử thẳng: `9e27852` docs → `7c69cbc` scaffold → `ab46084` TASK-02 → `76ec054` TASK-03 → `6aa2f82` TASK-04 → `69aa393` TASK-05 → `793d95d` + `daf2e6c` handover).
- **TASK-06 đã được gộp vào `main` và push lên GitHub** (chủ dự án đồng ý ngày 2026-10-10; gộp bằng `git merge --ff-only` nên lịch sử thẳng: `daf2e6c` → commit `feat: daily missions, gift boxes, 40-sticker album…`). Nhánh `claude/task-06-handover-09db84` chỉ còn là bản sao của `main`. Phiên mới nên làm việc trên nhánh/worktree mới **tạo từ `main`**.
- Nhánh/worktree cũ `claude/handover-next-task-8f81b2`, `claude/handover-continuation-f32d2a` chỉ còn là bản sao cũ – không cần dùng; đừng xóa nếu chưa hỏi.
- **Máy chủ `npm run dev` của chủ dự án chạy ở thư mục gốc (nhánh `main`, cổng 5173, `--host`)** và tự cập nhật khi `main` đổi (gộp xong chỉ cần tải lại trang trên điện thoại/tablet). Khi cần thử bản mới **trước** khi gộp: chạy dev server của worktree ở **cổng khác** (`npm run dev -- --port 5174 --strictPort`; thêm một mục trong `.claude/launch.json` để dùng `preview_start`, **đừng commit mục này**).
- Việc còn chờ chủ dự án (không chặn TASK-07): **duyệt nội dung mẫu** `docs/samples/G6.md`, `G7.md`, `G7.html`; **duyệt 40 sticker + trang phục + hình nền** (`/?gallery=1`); thử G1–G7, hộp quà, album trên điện thoại/tablet thật.

---

## 1. Cách bắt đầu phiên mới

Chủ dự án (PM, không phải lập trình viên, xưng “anh”, trao đổi **tiếng Việt**) chỉ cần nhắn:

```
Làm TASK-07
```

(hoặc “Đọc handover và thực hiện task tiếp theo”). Quy trình bắt buộc (CLAUDE.md mục 6) – đã áp dụng ở mọi TASK trước:

1. Đọc `CLAUDE.md`, `docs/PROGRESS.md`, rồi tài liệu TASK yêu cầu (với TASK-07: `docs/01_SPEC.md` mục 9, 10, 5, 6 và F06, F08, F10, F11, F12, F15, F16, F17, F18; `docs/data/levels.json` các khóa `benchmark`, `games`, `mathTopics`, `session`; `docs/04_ACCEPTANCE.md` TC-010, 023, 025, 026, 027 và bảng unit test bắt buộc cho `storage.ts`).
2. **Trình bày kế hoạch ngắn (file sẽ tạo/sửa, rủi ro, quyết định cần chủ dự án góp ý) và chờ “Đồng ý”** rồi mới viết code.
3. Làm từng bước nhỏ, chạy `npm run lint` + `npm run test` sau mỗi bước lớn; giao diện thì tự xem bằng ảnh chụp Playwright ở 3 khung hình.
4. Cuối TASK: cập nhật `docs/PROGRESS.md` (trạng thái + nhật ký trên cùng), commit Conventional Commits, push, báo cáo ngắn bằng tiếng Việt (đã làm gì, cách thử trên máy thật, điểm cần quyết định).

> Nếu phiên mới chạy trong **git worktree** mới: thư mục chưa có `node_modules` → chạy `npm ci` trước.

---

## 2. Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| TASK-00 → TASK-05 | **Xong**, đã ở `main` |
| TASK-06 | **Xong**, đã gộp vào `main` và push |
| Tiếp theo | **TASK-07: khu phụ huynh** |
| Sau đó | TASK-08 PWA + deploy · TASK-09 QA · TASK-10 sửa lỗi |

- Repo: https://github.com/Nin-Min2231/nhanh-tay-tinh-mat (công khai), remote `origin`. Máy đã đăng nhập GitHub sẵn nên `git push` chạy thẳng (dùng `GIT_TERMINAL_PROMPT=0 timeout 90 git push` để không bị treo).
- Git user riêng cho repo: `Nin-Min2231` / `nguyennc1357@gmail.com`. Commit kèm dòng `Co-Authored-By: …` theo nhắc trong phiên.
- Test e2e: hai test cũ phụ thuộc thời gian thực (**G1 TC-004**, **G3 TC-013**) thỉnh thoảng chập chờn khi chạy song song trên máy bận; chạy riêng thì pass. Chạy đủ bộ nên dùng `npx playwright test --workers=3` và chạy lại riêng test lỗi trước khi kết luận có hồi quy.
- Chất lượng hiện tại: `npm run lint` pass · **409 unit test** (Vitest; 1 test sinh file mẫu bị bỏ qua khi chạy thường) · `npm run build` OK (JS ≈ 313 KB, **≈ 98 KB gzip**; giới hạn 350 KB) · **267 e2e** Playwright (89 test × 3 khung hình `phone` 360×740 / `tablet` 1280×800 / `tablet-portrait` 800×1280) đều pass (chạy đủ ≈ 9 phút với `--workers=3`).
- Home: **cả 7 game chơi được**; nhiệm vụ 3 nhóm, hộp quà, album, trang phục, hình nền, nghỉ đúng giờ **đã làm** (TASK-06).
- Chưa làm: khu phụ huynh + Khóa PH + biểu đồ + sao lưu + bài đo tuần (TASK-07; route `/parent-gate`, `/parent/:tab` hiện là trang “Đang xây dựng” – `UnderConstruction` trong `App.tsx`), PWA icon/offline/deploy (TASK-08).

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
    e2e.ts                 # cờ ?e2e=1 / ?debug=1 / ?freeze=1 / ?gallery=1 (chỉ dev hoặc build VITE_E2E)
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
- Chạy e2e: `npm run test:e2e` – Playwright tự build **bản riêng cho e2e** vào `dist-e2e/` (`VITE_E2E=true`) rồi `vite preview` cổng 4173. Bản deploy thật **không** có các cờ test. Dùng `npx playwright test <tên file> --project=phone --reporter=line` để chạy gọn.
- Cờ trên URL (chỉ hoạt động ở dev / build e2e):
  - `?e2e=1` – rút lượt G1/G3/G5 ×10, thời gian mỗi câu G6/G7 ×10, **cửa sổ nghỉ 30 s → 3 s**, seed cố định (`&seed=N`), game ghi `data-*`. Không có `?e2e=1` thì chạy thời gian thật nhưng vẫn ghi `data-*`.
  - `?debug=1` – bảng chỉnh nhanh độ khó/tùy chọn ở màn Giới thiệu + đồng hồ FPS ở HUD canvas + (Home) công cụ thử thưởng.
  - `?freeze=1` – G3: thú đứng yên.
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

---

## 8. Việc cần chủ dự án tự làm / còn chờ (chưa có ai kiểm trên máy thật)

Ghi trong `docs/PROGRESS.md` từng TASK, tóm tắt:
- **Duyệt nội dung G6/G7** bằng `docs/samples/`.
- **Duyệt hình TASK-06**: 40 sticker, 2 trang phục, 2 hình nền (`?gallery=1`); quyết định **Nhạc Cụ Gõ + Cú Mèo** (làm ở TASK-10 hay bỏ).
- Thử trên **điện thoại Android** và **tablet Samsung** (Chrome, cùng wifi): cảm giác chơi G1–G7, **FPS thật** của G1/G3/G5 bằng `?debug=1`, TC-007 (2 ngón vào nốt đôi G5), TC-032, TC-033 (vuốt Quay lại), TC-034 (chia đôi màn hình/cửa sổ nổi), TC-035 (tablet không rung → lắc hình + âm “bụp”), TC-028 (G1 đen trắng); **hộp quà + album + nhiệm vụ + nghỉ đúng giờ** (cách thử từng bước ở PROGRESS, TASK-06).
- Mở bằng `http://192.168.x.x` thì chưa cài được PWA/offline (cần https GitHub Pages ở TASK-08).
- Việc GitHub cần chủ dự án bấm (TASK-08): bật Pages với Source = GitHub Actions – hướng dẫn từng bước sẽ viết vào PROGRESS.

---

## 9. Nợ kỹ thuật / đề xuất đã ghi nhận

- Home tablet ngang phải cuộn (4 cột nhưng mỗi nhóm chỉ 2–3 thẻ) → có thể xếp 3 nhóm cạnh nhau (TASK-10 nếu chủ dự án muốn).
- Biểu tượng thẻ G1, G2 phẳng hơn G3–G7 → nâng cấp cùng phong cách (TASK-10).
- G5: nếu máy yếu, vẽ nền tĩnh (làn, vạch) vào lớp canvas riêng.
- **Kích thước JS** ≈ 98 KB gzip → tách gói tải sau (dynamic import) cho từng game, Album/sticker/hình nền và Chart.js khi làm PWA (TASK-08).
- Tên sticker trong Album 16px (nhỏ hơn mức 18px của SPEC) – đã có phóng to khi chạm.
- Tỷ lệ độ hiếm thật ≈ 66 / 28,3 / 5,7 do “bảo đảm Hiếm” (SPEC không thể đúng cả 70/25/5 lẫn bảo đảm) – nếu cần chỉnh: `rollRarity` trong `rewards.ts`.
- Bộ âm Nhạc Cụ Gõ + Linh vật Cú Mèo: đã mở khóa nhưng chưa dùng được.
- G6: M11 tìm số thiếu ra số lớn (chủ đề lớp 3, không mặc định); G7 cấp 5 chưa có lời giải thích riêng cho hai nhịp lặp khác nhau.
- Chưa có: `updateAvailable`/SW (TASK-08), `DailyAggregate` + dọn bản ghi > 120 ngày (TASK-07).
- Manifest PWA chưa có icon; `gh` CLI chưa đăng nhập (chưa cần).
- Thư viện cài ngoài danh sách CLAUDE.md đã được chấp nhận: `@types/node`, `@eslint/js`, `typescript-eslint`, `globals`, `eslint-config-prettier`. Phiên bản mới nhất: Vite 8, Preact 11, TypeScript 6, ESLint 10, Vitest 5, vite-plugin-pwa 2 (chạy ổn).

---

## 10. Lệnh thường dùng

```bash
npm install            # (worktree mới: npm ci)
npm run dev            # http://localhost:5173 (+ địa chỉ Network cho điện thoại/tablet)
npm run lint           # eslint + tsc --noEmit
npm test               # Vitest (409 test)
npm run build          # production
npm run test:e2e       # Playwright 3 khung hình (tự build dist-e2e)
npm run samples        # sinh docs/samples/G6.md, G7.md, G7.html
npx playwright test rewards --project=phone --reporter=line   # chạy 1 file / 1 khung hình
git add -A && git commit -m "feat: …" && GIT_TERMINAL_PROMPT=0 timeout 90 git push
```
