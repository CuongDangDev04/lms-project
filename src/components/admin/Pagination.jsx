// src/components/Pagination.js
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
  
    return (
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 p-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
            currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-teal-500 text-white hover:bg-teal-600'
          }`}
        >
          Trước
        </button>
        <div className="flex gap-1 sm:gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => onPageChange(index + 1)}
              className={`px-2 sm:px-3 py-1 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                currentPage === index + 1 ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
            currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-teal-500 text-white hover:bg-teal-600'
          }`}
        >
          Sau
        </button>
      </div>
    );
  };
  
  export default Pagination;