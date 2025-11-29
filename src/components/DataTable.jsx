"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  MoreHorizontal
} from "lucide-react";

const DataTable = ({
  columns = [],
  data = [],
  actions = [],
  searchable = false,
  paginated = false,
  pageSize = 10,
  loading = false,
  emptyMessage = "No data found",
  searchPlaceholder = "Search...",
  className = "",
  title,
  onSearch,
  onPageChange,
  onSort,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      columns.some((column) => {
        const value = getNestedValue(item, column.key);
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (onSearch) onSearch(value);
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    if (onSort) onSort(key, direction);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (onPageChange) onPageChange(page);
  };

  // Get nested object value
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Render cell content
  const renderCell = (item, column) => {
    const value = getNestedValue(item, column.key);

    if (column.render) {
      return column.render(value, item);
    }

    // Default rendering based on value type
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      );
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return value || "-";
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <Card className={className} {...props}>
      <CardContent className="p-0">
        {/* Search Bar */}
        {searchable && (
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`h-10 px-2 sm:px-3 md:px-4 text-left align-middle font-semibold text-gray-900 text-xs sm:text-sm whitespace-nowrap ${
                      column.sortable ? "cursor-pointer select-none hover:bg-gray-100 transition-colors" : ""
                    }`}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate">{column.label}</span>
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
                {actions.length > 0 && (
                  <TableHead className="h-10 px-2 sm:px-3 md:px-4 text-right align-middle font-semibold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <p className="text-sm text-gray-600 font-medium">Loading data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">No data found</p>
                        <p className="text-sm text-gray-600">{emptyMessage}</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  // <TableRow
                  //   key={item._id || item.id || index}
                  //   className="hover:bg-blue-50/50 active:bg-blue-100/50 transition-colors border-b border-gray-100 cursor-pointer"
                  // >
                  // <TableRow
                  //   key={item._id || item.id || index}
                  //   className="border-b border-gray-100"
                  // >

                  <TableRow
  key={item._id || item.id || index}
  className={`
    border-b border-gray-100 transition-all cursor-pointer

    ${item.status?.toLowerCase() === "active" 
      ? "bg-green-100 hover:green-200 "
      : ""}

    ${item.status?.toLowerCase() === "inactive" 
      ? "bg-red-100 hover:red-200 "
      : ""}

    ${item.status?.toLowerCase() === "toggle" 
      ? "bg-gray-700/30"
      : ""}

    ${!["active","inactive","toggle"].includes(item.status?.toLowerCase())
      ? "hover:bg-blue-50 active:bg-blue-100"
      : ""}
  `}
>


                    {columns.map((column) => (
                      <TableCell key={column.key} className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                        {renderCell(item, column)}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {actions.length <= 3 ? (
                            actions.map((action, actionIndex) => {
                              const IconComponent = typeof action.icon === 'function' ? action.icon(item) : action.icon;
                              const buttonVariant = typeof action.variant === 'function' ? action.variant(item) : action.variant || "ghost";
                              const buttonLabel = typeof action.label === 'function' ? action.label(item) : action.label;

                              const getHoverClasses = () => {
                                if (buttonVariant === 'destructive') return 'bg-red-600 text-white';
                                return '';
                              };

                              return (
                                <Button
                                  key={actionIndex}
                                  variant={buttonVariant}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(item);
                                  }}
                                  className={`h-7 sm:h-8 px-1 sm:px-2 md:px-3 transition-colors touch-manipulation text-xs sm:text-sm ${getHoverClasses()}`}
                                  disabled={action.disabled?.(item)}
                                >
                                  {IconComponent && <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
                                  <span className="hidden sm:inline">{buttonLabel}</span>
                                </Button>
                              );
                            })
                          ) : (
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 sm:h-8 w-7 sm:w-8 p-0 transition-colors touch-manipulation"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              {/* Dropdown menu would go here - simplified for now */}
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden">
                                {actions.map((action, actionIndex) => {
                                  const IconComponent = typeof action.icon === 'function' ? action.icon(item) : action.icon;
                                  return (
                                    <button
                                      key={actionIndex}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        action.onClick(item);
                                      }}
                                      disabled={action.disabled?.(item)}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-green flex items-center gap-2 disabled:opacity-50 transition-colors touch-manipulation"
                                    >
                                      {IconComponent && <IconComponent className="h-4 w-4" />}
                                      {action.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {paginated && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="text-sm text-gray-700 font-medium">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 px-3 border-gray-200 hover:bg-white hover:border-gray-300 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 p-0 ${
                        currentPage === pageNum
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                          : "border-gray-200 hover:bg-white hover:border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 px-3 border-gray-200 hover:bg-white hover:border-gray-300 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;
