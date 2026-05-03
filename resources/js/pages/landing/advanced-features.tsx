import React from 'react';

function AdvancedFeatureCard({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="flex flex-col gap-2 p-6 rounded border border-white/10 bg-white/2 hover:bg-white/4 transition-colors">
            <h3 className="font-semibold text-lg text-white leading-tight">{title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
        </div>
    );
}

export default function AdvancedFeatures() {
    return (
        <section id="advanced-features" className="relative w-full bg-[#09090b] py-24 border-t border-white/5">
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="max-w-3xl mb-16">
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">
                        Manage your inventory exactly how you want
                    </h2>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        Create custom inventory management software that mirrors your operations
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AdvancedFeatureCard
                        title="Custom alerts and notifications"
                        desc="Set alerts for low stock, reorders, delayed shipments, or even demand spikes, and push notifications where it matters most"
                    />
                    <AdvancedFeatureCard
                        title="Batch and Serial Number tracking"
                        desc="Adjust to your industry's needs, improve traceability and ensure compliance with regulatory standards"
                    />
                    <AdvancedFeatureCard
                        title="Custom User Roles and Permissions"
                        desc="Implement highly specific user roles and permissions to ensure that employees only have access to relevant parts of the system"
                    />
                    <AdvancedFeatureCard
                        title="Integration with IoT Devices"
                        desc="Easily connect with Internet of Things (IoT) devices, such as smart shelves or sensors, to automate the tracking of inventory and improve accuracy"
                    />
                    <AdvancedFeatureCard
                        title="Custom workflow automation"
                        desc="Tailor and automate workflows like processing returns, reconciling discrepancies, or managing inventory transfers between locations"
                    />
                    <AdvancedFeatureCard
                        title="API Integrations"
                        desc="Ensure seamless synchronisation of stock levels, orders, and returns with e-commerce sites (e.g. Amazon, Shopify) and 3PLs"
                    />
                </div>
            </div>
        </section>
    );
}
