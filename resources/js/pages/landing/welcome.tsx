import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a]">
                <header className="w-full text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-2">
                        <Link href="">
                            <Button size="sm">
                                Demo
                            </Button>
                        </Link>
                        {auth.user ? (
                            <Link href={dashboard()}>
                                <Button variant="outline" size="sm">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href={login()}>
                                <Button variant="outline" size="sm">
                                    Log in
                                </Button>
                            </Link>
                        )}
                    </nav>
                </header>

                <main className="flex flex-1 items-center justify-center">
                    {/* Your content will go here */}
                </main>
            </div>


        </>
    );
}
