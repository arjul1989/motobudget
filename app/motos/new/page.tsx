"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewMotoPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState("/motos/akt_nkd_125.png");
    const [showImagePicker, setShowImagePicker] = useState(false);

    const MOTO_CATALOG = [
        { brand: "AKT", model: "NKD 125", url: "/motos/akt_nkd_125.png" },
        { brand: "Bajaj", model: "CT100", url: "/motos/bajaj_ct100.png" },
        { brand: "Yamaha", model: "NMAX 155", url: "/motos/yamaha_nmax_155.png" },
        { brand: "Yamaha", model: "XTZ 150", url: "/motos/yamaha_xtz_150.png" },
        { brand: "Suzuki", model: "GN 125", url: "/motos/suzuki_gn_125.png" },
        { brand: "Bajaj", model: "Pulsar NS 200", url: "/motos/bajaj_pulsar_ns_200.png" },
        { brand: "Suzuki", model: "DR 150", url: "/motos/suzuki_dr_150.png" },
        { brand: "Yamaha", model: "T115 FI", url: "/motos/yamaha_t115_fi.png" },
        { brand: "Bajaj", model: "Pulsar NS 160", url: "/motos/bajaj_pulsar_ns_160.png" },
        { brand: "TVS", model: "Raider 125", url: "/motos/tvs_raider_125.png" },
        { brand: "Honda", model: "XR 150L", url: "/motos/honda_xr_150l.png" },
        { brand: "Victory", model: "One", url: "/motos/victory_one.png" },
        { brand: "Hero", model: "Splendor +", url: "/motos/hero_splendor_plus.png" },
        { brand: "Yamaha", model: "FZ 25", url: "/motos/yamaha_fz_25.png" },
        { brand: "Suzuki", model: "Gixxer 150", url: "/motos/suzuki_gixxer_150.png" },
        { brand: "Honda", model: "CB125F", url: "/motos/honda_cb125f.png" },
        { brand: "Honda", model: "XR 190L", url: "/motos/honda_xr_190l.png" },
        { brand: "Victory", model: "Bomber 125", url: "/motos/victory_bomber_125.png" },
        { brand: "AKT", model: "CR4 125", url: "/motos/akt_cr4_125.png" },
        { brand: "TVS", model: "Apache RTR 160", url: "/motos/tvs_apache_rtr_160.png" },
    ];

    // Form State
    const [formData, setFormData] = useState({
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        plate: "",
        image: "/motos/akt_nkd_125.png",
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseCostEstimated: "",
        laborCostEstimated: "",
        partsCostEstimated: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            ...formData,
            image: selectedImage,
            purchaseCostEstimated: parseFloat(formData.purchaseCostEstimated || "0"),
            laborCostEstimated: parseFloat(formData.laborCostEstimated || "0"),
            parts: parseFloat(formData.partsCostEstimated || "0") > 0 ? [{
                name: "Repuestos Estimados",
                estimated: parseFloat(formData.partsCostEstimated || "0"),
                real: 0
            }] : [],
            year: parseInt(formData.year.toString())
        };

        try {
            const res = await fetch('/api/motos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push('/dashboard');
            } else {
                alert("Error al crear la moto");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen font-display selection:bg-primary selection:text-black">
            {/* Header */}
            <div className="sticky top-0 z-50 flex items-center bg-white/90 dark:bg-background-dark/90 backdrop-blur-md p-4 border-b border-gray-200 dark:border-white/5 max-w-3xl mx-auto w-full">
                <Link href="/dashboard">
                    <button className="text-slate-900 dark:text-white hover:text-primary transition-colors flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                </Link>
                <h2 className="ml-4 text-lg font-bold leading-tight tracking-tight flex-1">Nueva Moto</h2>
            </div>

            <div className="max-w-3xl mx-auto p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Section: Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-2">Información de la Moto</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Marca</label>
                                <input
                                    name="brand"
                                    required
                                    className="h-12 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white"
                                    placeholder="Ej: Yamaha"
                                    value={formData.brand}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Modelo</label>
                                <input
                                    name="model"
                                    required
                                    className="h-12 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white"
                                    placeholder="Ej: DT 125"
                                    value={formData.model}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Año</label>
                                <input
                                    name="year"
                                    type="number"
                                    inputMode="numeric"
                                    required
                                    className="h-12 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white"
                                    placeholder="Ej: 2005"
                                    value={formData.year}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Placa (Opcional)</label>
                                <input
                                    name="plate"
                                    className="h-12 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white uppercase"
                                    placeholder="XXX-123"
                                    value={formData.plate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Image Selector */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-2">Imagen de la Moto</h3>

                        <div className="flex flex-col gap-4">
                            <div className="relative w-full aspect-video bg-gray-100 dark:bg-surface-dark rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                                <img
                                    src={selectedImage}
                                    alt="Moto seleccionada"
                                    className="w-full h-full object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowImagePicker(!showImagePicker)}
                                    className="absolute top-3 right-3 bg-white dark:bg-surface-dark p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                                >
                                    <span className="material-symbols-outlined text-primary">edit</span>
                                </button>
                            </div>

                            {showImagePicker && (
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 p-4 bg-gray-50 dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                                    {MOTO_CATALOG.map((moto, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setSelectedImage(moto.url);
                                                setShowImagePicker(false);
                                            }}
                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selectedImage === moto.url
                                                    ? 'border-primary shadow-lg shadow-primary/20'
                                                    : 'border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            <img
                                                src={moto.url}
                                                alt={`${moto.brand} ${moto.model}`}
                                                className="w-full h-full object-contain bg-white dark:bg-gray-800"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section: Purchase Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-2">Estimaciones Iniciales</h3>

                        <div className="flex flex-col gap-1 md:w-1/3">
                            <label className="text-xs font-bold uppercase text-gray-500">Fecha de Compra</label>
                            <input
                                name="purchaseDate"
                                type="date"
                                required
                                className="h-12 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Compra Moto (Estimado)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        name="purchaseCostEstimated"
                                        type="number"
                                        inputMode="numeric"
                                        required
                                        className="h-12 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark pl-8 pr-4 font-mono font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white"
                                        placeholder="0"
                                        value={formData.purchaseCostEstimated}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Repuestos (Estimado)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        name="partsCostEstimated"
                                        type="number"
                                        inputMode="numeric"
                                        className="h-12 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark pl-8 pr-4 font-mono font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white"
                                        placeholder="0"
                                        value={formData.partsCostEstimated}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Mano de Obra (Estimado)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        name="laborCostEstimated"
                                        type="number"
                                        inputMode="numeric"
                                        className="h-12 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark pl-8 pr-4 font-mono font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white"
                                        placeholder="0"
                                        value={formData.laborCostEstimated}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-4"></div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary hover:bg-primary-dark text-black font-bold h-14 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed font-display tracking-wide uppercase"
                    >
                        {submitting ? 'Guardando...' : 'Crear Moto'}
                    </button>

                    <div className="h-10"></div>
                </form>
            </div>
        </main>
    );
}
