import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'client' | 'pharmacien';
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'client',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-[#2B3752]">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                            className="h-11 rounded-xl border-slate-300 focus-visible:ring-[#2E6E65]"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-[#2B3752]">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                            className="h-11 rounded-xl border-slate-300 focus-visible:ring-[#2E6E65]"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-[#2B3752]">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                            className="h-11 rounded-xl border-slate-300 focus-visible:ring-[#2E6E65]"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-[#2B3752]">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                            className="h-11 rounded-xl border-slate-300 focus-visible:ring-[#2E6E65]"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="grid gap-3">
                        <Label className="text-[#2B3752]">Select your role</Label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
                                <input
                                    type="radio"
                                    name="role"
                                    value="client"
                                    checked={data.role === 'client'}
                                    onChange={(e) => setData('role', e.target.value as RegisterForm['role'])}
                                    disabled={processing}
                                />
                                Client
                            </label>
                            <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
                                <input
                                    type="radio"
                                    name="role"
                                    value="pharmacien"
                                    checked={data.role === 'pharmacien'}
                                    onChange={(e) => setData('role', e.target.value as RegisterForm['role'])}
                                    disabled={processing}
                                />
                                Pharmacien
                            </label>
                        </div>
                        <InputError message={errors.role} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 h-11 w-full rounded-xl bg-[#2E6E65] text-white hover:bg-[#285f57]"
                        tabIndex={5}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <TextLink href={route('login')} className="text-[#2E6E65]" tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
