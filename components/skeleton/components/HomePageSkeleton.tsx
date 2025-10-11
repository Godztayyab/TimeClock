import StatisticsCardSkeleton from "../atomic/StatisticsCardSkeleton"

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-6 animate-pulse">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
         <StatisticsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function QuickActionsGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 md:row-span-2">
        <div className="h-[400px] bg-white rounded-lg border animate-pulse" />
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded mt-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdminSectionSkeleton() {
  return (
    <div className="space-y-4 bg-white rounded-2xl p-6 shadow-sm border animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-6">
            <div className="space-y-4">
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}