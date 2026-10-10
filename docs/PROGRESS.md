# PROGRESS – Nhật ký tiến độ

> Claude Code: đọc file này đầu mỗi phiên; cập nhật cuối mỗi TASK (ghi mới lên trên cùng của mục Nhật ký).

## Trạng thái hiện tại

| TASK | Trạng thái | Ngày | Ghi chú |
|---|---|---|---|
| TASK-00 Môi trường + Git/GitHub | Xong | 2026-10-10 | Repo: https://github.com/Nin-Min2231/nhanh-tay-tinh-mat |
| TASK-01 Khởi tạo dự án | Xong | 2026-10-10 | lint/test/build/e2e đều pass |
| TASK-02 Khung app | Chưa bắt đầu | | |
| TASK-03 G1 + G2 + độ khó | Chưa bắt đầu | | |
| TASK-04 G3 + G4 + G5 | Chưa bắt đầu | | |
| TASK-05 G6 + G7 | Chưa bắt đầu | | |
| TASK-06 Thưởng | Chưa bắt đầu | | |
| TASK-07 Khu phụ huynh | Chưa bắt đầu | | |
| TASK-08 PWA + deploy | Chưa bắt đầu | | |
| TASK-09 QA | Chưa bắt đầu | | |
| TASK-10 Sửa lỗi | Chưa bắt đầu | | |

## Câu hỏi mở (chờ chủ dự án)

- Không còn câu hỏi chặn. R23–R25 (mới v1.2) áp dụng theo đề xuất; chủ dự án có thể góp ý trong quá trình làm.

## Đề xuất (ngoài phạm vi, để sau)

-

## Nhật ký

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
