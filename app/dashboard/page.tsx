"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Moto {
    id: string;
    brand: string;
    model: string;
    year: number;
    status: string; // COMPRADA, EN_REPARACION, A_LA_VENTA, VENDIDA
    purchaseCostEstimated: number;
    purchaseCostReal: number | null;
    salePriceEstimated: number | null;
    salePriceReal: number | null;
    image?: string; // URL for moto image
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [filter, setFilter] = useState("Todos");
    const [motos, setMotos] = useState<Moto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        async function fetchMotos() {
            try {
                const res = await fetch('/api/motos');
                if (res.ok) {
                    const data = await res.json();
                    setMotos(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchMotos();
    }, []);

    const filteredMotos = filter === "Todos"
        ? motos
        : motos.filter(m => m.status === filter.toUpperCase().replace(/ /g, '_'));


    // Status mapping for visual display
    const getStatusDisplay = (status: string) => {
        return status.replace(/_/g, ' ');
    }

    // Calculate summary stats
    const totalInvertido = motos.reduce((acc, m) => acc + ((m.purchaseCostReal || m.purchaseCostEstimated) || 0), 0);
    const totalProyectado = motos.reduce((acc, m) => acc + ((m.salePriceEstimated || 0) * 1), 0);

    return (
        <main className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col relative overflow-hidden font-display selection:bg-primary selection:text-black transition-colors duration-300">

            {/* Top App Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between max-w-7xl mx-auto w-full bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-white/5 transition-all duration-300">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">two_wheeler</span>
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight uppercase">R-Motos</h2>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="relative rounded-full overflow-hidden w-10 h-10 border-2 border-primary/20 hover:border-primary transition-colors"
                        >
                            {session?.user?.image ? (
                                <img className="w-full h-full object-cover" src={session.user.image} alt="User Avatar" />
                            ) : (
                                <div className="w-full h-full bg-surface-dark flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                            )}
                        </button>

                        {/* User Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden">
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">logout</span>
                                    <span className="font-medium">Cerrar Sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area - Centered for Desktop */}
            <div className="flex-1 w-full pt-20 pb-24 px-4 overflow-y-auto no-scrollbar space-y-6 max-w-5xl mx-auto">

                {/* Filter Chips */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                    {["Todos", "En la Mira", "Comprada", "En Taller", "En Venta", "Vendida"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-5 pr-5 transition-all text-sm font-medium border ${filter === f
                                ? "bg-primary border-primary text-black shadow-md shadow-primary/20 font-bold"
                                : "bg-white dark:bg-surface-dark border-gray-200 dark:border-white/10 text-gray-500 dark:text-text-dim hover:bg-gray-100 dark:hover:bg-surface-highlight hover:text-black dark:hover:text-white"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <p className="text-gray-500 dark:text-text-dim text-xs uppercase font-bold tracking-wider mb-2">Total Invertido</p>
                        <p className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">
                            ${(totalInvertido / 1000000).toFixed(1)}M
                        </p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <p className="text-primary text-xs uppercase font-bold tracking-wider mb-2">Proyectado</p>
                        <p className="text-primary text-2xl md:text-3xl font-bold tracking-tight">
                            +${(totalProyectado / 1000000).toFixed(1)}M
                        </p>
                    </div>
                </div>

                {/* Card List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {loading ? (
                        <div className="col-span-full py-10 text-center text-gray-500">Cargando motos...</div>
                    ) : filteredMotos.length === 0 ? (
                        <div className="col-span-full py-10 text-center flex flex-col items-center">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">two_wheeler</span>
                            <p className="text-gray-500">No hay motos en esta categoría</p>
                        </div>
                    ) : filteredMotos.map((moto) => (
                        <Link key={moto.id} href={`/motos/${moto.id}`} className="block h-full">
                            <div className={`group relative flex flex-col h-full rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${moto.status === 'VENDIDA' ? 'opacity-75' : ''}`}>
                                <div className="flex p-4 gap-4 items-start">
                                    {/* Moto Image */}
                                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden relative bg-gray-100 dark:bg-surface-highlight flex items-center justify-center">
                                        {moto.image ? (
                                            <img className={`w-full h-full object-cover ${moto.status === 'VENDIDA' ? 'grayscale' : ''}`} src={moto.image} alt={moto.model} />
                                        ) : (
                                            <span className="material-symbols-outlined text-gray-300 text-4xl">motorcycle</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col flex-1 justify-between min-w-0">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`text-lg font-bold leading-tight truncate pr-2 ${moto.status === 'VENDIDA' ? 'text-gray-400 line-through decoration-primary decoration-2' : 'text-slate-900 dark:text-white'}`}>
                                                    {moto.brand} {moto.model}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-2">{moto.year}</p>

                                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide mb-3 ${moto.status === 'EN_TALLER' ? 'bg-orange-100 dark:bg-orange-400/10 text-orange-700 dark:text-orange-400' :
                                                moto.status === 'EN_VENTA' ? 'bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400' :
                                                    moto.status === 'COMPRADA' ? 'bg-blue-100 dark:bg-blue-400/10 text-blue-700 dark:text-blue-400' :
                                                        moto.status === 'EN_LA_MIRA' ? 'bg-purple-100 dark:bg-purple-400/10 text-purple-700 dark:text-purple-400' :
                                                            'bg-gray-100 dark:bg-gray-400/10 text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {getStatusDisplay(moto.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 pb-4 mt-auto">
                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-0.5">Inversión</span>
                                            <span className="text-slate-900 dark:text-white font-bold font-mono">
                                                ${new Intl.NumberFormat('es-CO').format(moto.purchaseCostReal || moto.purchaseCostEstimated)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-0.5">Venta Est.</span>
                                            <span className="text-primary font-bold font-mono">
                                                ${new Intl.NumberFormat('es-CO').format(moto.salePriceEstimated || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Bottom Spacer */}
                <div className="h-24"></div>
            </div>

            {/* Floating Action Button */}
            <Link href="/motos/new">
                <button className="fixed bottom-8 right-6 md:bottom-10 md:right-10 z-60 bg-primary hover:bg-primary-dark text-black rounded-2xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-[0_4px_20px_rgba(250,204,20,0.4)] transition-transform hover:scale-105 active:scale-95">
                    <span className="material-symbols-outlined text-3xl md:text-4xl">add</span>
                </button>
            </Link>

        </main>
    );
}
