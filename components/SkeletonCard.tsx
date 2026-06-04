export function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>
      <div className="w-1/2 h-8 bg-gray-200 rounded mb-4"></div>
      <div className="w-1/4 h-3 bg-gray-200 rounded"></div>
    </div>
  );
}
