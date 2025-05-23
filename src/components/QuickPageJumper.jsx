import React, { useState } from "react";
import { ArrowRight, Hash } from "lucide-react";

const QuickPageJumper = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  const [inputPage, setInputPage] = useState("");
  const [isValid, setIsValid] = useState(true);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputPage(value);

    // Validar se é um número válido dentro do range
    const pageNum = parseInt(value);
    setIsValid(value === "" || (pageNum >= 1 && pageNum <= totalPages));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage);

    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setInputPage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Hash className="h-4 w-4" />
        <span>Ir para página:</span>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max={totalPages}
          value={inputPage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={currentPage.toString()}
          className={`w-16 px-2 py-1 text-center border rounded text-sm transition-colors ${
            isValid
              ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              : "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          }`}
        />

        <button
          type="submit"
          disabled={!inputPage || !isValid}
          className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Ir para página"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <span className="text-xs text-gray-500">de {totalPages}</span>
    </div>
  );
};

export default QuickPageJumper;
