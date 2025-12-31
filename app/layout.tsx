import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'ManoMotos',
    description: 'Gestión de motos con berraquera',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    )
}
