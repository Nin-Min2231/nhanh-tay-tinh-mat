# HANDOVER – Bàn giao sang phiên làm việc mới

> Viết ngày 2026-10-11, sau khi **làm xong TASK-07 (khu phụ huynh)** trên nhánh `claude/task-07-parent-area`. Đọc file này **sau** `CLAUDE.md` và `docs/PROGRESS.md`.
> Mục đích: để phiên mới (Claude Code Desktop, tab Code, Local) làm tiếp **TASK-09 (kiểm thử tự động & rà soát chất lượng)** mà không phải đoán lại ngữ cảnh.

---

## 0. Trạng thái git

- **TASK-00 → TASK-08 đã ở `main` và `origin/main`** (lịch sử thẳng: `9e27852` docs → `7c69cbc` scaffold → `ab46084` TASK-02 → `76ec054` TASK-03 → `6aa2f82` TASK-04 → `69aa393` TASK-05 → `c73b4a9` TASK-06 → `5fe6d64` handover → **`5999963` TASK-08 PWA + deploy**). **GitHub Pages đã bật và deploy chạy** (chủ dự án xác nhận 2026-10-11): https://nin-min2231.github.io/nhanh-tay-tinh-mat/ – **mỗi lần push `main` là một lần deploy**.
- **TASK-07 nằm trên nhánh `claude/task-07-parent-area`** (các commit `feat: parent-area data layer …`, `feat: parent area …`, `docs: …` đi sau `5999963`). **Có thể chưa gộp vào `main`** – kiểm bằng `git log origin/main --oneline -3`; nếu chưa, hỏi chủ dự án (gộp = `git -C <thư mục gốc> merge --ff-only claude/task-07-parent-area` rồi `git push origin main` = deploy bản 0.9.0, cũng là lần thử TC-029 – cập nhật). Nhánh TASK-09 nên xuất phát từ `main` đã có TASK-07.
- Các nhánh cũ (`claude/handover-next-task-8f81b2`, `claude/handover-continuation-f32d2a`, `claude/task-06-handover-09db84`, `claude/handover-file-task-5ad07c`) chỉ còn là bản sao cũ của `main` – không cần dùng; đừng xóa nếu chưa hỏi chủ dự án. **Phiên mới tạo nhánh/worktree mới từ `main`** (gợi ý tên `claude/task-09-qa`; worktree mới chưa có `node_modules` → `npm ci`).
- **Máy chủ `npm run dev` của chủ dự án chạy ở thư mục gốc (nhánh `main`, cổng 5173, `--host`, địa chỉ LAN `192.168.1.14`)** và tự cập nhật khi `main` đổi. Khi cần dev server của worktree: dùng **cổng khác** (`npm run dev -- --port 5174 --strictPort`; thêm một mục tạm trong `.claude/launch.json` để dùng `preview_start`, **đừng commit mục này**).
- Việc còn chờ chủ dự án (không chặn TASK-09): **thử khu phụ huynh + bài đo tuần + sao lưu/khôi phục trên máy thật**; **cài thử PWA** (TC-001/002/012; TC-029 sau bản 0.9.0); **duyệt icon** (`public/icons/icon-512.png`); **duyệt chữ R13** (`vi.parent.data.note`); **duyệt nội dung mẫu** `docs/samples/G6.md`, `G7.md`, `G7.html`; **duyệt 40 sticker + trang phục + hình nền** (`/?gallery=1` ở bản dev); quyết định **Nhạc Cụ Gõ + Cú Mèo**; thử G1–G7, hộp quà, album trên điện thoại/tablet thật.

---

## 1. Cách bắt đầu phiên mới

Chủ dự án (PM, không phải lập trình viên, xưng “anh”, trao đổi **tiếng Việt**) chỉ cần nhắn:

```
Làm TASK-09
```

(hoặc “Đọc handover và thực hiện task tiếp theo”). Quy trình bắt buộc (CLAUDE.md mục 6) – đã áp dụng ở mọi TASK trước:

1. Đọc `CLAUDE.md`, `docs/PROGRESS.md`, rồi tài liệu TASK yêu cầu (với TASK-09: `docs/03_TASKS.md` mục TASK-09, `docs/04_ACCEPTANCE.md` toàn bộ, `CLAUDE.md` mục 5 (17 quy tắc) và **mục 6 của file này**).
2. **Trình bày kế hoạch ngắn và chờ “Đồng ý”** rồi mới viết code. *Lưu ý:* ở TASK-07 chủ dự án đã dặn **“làm luôn không cần hỏi”** nên phiên đó bỏ bước chờ duyệt; lời dặn đó chỉ áp dụng cho lần đó – nếu chủ dự án lặp lại thì cứ làm luôn (vẫn ghi rõ các quyết định tự chọn), còn không thì theo CLAUDE.md. **Gộp `main` + push luôn phải hỏi** (push `main` = deploy công khai).
3. Làm từng bước nhỏ, chạy `npm run lint` + `npm run test` sau mỗi bước lớn; giao diện thì tự xem bằng ảnh chụp Playwright ở 3 khung hình.
4. Cuối TASK: cập nhật `docs/PROGRESS.md` (trạng thái + nhật ký trên cùng), commit Conventional Commits, push, báo cáo ngắn bằng tiếng Việt (đã làm gì, cách thử trên máy thật, điểm cần quyết định). Gộp vào `main` + push `main` **chỉ khi chủ dự án đồng ý** (cách đã dùng: commit trên nhánh task, `git -C <thư mục gốc> merge --ff-only <nhánh>`, rồi `git push origin main`). **Từ nay push `main` = tự động deploy lên GitHub Pages** (`deploy.yml`): chủ dự án thấy bản mới trên máy sau ~2 phút + bấm “Cập nhật” ở Home.

> Nếu phiên mới chạy trong **git worktree** mới: thư mục chưa có `node_modules` → chạy `npm ci` trước.

---

## 2. Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| TASK-00 → TASK-08 | **Xong**, đã ở `main` và `origin/main`; Pages đang chạy |
| TASK-07 Khu phụ huynh | **Xong** trên nhánh `claude/task-07-parent-area` (chờ chủ dự án đồng ý gộp `main`, thử trên máy thật) |
| Tiếp theo | **TASK-09 QA** (mục 6) |
| Sau đó | TASK-10 sửa lỗi theo góp ý của chủ dự án (mẫu lặp lại) |

- Repo: https://github.com/Nin-Min2231/nhanh-tay-tinh-mat (công khai), remote `origin`, Pages `https://nin-min2231.github.io/nhanh-tay-tinh-mat/` (`BASE_PATH=/nhanh-tay-tinh-mat/`). Máy đã đăng nhập GitHub sẵn nên `git push` chạy thẳng (dùng `GIT_TERMINAL_PROMPT=0 timeout 90 git push` để không bị treo). Xem trạng thái workflow không cần `gh`: đọc API công khai `https://api.github.com/repos/Nin-Min2231/nhanh-tay-tinh-mat/actions/runs`.
- Git user riêng cho repo: `Nin-Min2231` / `nguyennc1357@gmail.com`. Commit kèm dòng `Co-Authored-By: …` theo nhắc trong phiên.
- Test e2e: hai test cũ phụ thuộc thời gian thực (**G1 TC-004**, **G3 TC-013**) thỉnh thoảng chập chờn khi chạy song song trên máy bận; chạy riêng thì pass. Chạy đủ bộ nên dùng `npx playwright test --workers=3` (≈ 12–15 phút với 375 test) và chạy lại riêng test lỗi trước khi kết luận có hồi quy. *(TASK-09 nên ổn định hóa hai test này.)*
- Chất lượng hiện tại (nhánh TASK-07): `npm run lint` pass · **470 unit test** (Vitest; 1 test sinh file mẫu bị bỏ qua khi chạy thường) · `npm run build` OK (gói chính ≈ 370 KB, **≈ 114 KB gzip**; giới hạn 350 KB; Chart.js tách riêng ≈ 57 KB gzip, tải khi mở tab Tiến bộ; precache 17 mục ≈ 1 MB) · **375 e2e** Playwright (125 test × 3 khung hình `phone` 360×740 / `tablet` 1280×800 / `tablet-portrait` 800×1280) đều pass.
- Home: **cả 7 game chơi được**; nhiệm vụ, hộp quà, album, trang phục, hình nền, nghỉ đúng giờ (TASK-06); PWA cài được + offline + nút Cập nhật (TASK-08); **khu phụ huynh đầy đủ + bài đo tuần + banner “Thử thách tuần” (TASK-07)**.

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
    version.ts             # APP_VERSION (từ package.json lúc build) – hiện trong khu PH, tab Dữ liệu
    daily.ts               # (TASK-07) THUẦN + test: DailyAggregate (syncDaily: tính lại ngày có lượt chi tiết, giữ ngày cũ; KHÔNG gồm lượt bài đo),
                           #   pruneRounds (> 120 ngày; giữ lượt bài đo), PROGRESS_METRICS/BENCHMARK_METRIC (khóa chỉ số + “thấp hơn là tốt”),
                           #   buildSeries (dữ liệu biểu đồ: game × chỉ số × thiết bị × khoảng ngày), recentRounds
    benchmark.ts           # (TASK-07) THUẦN + test: hàng đợi bài đo (game chưa làm trong 7 ngày), benchmarkDue, compareBenchmarks (tuần đầu ↔ gần nhất)
    parentGate.ts          # (TASK-07) THUẦN + test: phép nhân a×b, sai 3 lần khóa 30 giây (rng + đồng hồ truyền vào)
    parentOps.ts           # (TASK-07) THUẦN + test: giveBonusTime/giveBoxes (+ rewardLog), setLimits, patchGameSettings, setGameOption, setGrade,
                           #   toggleMathTopic, removeProfileFromState, deleteConfirmed
    backup.ts              # (TASK-07) THUẦN + test: createBackup/parseBackup/stateForRestore/backupOverdue, tên file nhanhtay-backup-YYYYMMDD.json
    parentStore.ts         # (TASK-07) nối thuần ↔ store: parentUnlocked, benchmarkMode, startBenchmark, parentGive*/parentPatch*/parentSet*,
                           #   parentAdd/Edit/DeleteProfile, parentCreateBackup, parentRestore
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
    screens/               # Home, GameIntro, Play (vòng đời lượt), Result, Rest, Album, ProfileSelect, ProfileForm, ParentGate, ParentArea
    parent/                # (TASK-07) 6 tab khu PH: ProgressTab (+ chartRender.ts = Chart.js tải sau), BenchmarkTab, SettingsTab (+ gameOptions.ts),
                           #   ProfilesTab, RewardsTab, DataTab + state.ts (hồ sơ đang xem, định dạng số/ngày). Style: ui/parent.css
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

---

## 6. Việc cần làm: TASK-09 (kiểm thử tự động & rà soát chất lượng)

Tài liệu nguồn: `docs/03_TASKS.md` mục TASK-09, `docs/04_ACCEPTANCE.md` (35 TC), `CLAUDE.md` mục 5 (17 quy tắc). Prompt TASK-09 (tóm tắt):
1. Bổ sung e2e Playwright (phone + tablet) cho các TC đánh dấu “Tự động”, dùng `?e2e=1`.
2. Rà soát 17 quy tắc của CLAUDE.md mục 5: liệt kê vi phạm và sửa.
3. Rà soát accessibility: tương phản, vùng chạm, `prefers-reduced-motion`, màu + hình.
4. Kiểm bundle size, 60 fps G1/G3/G5 (ghi số liệu).
5. Xuất `docs/QA_REPORT.md`: bảng 35 TC (Tự động: Pass/Fail; Thủ công: cần chủ dự án test), lỗi đã sửa, rủi ro còn lại. Hoàn thành khi toàn bộ test pass, báo cáo hoàn chỉnh, đã deploy bản mới.

Gợi ý chuẩn bị (từ các nhật ký TASK-02 → TASK-07 trong `docs/PROGRESS.md`, mỗi nhật ký ghi rõ TC nào đã tự kiểm “Pass” và TC nào “mức mô phỏng/cần máy thật”):
- Lập bảng TC trước, đối chiếu với test e2e hiện có (`grep -rn "TC-0" tests/e2e`) để biết TC nào còn thiếu test tự động. Các TC đã có test: TC-003–006, 008, 009, 010, 011, 012 (phần tự động), 013–024 (trừ vài TC thủ công), 025–027, 030, 031, 033, 034 (mô phỏng); thủ công cần thiết bị thật: TC-001, 002, 007 (2 ngón thật), 028, 029, 032, 035, và phần thật của TC-033/034.
- **Ổn định hóa 2 test chập chờn**: G1 TC-004 và G3 TC-013 (nới dung sai hoặc hạ số luồng trong `playwright.config.ts`).
- Quy tắc cần kiểm kỹ: 1 (không request ra ngoài – đã có test NF05 và `pwa.spec.ts`; Chart.js/khu PH không gọi mạng), 8 (vùng chạm; khu PH dùng chữ 16–18px, tiêu đề 24px nhỏ hơn mức 28px của giao diện bé – ghi rõ là cố ý), 9 (màu kèm hình), 10 (tạm dừng), 11 (mọi `localStorage` qua `storage.ts`: `grep -rn "localStorage" src` chỉ nên thấy `storage.ts`), 13 (không tự reload), 14 (random ảnh hưởng điểm/thưởng dùng `rng.ts`: `parentGate` dùng rng có seed khi `?e2e=1`), 16 (chuỗi tiếng Việt chỉ ở `vi.ts`: tên chủ đề toán/phần thưởng lấy từ `levels.json` là dữ liệu, không tính; `grep` các chuỗi tiếng Việt cứng trong `src/**/*.tsx`).
- Accessibility đã biết: viewport có `user-scalable=no` (Lighthouse trừ điểm, chủ dự án chưa quyết định); khu PH có vai trò ARIA đơn giản (nav + `aria-current`, radiogroup, details/summary); tương phản chữ muted `#4d6270` trên trắng ≈ 6:1 (đạt AA) – nên đo lại bằng công cụ.
- Số liệu có sẵn: gói chính ≈ 114 KB gzip; khởi động offline FCP ≈ 100 ms (TASK-08); Lighthouse (TASK-08) Performance 83 · Accessibility 93 · Best Practices 81 · SEO 60 (noindex cố ý); 60 fps G1/G3/G5 mới đo bằng script (ms JS mỗi khung) – số thật cần máy thật (`?debug=1`).
- Muốn có “đã deploy bản mới”: gộp `main` (hỏi chủ dự án) và tăng `package.json` version (mỗi TASK một bản; hiện **0.9.0**).

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

---

## 8. Việc cần chủ dự án tự làm / còn chờ (chưa có ai kiểm trên máy thật)

Ghi trong `docs/PROGRESS.md` từng TASK, tóm tắt:
- **TASK-07**: cho phép gộp nhánh `claude/task-07-parent-area` vào `main` (= deploy 0.9.0); thử khu PH trên máy thật (khóa, biểu đồ, bài đo tuần, cài đặt, thưởng, **sao lưu → xóa dữ liệu trang → khôi phục**); **duyệt chữ R13**; quyết định bỏ `user-scalable=no` hay không.
- **TASK-08**: cài thử PWA lên điện thoại/Galaxy Tab bằng Chrome + chế độ máy bay (TC-001, 002, 012), mở thử bằng Samsung Internet; TC-029 (cập nhật) sau bản 0.9.0; **duyệt icon**.
- **Duyệt nội dung G6/G7** bằng `docs/samples/`.
- **Duyệt hình TASK-06**: 40 sticker, 2 trang phục, 2 hình nền (`?gallery=1`); quyết định **Nhạc Cụ Gõ + Cú Mèo** (làm ở TASK-10 hay bỏ).
- Thử trên **điện thoại Android** và **tablet Samsung**: cảm giác chơi G1–G7, **FPS thật** của G1/G3/G5 bằng `?debug=1`, TC-007 (2 ngón vào nốt đôi G5), TC-032, TC-033 (vuốt Quay lại), TC-034 (chia đôi màn hình/cửa sổ nổi), TC-035 (tablet không rung → lắc hình + âm “bụp”), TC-028 (G1 đen trắng); **hộp quà + album + nhiệm vụ + nghỉ đúng giờ** (cách thử từng bước ở PROGRESS, TASK-06).

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
- Khu PH: chưa có xuất CSV; nhắc sao lưu chỉ hiện trong khu PH (chưa nhắc ở Home); bộ đếm “sai 3 lần” nằm trong bộ nhớ (tải lại trang là thử lại được); `ParentArea` dùng nav + `aria-current` (chưa có điều hướng bằng phím mũi tên kiểu tablist).
- Gói chính tăng lên ≈ 114 KB gzip vì giao diện khu PH (6 tab) nằm cùng gói; có thể tách `ui/parent/*` thành gói tải sau nếu TASK-09 thấy cần (Chart.js đã tách).
- `AppState.installedVersion` chỉ ghi lúc tạo dữ liệu, chưa cập nhật khi app lên phiên bản mới (khu PH dùng `APP_VERSION` từ `version.ts`, không dùng trường này; nếu muốn biết “phiên bản đã từng cài”, thêm cập nhật khi mở app + test).
- Chưa kiểm trên **Samsung Internet** thật (TASK-08 chỉ kiểm bằng Chromium/Playwright); `gh` CLI chưa đăng nhập (chưa cần).
- Thư viện cài ngoài danh sách CLAUDE.md đã được chấp nhận: `@types/node`, `@eslint/js`, `typescript-eslint`, `globals`, `eslint-config-prettier`. Phiên bản mới nhất: Vite 8, Preact 11, TypeScript 6, ESLint 10, Vitest 5, vite-plugin-pwa 2 (chạy ổn).

---

## 10. Lệnh thường dùng

```bash
npm install            # (worktree mới: npm ci)
npm run dev            # http://localhost:5173 (+ địa chỉ Network cho điện thoại/tablet)
npm run lint           # eslint + tsc --noEmit
npm test               # Vitest (470 test)
npm run build          # production
npm run build:pages    # production với BASE_PATH=/nhanh-tay-tinh-mat/ (giống bản deploy)
npm run icons          # vẽ lại icon PWA vào public/icons/ (cần `npx playwright install chromium`)
npm run test:e2e       # Playwright 3 khung hình, 375 test (tự build dist-e2e + dist-e2e-base)
npm run samples        # sinh docs/samples/G6.md, G7.md, G7.html
npx playwright test rewards --project=phone --reporter=line   # chạy 1 file / 1 khung hình
git add -A && git commit -m "feat: …" && GIT_TERMINAL_PROMPT=0 timeout 90 git push
```
