import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/pages/landing/navbar';
import Banner from '@/pages/landing/banner';
import Features from '@/pages/landing/features';
import AdvancedFeatures from '@/pages/landing/advanced';
import CTA from '@/pages/landing/cta';
import { Heart, Github } from 'lucide-react';

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
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 px-4 md:px-0">
                            <div className="space-y-4 text-center md:text-left">
                                <p className="text-sm text-zinc-500">
                                    A simple way to track your physical assets. Built for teams that move fast.
                                </p>
                            </div>

                            <div className="flex items-center gap-6 text-zinc-400 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <span>Crafted by hyeucong with</span>
                                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                                </div>
                                <div className="w-px h-4 bg-white/10 hidden md:block" />
                                <a
                                    href="https://github.com/hyeucong"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                                >
                                    <Github className="w-4 h-4" />
                                    <span>GitHub</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
