import { Link, usePage } from '@inertiajs/react';
import { dashboard, home, login } from '@/routes';
import { store as loginDemo } from '@/actions/App/Http/Controllers/Auth/DemoLoginController';
import { Button } from '@/components/ui/button';

export default function Navbar() {
    const { auth } = usePage().props;

    return (
        <header className="w-full bg-[#09090b] text-sm border-b border-white/10 not-has-[nav]:hidden">
            <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between border-l border-r px-4 border-white/10">

                {/* Left: Logo */}
                <div className="flex shrink-0 items-center">
                    <Link
                        href={home()}
                        className="flex items-center gap-2 text-lg font-semibold text-white transition-opacity hover:opacity-80"
                    >
                        shelf-space
                    </Link>
                </div>

                {/* Right: Your 2 Buttons (Variables kept exactly the same) */}
                <div className="flex items-center gap-3">
                    {auth.user ? (
                        <Button
                            variant="outline"
                            className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            asChild
                        >
                            <Link href={dashboard()}>
                                Dashboard
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            asChild
                        >
                            <Link href={login()}>
                                Log in
                            </Link>
                        </Button>
                    )}

                    {/* Primary CTA matches the white "Get started" button */}
                    <Button
                        className="bg-white text-black hover:bg-zinc-200"
                        asChild
                    >
                        <Link href={loginDemo().url} method="post">
                            Demo
                        </Link>
                    </Button>
                </div>

            </nav>
        </header>
    );
}
