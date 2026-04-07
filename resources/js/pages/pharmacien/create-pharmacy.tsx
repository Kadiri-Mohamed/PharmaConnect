import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreatePharmacyForm {
    name: string;
    address: string;
    phone: string;
}

export default function CreatePharmacy() {
    const { data, setData, post, processing, errors } = useForm<CreatePharmacyForm>({
        name: '',
        address: '',
        phone: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('pharmacy.store'));
    };

    return (
        <div className="mx-auto mt-10 w-full max-w-lg rounded-md border bg-white p-6 shadow-sm">
            <Head title="Create Pharmacy" />

            <h1 className="mb-6 text-2xl font-bold">Setup Your Pharmacy</h1>

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Pharmacy Name</Label>
                    <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        disabled={processing}
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                        id="address"
                        type="text"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        disabled={processing}
                    />
                    <InputError message={errors.address} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        type="text"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        disabled={processing}
                    />
                    <InputError message={errors.phone} />
                </div>

                <Button type="submit" disabled={processing} className="mt-2 w-full">
                    Create Pharmacy
                </Button>
            </form>
        </div>
    );
}
