import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

const ITEMS = [
    {
        title: 'Global Command Palette',
        point: 'Navigate at the speed of thought.',
        desc: 'Press CMD+K to instantly locate any asset, user, or location globally.',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072',
    },
    {
        title: 'Intelligent Kitting',
        point: 'Deploy bundles safely.',
        desc: 'Group assets into deployable kits with built-in relational logic for complex workflows.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070',
    },
    {
        title: 'Frictionless Audits',
        point: 'Bridge physical and digital.',
        desc: 'Every registered item automatically generates a unique, non-sequential Asset Tag for scanning.',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=2070',
    },
    {
        title: 'Granular Permissions',
        point: 'RBAC at the asset level.',
        desc: 'Define exactly who can check out, audit, or retire specific asset categories.',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070',
    }
];

export default function Features() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section id="features" className="relative w-full bg-[#09090b] py-16">
            <div className="relative z-10 max-w-5xl mx-auto">

                {/* Section Heading */}
                <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-2">
                        Enterprise-grade engineering.<br />
                        Built for scale.
                    </h2>
                </div>

                {/* Two-Column Grid Layout */}
                <div className="flex flex-col lg:flex-row gap-4 items-stretch">

                    {/* Left Side: Floating Block Tabs */}
                    <div className="w-full lg:w-[45%] flex flex-col gap-4">
                        {ITEMS.map((item, index) => {
                            const isActive = activeIndex === index;

                            return (
                                <div
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={cn(
                                        "rounded p-5 cursor-pointer transition-colors duration-300",
                                        isActive
                                            ? "bg-[#141416]" // Slightly lighter dark for active state
                                            : "bg-[#0f0f11] hover:bg-[#141416]"
                                    )}
                                >
                                    {/* Tab Header */}
                                    <div className="flex items-center">
                                        {/* The precise vertical line indicator */}
                                        <div className={cn(
                                            "w-[3px] h-5 rounded mr-4 transition-colors duration-300",
                                            isActive ? "bg-white" : "bg-zinc-800"
                                        )} />
                                        <h3 className={cn(
                                            "text-lg tracking-tight transition-colors duration-300",
                                            isActive ? "text-white font-medium" : "text-zinc-400 font-normal"
                                        )}>
                                            {item.title}
                                        </h3>
                                    </div>

                                    {/* Expandable Content */}
                                    <AnimatePresence initial={false}>
                                        {isActive && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                {/* Added pl-5 to align the text with the title (past the indicator) */}
                                                <div className="pt-3 pl-5 flex flex-col gap-1">
                                                    <span className="text-sm font-medium text-zinc-300">
                                                        {item.point}
                                                    </span>
                                                    <span className="text-sm text-zinc-500 leading-relaxed line-clamp-2">
                                                        {item.desc}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Side: Detached Visual Image Panel */}
                    <div className="w-full lg:w-[55%] relative min-h-[350px] rounded overflow-hidden bg-zinc-900 border border-white/5">
                        <img
                            src={ITEMS[activeIndex].image}
                            alt={ITEMS[activeIndex].title}
                            className="w-full h-full object-cover opacity-90"
                        />
                        {/* Optional: Keep a subtle gradient if your images need text overlay, otherwise this just darkens it slightly to look premium */}
                        <div className="absolute inset-0 bg-linear-to-t from-[#09090b]/40 to-transparent" />
                    </div>

                </div>
            </div>
        </section>
    );
}
