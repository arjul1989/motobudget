"use client";

import Link from "next/link";
import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const POPULAR_MOTOS = [
    "Yamaha NMAX", "Bajaj Boxer CT100", "Honda XR150L", "Yamaha XTZ125", "Suzuki GN125",
    "Bajaj Pulsar N250", "TVS Raider 125", "AKT NKD 125", "Honda CB125F", "Yamaha FZ25",
    "Suzuki Gixxer 150", "Bajaj Dominar 400", "KTM 200 Duke", "KTM 390 Duke", "Royal Enfield Himalayan",
    "Hero Eco Deluxe", "Honda PCX 150", "Yamaha MT-03", "Kawasaki Z400", "AKT TT Dual Sport",
    "Victory MRX 150", "Honda X-ADV", "Yamaha R15", "Suzuki DR150", "Benelli TRK 502",
    "BMW G310GS", "Husqvarna Svartpilen 401", "Harley-Davidson Sportster", "Ducati Scrambler", "Triumph Bonneville",
    "Generica"
];

export default function MotoDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [motoData, setMotoData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // Fetch logic
    useEffect(() => {
        async function fetchMoto() {
            if (!id) return;
            try {
                const res = await fetch(`/api/motos/${id}`);
                if (res.ok) {
                    const data = await res.json();

                    // Map API data to UI structure
                    setMotoData({
                        id: data.id,
                        brand: data.brand,
                        model: data.model,
                        year: data.year,
                        plate: data.plate || "",
                        status: data.status,
                        image: data.image || null,
                        salePriceEstimated: data.salePriceEstimated || 0,

                        // Flatten details for easier state mapping
                        purchaseCostReal: data.purchaseCostReal || 0,
                        purchaseCostEstimated: data.purchaseCostEstimated || 0,

                        paperworkCostReal: data.paperworkCostReal || 0,
                        paperworkCostEstimated: data.paperworkCostEstimated || 0,

                        laborCostReal: data.laborCostReal || 0,
                        laborCostEstimated: data.laborCostEstimated || 0,

                        parts: data.spareParts ? data.spareParts.map((p: any) => ({
                            id: p.id,
                            name: p.name,
                            type: "Repuesto",
                            estimated: p.costEstimated,
                            real: p.costReal || 0
                        })) : []
                    });
                } else {
                    console.error("Failed to fetch moto");
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchMoto();
    }, [id]);

    const handleUpdate = (field: string, value: any) => {
        setMotoData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleUpdateDetail = (field: string, value: string) => {
        const val = parseFloat(value) || 0;
        setMotoData((prev: any) => ({ ...prev, [field]: val }));
    };

    const handleUpdatePart = (idx: number, field: string, value: string) => {
        const newParts = [...motoData.parts];
        if (field === 'name') {
            newParts[idx] = { ...newParts[idx], name: value };
        } else {
            const val = parseFloat(value) || 0;
            newParts[idx] = { ...newParts[idx], [field]: val };
        }
        setMotoData((prev: any) => ({ ...prev, parts: newParts }));
    };

    const handleAddPart = () => {
        const newPart = {
            name: "",
            type: "Repuesto",
            estimated: 0,
            real: 0
        };
        setMotoData((prev: any) => ({ ...prev, parts: [...prev.parts, newPart] }));
    };
    const MOTO_STATUSES = ["EN_LA_MIRA", "COMPRADA", "EN_TALLER", "EN_VENTA", "VENDIDA"];

    const handleUpdateStatus = (direction: 'next' | 'prev') => {
        const currentIndex = MOTO_STATUSES.indexOf(motoData.status);
        let newIndex = currentIndex;

        if (direction === 'next' && currentIndex < MOTO_STATUSES.length - 1) {
            newIndex++;
        } else if (direction === 'prev' && currentIndex > 0) {
            newIndex--;
        }

        if (newIndex !== currentIndex) {
            setMotoData((prev: any) => ({ ...prev, status: MOTO_STATUSES[newIndex] }));
        }
    };

    const calculateTotalInvestment = () => {
        if (!motoData) return 0;
        const partsTotal = motoData.parts.reduce((acc: number, p: any) => acc + (p.real || 0), 0);
        return (motoData.purchaseCostReal || 0) + (motoData.paperworkCostReal || 0) + (motoData.laborCostReal || 0) + partsTotal;
    };

    const triggerSave = () => {
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        setShowSaveConfirm(false);
        setSaving(true);
        try {
            const payload = {
                purchaseCostReal: motoData.purchaseCostReal,
                paperworkCostReal: motoData.paperworkCostReal,
                laborCostReal: motoData.laborCostReal,
                salePriceEstimated: motoData.salePriceEstimated,
                parts: motoData.parts,
                plate: motoData.plate,
                image: motoData.image,
                status: motoData.status
            };

            const res = await fetch(`/api/motos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Success feedback handled by UI state if needed, or simple reset
            } else {
                alert("Error al guardar");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setSaving(false);
        }
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // ... (keep default saving logic above)

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirm(false);

        try {
            const res = await fetch(`/api/motos/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.push('/dashboard');
            } else {
                alert("Error al eliminar");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        }
    };
    const handleExportPDF = () => {
        if (!motoData) return;
        const doc = new jsPDF();

        // Colors
        const primaryColor = [250, 204, 20] as [number, number, number]; // Yellow
        const darkColor = [39, 39, 42] as [number, number, number]; // Zinc 800

        // -- HEADER --
        // Logo / Brand
        doc.setFontSize(26);
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text("R-MOTOS", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text("Taller y Compraventa de Motocicletas", 14, 26);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 31);

        // -- MOTO DETAILS BOX --
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(14, 38, 182, 35, 3, 3, 'F');

        doc.setFontSize(16);
        doc.setTextColor(...darkColor);
        doc.setFont("helvetica", "bold");
        doc.text(`${motoData.brand} ${motoData.model} (${motoData.year})`, 20, 50);

        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "bold");
        doc.text("Placa:", 20, 60);
        doc.setFont("helvetica", "normal");
        doc.text(motoData.plate || "N/A", 35, 60);

        doc.setFont("helvetica", "bold");
        doc.text("Estado:", 80, 60);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...primaryColor); // Highlight status
        doc.text(motoData.status.replace(/_/g, ' '), 100, 60);

        doc.setTextColor(80, 80, 80); // Reset

        // -- FINANCIAL SUMMARY --
        const totalInv = calculateTotalInvestment();
        const projected = motoData.salePriceEstimated || 0;
        const profit = projected - totalInv;
        const margin = totalInv > 0 ? Math.round((profit / totalInv) * 100) : 0;

        doc.text("Inversión Total:", 20, 68);
        doc.setFont("helvetica", "bold");
        doc.text(`$${new Intl.NumberFormat('es-CO').format(totalInv)}`, 55, 68);

        doc.setFont("helvetica", "normal");
        doc.text("Venta Sugerida:", 100, 68);
        doc.setFont("helvetica", "bold");
        doc.text(`$${new Intl.NumberFormat('es-CO').format(projected)}`, 135, 68);

        // -- DETAILED COSTS TABLE --
        const tableBody = [
            // Section Header
            // Section Header
            [{ content: 'Costos Base', colSpan: 3, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' as const } }],
            ["Compra de la Moto", `$${new Intl.NumberFormat('es-CO').format(motoData.purchaseCostEstimated)}`, `$${new Intl.NumberFormat('es-CO').format(motoData.purchaseCostReal || 0)}`],
            ["Trámites y Papeleo", `$${new Intl.NumberFormat('es-CO').format(motoData.paperworkCostEstimated)}`, `$${new Intl.NumberFormat('es-CO').format(motoData.paperworkCostReal || 0)}`],
            ["Mano de Obra General", `$${new Intl.NumberFormat('es-CO').format(motoData.laborCostEstimated)}`, `$${new Intl.NumberFormat('es-CO').format(motoData.laborCostReal || 0)}`],

            // Section Header
            [{ content: 'Repuestos y Ajustes', colSpan: 3, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' as const } }],
        ];

        // Add Parts
        if (motoData.parts && motoData.parts.length > 0) {
            motoData.parts.forEach((p: any) => {
                tableBody.push([
                    p.name || "Repuesto sin nombre",
                    `$${new Intl.NumberFormat('es-CO').format(p.estimated || 0)}`,
                    `$${new Intl.NumberFormat('es-CO').format(p.real || 0)}`
                ]);
            });
        } else {
            tableBody.push([{ content: "No hay repuestos registrados", colSpan: 3, styles: { halign: 'center', fontStyle: 'italic' as const } as any }]);
        }

        // Add Total Row
        tableBody.push(
            [{ content: 'TOTALES', colSpan: 1, styles: { fontStyle: 'bold' as const, fillColor: [250, 204, 20] } },
            { content: '', styles: { fillColor: [250, 204, 20] } },
            { content: `$${new Intl.NumberFormat('es-CO').format(totalInv)}`, styles: { fontStyle: 'bold' as const, fillColor: [250, 204, 20] } }]
        );

        autoTable(doc, {
            startY: 85,
            head: [['Concepto / Item', 'Costo Estimado', 'Costo Real']],
            body: tableBody,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3, lineColor: [200, 200, 200] },
            headStyles: { fillColor: darkColor, textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [252, 252, 252] },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 40, halign: 'right' },
                2: { cellWidth: 40, halign: 'right' }
            }
        });

        // -- PROFITABILITY FOOTER --
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFillColor(240, 253, 244); // Light green background
        doc.setDrawColor(22, 163, 74); // Green border
        doc.roundedRect(14, finalY, 182, 25, 3, 3, 'FD');

        doc.setFontSize(12);
        doc.setTextColor(22, 101, 52); // Dark green text
        doc.setFont("helvetica", "bold");
        doc.text("Rentabilidad del Proyecto", 20, finalY + 10);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Ganancia Neta Esperada: $${new Intl.NumberFormat('es-CO').format(profit)}`, 20, finalY + 18);
        doc.text(`Margen de Ganancia: ${margin}%`, 120, finalY + 18);

        // Disclaimer
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text("Este documento es un estimado presupuestal sujeto a cambios según imprevistos mecánicos o de mercado.", 14, 285);

        doc.save(`Presupuesto_${motoData.brand}_${motoData.model}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const selectImage = (imgName: string) => {
        // In a real app we'd map names to URLs.
        // For now, we store the name to display or a placeholder specific to it.
        // If "Generica", we set null/empty to show default icon.
        setMotoData((prev: any) => ({ ...prev, image: imgName === "Generica" ? null : imgName }));
        setShowImageSelector(false);
    };

    // Updated Moto Catalog with locally stored images
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

    if (loading || !motoData) return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">Cargando...</div>;

    const totalInversion = calculateTotalInvestment();
    const ganancia = (motoData.salePriceEstimated || 0) - totalInversion;
    const margen = totalInversion > 0 ? Math.round((ganancia / totalInversion) * 100) : 0;

    return (
        <main className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased min-h-screen selection:bg-primary selection:text-black">
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/10 transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="bg-red-100 dark:bg-red-500/20 p-4 rounded-full text-red-600 dark:text-red-500">
                                <span className="material-symbols-outlined text-4xl">warning</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold dark:text-white text-slate-900">¿Eliminar Moto?</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Esta acción es permanente y no se puede deshacer.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="w-full py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation Modal */}
            {showSaveConfirm && (
                <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/10 transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="bg-primary/20 p-4 rounded-full text-primary">
                                <span className="material-symbols-outlined text-4xl">save</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold dark:text-white text-slate-900">¿Guardar Cambios?</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Se actualizarán los costos y la información de la moto.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                <button
                                    onClick={() => setShowSaveConfirm(false)}
                                    className="w-full py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmSave}
                                    className="w-full py-3 rounded-xl font-bold bg-primary text-black hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Selector Modal */}
            {showImageSelector && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-black/80">
                    <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 transition-colors duration-300">

                        {/* Header */}
                        <header className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20">
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                    Seleccionar <span className="text-primary">Moto</span>
                                </h1>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider">RMOTO GARAGE</span>
                            </div>
                            <button onClick={() => setShowImageSelector(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group">
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-900 dark:group-hover:text-primary">close</span>
                            </button>
                        </header>

                        {/* Search Bar (Visual Only for now) */}
                        <div className="px-6 py-3 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 z-10">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
                                <input
                                    className="w-full bg-gray-100 dark:bg-zinc-950 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary placeholder-gray-500 dark:placeholder-zinc-600 transition-all shadow-inner"
                                    placeholder="Buscar modelo o marca..."
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-black/20 custom-scrollbar">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
                                {MOTO_CATALOG.map((moto, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => selectImage(moto.url)}
                                        className="group flex flex-col bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-primary dark:hover:border-primary transition-all duration-200 relative"
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
                                        </div>
                                        <div className="h-32 w-full bg-gray-100 dark:bg-zinc-900/50 p-2 flex items-center justify-center">
                                            <img
                                                alt={moto.model}
                                                className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                                                src={moto.url}
                                            />
                                        </div>
                                        <div className="p-3 text-left w-full border-t border-gray-100 dark:border-zinc-700/50 bg-white dark:bg-zinc-800">
                                            <span className="block text-xs font-bold text-primary uppercase tracking-wider mb-0.5">{moto.brand}</span>
                                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors leading-tight">{moto.model}</h3>
                                        </div>
                                    </button>
                                ))}

                                {/* Generic Option */}
                                <button
                                    onClick={() => selectImage("Generica")}
                                    className="group flex flex-col bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-primary dark:hover:border-primary transition-all duration-200 relative"
                                >
                                    <div className="h-32 w-full bg-gray-100 dark:bg-zinc-900/50 p-2 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl text-gray-400 group-hover:text-primary transition-colors">two_wheeler</span>
                                    </div>
                                    <div className="p-3 text-left w-full border-t border-gray-100 dark:border-zinc-700/50 bg-white dark:bg-zinc-800">
                                        <span className="block text-xs font-bold text-primary uppercase tracking-wider mb-0.5">Varias</span>
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors leading-tight">Genérica</h3>
                                    </div>
                                </button>

                                {/* Manual Option (Mock for now, acts like generic file upload in future?) */}
                                <button
                                    className="group flex flex-col bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-primary dark:hover:border-primary transition-all duration-200 relative opacity-50 cursor-not-allowed"
                                >
                                    <div className="h-32 w-full bg-gray-100 dark:bg-zinc-900/50 p-2 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl text-gray-400 group-hover:text-primary transition-colors">add_circle_outline</span>
                                    </div>
                                    <div className="p-3 text-left w-full border-t border-gray-100 dark:border-zinc-700/50 bg-white dark:bg-zinc-800">
                                        <span className="block text-xs font-bold text-primary uppercase tracking-wider mb-0.5">Manual</span>
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors leading-tight">Otro Modelo</h3>
                                    </div>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-4xl mx-auto shadow-none md:shadow-2xl bg-background-light dark:bg-background-dark">

                {/* Top App Bar */}
                <div className="sticky top-0 z-50 flex items-center bg-white/90 dark:bg-background-dark/90 backdrop-blur-md p-4 justify-between border-b border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard">
                            <button className="text-slate-900 dark:text-white hover:text-primary transition-colors flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                                <span className="material-symbols-outlined text-2xl">arrow_back</span>
                            </button>
                        </Link>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">Detalle del Proyecto</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-8">

                    {/* Left Column: Header & Info */}
                    <div className="flex flex-col gap-6">

                        {/* Profile / Bike Header */}
                        <div className="flex gap-5 items-start">
                            <div className="relative group cursor-pointer shrink-0" onClick={() => setShowImageSelector(true)}>
                                <div
                                    className="bg-center bg-no-repeat bg-gray-200 dark:bg-surface-highlight aspect-square bg-cover rounded-xl w-28 h-28 shadow-lg ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-center overflow-hidden"
                                >
                                    {motoData.image ? (
                                        <img src={motoData.image} className="w-full h-full object-cover" alt="Moto" />
                                    ) : (
                                        <span className="material-symbols-outlined text-4xl text-gray-400">motorcycle</span>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-1.5 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <span className="material-symbols-outlined text-primary text-[18px] block">edit</span>
                                </div>
                            </div>
                            <div className="flex flex-col flex-1 gap-1">
                                <div className="flex items-start justify-between">
                                    <h1 className="text-2xl font-bold leading-none tracking-tight">{motoData.brand} {motoData.model}</h1>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Modelo {motoData.year}</p>
                                <div className="mt-2 flex flex-wrap gap-2 items-center">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleUpdateStatus('prev')}
                                            disabled={motoData.status === "EN_LA_MIRA"}
                                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="Estado Anterior"
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                                        </button>

                                        <div className="px-2.5 py-1 rounded bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-500 text-xs font-bold uppercase tracking-wider min-w-[100px] text-center">
                                            {motoData.status.replace(/_/g, ' ')}
                                        </div>

                                        <button
                                            onClick={() => handleUpdateStatus('next')}
                                            disabled={motoData.status === "VENDIDA"}
                                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="Siguiente Estado"
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                                        </button>
                                    </div>
                                    <input
                                        className="w-24 px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono text-slate-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-primary uppercase"
                                        value={motoData.plate}
                                        onChange={(e) => handleUpdate('plate', e.target.value.toUpperCase())}
                                        placeholder="PLACA"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Financial Summary Dashboard */}
                        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm md:shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Resultados Financieros</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-500 font-medium">Inversión Total (Real)</span>
                                    <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                                        ${new Intl.NumberFormat('es-CO').format(totalInversion)}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-500 font-medium">Venta Sugerida</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            className="w-full bg-transparent border-b border-dashed border-gray-300 dark:border-gray-500 focus:border-primary text-lg font-bold font-mono text-slate-700 dark:text-gray-300 py-0 px-0 outline-none"
                                            type="number"
                                            inputMode="numeric"
                                            value={motoData.salePriceEstimated || ''}
                                            onChange={(e) => handleUpdateDetail('salePriceEstimated', e.target.value)}
                                        />
                                        <span className="material-symbols-outlined text-gray-400 text-sm cursor-help">edit</span>
                                    </div>
                                </div>
                                <div className="col-span-2 bg-gray-50 dark:bg-gray-950/50 rounded-lg p-4 border border-primary/20 flex items-center justify-between mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-primary font-bold uppercase tracking-wider">Ganancia Neta</span>
                                        <span className="text-[10px] text-gray-400">Margen Calculado: {margen}%</span>
                                    </div>
                                    <span className="text-3xl font-bold text-primary font-mono tracking-tight">
                                        ${new Intl.NumberFormat('es-CO').format(ganancia)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleExportPDF}
                            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-white/5 text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 font-bold h-12 rounded-lg transition-all active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                            <span>Exportar Presupuesto PDF</span>
                        </button>

                    </div>


                    {/* Right Column: Tables */}
                    <div className="flex flex-col gap-6">

                        {/* Cost Table */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-lg font-bold">Costos & Ejecución</h3>

                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-gray-100 dark:bg-surface-dark rounded-t-lg border-b border-gray-200 dark:border-gray-700">
                                <div className="col-span-4 text-xs font-bold uppercase tracking-wider text-gray-500">Concepto</div>
                                <div className="col-span-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Estimado</div>
                                <div className="col-span-4 text-right text-xs font-bold uppercase tracking-wider text-primary">Real</div>
                            </div>

                            {/* Table Body */}
                            <div className="bg-white/50 dark:glass-panel rounded-b-lg overflow-hidden flex flex-col divide-y divide-gray-200 dark:divide-gray-700/50 border border-t-0 border-gray-200 dark:border-white/5">

                                {/* Purchase Cost */}
                                <div className="grid grid-cols-12 gap-3 p-3 items-center group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="col-span-4 flex flex-col justify-center">
                                        <span className="text-sm font-medium">Compra Moto</span>
                                    </div>
                                    <div className="col-span-4 text-right text-sm text-gray-500 dark:text-gray-300 font-mono font-medium">
                                        {new Intl.NumberFormat('es-CO').format(motoData.purchaseCostEstimated)}
                                    </div>
                                    <div className="col-span-4">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                            <input
                                                className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 focus:border-primary text-right text-slate-900 dark:text-white text-sm py-1.5 pl-4 pr-2 rounded outline-none font-mono transition-all"
                                                type="number"
                                                inputMode="numeric"
                                                value={motoData.purchaseCostReal || ''}
                                                onChange={(e) => handleUpdateDetail('purchaseCostReal', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Paperwork Cost */}
                                <div className="grid grid-cols-12 gap-3 p-3 items-center group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="col-span-4 flex flex-col justify-center">
                                        <span className="text-sm font-medium">Trámites</span>
                                    </div>
                                    <div className="col-span-4 text-right text-sm text-gray-500 dark:text-gray-300 font-mono font-medium">
                                        {new Intl.NumberFormat('es-CO').format(motoData.paperworkCostEstimated)}
                                    </div>
                                    <div className="col-span-4">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                            <input
                                                className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 focus:border-primary text-right text-slate-900 dark:text-white text-sm py-1.5 pl-4 pr-2 rounded outline-none font-mono transition-all"
                                                type="number"
                                                inputMode="numeric"
                                                value={motoData.paperworkCostReal || ''}
                                                onChange={(e) => handleUpdateDetail('paperworkCostReal', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Labor Cost */}
                                <div className="grid grid-cols-12 gap-3 p-3 items-center group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="col-span-4 flex flex-col justify-center">
                                        <span className="text-sm font-medium">Mano de Obra</span>
                                    </div>
                                    <div className="col-span-4 text-right text-sm text-gray-500 dark:text-gray-300 font-mono font-medium">
                                        {new Intl.NumberFormat('es-CO').format(motoData.laborCostEstimated)}
                                    </div>
                                    <div className="col-span-4">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                            <input
                                                className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 focus:border-primary text-right text-slate-900 dark:text-white text-sm py-1.5 pl-4 pr-2 rounded outline-none font-mono transition-all"
                                                type="number"
                                                inputMode="numeric"
                                                value={motoData.laborCostReal || ''}
                                                onChange={(e) => handleUpdateDetail('laborCostReal', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Total Parts Cost (Read Only) */}
                                <div className="grid grid-cols-12 gap-3 p-3 items-center group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="col-span-4 flex flex-col justify-center">
                                        <span className="text-sm font-medium">Total Repuestos</span>
                                    </div>
                                    <div className="col-span-4 text-right text-sm text-gray-500 dark:text-gray-300 font-mono font-medium">
                                        {new Intl.NumberFormat('es-CO').format(motoData.parts.reduce((acc: number, p: any) => acc + (p.estimated || 0), 0))}
                                    </div>
                                    <div className="col-span-4">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                            <div className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-right text-slate-500 dark:text-gray-400 text-sm py-1.5 pl-4 pr-2 rounded font-mono">
                                                {new Intl.NumberFormat('es-CO').format(motoData.parts.reduce((acc: number, p: any) => acc + (p.real || 0), 0))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Parts Section */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Repuestos y Ajustes</h3>
                                <button onClick={handleAddPart} className="flex items-center gap-1 text-xs font-bold bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-slate-900 dark:text-primary px-3 py-1.5 rounded transition-colors">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    AGREGAR
                                </button>
                            </div>
                            <div className="bg-white/50 dark:glass-panel rounded-lg flex flex-col divide-y divide-gray-200 dark:divide-gray-700/50 border border-gray-200 dark:border-white/5">
                                {motoData.parts.map((part: any, idx: number) => (
                                    <div key={idx} className="grid grid-cols-12 gap-3 p-3 items-center">
                                        <div className="col-span-8 flex flex-col overflow-hidden gap-1">
                                            <input
                                                className="w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 text-sm font-medium focus:border-primary focus:ring-0 px-0 py-0.5"
                                                value={part.name}
                                                onChange={(e) => handleUpdatePart(idx, 'name', e.target.value)}
                                                placeholder="Nombre Repuesto"
                                            />
                                            <span className="text-[10px] text-gray-500 uppercase">{part.type}</span>
                                        </div>
                                        <div className="col-span-4">
                                            <input
                                                className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 focus:border-primary text-right text-slate-900 dark:text-white text-sm py-1.5 px-2 rounded focus:ring-1 focus:ring-primary outline-none font-mono placeholder-gray-400"
                                                type="number"
                                                inputMode="numeric"
                                                value={part.real || ''}
                                                onChange={(e) => handleUpdatePart(idx, 'real', e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions Sticky */}
                <div className="sticky bottom-0 p-4 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-gray-200 dark:border-white/5 flex gap-3">
                    <button
                        onClick={handleDelete}
                        className="bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold h-14 w-14 rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
                        title="Eliminar Moto"
                    >
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                    <button
                        onClick={triggerSave}
                        disabled={saving}
                        className="flex-1 bg-primary hover:bg-primary-dark text-black font-bold h-14 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] tracking-wide uppercase disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

            </div>
        </main>
    )
}
