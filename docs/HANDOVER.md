# HANDOVER – Bàn giao sang phiên làm việc mới

> Viết ngày 2026-10-10, sau khi hoàn thành TASK-05. Đọc file này **sau** `CLAUDE.md` và `docs/PROGRESS.md`.
> Mục đích: để phiên mới (Claude Code Desktop, tab Code, Local) làm tiếp **TASK-06** mà không phải đoán lại ngữ cảnh.

---

## 1. Cách bắt đầu phiên mới

Chủ dự án (PM, không phải lập trình viên, xưng “anh”, trao đổi **tiếng Việt**) chỉ cần nhắn:

```
Làm TASK-06
```

(hoặc “Đọc handover và thực hiện task tiếp theo”). Quy trình bắt buộc (CLAUDE.md mục 6) – đã áp dụng ở mọi TASK trước:

1. Đọc `CLAUDE.md`, `docs/PROGRESS.md`, rồi tài liệu TASK yêu cầu (với TASK-06: `docs/01_SPEC.md` mục 7, 8 và F13, F14, F20; `docs/data/levels.json` các khóa `rewards`, `unlocks`; `docs/04_ACCEPTANCE.md` TC-021, 022, 030).
2. **Trình bày kế hoạch ngắn (file sẽ tạo/sửa, rủi ro, quyết định cần chủ dự án góp ý) và chờ “Đồng ý”** rồi mới viết code.
3. Làm từng bước nhỏ, chạy `npm run lint` + `npm run test` sau mỗi bước lớn; giao diện thì tự xem bằng ảnh chụp Playwright ở 3 khung hình.
4. Cuối TASK: cập nhật `docs/PROGRESS.md` (trạng thái + nhật ký trên cùng), commit Conventional Commits, push, báo cáo ngắn bằng tiếng Việt (đã làm gì, cách thử trên máy thật, điểm cần quyết định).

> Nếu phiên mới chạy trong **git worktree** mới: thư mục chưa có `node_modules` → chạy `npm ci` trước.

---

## 2. Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| TASK-00 → TASK-05 | **Xong** (commit cuối: `feat: G6 apple math with error book, G7 pattern puzzles with unique-answer solver`) |
| Tiếp theo | **TASK-06: nhiệm vụ, hộp quà, album** |
| Sau đó | TASK-07 khu phụ huynh · TASK-08 PWA + deploy · TASK-09 QA · TASK-10 sửa lỗi |

- Repo: https://github.com/Nin-Min2231/nhanh-tay-tinh-mat (công khai), nhánh `main`, remote `origin`. Máy đã đăng nhập GitHub sẵn nên `git push` chạy thẳng (dùng `GIT_TERMINAL_PROMPT=0 timeout 90 git push` để không bị treo).
- Git user riêng cho repo: `Nin-Min2231` / `nguyennc1357@gmail.com`. Commit kèm dòng `Co-Authored-By: …` theo nhắc trong phiên.
- Lịch sử: `9e27852` docs → `7c69cbc` scaffold → `ab46084` app shell (TASK-02) → `76ec054` G1+G2 (TASK-03) → `6aa2f82` G3+G4+G5 (TASK-04) → G6+G7 (TASK-05).
- Chất lượng hiện tại: `npm run lint` pass · **373 unit test** (Vitest; 1 test sinh file mẫu bị bỏ qua khi chạy thường) · `npm run build` OK (JS ≈ 188 KB, **≈ 64 KB gzip**) · **204 e2e** (Playwright, 68 test × 3 khung hình `phone` 360×740 / `tablet` 1280×800 / `tablet-portrait` 800×1280) đều pass.
- Home: **cả 7 game đều chơi được**.
- Chưa làm: nhiệm vụ/hộp quà/album (TASK-06), khu phụ huynh + Khóa PH + biểu đồ + sao lưu (TASK-07), PWA icon/offline/deploy (TASK-08). Album/Khu PH/Khóa PH hiện là trang “Đang xây dựng”.
- **Chủ dự án đang duyệt nội dung mẫu** `docs/samples/G6.md`, `G7.md`, `G7.html` (câu toán/logic có phù hợp bé lớp 2 không). Nếu có phản hồi: sửa `games/g6-math/topics.ts` hoặc `games/g7-patterns/puzzles.ts`, chạy `npm run samples` để sinh lại, chạy lại unit test.

---

## 3. Chủ dự án thích gì / dặn gì (quan trọng)

- **Hình ảnh luôn phải đẹp, chân thật, rực rỡ, nhiều tông màu nổi bật để trẻ thích** (dặn ở TASK-03 và TASK-04). Mọi hình mới (sticker, hộp quà, trang phục, hình nền…) phải vẽ chi tiết: chuyển sắc, vệt sáng, đổ bóng, viền mềm – **không dùng hình phẳng đơn điệu**. Chữ vẫn tối trên nền sáng để dễ đọc (tương phản AA); màu luôn kèm hình dạng/hoa văn (mù màu).
- Luôn **trình bày kế hoạch và chờ duyệt** trước khi code; hướng dẫn thao tác trên máy thật theo **từng bước đánh số**, không giả định kiến thức lập trình.
- Ghi rõ **quyết định tự chọn** để chủ dự án góp ý; việc ngoài phạm vi → ghi vào mục “Đề xuất” của `docs/PROGRESS.md`.
- Không có Excel nào được đẩy lên GitHub (`*.xlsx` bị `.gitignore`); file kế hoạch Excel chỉ ở thư mục gốc máy chủ dự án.

---

## 4. Kiến trúc & bản đồ mã (đọc nhanh)

Công nghệ đã chốt: Vite + TypeScript strict + Preact + `@preact/signals`; Canvas 2D cho game động (G1, G3, G5), DOM/SVG/CSS cho game tĩnh (G2, G4, G6, G7); `vite-plugin-pwa`; Chart.js; Nunito; Web Audio tự tổng hợp; `localStorage`; Vitest + Playwright (chỉ Chromium).

```
src/
  main.tsx                 # khởi động: router, back button, mount App
  i18n/vi.ts               # TẤT CẢ chuỗi giao diện (quy tắc 16) – kể cả chuỗi vẽ trong canvas/DOM của game
  app/
    types.ts               # AppState, Profile, RoundRecord… (SPEC mục 5)
    storage.ts             # localStorage có try/catch, schemaVersion, migration, bộ nhớ tạm khi lỗi
    store.ts               # signals + addProfile, recordRound (cộng sao/giờ, độ khó, sổ lỗi G6), audio/haptics singleton
    session.ts             # RoundClock (chỉ cộng giờ khi Running, nhắc 2 phút, hết giờ +90s) + giờ chơi trong ngày
    adaptive.ts / scoring.ts  # độ khó thích ứng (SPEC mục 6) / sao
    mathFacts.ts           # SỔ LỖI TOÁN (F19) thuần, có test: applyMathResults, dueFactKeys, prune, applyRoundToMath
    router.ts + routes.ts  # ngăn xếp màn hình tự quản + hash route; backButton.ts = nút Quay lại Android
    e2e.ts                 # cờ ?e2e=1 / ?debug=1 / ?freeze=1 (chỉ dev hoặc build VITE_E2E)
    rng.ts                 # mulberry32 có seed + randInt, pick, shuffle
    rewards.ts             # STUB RỖNG – TASK-06 làm
  games/
    levels.ts              # import docs/data/levels.json, kiểu an toàn (KHÔNG chép tay số liệu)
    registry.ts            # GAME_GROUPS + MODULES (cả 7 game đã đăng ký)
    common/                # types.ts (GameModule/Context/Result), CanvasStage, PointerInput (PointerGate),
                           # HintBubble, hud.ts (HUD canvas), sparkles.ts, Countdown, PauseOverlay
    g1-balls … g5-notes/   # mỗi game: config.ts · logic.ts (thuần, có test) · view.ts · index.ts
    g6-math/               # topics.ts (14 bộ sinh M01–M14 + inRange + khóa sổ lỗi) · question.ts (câu hỏi, đáp án nhiễu,
                           #   hình minh họa, đặt tính dọc) · logic.ts (G6Rules: 10 câu, chèn lại câu sai) · config.ts ·
                           #   format.ts (chữ hiển thị) · art.ts (táo/giỏ SVG) · illustrations.ts (khung 10 ô, lưới chấm,
                           #   đặt tính dọc, khối chục) · view.ts · logic.test.ts
    g7-patterns/           # elements.ts (Glyph/Num) · puzzles.ts (18 dạng câu + buildPuzzle + validatePuzzle) ·
                           #   solve.ts (BỘ GIẢI ĐỘC LẬP: liệt kê mọi lời giải của ô “?”) · logic.ts (G7Rules) · config.ts ·
                           #   art.ts (hình SVG có hoa văn) · view.ts · logic.test.ts
    samples.test.ts        # sinh docs/samples/* khi GEN_SAMPLES=1 (`npm run samples`); bình thường bị bỏ qua
  ui/
    App.tsx                # chọn màn hình + redirect hợp lệ
    screens/               # Home, GameIntro, Play (vòng đời lượt), Result, Rest, ProfileSelect, ProfileForm, UnderConstruction
    components/            # Button, Mascot (Sóc Bo 5 biểu cảm), Avatar (12), GameIcon, IntroAnimation, DebugPanel,
                           # Confetti, StarBurst, ProgressBar, Overlays…
    theme.css / app.css / games.css / games2.css   # bảng màu rực rỡ + style (games2.css = G6 + G7)
tests/e2e/                 # helpers.ts + framework.spec / games.spec / games2.spec / games3.spec (G6, G7)
docs/                      # SPEC, GAMES, TASKS, ACCEPTANCE, PROGRESS, data/levels.json, samples/, HANDOVER (file này)
```

### Hợp đồng game (docs/01_SPEC.md mục 4, đã triển khai)
`GameModule.create(host, ctx) → { start, pause, resume, destroy, finish? }`. `ctx` có: `level`, `options` (tùy chọn PH), `profile` (`grade`, `mathTopics`, `mathFacts`), `rng` (có seed), `audio`, `haptics`, `benchmark`, `timeScale`, `onFinish(result)`. `RoundResult = { score 0–1, durationMs, metrics, extra? }`.
- `finish?()` là phần mở rộng ngoài SPEC: host gọi khi chơi lố giờ quá 90 giây (game tự kết thúc với kết quả hiện có). G6/G7 kết thúc **ngay** (câu đang dở tính chưa làm).
- `timeScale` chỉ >1 khi chạy e2e (`?e2e=1` → 10): game dùng để rút ngắn **độ dài lượt** hoặc **thời gian mỗi câu** (G6/G7), không đổi độ khó thật. Nhịp phản hồi của G6/G7 chỉ rút xuống tối thiểu 40% (`fbScale`).
- `RoundResult.extra` được `recordRound` đọc: **G6 trả `extra.factResults`** (danh sách `{key, correct}` theo thứ tự trả lời) → `applyRoundToMath` cập nhật `profile.math.facts`. Game khác tự do dùng `extra` cho mục đích khác.
- Vòng đời lượt do `ui/screens/Play.tsx` điều phối: đếm ngược 3-2-1 → Running → tạm dừng (ẩn tab/xoay/resize/Quay lại) → kết thúc → `recordRound` (lưu `RoundRecord`, cộng sao, cộng giờ, `applyRound` độ khó, sổ lỗi G6) → `/result`.

### Quy ước làm game (rút từ TASK-03/04/05, nên theo)
1. **Logic thuần tách khỏi view** (`logic.ts`) + unit test; `config.ts` đọc `levelsConfig.games.Gx.levels` và ánh xạ nhãn tiếng Việt trong JSON sang enum/số.
2. Tùy chọn PH đọc qua `readGxOptions(ctx.options)` (bỏ giá trị lạ, mặc định an toàn) → `resolveGxParams(level, options)`.
3. Nhiều nguồn ngẫu nhiên → tách luồng riêng từ `ctx.rng` (`mulberry32((ctx.rng()*2**32)>>>0)`) để dãy đề không phụ thuộc kích thước màn hình.
4. Canvas: tạo `createCanvasStage`, vẽ sprite/gradient **một lần khi resize** rồi `drawImage`; **không tạo object/chuỗi/gradient mới mỗi khung hình** (quy tắc 17). Game DOM: tính bố cục trong `ResizeObserver` hoặc khi đổi câu (đọc `offsetHeight` một lần mỗi lần đổi câu thì được), cập nhật thanh thời gian bằng `style.transform`.
5. Chạm: `PointerGate('first')` hoặc `attachPointerInput`. Chạm sai luôn nhẹ nhàng: âm “bụp” + `haptics.wrong(el)` (lắc hình) + lời động viên, **không trừ sao**. G6/G7: chạm ra ngoài thẻ/táo không tính lỗi.
6. **Chống “click-through”**: game kết thúc bằng `pointerdown` thì màn Kết quả khóa nút 0,6 giây đầu (đã làm ở `Result.tsx`).
7. Hook cho e2e: chỉ ghi `host.dataset.*` khi `E2E.hooks` (dev/build e2e). G6/G7: `data-phase` (idle/ask/fly|celebrate/show|reveal/over), `data-q` (JSON câu hiện tại, có `correct` = chỉ số đáp án đúng), `data-stats`; nút đáp án có `data-i` và `data-correct`.
8. Mỗi game có **hình động giới thiệu** (`components/IntroAnimation.tsx`), **biểu tượng thẻ** (`GameIcon.tsx`), **dòng kết quả** (`vi.games.Gx.lines`), và tùy chọn trong `DebugPanel.tsx`.
9. Game DOM muốn dùng linh vật: `render(h(Mascot, {mood, size}), el)` (Preact vào phần tử thường) và **nhớ `render(null, el)` trong `destroy`**. Tránh mood `wave` ở chỗ chật (nó xoay cả hình, bị cắt mép).

---

## 5. Hạ tầng kiểm thử & cờ dev (rất hữu ích)

- Chạy dev: `npm run dev` (cổng 5173, mở ra mạng LAN để thử bằng điện thoại/tablet: `http://192.168.x.x:5173`). `.claude/launch.json` cấu hình cho Browser pane.
- Chạy e2e: `npm run test:e2e` – Playwright tự build **bản riêng cho e2e** vào `dist-e2e/` (`VITE_E2E=true`) rồi `vite preview` cổng 4173. Bản deploy thật **không** có các cờ test.
- Cờ trên URL (chỉ hoạt động ở dev / build e2e):
  - `?e2e=1` – rút lượt G1/G3/G5 ×10 (60 s → 6 s), thời gian mỗi câu G6/G7 ×10, seed cố định (`&seed=N`, mặc định 12345), game ghi `data-*`. **Không có `?e2e=1`** thì game chạy thời gian thật nhưng vẫn ghi `data-*` (dùng cho chụp ảnh).
  - `?debug=1` – bảng chỉnh nhanh ở màn Giới thiệu (Tự động/Cố định, cấp, min/max, tùy chọn từng game gồm chủ đề toán G6 và nhóm/đồng hồ G7) + đồng hồ FPS ở HUD canvas. UI phụ huynh thật làm ở TASK-07.
  - `?freeze=1` – G3: thú đứng yên.
- `tests/e2e/helpers.ts`: `seedProfiles` (gieo `ntm.state` qua `addInitScript`, chỉ khi chưa có dữ liệu), `makeProfile`, `withGame`, `startGame`, bot `playG1/playG2/g5Bot`, `readState/readRounds/lastRound`, `hidePage`, `E2E_URL`; **mới cho G6/G7:** `questionState` (đọc `data-phase/q/stats`), `waitForAsk(page, i)`, `tapSelector(page, selector)` (chạm bằng `touchscreen` thật), `solveDisplayedText` (tự tính đáp án từ đề “a ⊕ b = ?”).
- Mẫu e2e game mới: seed profile ở cấp/chế độ/tùy chọn cần thiết → `page.goto(E2E_URL)` → `startGame(page, 'G6')` → bot/tap → kiểm `lastRound(...).metrics` và `readState(...)`. Xem `games3.spec.ts`.
- Việc luôn làm trước khi báo xong: `npm run lint` (eslint + `tsc --noEmit`), `npm test`, `npm run build`, `npm run test:e2e`; rồi chụp ảnh 3 khung hình để tự xem giao diện (xem “Mẹo công cụ”).
- `npm run samples` (Vitest + `cross-env GEN_SAMPLES=1`) sinh lại `docs/samples/G6.md`, `G7.md`, `G7.html` (seed cố định – nội dung chỉ đổi khi sửa bộ sinh câu).

---

## 6. Việc cần làm: TASK-06 (nhiệm vụ, hộp quà, album)

Tài liệu nguồn: `docs/03_TASKS.md` mục TASK-06, `docs/01_SPEC.md` mục 7 (bảng quy tắc sao/nhiệm vụ/hộp/mở khóa), mục 8, F13, F14, F20; `docs/data/levels.json` (`rewards`, `unlocks`); `docs/04_ACCEPTANCE.md` TC-021, TC-022, TC-030.

Prompt TASK-06 (tóm tắt):
1. `rewards.ts` (thuần + RNG seed, có test): nhiệm vụ 3 nhóm/ngày → 1 hộp; hộp mỗi khi `totalStars` vượt bội số 15; giới hạn hộp/ngày (mặc định 3, PH chỉnh 0–5, hộp PH tặng không tính); độ hiếm **70/25/5** (24/12/4 sticker); bảo đảm Hiếm sau 5 hộp (`boxes.sinceLastRare`); trùng → +3 sao (vẫn tăng số lượng “×2”); mốc mở khóa theo tổng sao (10, 25, 50, 80, 120, 170, 230, 300). **Mô phỏng 10.000 hộp kiểm tra tỷ lệ ±2%.**
2. UI: 3 ô nhiệm vụ trên Home (đánh dấu khi xong – hiện đang **tĩnh**, xem `MISSIONS` trong `Home.tsx`), modal mở hộp quà (lắc → bung → sticker), Album 40 sticker SVG tự vẽ (`stk-01` … `stk-40`, độ hiếm khai báo trong `rewards.ts`) + tab Trang phục/Hình nền, áp dụng trang phục cho linh vật (`profile.outfitId`, `backgroundId`).
3. Màn nghỉ (`ui/screens/Rest.tsx`): nút “Con nghỉ đây” +2 sao trong 30 giây (1 lần/ngày – `DayUsage.restOnTimeRewarded`), gợi ý vận động, mở hộp còn lại. **Hộp mở được cả khi đã hết giờ.**
Không làm: khu phụ huynh (phần tặng hộp/thời gian ở TASK-07).

Điểm kỹ thuật cần lưu ý:
- Dữ liệu đã có sẵn trong `Profile`: `totalStars`, `unlocked`, `outfitId`, `backgroundId`, `stickers: Record<string, number>`, `boxes: { pending, openedTotal, sinceLastRare }`, và `DayUsage` (`missions: { reflex, focus, learn, rewarded }`, `boxesEarned`, `starsToday`, `restOnTimeRewarded`). Nếu đổi cấu trúc → **viết migration + test** (quy tắc 12).
- `store.recordRound` (`app/store.ts`) là chỗ hợp lý để đánh dấu nhiệm vụ nhóm đã xong (nhóm của game: `groupOf(gameId)` trong `games/registry.ts`) và cộng hộp theo mốc 15 sao; trả thêm thông tin cho màn Kết quả nếu cần hiện “Con nhận được hộp quà!”. Nhớ: sao chỉ tăng, không bao giờ giảm.
- Mọi random (độ hiếm, chọn sticker) dùng `rng.ts` có seed (quy tắc 14). Sticker/hộp/trang phục là hình mới ⇒ phải **đẹp, rực rỡ, bóng bẩy** (mục 3); xem `g3-pets/art.ts`, `g6-math/art.ts`, `g7-patterns/art.ts` làm mẫu.
- Không mua bằng tiền thật, không quảng cáo (quy tắc 2).

---

## 7. Điều đã học – bẫy hay gặp (đừng lặp lại)

**Môi trường công cụ**
- Lệnh Bash chứa **heredoc nhiều dòng có dấu nháy đơn `'`** trong thân thường bị lỗi “unexpected EOF”. Cách ổn định: dùng công cụ **Write** để tạo file (kể cả script Python rồi chạy `python3 file.py`); sửa nhỏ thì `python3 - <<'PY' … PY` với nội dung không có `'` lệch cặp. Tool **Write/Edit yêu cầu Read file trước** (đặc biệt sau khi prettier sửa file).
- `rm -f "$BIẾN"/*.png` bị chặn bởi kiểm tra an toàn (biến có thể rỗng). Dùng đường dẫn cố định hoặc bỏ qua việc xóa (ảnh chụp mới tự ghi đè).
- Chạy `npx prettier --write "src/**/*.{ts,tsx,css}" "tests/**/*.ts"` trước khi lint (nó đổi file nên các Edit sau phải Read lại).
- Windows: dùng `cross-env`, đường dẫn bằng `path.join`; import JSON luôn kèm `with { type: 'json' }`. In tiếng Việt từ Python cần `PYTHONIOENCODING=utf-8`.
- Dev server tạm phải tắt bằng PowerShell `Get-NetTCPConnection -LocalPort … | Stop-Process`; preview của Browser pane thì `preview_stop`.
- Pane trình duyệt nhúng có khung hình 780×450 không khớp viewport giả lập → **chụp ảnh bằng Playwright** (spec tạm `tests/e2e/tmp-*.spec.ts` ghi ảnh vào thư mục scratchpad qua biến `SHOT_DIR`, **xóa spec tạm trước khi commit**) rồi đọc ảnh bằng Read.
- Vitest mặc định timeout 5 giây; đã nâng lên 30 giây trong `vite.config.ts` cho các test sinh 1.000 câu. Bộ giải G7 dãy số chỉ duyệt ứng viên đến `3×max+20` (đừng nới tùy tiện kẻo test chậm).

**Kỹ thuật**
- **TDZ**: callback `onResize` của `createCanvasStage` chạy đồng bộ lúc tạo → mọi biến nó dùng phải khai báo **trước** `createCanvasStage`. Với game DOM dùng `ResizeObserver` cũng vậy (callback chạy sau, nhưng biến phải có).
- Nút Quay lại Android: lịch sử trình duyệt chỉ được “gài” sau **tương tác đầu tiên** (`pointerup`); `hashchange` do popstate phải bị bỏ qua (xem `router.ts`).
- Game kết thúc bằng `pointerdown` → click giả rơi vào nút màn Kết quả (đã chặn 0,6 s).
- Banner nhắc giờ trong lúc chơi phải là **lớp phủ** (không đẩy bố cục).
- `noUncheckedIndexedAccess` bật: mọi truy cập mảng/record cần `?? …` hoặc `as T`.
- Test e2e có thời gian: dùng bot chạy **trong trang** hoặc chờ bằng `expect.poll` theo `data-phase`; với G6/G7 chờ `waitForAsk` thay vì `waitForTimeout`.
- Mật độ/khoảng đo trong test sinh ngẫu nhiên: dùng nhiều seed + dung sai, không khẳng định theo 1 seed.
- **SVG chỉ có `viewBox` mà CSS để `width:auto` sẽ co về 0** khi nằm trong flex: luôn đặt `width` (vd `min(100%, 400px)`). Gradient/pattern/`<use>` dùng chung: khai báo `<defs>` **một lần** trong vùng chơi, id có tiền tố riêng từng game (`g6-…`, `g7-…`); id trùng trong cùng trang chỉ an toàn khi nội dung giống hệt.
- CSS: dùng thuộc tính riêng `translate` (vị trí cố định của táo) và `transform` (hiệu ứng) để hai thứ không đè nhau; hiệu ứng đung đưa chỉ đặt lên phần thân, **nút chạm giữ nguyên kích thước**.
- Bố cục phụ thuộc kích thước thật: đo `offsetHeight` của phần đầu (thanh tiến độ, bóng nói) một lần khi đổi câu/resize; **giữ chiều cao bóng nói cố định** (min-height) để lời giải thích không làm cả màn nhảy.
- Sinh câu hỏi “đúng 1 đáp án”: **đừng chỉ kiểm bằng chính bộ sinh** – dùng bộ giải độc lập (G7 `solve.ts`; G6 test `satisfies()` thay từng đáp án vào phép tính).

---

## 8. Việc cần chủ dự án tự làm / còn chờ (chưa có ai kiểm trên máy thật)

Ghi trong `docs/PROGRESS.md` từng TASK, tóm tắt:
- **Duyệt nội dung G6/G7** bằng `docs/samples/` (ưu tiên số 1 cho TASK-05).
- Thử trên **điện thoại Android** và **tablet Samsung** (Chrome, cùng wifi, `npm run dev`): cảm giác chơi G1–G7, **FPS thật** của G1/G3/G5 bằng `?debug=1` (Galaxy Tab dòng A – mục tiêu ≥ 50–60 fps), TC-007 (2 ngón vào nốt đôi G5), TC-032 (G5 điện thoại dọc 2 ngón cái), TC-033 (vuốt Quay lại), TC-034 (chia đôi màn hình/cửa sổ nổi), TC-035 (tablet không rung → lắc hình + âm “bụp”), TC-028 (G1 chuyển ảnh đen trắng).
- Mở bằng `http://192.168.x.x` thì chưa cài được PWA/offline (cần https GitHub Pages ở TASK-08).
- Việc GitHub cần chủ dự án bấm (TASK-08): bật Pages với Source = GitHub Actions – hướng dẫn từng bước sẽ viết vào PROGRESS.

---

## 9. Nợ kỹ thuật / đề xuất đã ghi nhận

- Home tablet ngang phải cuộn (4 cột nhưng mỗi nhóm chỉ 2–3 thẻ) → có thể xếp 3 nhóm cạnh nhau (TASK-10 nếu chủ dự án muốn).
- Biểu tượng thẻ G1, G2 phẳng hơn G3–G7 → nâng cấp cùng phong cách (TASK-10).
- G5: nếu máy yếu, vẽ nền tĩnh (làn, vạch) vào lớp canvas riêng.
- **Kích thước JS** ≈ 64 KB gzip (tăng gấp đôi sau G6/G7) → tách gói tải sau cho từng game (dynamic import) khi làm PWA (TASK-08).
- G6: M11 tìm số thiếu ra số lớn (chủ đề lớp 3, không mặc định); G7 cấp 5 chưa có lời giải thích riêng cho hai nhịp lặp khác nhau.
- `adaptive.ts`/`scoring.ts`/`session.ts`/`mathFacts.ts` đã có test; **chưa có**: `rewards.ts` (stub rỗng, TASK-06), nhiệm vụ 3 ô trên Home (đang tĩnh), `updateAvailable`/SW (TASK-08), `DailyAggregate` + dọn bản ghi > 120 ngày (TASK-07).
- Manifest PWA chưa có icon; `gh` CLI chưa đăng nhập (chưa cần).
- Thư viện cài ngoài danh sách CLAUDE.md đã được chấp nhận: `@types/node`, `@eslint/js`, `typescript-eslint`, `globals`, `eslint-config-prettier`. Phiên bản mới nhất: Vite 8, Preact 11, TypeScript 6, ESLint 10, Vitest 5, vite-plugin-pwa 2 (chạy ổn).

---

## 10. Lệnh thường dùng

```bash
npm install            # (worktree mới: npm ci)
npm run dev            # http://localhost:5173 (+ địa chỉ Network cho điện thoại/tablet)
npm run lint           # eslint + tsc --noEmit
npm test               # Vitest (373 test)
npm run build          # production
npm run test:e2e       # Playwright 3 khung hình (tự build dist-e2e)
npm run samples        # sinh docs/samples/G6.md, G7.md, G7.html
npx playwright test games3 --project=phone --reporter=line   # chạy 1 file / 1 khung hình
git add -A && git commit -m "feat: …" && GIT_TERMINAL_PROMPT=0 timeout 90 git push
```
