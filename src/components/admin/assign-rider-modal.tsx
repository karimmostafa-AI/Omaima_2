import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for riders
const riders = [
  { id: 'rider_1', name: 'John Doe', incompleteOrders: 3 },
  { id: 'rider_2', name: 'Jane Smith', incompleteOrders: 1 },
  { id: 'rider_3', name: 'Peter Jones', incompleteOrders: 5 },
];

interface AssignRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (riderId: string) => void;
  orderId: string;
}

const AssignRiderModal = ({ isOpen, onClose, onAssign, orderId }: AssignRiderModalProps) => {
  const [selectedRider, setSelectedRider] = React.useState<string | null>(null);

  const handleAssign = () => {
    if (selectedRider) {
      onAssign(selectedRider);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Rider for Order #{orderId}</DialogTitle>
          <DialogDescription>
            Select a rider from the list below to assign them to this order.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedRider}>
            <SelectTrigger>
              <SelectValue placeholder="Select a rider" />
            </SelectTrigger>
            <SelectContent>
              {riders.map((rider) => (
                <SelectItem key={rider.id} value={rider.id}>
                  <div className="flex justify-between items-center">
                    <span>{rider.name}</span>
                    <span className="text-sm text-gray-500">
                      {rider.incompleteOrders} incomplete orders
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedRider}>
            Assign Rider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignRiderModal;
