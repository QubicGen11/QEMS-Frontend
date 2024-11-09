const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-6 gap-4 mb-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      {[...Array(5)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-6 gap-4 mb-4">
          {[...Array(6)].map((_, colIndex) => (
            <div key={colIndex} className="h-8 bg-gray-100 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
