import { Link } from '@inertiajs/react';
import { login } from '@/routes';
import { Button } from '@/components/ui/button';

function FeatureCard({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="p-6 rounded border border-white/10 bg-white/5 backdrop-blur-sm">
            <h3 className="font-semibold text-lg mb-2 text-white">{title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
        </div>
    );
}

export default function Features() {
    return (
        <div className="relative w-full overflow-hidden bg-[#09090b] py-24 border-t border-white/5">
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Feature Grid */}
                <section className="grid grid-cols-1 gap-8 sm:grid-cols-3 w-full">
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
