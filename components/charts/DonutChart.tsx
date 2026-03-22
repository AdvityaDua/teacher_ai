"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold mb-1" style={{ color: d.payload.color }}>{d.name}</p>
      <p className="text-slate-700 dark:text-slate-200 font-bold">{d.value.toLocaleString()}</p>
    </div>
  );
};

export default function DonutChart({ data }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
          formatter={(v) => <span className="text-slate-500 dark:text-slate-400">{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
