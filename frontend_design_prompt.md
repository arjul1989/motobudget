
**Prompt para Generación de Diseño (UI/UX)**

**Rol:** Diseñador experto en UI/UX y Sistemas de Diseño Modernos.

**Proyecto:** Diseñar la interfaz de usuario para una aplicación web llamada **"ManoMotos"**.
**Concepto:** Aplicación de negocio para comprar, reparar y vender motocicletas. El objetivo es gestionar el presupuesto (inversión inicial, mano de obra, repuestos, trámites) y comparar lo "Presupuestado" vs lo "Real" (Gastos reales) para calcular la ganancia final.
**Identidad Regional:** La app tiene un toque "Santandereano" (Colombia). El nombre "ManoMotos" alude al trato cordial de la región ("Mano").
**Estilo Visual:**
- **Tema:** Modo Oscuro (Premium, Industrial).
- **Paleta de Colores:** Fondo Gris Asfalto (#121212 o #1a1a1a), Acentos Amarillo Seguridad/Caterpillar (#FACC15 o #FFD700) para botones y acciones principales. Texto Blanco o Gris Claro (#E5E5E5).
- **Tipografía:** Moderna, legible y fuerte (ej. 'Inter', 'Roboto' o 'Space Grotesk').
- **Componentes:** Tarjetas con efectos de "Glassmorphism" sutil o bordes definidos. Botones grandes y fáciles de tocar (Responsivo).

**Pantallas Requeridas:**

1.  **Login / Landing Page:**
    - Logo de "ManoMotos" (Icono de moto/herramienta minimalista).
    - Eslogan: "El Arreglo Santandereano".
    - Botón prominente: "Ingresar con Google".

2.  **Dashboard Principal (Lista de Motos):**
    - Barra de navegación superior con Avatar del usuario y Logo.
    - Botón flotante o destacado: "+ Nueva Moto".
    - Lista de tarjetas (Grid en escritorio, Lista en móvil).
    - Cada tarjeta muestra:
        - Foto de la moto (o placeholder).
        - Marca, Modelo y Año (ej. "Yamaha DT 125 - 2005").
        - Estado (Badge: "En Reparación", "Lista para Venta", "Vendida").
        - Resumen Financiero: "Inversión: $5.000.000" | "Proyectado: $7.500.000".
        - Barra de progreso de la reparación.

3.  **Detalle de la Moto (El corazón de la app):**
    - **Cabecera:** Título grande (Marca/Modelo), Estado actual.
    - **Botón de Acción:** "Exportar Presupuesto PDF" (Icono destacado).
    - **Estructura de Dos Columnas (Presupuesto vs Real):**
        - Columna Izquierda: **Presupuesto (Estimado)**.
            - Fecha Compra, Costo Compra.
            - Mano de Obra Estimada.
            - Repuestos Estimados (Lista).
            - Trámites Estimados.
            - **Total Inversión Proyectada**.
            - **Precio Venta Sugerido**.
        - Columna Derecha: **Ejecución (Real)**.
            - Costos Reales de cada ítem anterior (Inputs editables si la moto está en proceso).
            - Fecha Terminación Real.
            - **Ganancia Real Calculada**.
    - **Sección de Repuestos:** Tabla o Lista donde se pueden agregar repuestos con su costo estimado y luego actualizar con el costo real.

**Interacciones Clave:**
- Al cambiar un valor en "Real", los totales y la ganancia se recalculan automáticamente con una animación sutil.
- El diseño debe ser totalmente **Responsivo** (Mobile First).

**Entregable:**
Genera el código HTML/TailwindCSS (o React/Next.js) para estas pantallas, asegurando una estética profesional de alto nivel que impresione a inversores.
