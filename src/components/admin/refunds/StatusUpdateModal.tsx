"use client";

import React, { useState } from 'react';
import { Refund, RefundStatus } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface StatusUpdateModalProps {
  refund: Refund | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (refundId: string, status: RefundStatus, notes: string) => void;
  isUpdating: boolean;
}

const StatusUpdateModal = ({ refund, isOpen, onClose, onUpdate, isUpdating }: StatusUpdateModalProps) => {
  const [status, setStatus] = useState<RefundStatus | null>(null);
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (refund) {
      setStatus(refund.status);
      setNotes(refund.notes || '');
    }
  }, [refund]);

  if (!refund) return null;

  const handleUpdate = () => {
    if (status) {
      onUpdate(refund.id, status, notes);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Refund Status for #{refund.id}</DialogTitle>
          <DialogDescription>
            Select a new status for this refund request and add any relevant notes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label>Status</Label>
            <RadioGroup value={status || ''} onValueChange={(value: RefundStatus) => setStatus(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending">Pending</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approved" id="approved" />
                <Label htmlFor="approved">Approved</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="rejected" />
                <Label htmlFor="rejected">Rejected</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" />
                <Label htmlFor="completed">Completed</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={isUpdating || !status}>
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateModal;
