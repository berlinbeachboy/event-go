import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    SheetFooter,
} from "@/components/ui/sheet";
import { SpotType, User } from '@/models/models';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState

 } from "react";
const AdminUserForm = ({
    user,
    spotTypes,
    onSubmit,
    isCreating = false,
}: {
    user?: User;
    spotTypes: SpotType[];
    onSubmit: (data: Partial<User>) => void;
    isCreating?: boolean;
}) => {
    const [formData, setFormData] = useState<Partial<User>>(
        user ?? {
            type: 'reg',
            amountPaid: 0,
            spotTypeId: 0,
        }
    );

    const handleChange = (field: keyof User, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    value={formData.username ?? ''}
                    onChange={(e) => handleChange('username', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                    id="fullName"
                    value={formData.fullName ?? ''}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                    id="nickname"
                    value={formData.nickname ?? ''}
                    onChange={(e) => handleChange('nickname', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                    id="phone"
                    value={formData.phone ?? ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="type">User Type</Label>
                <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange('type', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="reg">Regular</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="spotTypeId">Spot Type</Label>
                <Select
                    value={formData.spotTypeId?.toString()}
                    onValueChange={(value) => handleChange('spotTypeId', parseInt(value))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select spot type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">No spot</SelectItem>
                        {spotTypes.map(spot => (
                            <SelectItem key={spot.id} value={spot.id.toString()}>
                                {spot.name} - {spot.price}€
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount Paid (€)</Label>
                <Input
                    id="amountPaid"
                    type="number"
                    value={formData.amountPaid ?? 0}
                    onChange={(e) => handleChange('amountPaid', parseFloat(e.target.value))}
                />
            </div>

            <SheetFooter>
                <Button onClick={() => onSubmit(formData)}>
                    {isCreating ? 'Create User' : 'Save Changes'}
                </Button>
            </SheetFooter>
        </div>
    );
};

export default AdminUserForm;