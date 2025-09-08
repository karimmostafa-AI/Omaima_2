"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  maxVisiblePages?: number
}

// Additional pagination components for compatibility
interface PaginationItemProps extends React.ComponentProps<"button"> {
  isActive?: boolean
}

export function PaginationItem({ isActive, className, ...props }: PaginationItemProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      className={cn("h-9 w-9 p-0", className)}
      {...props}
    />
  )
}

interface PaginationLinkProps extends React.ComponentProps<"button"> {
  isActive?: boolean
}

export function PaginationLink({ isActive, className, ...props }: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      className={cn("h-9 w-9 p-0", className)}
      {...props}
    />
  )
}

export function PaginationContent({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

export function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <span className="text-muted-foreground">...</span>
    </span>
  )
}

export function PaginationPrevious({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("h-9 w-9 p-0", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  )
}

export function PaginationNext({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("h-9 w-9 p-0", className)}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  )
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: number[] = []
    const half = Math.floor(maxVisiblePages / 2)
    
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()
  const showFirstEllipsis = visiblePages[0] > 1
  const showLastEllipsis = visiblePages[visiblePages.length - 1] < totalPages

  return (
    <nav className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-9 w-9 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* First Page + Ellipsis */}
      {showFirstLast && showFirstEllipsis && (
        <>
          <Button
            variant={1 === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(1)}
            className="h-9 w-9 p-0"
          >
            1
          </Button>
          {visiblePages[0] > 2 && (
            <span className="text-muted-foreground px-2">...</span>
          )}
        </>
      )}

      {/* Visible Page Numbers */}
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className={cn(
            "h-9 w-9 p-0",
            page === currentPage && "pointer-events-none"
          )}
        >
          {page}
        </Button>
      ))}

      {/* Last Page + Ellipsis */}
      {showFirstLast && showLastEllipsis && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="text-muted-foreground px-2">...</span>
          )}
          <Button
            variant={totalPages === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="h-9 w-9 p-0"
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="h-9 w-9 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
