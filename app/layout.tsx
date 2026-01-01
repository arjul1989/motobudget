import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'R-MOTOS | Gestión de Proyectos de Motos',
    description: 'Sistema de gestión y presupuesto para compra, reparación y venta de motocicletas',
    icons: {
        icon: '/favicon.ico',
    },
}

import Providers from './providers'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" className="dark" suppressHydrationWarning>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen">
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
