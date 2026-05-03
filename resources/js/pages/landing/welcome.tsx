import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/pages/landing/navbar';
import Banner from '@/pages/landing/banner';
import Features from '@/pages/landing/features';
import AdvancedFeatures from '@/pages/landing/advanced';
import CTA from '@/pages/landing/cta';
import { Heart } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props;
    const currentYear = new Date().getFullYear();

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <Navbar />
            <div className="flex min-h-screen flex-col bg-[#09090b]">
                <main className="flex-1 w-full">
                    <Banner />
                    <AdvancedFeatures />
                    <Features />
                    <CTA />
                </main>

                <footer className="w-full bg-[#09090b] py-12 border-t border-dashed border-white/20">
                    <div className="max-w-5xl mx-auto ">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="space-y-4 text-center md:text-left">
                                <p className="text-sm text-zinc-500">
                                    The modern OS for your physical assets. Built for teams that move fast.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                <span>Crafted with</span>
                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                <span>in Jakarta</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
