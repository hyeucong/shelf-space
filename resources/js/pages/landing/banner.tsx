import { Link } from '@inertiajs/react';
import { login } from '@/routes';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import bannerImg from '@/assets/banner.webp';
import { store as loginDemo } from '@/actions/App/Http/Controllers/Auth/DemoLoginController';


export default function Banner() {
    return (
        <div className="relative w-full overflow-hidden bg-[#09090b] pb-16">

            {/* Subtle Dot Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] bg-size-[14.4px_14.4px] mask-[radial-gradient(ellipse_at_center,#000_20%,transparent_70%)] pointer-events-none"></div>

            <style>
                {`
                    @keyframes pulse-scale {
                        0%, 100% { transform: scale(1); opacity: 0.35; filter: blur(20px) brightness(1); }
                        50% { transform: scale(1.1); opacity: 0.5; filter: blur(25px) brightness(1.2); }
                    }
                `}
            </style>

            {/* Custom SVG Noise Glow */}
            <div className="absolute -bottom-64 -right-64 w-[972px] h-[972px] pointer-events-none overflow-hidden origin-bottom-right animate-[pulse-scale_15s_ease-in-out_infinite]">
                <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <circle id="shape" cx="50" cy="50" r="50" />
                        <filter id="noise">
                            <feTurbulence
                                type="fractalNoise"
                                baseFrequency="19.5"
                                numOctaves="10"
                                result="turbulence"
                            />
                            <feComposite operator="in" in="turbulence" in2="SourceAlpha" result="composite" />
                            <feColorMatrix in="composite" type="luminanceToAlpha" />
                            <feBlend in="SourceGraphic" in2="composite" mode="color-burn" />
                        </filter>
                        <mask id="gradient">
                            <linearGradient id="fade" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="black" stopOpacity="0.6" />
                                <stop offset="65%" stopColor="white" stopOpacity="0.9" />
                                <stop offset="75%" stopColor="white" stopOpacity="1" />
                            </linearGradient>
                            <use href="#shape" fill="url('#fade')" />
                        </mask>
                    </defs>
                    <use href="#shape" fill="white" mask="url(#gradient)" filter="url('#noise')" />
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[360px] bg-linear-to-t from-white/5 to-transparent pointer-events-none"></div>

            <div className="relative z-10 max-w-5xl mx-auto pt-20">

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

                        <Link
                            href={loginDemo().url}
                            method="post"
                            as="button"
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
                                className="absolute inset-0 pointer-events-none transition-opacity ease-in-out duration-1200 opacity-0 group-hover:opacity-100"
                                data-framer-name="Glow Hover"
                                style={{
                                    background: 'radial-gradient(60.6% 50% at 50% 100%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)',
                                    borderRadius: '8px',
                                    filter: 'blur(18px)',
                                }}
                            ></div>

                            <div
                                className="absolute inset-0 pointer-events-none will-change-auto transition-opacity ease-in-out duration-1200 opacity-100 group-hover:opacity-0"
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
                        </Link>
                        <div className="relative group/hint">
                            <style>
                                {`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}
                            </style>
                            <span className="font-['Caveat'] text-2xl text-white leading-none">
                                Your time is valuable, so I built a shortcut for you.
                            </span>
                            <div className="absolute -left-20 top-4 w-[130px] h-auto pointer-events-none opacity-80 rotate-[-20deg]">
                                <svg width="447" height="269" viewBox="0 0 447 269" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                    <path d="M57.9386 51.2649C57.4202 84.8756 73.97 113.867 99.4759 134.865C127.692 158.157 158.687 164.905 183.924 133.474C182.57 152.812 180.208 174.086 190.957 191.33C216.963 229.082 271.803 227.777 290.696 183.706C294.937 206.049 300.34 231.66 320.753 244.874C355.438 264.993 404.94 241.56 419.066 205.906C426.26 191.576 427.373 175.546 428.864 159.877C431.012 142.62 436.022 124.352 430.509 107.306C423.166 86.2879 397.704 109.79 416.331 117.104C417.862 130.893 414.588 144.626 412.779 158.243C411.48 176.437 408.913 194.938 398.346 210.356C381.729 234.918 333.309 249.98 317.299 217.399C310.151 202.918 307.374 186.733 305.254 170.858C304.369 161.698 303.75 152.512 303.454 143.316C303.712 137.765 302.61 130.409 295.804 129.775C280.062 128.07 291.463 162.08 267.301 190.313C250.747 210.964 215.294 202.362 203.515 180.777C193.204 156.836 202.872 129.954 201.795 104.863C201.757 96.7558 190.288 93.7639 186.48 100.966C182.941 108.224 178.434 114.925 173.26 121.12C165.174 130 154.841 141.28 141.6 138.553C114.119 132.115 91.3425 109.003 80.0444 83.999C76.6763 74.7488 74.7237 65.0254 74.3038 55.1914C73.4004 48.8268 76.533 39.5456 68.0845 37.4474C59.9411 35.6445 56.6805 44.6177 57.9386 51.2649Z" fill="white" />
                                    <path d="M25.8178 91.7622C35.8703 95.2263 37.5476 82.2134 42.0517 76.3338C48.5947 65.7132 58.5405 56.9739 61.7132 44.5533C76.3845 51.0405 90.9885 57.6215 105.15 65.1801C112.796 68.4316 121.375 74.9934 129.969 71.95C136.877 68.9998 136.022 58.2152 128.615 56.599C118.307 55.7163 109.531 48.5312 100.126 44.4675C90.0031 39.2811 79.5054 34.9427 69.1608 30.2255C62.7356 26.9201 53.224 23.4373 49.2543 31.9348C46.6087 37.0204 45.9688 42.9928 42.768 47.8243C37.4832 56.8583 10.0795 84.2299 25.8178 91.7622Z" fill="white" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Reference Image */}
                <div className="w-full border border-white/20 rounded p-2">
                    <img
                        src={bannerImg}
                        alt="Dashboard Preview"
                        className="w-full h-auto block rounded"
                    />
                </div>
            </div>
        </div>
    );
}
