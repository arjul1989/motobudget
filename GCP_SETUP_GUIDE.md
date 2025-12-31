# Guía de Despliegue en GCP y Configuración de Login

## 1. Configuración de Google OAuth (Login)

Para que el login funcione "desde el inicio", necesitamos crear las credenciales en Google Cloud.

1.  Ve a [Google Cloud Console - APIs & Services](https://console.cloud.google.com/apis/dashboard).
2.  Selecciona tu proyecto GCP.
3.  Ve a **"Pantalla de consentimiento de OAuth" (OAuth consent screen)**:
    *   **User Type**: `External` (o `Internal` si tienes Google Workspace).
    *   Rellena: Nombre de la App ("ManoMotos"), Correo de soporte, etc.
    *   **Scopes**: Agrega `userinfo.email` y `userinfo.profile`.
    *   Agrega tu correo en "Test users" si la app está en modo prueba.
4.  Ve a **"Credenciales" (Credentials)**:
    *   Clic en **"+ CREAR CREDENCIALES"** -> **"ID de cliente de OAuth"**.
    *   **Tipo de aplicación**: `Aplicación web`.
    *   **Orígenes de JavaScript autorizados**:
        *   Local: `http://localhost:3000`
        *   Producción (luego de desplegar): `https://tu-servicio-cloud-run.run.app`
    *   **URI de redireccionamiento autorizados**:
        *   Local: `http://localhost:3000/api/auth/callback/google`
        *   Producción: `https://tu-servicio-cloud-run.run.app/api/auth/callback/google`
5.  **Copia el Client ID y Client Secret**.

## 2. Configurar Variables de Entorno

Crea o actualiza el archivo `.env` en tu proyecto (no lo subas al repo):

```env
DATABASE_URL="file:./dev.db" # O la URL de Cloud SQL si usas Postgres
GOOGLE_CLIENT_ID="TU_CLIENT_ID_COPIADO"
GOOGLE_CLIENT_SECRET="TU_CLIENT_SECRET_COPIADO"
NEXTAUTH_SECRET="cualquier-string-secreto-largo"
NEXTAUTH_URL="http://localhost:3000" # Cambiar a la URL de Cloud Run en producción
```

## 3. Despliegue en Cloud Run (Opción Rápida con SQLite)

*Nota: SQLite en Cloud Run requiere volúmenes para no perder datos al reiniciar. Para producción real se recomienda Cloud SQL (PostgreSQL).*

### Paso 1: Construir la imagen
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/mano-motos
```

### Paso 2: Desplegar
```bash
gcloud run deploy mano-motos \
  --image gcr.io/PROJECT_ID/mano-motos \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXTAUTH_URL=https://URL_QUE_TE_DA_GOOGLE,NEXTAUTH_SECRET=secreto_generado \
  --set-cloudsql-instances=... # Si usas Cloud SQL
```
