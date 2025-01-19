import { Label } from "@/components/ui/label";
import { SheetFooter } from "@/components/ui/sheet";
import { SpotType } from '@/models/models';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface AdminSpotFormProps {
    spotType?: SpotType;
    onSubmit: (data: Partial<SpotType>) => void;
    isCreating?: boolean;
}

const AdminSpotForm = ({
    spotType,
    onSubmit,
    isCreating = false,
}: AdminSpotFormProps) => {
    const [formData, setFormData] = useState<Partial<SpotType>>(
        spotType ?? {
            price: 0,
            limit: 0,
            currentCount: 0,
            description: '',
            name: ''
        }
    );

    const handleChange = (field: keyof SpotType, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={formData.name ?? ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                    id="description"
                    value={formData.description ?? ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="min-h-[100px]"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="price">Preis (€)</Label>
                <Input
                    id="price"
                    type="number"
                    value={formData.price ?? 0}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="limit">Spot Limit</Label>
                <Input
                    id="limit"
                    type="number"
                    value={formData.limit ?? 0}
                    onChange={(e) => handleChange('limit', parseInt(e.target.value))}
                />
            </div>

            {!isCreating && (
                <div className="space-y-2">
                    <Label htmlFor="currentCount">Aktuelle Anzahl</Label>
                    <Input
                        id="currentCount"
                        type="number"
                        value={formData.currentCount ?? 0}
                        onChange={(e) => handleChange('currentCount', parseInt(e.target.value))}
                    />
                </div>
            )}

            <SheetFooter>
                <Button onClick={() => onSubmit(formData)}>
                    {isCreating ? 'Create Spot Type' : 'Save Changes'}
                </Button>
            </SheetFooter>
        </div>
    );
};

export default AdminSpotForm;