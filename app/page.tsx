export default function Home() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', background: '#121212', color: '#facc15' }}>
            <h1>🏍️ ManoMotos</h1>
            <p>El sistema backend está listo.</p>
            <div style={{ marginTop: '20px', padding: '15px', background: '#333', borderRadius: '8px', maxWidth: '600px', color: 'white' }}>
                <p><strong>Siguientes Pasos:</strong></p>
                <ol style={{ textAlign: 'left' }}>
                    <li>Configura <code>GOOGLE_CLIENT_ID</code> y <code>GOOGLE_CLIENT_SECRET</code> en tu archivo <code>.env</code>.</li>
                    <li>Usa el archivo <code>frontend_design_prompt.md</code> para generar el diseñoFrontend.</li>
                    <li>Implementa el diseño aquí.</li>
                </ol>
            </div>
        </div>
    )
}
