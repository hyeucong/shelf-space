import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { login } from '@/routes';
import { motion } from 'motion/react';

const LIST_ITEMS = [
    { title: 'MacBook Pro M3 Max', status: 'In_Use', color: 'text-white' },
    { title: 'Sony A7IV Camera Body', status: 'Maintenance', color: 'text-amber-400' },
    { title: 'Dell UltraSharp 32" 4K', status: 'In_Use', color: 'text-white' },
    { title: 'Herman Miller Aeron', status: 'Available', color: 'text-white' },
    { title: 'Logitech MX Master 3S', status: 'Retired', color: 'text-zinc-500' },
];

export default function CTA() {
    return (
        <section id="cta" className="relative w-full bg-[#09090b] py-24 border-t border-dashed border-white/20">
            <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-0">
                <div className="rounded overflow-hidden relative group lg:h-[400px] border border-white/10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-0 h-full">
                        {/* Left Side: Content */}
                        <div className="relative z-10 p-8 md:p-10 flex flex-col justify-center h-full space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-2 bg-white rounded-full" />
                                    <span className="text-white text-sm font-medium">Get started</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white leading-tight">
                                    Stop losing track of your assets today.
                                </h2>
                                <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-sm">
                                    Join hundreds of teams using Shelf Space to organize, track, and optimize their physical resources.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start pt-2">
                                <Button size="lg" className="h-10 px-5 text-sm font-medium rounded bg-white text-black hover:bg-zinc-200 cursor-pointer" asChild>
                                    <Link href={login()}>
                                        Get started now
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Right Side: Animated List */}
                        <div className="relative h-full bg-[#0c0c0e] overflow-hidden flex flex-col border-l border-white/10">
                            <motion.div
                                className="flex flex-col gap-4 px-8 md:px-12 py-0 pb-4"
                                animate={{
                                    y: ["-50%", "0%"]
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                {[...LIST_ITEMS, ...LIST_ITEMS].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded border border-white/10 flex items-center justify-center bg-white/5">
                                            <Camera className="w-5 h-5 text-zinc-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-white">{item.title}</div>
                                        </div>
                                        <div className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border border-white/10 bg-white/5 ${item.color}`}>
                                            {item.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Fading overlays for seamless loop look */}
                            <div className="absolute top-0 left-0 right-0 h-24 bg-linear-to-b from-[#0c0c0e] to-transparent z-20 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-[#0c0c0e] to-transparent z-20 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
