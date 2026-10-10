import { render } from 'preact';
import './ui/theme.css';
import { vi } from './i18n/vi';

// TODO (TASK-02): thay trang Hello bằng App thật (router, store, đăng ký SW).
function Hello() {
  return (
    <main style={{ padding: '32px 16px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--font-title)', fontWeight: 800, margin: 0 }}>{vi.app.title}</h1>
      <p>{vi.app.tagline}</p>
    </main>
  );
}

render(<Hello />, document.getElementById('app')!);
