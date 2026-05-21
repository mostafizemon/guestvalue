export function SkeletonCard() {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-1/3 h-4 bg-[#222] rounded"></div>
        <div className="w-5 h-5 bg-[#222] rounded-full"></div>
      </div>
      <div className="w-1/2 h-8 bg-[#222] rounded mb-2"></div>
      <div className="w-1/4 h-3 bg-[#222] rounded"></div>
    </div>
  );
}
