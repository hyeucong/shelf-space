import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/pages/landing/navbar';
import Banner from '@/pages/landing/banner';

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
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a]">

                <main className="flex flex-col items-center flex-1 w-full max-w-5xl px-6 py-12 lg:py-24">
                    <Banner />
                </main>
            </div>
        </>
    );
}

