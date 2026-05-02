import { Link } from '@inertiajs/react';
import { login } from '@/routes';
import { Button } from '@/components/ui/button';

export default function Banner() {
    return (
        <div className="relative w-full overflow-hidden bg-[#09090b] pb-16">

            {/* Subtle Dot Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_60%_50%_at_20%_40%,#000_10%,transparent_100%)] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero Section */}
                <section className="text-left max-w-3xl mb-12">

                    {/* Main Heading */}
                    <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-medium tracking-tight text-white mb-6 leading-[1.1]">
                        Asset management <br className="hidden md:block" /> for modern teams.
                    </h1>

                    {/* Subtext */}
                    <p className="text-base md:text-lg text-zinc-400 mb-8 max-w-2xl leading-relaxed">
                        Track, manage, and scale your hardware and software inventory with a unified dashboard built for speed and precision.
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center gap-4">
                        <Button
                            size="lg"
                            className="bg-white text-black hover:bg-zinc-200 rounded px-6 font-medium"
                            asChild
                        >
                            <Link href={login()}>Get started now</Link>
                        </Button>

                        <Button
                            size="lg"
                            className="bg-[#18181b] text-white hover:bg-[#27272a] border border-white/5 rounded px-6 font-medium"
                        >
                            View Documentation
                        </Button>
                    </div>
                </section>

                {/* Reference Image */}
                <div className="w-full">
                    <img
                        src="https://framerusercontent.com/images/Sh880sHyNnkevnmfd0Pd1wSthI.png?scale-down-to=1024&width=7136&height=3840"
                        alt="Dashboard Preview"
                        className="w-full h-auto block"
                    />
                </div>
            </div>
        </div>
    );
}
