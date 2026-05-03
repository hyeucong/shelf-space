import { Link } from '@inertiajs/react';
import { login } from '@/routes';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

export default function Banner() {
    return (
        <div className="relative w-full overflow-hidden bg-[#09090b] pb-16">

            {/* Subtle Dot Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_at_center,#000_20%,transparent_70%)] pointer-events-none"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 lg:px-8">

                {/* Hero Section */}
                <section className="text-left max-w-5xl mb-12">

                    {/* Main Heading */}
                    <h1 className="text-2xl md:text-3xl lg:text-5xl font-medium tracking-tight text-white mb-6 leading-[1.2]">
                        Stay in control of every unit.
                    </h1>

                    {/* Subtext */}
                    <p className="text-sm md:text-base text-zinc-400 mb-8 max-w-2xl leading-relaxed">
                        Inventory isn’t just numbers on a spreadsheet. shelf-space gives you total visibility and control over your hardware and software assets across every location.
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center gap-4">
                        <Button
                            size="lg"
                            className="bg-white text-black hover:bg-zinc-200 rounded px-6 font-medium gap-2"
                            asChild
                        >
                            <Link href={login()}>
                                Get started now
                                <ArrowUpRight size={18} />
                            </Link>
                        </Button>

                        <button
                            className="group relative flex flex-col items-center justify-center w-[180px] h-[48px] decoration-0 transition-transform active:scale-95 cursor-pointer outline-none"
                            type="button"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                opacity: 1,
                                border: 'none',
                                padding: 0,
                            }}
                            data-framer-name="desktop"
                        >
                            <div
                                className="absolute inset-0 pointer-events-none transition-opacity ease-in-out duration-1200 opacity-100 group-hover:opacity-0"
                                data-framer-name="Glow"
                                style={{
                                    background: 'radial-gradient(15% 50% at 50% 100%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)',
                                    borderRadius: '8px',
                                    filter: 'blur(15px)',
                                }}
                            ></div>

                            <div
                                className="absolute inset-0 pointer-events-none transition-opacity ease-in-out duration-1200city-0 group-hover:opacity-100"
                                data-framer-name="Glow Hover"
                                style={{
                                    background: 'radial-gradient(60.6% 50% at 50% 100%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)',
                                    borderRadius: '8px',
                                    filter: 'blur(18px)',
                                }}
                            ></div>

                            <div
                                className="absolute inset-0 pointer-events-none will-change-auto transition-opacity ease-in-out duration-1200city-100 group-hover:opacity-0"
                                data-framer-name="Stroke"
                                style={{
                                    background: 'radial-gradient(10.7% 50% at 50% 100%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)',
                                    borderRadius: '8px',
                                }}
                            ></div>

                            <div
                                className="absolute inset-0 pointer-events-none will-change-auto transition-opacity ease-in-out duration-1200 opacity-0 group-hover:opacity-100"
                                data-framer-name="Stroke Hover"
                                style={{
                                    background: 'radial-gradient(60.1% 50% at 50% 100%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)',
                                    borderRadius: '8px',
                                }}
                            ></div>

                            <div
                                className="absolute inset-px pointer-events-none z-10 rounded-[7px]"
                                data-framer-name="Fill"
                                style={{
                                    backgroundColor: 'rgb(0, 0, 0)',
                                    opacity: 1,
                                }}
                            ></div>

                            <div
                                className="relative z-20 flex flex-col items-center justify-center opacity-100"
                                data-framer-name="text content"
                            >
                                <div
                                    className="flex flex-col items-center justify-center transform-none opacity-100"
                                    data-framer-name="Text"
                                >
                                    <p
                                        className="m-0 p-0 font-sans text-[15px] font-medium text-white tracking-wide flex items-center gap-2"
                                        style={{
                                            WebkitFontSmoothing: 'antialiased',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        View Demo
                                        <ArrowUpRight size={16} />
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                {/* Reference Image */}
                <div className="w-full ">
                    <img
                        src="https://framerusercontent.com/images/Sh880sHyNnkevnmfd0Pd1wSthI.png?scale-down-to=1024&width=7136&height=3840"
                        alt="Dashboard Preview"
                        className="w-full h-auto block rounded"
                    />
                </div>
            </div>
        </div>
    );
}
