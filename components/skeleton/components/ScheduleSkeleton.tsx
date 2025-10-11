export function ScheduleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
      <div className="grid grid-cols-7 gap-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  )
}