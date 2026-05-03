import React from 'react';

function AdvancedFeatureCard({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="flex flex-col gap-2 p-6 bg-white/5 hover:bg-white/10 transition-colors h-full">
            <img
                src="https://pbs.twimg.com/media/HHXBc6AbwAETIje?format=jpg&name=large"
                alt={title}
                className="h-[200px] w-full object-cover rounded-sm mb-4"
            />
            <h3 className="font-semibold text-lg text-white leading-tight">{title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
        </div>
    );
}

export default function AdvancedFeatures() {
    const features = [
        {
            title: "Custom alerts and notifications",
            desc: "Set alerts for low stock, reorders, delayed shipments, or even demand spikes, and push notifications where it matters most"
        },
        {
            title: "Batch and Serial Number tracking",
            desc: "Adjust to your industry's needs, improve traceability and ensure compliance with regulatory standards"
        },
        {
            title: "Custom User Roles and Permissions",
            desc: "Implement highly specific user roles and permissions to ensure that employees only have access to relevant parts of the system"
        }
    ];

    return (
        <section id="advanced-features" className="relative w-full bg-[#09090b] py-24">

            {/* Header Area - Constrained */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 mb-16">
                <div className="max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">
                        Manage your inventory exactly how you want
                    </h2>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        Create custom inventory management software that mirrors your operations
                    </p>
                </div>
            </div>

            {/* Grid Area */}
            <div className="w-full flex flex-col">

                {/* Top Cap (The "1"s) - REMOVED border-t entirely */}
                <div className="w-full">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 px-6">
                        <div className="flex justify-center border-l border-dashed border-white/20 py-2 text-zinc-600 text-sm">1</div>
                        <div className="hidden md:flex justify-center border-l border-dashed border-white/20 py-2 text-zinc-600 text-sm">1</div>
                        <div className="hidden md:flex justify-center border-x border-dashed border-white/20 py-2 text-zinc-600 text-sm">1</div>
                    </div>
                </div>

                {/* Row 1 */}
                <div className="w-full border-t border-dashed border-white/20">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 px-6">
                        {features.map((feature, idx) => (
                            <div key={`row1-${idx}`} className={`border-l border-dashed border-white/20 ${idx === 2 ? 'md:border-r' : ''}`}>
                                <AdvancedFeatureCard title={feature.title} desc={feature.desc} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2 */}
                <div className="w-full border-t border-dashed border-white/20">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 px-6">
                        {features.map((feature, idx) => (
                            <div key={`row2-${idx}`} className={`border-l border-dashed border-white/20 ${idx === 2 ? 'md:border-r' : ''}`}>
                                <AdvancedFeatureCard title={feature.title} desc={feature.desc} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Cap (The "1"s) - CHANGED border-y to border-t */}
                <div className="w-full border-t border-dashed border-white/20">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 px-6">
                        <div className="flex justify-center border-l border-dashed border-white/20 py-2 text-zinc-600 text-sm">1</div>
                        <div className="hidden md:flex justify-center border-l border-dashed border-white/20 py-2 text-zinc-600 text-sm">1</div>
                        <div className="hidden md:flex justify-center border-x border-dashed border-white/20 py-2 text-zinc-600 text-sm">1</div>
                    </div>
                </div>

            </div>
        </section>
    );
}
