import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { DailyStats } from '@/types/routine';
import { TrendingUp, Target, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ProgressChartsProps {
  stats: DailyStats[];
  todayProgress: {
    done: number;
    skip: number;
    pending: number;
    percentage: number;
  };
}

export const ProgressCharts = ({ stats, todayProgress }: ProgressChartsProps) => {
  const primaryColor = 'hsl(262, 83%, 58%)';
  const accentColor = 'hsl(316, 70%, 50%)';
  const successColor = 'hsl(142, 76%, 45%)';
  const skipColor = 'hsl(240, 8%, 30%)';
  const mutedColor = 'hsl(240, 10%, 14%)';

  const avgCompletion = stats.length > 0
    ? Math.round(stats.reduce((sum, s) => sum + s.percentage, 0) / stats.length)
    : 0;

  const totalDone = stats.reduce((sum, s) => sum + s.done, 0);

  // Today's doughnut data
  const todayData = {
    labels: ['Done', 'Skipped', 'Pending'],
    datasets: [
      {
        data: [todayProgress.done, todayProgress.skip, todayProgress.pending],
        backgroundColor: [successColor, skipColor, mutedColor],
        borderWidth: 0,
        cutout: '80%',
        borderRadius: 10,
        spacing: 5
      }
    ]
  };

  // Weekly trend data
  const weeklyData = {
    labels: stats.map(s => {
      const date = new Date(s.date);
      return date.toLocaleDateString('en-IN', { weekday: 'short' });
    }),
    datasets: [
      {
        label: 'Efficiency',
        data: stats.map(s => s.percentage),
        borderColor: primaryColor,
        backgroundColor: (context: any) => {
          const char = context.chart;
          const { ctx, chartArea } = char;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'hsla(262, 83%, 58%, 0)');
          gradient.addColorStop(1, 'hsla(262, 83%, 58%, 0.2)');
          return gradient;
        },
        fill: true,
        tension: 0.5,
        pointBackgroundColor: primaryColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        cornerRadius: 12,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'hsla(0, 0%, 100%, 0.4)', font: { size: 11, weight: '600' as const } }
      },
      y: {
        grid: { color: 'hsla(0, 0%, 100%, 0.05)' },
        ticks: { color: 'hsla(0, 0%, 100%, 0.4)', font: { size: 11 } },
        beginAtZero: true,
        max: 100
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tighter text-gradient uppercase italic">Consistency</h2>
        <p className="text-muted-foreground text-sm font-medium tracking-wide">
          Your journey to a better version of yourself
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Today', value: `${todayProgress.percentage}%`, icon: Target, color: 'text-primary' },
          { label: 'Avg Efficiency', value: `${avgCompletion}%`, icon: TrendingUp, color: 'text-accent' },
          { label: 'Total Done', value: totalDone, icon: Award, color: 'text-success' }
        ].map((stat, i) => (
          <div key={i} className="glass-premium p-6 rounded-[2rem] flex flex-col items-center text-center group hover:scale-[1.02] transition-transform">
            <div className={cn("w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4 group-hover:animate-float", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black tracking-tighter leading-none mb-1">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's progress doughnut */}
        <div className="glass-premium p-8 rounded-[2.5rem] flex flex-col items-center border-primary/10">
          <h3 className="text-lg font-black uppercase tracking-widest text-white/80 self-start mb-8 italic">Focus Score</h3>
          <div className="relative w-full aspect-square max-w-[240px]">
            <Doughnut data={todayData} options={{ ...chartOptions, cutout: '82%' } as any} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-tighter text-gradient leading-none">{todayProgress.percentage}%</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Daily Goal</span>
            </div>
          </div>
          <div className="flex gap-4 mt-8 flex-wrap justify-center">
            {[
              { label: `Done (${todayProgress.done})`, color: 'bg-success' },
              { label: `Skip (${todayProgress.skip})`, color: 'bg-skip' },
              { label: `Left (${todayProgress.pending})`, color: 'bg-muted' }
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-white/5">
                <div className={cn("w-2 h-2 rounded-full", l.color)} />
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly trend line */}
        <div className="glass-premium p-8 rounded-[2.5rem] flex flex-col border-primary/10">
          <h3 className="text-lg font-black uppercase tracking-widest text-white/80 mb-8 italic">Efficiency Stream</h3>
          <div className="flex-1 min-h-[250px] w-full">
            {stats.length > 0 ? (
              <Line data={weeklyData} options={chartOptions as any} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center text-muted-foreground mb-4">
                  <TrendingUp className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-sm font-bold text-muted-foreground/60">No data streams found yet.</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mt-1">Consistency creates flow.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
