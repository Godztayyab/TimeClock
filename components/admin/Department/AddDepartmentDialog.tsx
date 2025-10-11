import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createDepartment } from '@/actions/department';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useToast } from '@/hooks/use-toast';
import { DepartmentViewInterface } from './DeparmentManagement';

interface AddDepartmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    setDepartments: React.Dispatch<React.SetStateAction<DepartmentViewInterface[]>>;
}

export const AddDepartmentDialog = ({ isOpen, onClose, setDepartments }: AddDepartmentDialogProps) => {
    const [newDepartment, setNewDepartment] = useState({ name: '', info: '' });
    const { toast } = useToast();
    const user = useCurrentUser();


    const handleAddDepartment = async () => {
        if (!newDepartment.name) {
            toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please fill all fields',
            });
            return;
        }
        if (user?.id === undefined) {
            toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to add a department',
            });
            return;
        }

        try {
            const createdDepartment = await createDepartment(user?.id, newDepartment.name, newDepartment.info);
            if (createdDepartment.error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: createdDepartment.error,
            });
            return;
            }

            if (createdDepartment.department) {
            setDepartments(prev => [...prev, createdDepartment.department]);
            if (createdDepartment.success) {
                toast({
                title: 'Success',
                description: createdDepartment.success,
                });
                onClose();
            }
            }
        } catch {
            toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to add department',
            });
        }
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Department</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                            id="name"
                            value={newDepartment.name}
                            onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="otherInfo" className="text-right">Other Info</Label>
                        <Textarea
                            id="otherInfo"
                            value={newDepartment.info}
                            onChange={(e) => setNewDepartment({ ...newDepartment, info: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <Button onClick={handleAddDepartment} style={{ backgroundColor: 'rgb(254, 159, 43)' }}>Add Department</Button>
            </DialogContent>
        </Dialog>
    );
};