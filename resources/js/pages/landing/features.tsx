import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Package, MapPin, History, Tags, CheckCircle2, AlertCircle, Clock, Map as MapIcon, ChevronRight } from 'lucide-react';

const ITEMS = [
    {
        title: 'Activity Timeline',
        point: 'Stay informed in real-time.',
        desc: 'Monitor an immutable stream of every checkout, update, and movement across your inventory.',
    },
    {
        title: 'Centralized Registry',
        point: 'Your single source of truth.',
        desc: 'Manage all your physical hardware and equipment in one unified, searchable dashboard.',
    },
    {
        title: 'Visual Locations',
        point: 'See where items are deployed.',
        desc: 'Track assets across multiple offices or remote sites with integrated map views.',
    },
    {
        title: 'Command Search',
        point: 'Everything at your fingertips.',
        desc: 'Quickly find assets, locations, or actions using a powerful global command palette.',
    }
];

function RegistryVisual() {
    const assets = [
        { name: 'MacBook Pro 16"', id: 'AST-8821', status: 'In Use', color: 'text-white' },
        { name: 'Dell UltraSharp 32"', id: 'AST-1102', status: 'Available', color: 'text-emerald-400' },
        { name: 'Sony A7IV Body', id: 'AST-4493', status: 'Maintenance', color: 'text-amber-400' },
        { name: 'iPad Pro 12.9"', id: 'AST-2291', status: 'In Use', color: 'text-white' },
        { name: 'Keychron K2', id: 'AST-5501', status: 'Available', color: 'text-emerald-400' },
        { name: 'Logitech MX Master', id: 'AST-0092', status: 'In Use', color: 'text-white' },
        { name: 'Shure SM7B', id: 'AST-7721', status: 'Available', color: 'text-emerald-400' },
        { name: 'Focusrite 2i2', id: 'AST-1188', status: 'Maintenance', color: 'text-amber-400' },
    ];

    return (
        <div className="p-6 h-full flex flex-col bg-[#09090b]">
            <div className="space-y-3 relative">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#09090b] to-transparent z-10 pointer-events-none" />
                {assets.map((asset, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-5 p-4 rounded bg-white/5 border border-white/10"
                    >
                        <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center shrink-0">
                            <Package size={22} className="text-zinc-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{asset.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono tracking-wider">{asset.id}</div>
                        </div>
                        <div className={cn("text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-white/5 bg-white/5", asset.color)}>
                            {asset.status}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function LocationsVisual() {
    return (
        <div className="relative h-full w-full p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <MapIcon size={16} className="text-zinc-400" />
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Global Sites</span>
            </div>

            <div className="flex-1 relative rounded border border-white/10 bg-white/5 overflow-hidden">
                {/* Mock Map Background */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] bg-size-[20px_20px]"></div>

                {/* Animated Pins */}
                {[
                    { top: '30%', left: '25%', label: 'SF Office' },
                    { top: '45%', left: '70%', label: 'London Lab' },
                    { top: '70%', left: '40%', label: 'Austin Hub' }
                ].map((pin, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.2, type: 'spring' }}
                        className="absolute flex flex-col items-center gap-1"
                        style={{ top: pin.top, left: pin.left }}
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-white rounded-full"
                            />
                            <div className="relative w-3 h-3 bg-white rounded-full border-2 border-[#09090b]" />
                        </div>
                        <div className="px-2 py-1 rounded bg-black/80 border border-white/20 text-[9px] text-white whitespace-nowrap font-medium">
                            {pin.label}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function TimelineVisual() {
    const [messages, setMessages] = useState([
        { id: 1, user: 'System', action: 'Initial', content: 'Asset added', time: '20:12' }
    ]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const fullText = "John borrow the camera";
        let currentIndex = 0;
        let timeoutId: NodeJS.Timeout;

        const typeNextLetter = () => {
            if (currentIndex <= fullText.length) {
                setInputValue(fullText.slice(0, currentIndex));
                currentIndex++;
                timeoutId = setTimeout(typeNextLetter, 100);
            } else {
                // Wait before "sending"
                timeoutId = setTimeout(() => {
                    setMessages(prev => [
                        {
                            id: Date.now(),
                            user: 'Demo User',
                            action: 'Note',
                            content: fullText,
                            time: '20:55'
                        },
                        ...prev
                    ]);
                    setInputValue('');

                    // Reset cycle after 5 seconds
                    timeoutId = setTimeout(() => {
                        setMessages([{ id: 1, user: 'System', action: 'Initial', content: 'Asset added', time: '20:12' }]);
                        currentIndex = 0;
                        typeNextLetter();
                    }, 5000);
                }, 1000);
            }
        };

        const startTimer = setTimeout(typeNextLetter, 2000);
        return () => {
            clearTimeout(startTimer);
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="p-4 h-full flex flex-col bg-[#09090b] text-zinc-300 select-none">
            {/* Editor Mock at Top */}
            <div className="mb-4 bg-[#0c0c0e] border border-white/10 rounded overflow-hidden shrink-0">
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4 text-zinc-500">
                        <span className="text-[10px] font-bold uppercase tracking-widest">New Activity</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="bg-zinc-200 text-black text-[11px] font-bold px-3 py-1 rounded">
                            Create note
                        </button>
                    </div>
                </div>
                <div className="p-4 min-h-[60px]">
                    <div className="text-sm text-white">
                        {inputValue}
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-[2px] h-4 bg-white ml-1 align-middle"
                        />
                    </div>
                </div>
            </div>

            {/* Activity Log List */}
            <div className="flex-1 overflow-hidden space-y-3 relative">
                <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-[#09090b] to-transparent z-10 pointer-events-none" />

                <AnimatePresence initial={false} mode="popLayout">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            className="p-3 rounded bg-[#0c0c0e] border border-white/5 flex flex-col gap-2"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-500">
                                        {msg.time}
                                    </div>
                                    <span className="text-xs font-bold text-white">{msg.user}</span>
                                    <span className="text-xs text-zinc-500">{msg.action}</span>
                                </div>
                            </div>
                            <div className="text-sm text-zinc-400">
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function CommandSearchVisual() {
    return (
        <div className="p-10 h-full flex flex-col bg-black/40 items-center justify-start pt-20">
            <div className="w-full max-w-lg bg-[#0c0c0e] border border-white/10 rounded shadow-2xl overflow-hidden scale-110 origin-top">
                <div className="p-5 border-b border-white/5 flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full" />
                    </div>
                    <span className="text-base text-zinc-400">Search assets, tags, or locations...</span>
                    <div className="ml-auto px-2 py-1 rounded border border-white/10 bg-white/5 text-[11px] text-zinc-500 font-mono font-bold">
                        ⌘K
                    </div>
                </div>
                <div className="p-3 space-y-1.5">
                    {[
                        { icon: <Package size={16} />, label: 'MacBook Pro 16"', type: 'Asset' },
                        { icon: <MapPin size={16} />, label: 'London Lab', type: 'Location' },
                        { icon: <Tags size={16} />, label: 'In Warranty', type: 'Tag' }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "flex items-center gap-4 p-3 rounded transition-colors",
                                i === 0 ? "bg-white/5 text-white" : "text-zinc-500"
                            )}
                        >
                            <div className="opacity-60">{item.icon}</div>
                            <span className="text-sm font-medium">{item.label}</span>
                            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest opacity-30">{item.type}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Features() {
    const [activeIndex, setActiveIndex] = useState(0);

    const visuals = [
        <TimelineVisual key="timeline" />,
        <RegistryVisual key="registry" />,
        <LocationsVisual key="locations" />,
        <CommandSearchVisual key="search" />
    ];

    return (
        <section id="features" className="relative w-full bg-[#09090b] py-16">
            <div className="relative z-10 max-w-5xl mx-auto">

                {/* Section Heading */}
                <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-2">
                        Practical engineering.<br />
                        Built for clarity.
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
                                        "rounded p-5 cursor-pointer transition-all duration-300 border",
                                        isActive
                                            ? "bg-[#141416] border-white/10"
                                            : "bg-[#0f0f11] hover:bg-[#141416] border-transparent"
                                    )}
                                >
                                    {/* Tab Header */}
                                    <div className="flex items-center">
                                        <div className={cn(
                                            "w-[3px] h-5 rounded mr-4 transition-colors duration-300",
                                            isActive ? "bg-white" : "bg-zinc-800"
                                        )} />
                                        <h3 className={cn(
                                            "text-lg tracking-tight transition-colors duration-300 flex items-center justify-between w-full",
                                            isActive ? "text-white font-medium" : "text-zinc-400 font-normal"
                                        )}>
                                            {item.title}
                                            {isActive && <ChevronRight size={16} className="text-white/20" />}
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
                                                <div className="pt-3 pl-7 flex flex-col gap-1">
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

                    {/* Right Side: Animated Mock UI Panel */}
                    <div className="w-full lg:w-[55%] relative min-h-[400px] rounded overflow-hidden bg-[#0c0c0e] border border-white/5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="absolute inset-0"
                            >
                                {visuals[activeIndex]}
                            </motion.div>
                        </AnimatePresence>

                        {/* Premium Overlays */}
                        <div className="absolute inset-0 pointer-events-none border border-white/10 rounded" />
                        <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-[#09090b]/40 to-transparent" />
                    </div>

                </div>
            </div>
        </section>
    );
}

