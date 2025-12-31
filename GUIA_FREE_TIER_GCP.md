# Guía de Despliegue 100% Gratuito y Profesional en GCP

Para mantener el negocio **GRATIS** y profesional dentro de Google Cloud Platform, utilizaremos la siguiente arquitectura "Free Tier":

1.  **Servidor (Compute Engine):** Instancia `e2-micro` (Gratis en región us-central1, us-west1 o us-east1).
2.  **Base de Datos:** SQLite (integrada en el servidor, costo $0 y backup fácil).
3.  **Dominio y Seguridad (HTTPS):** Cloudflare Tunnel (Gratis, nos da HTTPS automático y evita abrir puertos vulnerables).

---

## Paso 1: Crear la Máquina Virtual en GCP

1.  Ve a **GCP Console > Compute Engine > VM Instances**.
2.  **Crear Instancia**:
    *   **Nombre**: `manomotos-server`
    *   **Región**: `us-central1` (Iowa), `us-west1` (Oregon) o `us-east1` (S. Carolina). *Vital para que sea gratis*.
    *   **Tipo de máquina**: `e2-micro` (2 vCPU, 1 GB memoria).
    *   **Disco de arranque**: Cambiar a "Standard persistent disk" 30GB (El tier gratuito da hasta 30GB). selecciona **Ubuntu 22.04 LTS**.
    *   **Firewall**: Permitir tráfico HTTP/HTTPS (aunque usaremos Tunnel, es bueno tenerlo).
3.  Dale a **Crear**.

## Paso 2: Configuración del Dominio (Cloudflare)

Como Google Login requiere `https://` y no queremos pagar certificados ni dominios caros:

1.  Crea una cuenta gratuita en [Cloudflare](https://www.cloudflare.com/).
2.  Si no tienes dominio, puedes intentar conseguir uno barato, o usar el que Cloudflare a veces ofrece.
3.  Si no quieres dominio propio, Cloudflare Tunnel te puede dar una URL temporal tipo `trycloudflare.com` pero cambia cada vez.
    *   *Recomendación:* Compra un dominio barato (.com, .online) por $1-10 USD al año. Vale la pena para el login de Google.

**Configurar Tunnel (Sin abrir puertos):**
1.  En el dashboard de Cloudflare: **Zero Trust > Networks > Tunnels**.
2.  Crea un tunnel llamado `manomotos`.
3.  Instala el conector en tu VM de GCP (copia el comando que te dan para Debian/Ubuntu y pégalo en la consola SSH de Google).
4.  En la configuración del Tunnel ("Public Hostname"):
    *   Subdominio: `app.tudominio.com`
    *   Service: `http://localhost:3000`

## Paso 3: Desplegar la Aplicación

Conéctate por **SSH** a tu instancia desde la consola de GCP y ejecuta:

1.  **Instalar Docker y Git:**
    ```bash
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose git
    sudo usermod -aG docker $USER
    # Cierra y abre SSH para aplicar permisos
    ```

2.  **Clonar y Configurar:**
    ```bash
    git clone https://github.com/TU_USUARIO/Moto_Budget.git
    cd Moto_Budget
    
    # Crear archivo .env de producción
    nano .env
    ```
    
    Pega lo siguiente en el editor `nano`:
    ```env
    DATABASE_URL="file:/app/data/prod.db"
    NEXTAUTH_URL="https://app.tudominio.com" 
    NEXTAUTH_SECRET="inventa_un_codigo_largo_y_seguro"
    GOOGLE_CLIENT_ID="tus_credenciales_de_gcp"
    GOOGLE_CLIENT_SECRET="tus_credenciales_de_gcp"
    ```
    *(Guarda con Ctrl+O, Enter, y sal con Ctrl+X)*

3.  **Iniciar el servicio:**
    ```bash
    docker-compose up -d --build
    ```

## Paso 4: Actualizar Google Login

Una vez tengas tu dominio (ej: `https://app.manomotos.com`):

1.  Ve a **GCP Console > APIs & Services > Credentials**.
2.  Edita tu cliente OAuth.
3.  Agrega a **Orígenes autorizados**: `https://app.manomotos.com`
4.  Agrega a **Redireccionamiento**: `https://app.manomotos.com/api/auth/callback/google`

---

¡Listo! Tienes una aplicación de negocio real:
*   ✅ Base de datos persistente.
*   ✅ Dominio seguro HTTPS.
*   ✅ Costo mensual estimado: **$0.00** (Siempre que te mantengas en los límites del Free Tier).
