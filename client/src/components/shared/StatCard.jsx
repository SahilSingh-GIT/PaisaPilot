export default function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        {Icon && (
          <div className="h-8 w-8 rounded-md bg-zinc-900 flex items-center justify-center border border-zinc-800">
            <Icon className="h-4 w-4 text-zinc-300" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <div className="flex items-center mt-1">
          {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
          {trend !== undefined && (
            <span className={`ml-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
