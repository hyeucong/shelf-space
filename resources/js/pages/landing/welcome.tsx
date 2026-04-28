import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { Button } from '@/components/ui/button';

function FeatureCard({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="p-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <h3 className="font-semibold text-lg mb-2 text-[#1b1b18] dark:text-white">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    );
}

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
                            <Button>
                                Demo
                            </Button>
                        </Link>
                        {auth.user ? (
                            <Link href={dashboard()}>
                                <Button variant="outline">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href={login()}>
                                <Button variant="outline">
                                    Log in
                                </Button>
                            </Link>
                        )}
                    </nav>
                </header>

                <main className="flex flex-col items-center flex-1 w-full max-w-5xl px-6 py-12 lg:py-24">
                    {/* Hero Section */}
                    <section className="text-center space-y-6 max-w-3xl">
                        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl text-[#1b1b18] dark:text-white">
                            Asset management for <span className="text-blue-600">modern teams</span>
                        </h1>
                        <p className="text-lg text-muted-foreground sm:text-xl">
                            Track, manage, and scale your hardware and software inventory with a unified dashboard built for speed and precision.
                        </p>
                        <div className="flex justify-center gap-4 pt-4">
                            <Link href={login()}>
                                <Button size="lg" className="rounded-full px-8">Get Started</Button>
                            </Link>
                            <Button size="lg" variant="ghost" className="rounded-full">
                                View Documentation
                            </Button>
                        </div>
                    </section>

                    {/* Feature Grid */}
                    <section className="grid grid-cols-1 gap-8 mt-24 sm:grid-cols-3 w-full">
                        <FeatureCard
                            title="Real-time Tracking"
                            desc="Every asset move is logged instantly. No more spreadsheets, no more lost hardware."
                        />
                        <FeatureCard
                            title="Laravel 13 Powered"
                            desc="Built on the latest stack for ultra-fast response times and rock-solid security."
                        />
                        <FeatureCard
                            title="Kit Management"
                            desc="Group assets into deployable kits and assign them to team members in one click."
                        />
                    </section>

                </main>
            </div>
        </>
    );
}
