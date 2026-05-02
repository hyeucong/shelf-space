import { Link } from '@inertiajs/react';
import { login } from '@/routes';
import { Button } from '@/components/ui/button';

function FeatureCard({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <h3 className="font-semibold text-lg mb-2 text-white">{title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
        </div>
    );
}

export default function Banner() {
    return (
        <div className="relative w-full overflow-hidden bg-[#09090b] pb-16">

            {/* Subtle Dot Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_60%_50%_at_20%_40%,#000_10%,transparent_100%)] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero Section */}
                <section className="text-left max-w-3xl">

                    {/* Top Badge */}
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        <span className="text-[#e8c371] text-sm font-medium tracking-wide">
                            Smart Workspace
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-medium tracking-tight text-white mb-6 leading-[1.05]">
                        Asset management <br className="hidden md:block" /> for modern teams.
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl leading-relaxed">
                        Track, manage, and scale your hardware and software inventory with a unified dashboard built for speed and precision.
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center gap-4">
                        <Button
                            size="lg"
                            className="bg-white text-black hover:bg-zinc-200 rounded-md px-6 font-medium"
                            asChild
                        >
                            <Link href={login()}>Get started now</Link>
                        </Button>

                        <Button
                            size="lg"
                            className="bg-[#18181b] text-white hover:bg-[#27272a] border border-white/5 rounded-md px-6 font-medium"
                        >
                            View Documentation
                        </Button>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="grid grid-cols-1 gap-6 mt-32 sm:grid-cols-3 w-full max-w-5xl">
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

            </div>
        </div>
    );
}
