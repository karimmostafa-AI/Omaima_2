"use client"
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, AlertCircle } from 'lucide-react'

interface SaveDesignModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string, notes?: string) => Promise<void>
}

export function SaveDesignModal({ open, onOpenChange, onSave }: SaveDesignModalProps) {
  const [designName, setDesignName] = useState('')
  const [designNotes, setDesignNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!designName.trim()) {
      setError('Please enter a name for your design.')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      
      await onSave(designName.trim(), designNotes.trim() || undefined)
      
      // Reset form
      setDesignName('')
      setDesignNotes('')
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to save design:', err)
      setError(err instanceof Error ? err.message : 'Failed to save design. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setDesignName('')
      setDesignNotes('')
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Your Design
          </DialogTitle>
          <DialogDescription>
            Save your custom design to your account so you can easily reorder or modify it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="design-name">Design Name *</Label>
            <Input
              id="design-name"
              placeholder="e.g., Navy Business Suit, Custom Blazer..."
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              disabled={isSaving}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="design-notes">Notes (Optional)</Label>
            <Textarea
              id="design-notes"
              placeholder="Add any notes about this design, occasions it's for, or special requirements..."
              value={designNotes}
              onChange={(e) => setDesignNotes(e.target.value)}
              disabled={isSaving}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {designNotes.length}/500 characters
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!designName.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Design
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}