export default function TierPageLoader() {
  return (
    <div className="space-y-8">
      {/* Current Tier Card Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse flex flex-col md:flex-row items-center gap-6">
          {/* Tier Image Skeleton */}
          <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
          
          {/* Tier Info Skeleton */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-100 rounded w-64"></div>
            <div className="h-4 bg-gray-100 rounded w-40"></div>
          </div>
          
          {/* Action Button Skeleton */}
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Upgrade Section */}
      <div className="space-y-4">
        {/* Section Title Skeleton */}
        <div className="animate-pulse">
          <div className="bg-gradient-to-r from-gray-300 to-gray-200 rounded-lg p-2">
            <div className="h-8 bg-white/30 rounded w-48 p-2"></div>
          </div>
        </div>

        {/* Tier Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse space-y-4">
                {/* Tier Name */}
                <div className="text-center space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-20 mx-auto"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
                
                {/* Features List */}
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center space-x-3">
                      <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                      <div className="h-3 bg-gray-100 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
                
                {/* Action Button */}
                <div className="pt-4">
                  <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Content Section (Optional) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                </div>
                <div className="h-8 w-20 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}