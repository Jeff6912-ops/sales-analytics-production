'use client'

import { useState, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Type definition for call data
interface CallData {
  id: string
  created_at: string
  contact_name: string
  call_source: string
  analysisData?: {
    heatCheckScore: number | null
    prospectName: string | null
    topNeed: string | null
    mainObjection: string | null
    callOutcome: string | null
  } | null
}

interface InteractiveCallTableProps {
  data: CallData[]
  loading?: boolean
}

// Helper functions
function getHeatCheckColor(score: number | null) {
  if (!score) return 'bg-gray-100 text-gray-800'
  if (score >= 8) return 'bg-green-100 text-green-800'
  if (score >= 6) return 'bg-yellow-100 text-yellow-800'
  if (score >= 4) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

function formatHeatCheckScore(score: number | null): string {
  if (score === null || score === undefined) return 'N/A'
  return score % 1 === 0 ? score.toString() : score.toFixed(1)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

export function InteractiveCallTable({ data, loading = false }: InteractiveCallTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })
  const [globalFilter, setGlobalFilter] = useState('')

  // Define table columns
  const columns = useMemo<ColumnDef<CallData>[]>(
    () => [
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Date & Time
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {formatDate(row.getValue('created_at'))}
          </div>
        ),
      },
      {
        accessorKey: 'contact_name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Prospect Name
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const prospectName = row.original.analysisData?.prospectName || row.getValue('contact_name')
          return (
            <div className="font-medium">
              {prospectName}
            </div>
          )
        },
        filterFn: 'includesString',
      },
      {
        accessorFn: (row) => row.analysisData?.heatCheckScore,
        id: 'heatcheck_score',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            HeatCheck Score
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const score = row.original.analysisData?.heatCheckScore ?? null
          return (
            <Badge className={getHeatCheckColor(score)}>
              {formatHeatCheckScore(score)}
            </Badge>
          )
        },
      },
      {
        accessorFn: (row) => row.analysisData?.topNeed,
        id: 'top_need',
        header: 'Top Need/Pain Point',
        cell: ({ row }) => {
          const topNeed = row.original.analysisData?.topNeed || 'Not identified'
          return (
            <div className="max-w-[200px]">
              <div className="truncate" title={topNeed}>
                {topNeed}
              </div>
            </div>
          )
        },
      },
      {
        accessorFn: (row) => row.analysisData?.mainObjection,
        id: 'main_objection',
        header: 'Main Objection',
        cell: ({ row }) => {
          const objection = row.original.analysisData?.mainObjection || 'None noted'
          return (
            <div className="max-w-[200px]">
              <div className="truncate" title={objection}>
                {objection}
              </div>
            </div>
          )
        },
      },
      {
        accessorFn: (row) => row.analysisData?.callOutcome,
        id: 'call_outcome',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Call Outcome
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-1 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const outcome = row.original.analysisData?.callOutcome || 'Pending'
          return (
            <div className="max-w-[150px]">
              <div className="truncate" title={outcome}>
                {outcome}
              </div>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      pagination,
      globalFilter,
    },
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search calls..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} calls
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-muted/50 cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              ««
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              «
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              »
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              »»
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 