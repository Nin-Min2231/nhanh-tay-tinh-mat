// Vẽ biểu đồ tiến bộ bằng Chart.js (đóng gói sẵn, không CDN). Module này chỉ được nạp khi mở tab Tiến bộ
// (dynamic import) và chỉ đăng ký các thành phần cần dùng để gói nhỏ.
import {
  CategoryScale,
  Chart,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
);

export interface ChartInput {
  labels: string[];
  values: (number | null)[];
  levels: number[];
  metricLabel: string;
  levelLabel: string;
  /** Định dạng giá trị chỉ số cho trục và chú thích. */
  format: (v: number) => string;
}

const METRIC_COLOR = '#1565c0';
const LEVEL_COLOR = '#e65100';

export function renderChart(canvas: HTMLCanvasElement, input: ChartInput): Chart {
  Chart.defaults.font.family = "'Nunito', system-ui, sans-serif";
  Chart.defaults.font.size = 14;
  Chart.defaults.color = '#263238';
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: input.labels,
      datasets: [
        {
          label: input.metricLabel,
          data: input.values,
          borderColor: METRIC_COLOR,
          backgroundColor: METRIC_COLOR,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.25,
          spanGaps: true,
          yAxisID: 'y',
        },
        {
          label: input.levelLabel,
          data: input.levels,
          borderColor: LEVEL_COLOR,
          backgroundColor: LEVEL_COLOR,
          borderWidth: 2,
          borderDash: [6, 4],
          pointStyle: 'rectRot',
          pointRadius: 4,
          tension: 0,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 12 } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y;
              if (v === null || Number.isNaN(v)) return ctx.dataset.label ?? '';
              const text =
                ctx.datasetIndex === 0 ? input.format(v) : String(Math.round(v * 10) / 10);
              return `${ctx.dataset.label ?? ''}: ${text}`;
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          position: 'left',
          beginAtZero: false,
          ticks: { callback: (v) => input.format(Number(v)), maxTicksLimit: 6 },
        },
        y1: {
          position: 'right',
          min: 0,
          max: 10,
          ticks: { stepSize: 2 },
          grid: { drawOnChartArea: false },
        },
      },
    },
  });
}
