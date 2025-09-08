import { Suspense } from 'react'
import CustomizeContent from './customize-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function CustomizePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<CustomizePageSkeleton />}>
        <CustomizeContent />
      </Suspense>
    </div>
  )
}

function CustomizePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          
          {/* Right sidebar skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}