import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/pages/landing/navbar';
import Banner from '@/pages/landing/banner';
import Features from '@/pages/landing/features';
import AdvancedFeatures from '@/pages/landing/advanced-features';

export default function Welcome() {
    const { auth } = usePage().props;

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
                    <Features />
                    <AdvancedFeatures />
                </main>
            </div>
        </>
    );
}
