import { Bell, QrCode, ShieldCheck, History, Laptop, Calendar, LucideIcon } from 'lucide-react';

function AdvancedFeatureCard({ title, desc, icon: Icon }: { title: string; desc: string; icon: LucideIcon }) {
    return (
        <div className="flex flex-col gap-6 p-8 hover:bg-white/5 transition-colors h-full">
            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-3">
                <h3 className="font-semibold text-xl text-white leading-tight">{title}</h3>
                <p className="text-base text-zinc-400 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

export default function AdvancedFeatures() {
    const row1Features = [
        {
            title: "Smart Alerts",
            desc: "Set automated alerts for maintenance schedules, low stock, or checkout deadlines.",
            icon: Bell
        },
        {
            title: "Dynamic QR Tags",
            desc: "Generate and print unique QR codes for every asset to bridge the physical and digital gap.",
            icon: QrCode
        },
        {
            title: "Granular Security",
            desc: "Implement field-level permissions to ensure sensitive asset data is only seen by the right eyes.",
            icon: ShieldCheck
        }
    ];

    const row2Features = [
        {
            title: "Full Audit History",
            desc: "Track every change, checkout, and movement with a permanent, immutable audit trail.",
            icon: History
        },
        {
            title: "Bulk Operations",
            desc: "Manage thousands of assets at once with powerful bulk editing and import tools.",
            icon: Laptop
        },
        {
            title: "Lifecycle Tracking",
            desc: "Monitor assets from procurement to retirement with automated depreciation and health scoring.",
            icon: Calendar
        }
    ];

    return (
        <section id="advanced-features" className="relative w-full bg-[#09090b] py-24">

            {/* Header Area - Constrained */}
            <div className="relative z-10 max-w-5xl mx-auto mb-16">
                <div className="max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">
                        Manage your inventory exactly how you want
                    </h2>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        Create custom inventory management workflows that mirror your business operations.
                    </p>
                </div>
            </div>

            {/* Grid Area */}
            <div className="w-full flex flex-col">

                {/* Top Cap (The "1"s) - REMOVED border-t entirely */}
                <div className="w-full">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3">
                        <div className="flex justify-center border-l border-dashed border-white/20 py-4 text-zinc-600 text-sm"></div>
                        <div className="hidden md:flex justify-center border-l border-dashed border-white/20 py-4 text-zinc-600 text-sm"></div>
                        <div className="hidden md:flex justify-center border-x border-dashed border-white/20 py-4 text-zinc-600 text-sm"></div>
                    </div>
                </div>

                {/* Row 1 */}
                <div className="w-full border-t border-dashed border-white/20">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3">
                        {row1Features.map((feature, idx) => (
                            <div key={`row1-${idx}`} className={`border-l border-dashed border-white/20 ${idx === 2 ? 'md:border-r' : ''}`}>
                                <AdvancedFeatureCard title={feature.title} desc={feature.desc} icon={feature.icon} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2 */}
                <div className="w-full border-t border-dashed border-white/20">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3">
                        {row2Features.map((feature, idx) => (
                            <div key={`row2-${idx}`} className={`border-l border-dashed border-white/20 ${idx === 2 ? 'md:border-r' : ''}`}>
                                <AdvancedFeatureCard title={feature.title} desc={feature.desc} icon={feature.icon} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Cap (The "1"s) - CHANGED border-y to border-t */}
                <div className="w-full border-t border-dashed border-white/20">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3">
                        <div className="flex justify-center border-l border-dashed border-white/20 py-4 text-zinc-600 text-sm"></div>
                        <div className="hidden md:flex justify-center border-l border-dashed border-white/20 py-4 text-zinc-600 text-sm"></div>
                        <div className="hidden md:flex justify-center border-x border-dashed border-white/20 py-4 text-zinc-600 text-sm"></div>
                    </div>
                </div>

            </div>
        </section>
    );
}
