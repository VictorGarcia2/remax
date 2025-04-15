import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

function Pagination({ totalPages, currentPage, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1); // always show first page

    if (currentPage > 3) {
      pages.push("ellipsis1");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis2");
    }

    pages.push(totalPages); // always show last page

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pageNumbers.map((pageNumber, index) =>
        pageNumber.toString().includes("ellipsis") ? (
          <span key={index} className="px-2 text-gray-400">
            <MoreHorizontal className="w-5 h-5" />
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(pageNumber)}
            className={`w-9 h-9 sm:w-10 sm:h-10 text-sm font-medium rounded-full transition-colors
              ${
                currentPage === pageNumber
                  ? "bg-blueRemax text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            {pageNumber}
          </button>
        )
      )}

      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
        aria-label="Página siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}

function Paginacion({ setPagina, totalPaginas }) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setPagina(currentPage);
  }, [currentPage, setPagina]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
        <Pagination
          totalPages={totalPaginas}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default Paginacion;
