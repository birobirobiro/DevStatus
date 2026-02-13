"use client";

import React, { useState } from "react";
import { motion, LayoutGroup } from "motion/react";

export const FilterSelector = ({ 
  items = [], 
  activeFilters: controlledActiveFilters, 
  onFilterChange,
  theme = "dark"
}) => {
  const isDark = theme === "dark";
  const [internalActiveFilters, setInternalActiveFilters] = useState(
    items.length > 0 ? [items[0]?.id || ""].filter(Boolean) : []
  );

  const activeFilters = controlledActiveFilters !== undefined ? controlledActiveFilters : internalActiveFilters;

  const toggleFilter = (id) => {
    // Se clicar em "all", limpa outros filtros
    if (id === "all") {
      const newFilters = ["all"];
      if (controlledActiveFilters === undefined) {
        setInternalActiveFilters(newFilters);
      }
      onFilterChange?.(newFilters);
      return;
    }

    let newFilters;
    if (activeFilters.includes(id)) {
      newFilters = activeFilters.filter((i) => i !== id);
    } else {
      // Remove "all" se existir e adiciona o novo filtro
      newFilters = [...activeFilters.filter((i) => i !== "all"), id];
    }
    
    // Se não tiver nenhum filtro, volta para "all"
    if (newFilters.length === 0) {
      newFilters = ["all"];
    }
    
    if (controlledActiveFilters === undefined) {
      setInternalActiveFilters(newFilters);
    }
    onFilterChange?.(newFilters);
  };

  const selectedFiltersMap = activeFilters.map(id => items.find(f => f.id === id)).filter(Boolean);
  const availableFiltersMap = items.filter(f => !activeFilters.includes(f.id));

  return (
    <div className="w-full font-inter">
      <LayoutGroup>
        {/* Selected Filters */}
        {selectedFiltersMap.length > 0 && (
          <motion.div
            layout
            transition={{ layout: { type: "tween", duration: 0.20, ease: "easeOut" } }}
            className="flex flex-wrap gap-2 mb-3"
          >
            {selectedFiltersMap.map((filter) => (
              <FilterChip
                key={filter.id}
                filter={filter}
                isSelected={true}
                onClick={() => toggleFilter(filter.id)}
              />
            ))}
          </motion.div>
        )}

        {/* Available Filters - Horizontal Scroll */}
        <motion.div
          layout
          transition={{ layout: { type: "tween", duration: 0.20, ease: "easeOut" } }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
        >
          {availableFiltersMap.map((filter) => (
            <FilterChip
              key={filter.id}
              filter={filter}
              isSelected={false}
              onClick={() => toggleFilter(filter.id)}
            />
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  );
};

const FilterChip = ({ filter, isSelected, onClick }) => {
  return (
    <motion.button
      layoutId={`filter-${filter.id}`}
      onClick={onClick}
      className={`
        relative flex items-center justify-center gap-1.5 px-3 py-1.5 text-[13px] font-medium border-[2px] border-dotted rounded-full
        cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 whitespace-nowrap
        ${filter.color}
      `}
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 28,
          mass: 0.8,
        },
      }}
    >
      <span className="relative z-10">{filter.label}</span>
      {isSelected && (
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className="opacity-70 hover:opacity-100 ml-1.5"
          >
            <path
              d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      )}
    </motion.button>
  );
};
