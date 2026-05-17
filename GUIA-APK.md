# MKEYZ Control v7 → APK
## Guía completa: PWA → APK con Capacitor

---

## ESTRUCTURA DE ARCHIVOS FINAL

Antes de empezar, organiza todo así:

```
mkeyz-control/
├── www/
│   ├── index.html          ← el HTML modificado (este mismo)
│   ├── manifest.json       ← incluido en este pack
│   ├── sw.js               ← incluido en este pack
│   └── icons/              ← TÚ creas esta carpeta con los PNGs del ícono
│       ├── icon-72.png
│       ├── icon-96.png
│       ├── icon-128.png
│       ├── icon-144.png
│       ├── icon-152.png
│       ├── icon-192.png    ← obligatorio
│       ├── icon-384.png
│       └── icon-512.png    ← obligatorio
├── package.json            ← lo genera npm
└── capacitor.config.json   ← lo genera Capacitor
```

---

## PASO 0 — Generar los íconos

Necesitas una imagen cuadrada de tu logo MKEYZ (mínimo 512×512px, PNG, fondo oscuro #030308).

**Opción rápida (online, gratis):**
1. Ve a https://maskable.app/editor o https://favicon.io/favicon-generator/
2. Sube tu imagen
3. Descarga el pack de íconos
4. Pon los PNGs en `www/icons/`

**Opción rápida con ImageMagick (si lo tienes):**
```bash
for size in 72 96 128 144 152 192 384 512; do
  convert logo-512.png -resize ${size}x${size} www/icons/icon-${size}.png
done
```

---

## PASO 1 — Requisitos previos

Instala esto si no lo tienes:

| Herramienta | Link |
|---|---|
| Node.js (v18+) | https://nodejs.org |
| Android Studio | https://developer.android.com/studio |
| JDK 17 | Incluido en Android Studio |

Después de instalar Android Studio:
- Abre Android Studio → SDK Manager
- Instala: **Android SDK 34** (o la última versión estable)
- En "SDK Tools": marca **Android SDK Build-Tools** y **Android Emulator**

---

## PASO 2 — Inicializar el proyecto

Abre una terminal en la carpeta `mkeyz-control/` (donde está la carpeta `www/`):

```bash
# Inicializar npm
npm init -y

# Instalar Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Inicializar Capacitor apuntando a la carpeta www/
npx cap init "MKEYZ Control" "com.mkeyz.control" --web-dir www
```

Cuando te pregunte, confirma los datos:
- App name: `MKEYZ Control`
- App ID: `com.mkeyz.control`
- Web assets dir: `www`

---

## PASO 3 — Añadir plataforma Android

```bash
npx cap add android
```

Esto crea la carpeta `android/` con el proyecto nativo.

---

## PASO 4 — Copiar los assets al proyecto Android

```bash
npx cap copy android
```

Cada vez que modifiques el HTML/CSS/JS, repite este comando.

---

## PASO 5 — Abrir en Android Studio

```bash
npx cap open android
```

Se abre Android Studio automáticamente con el proyecto.

---

## PASO 6 — Configuración en Android Studio

### 6.1 Esperar que Gradle sincronice
La primera vez tarda 5–10 minutos descargando dependencias. Espera hasta que desaparezca la barra de progreso inferior.

### 6.2 Ajustar el nombre de la app (opcional)
En `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">MKEYZ Control</string>
```

### 6.3 Añadir íconos a Android
En Android Studio: botón derecho sobre `app` → **New → Image Asset**
- Icon Type: Launcher Icons
- Source: sube tu `icon-512.png`
- Genera todos los tamaños automáticamente

---

## PASO 7 — Generar el APK

### Opción A: APK de debug (para testear sin firmar)
```
Menú: Build → Build Bundle(s) / APK(s) → Build APK(s)
```
El APK estará en:
`android/app/build/outputs/apk/debug/app-debug.apk`

Envíatelo por Telegram o cable USB e instálalo (necesitas tener activado "Fuentes desconocidas" en Android).

### Opción B: APK firmado (para distribución)
```
Menú: Build → Generate Signed Bundle / APK → APK
```
1. **Create new...** para crear un keystore (guárdalo en lugar seguro)
2. Rellena alias, contraseñas
3. Selecciona: `release`
4. Finish

El APK estará en:
`android/app/build/outputs/apk/release/app-release.apk`

---

## ALTERNATIVA: PWA Builder (sin Android Studio)

Si no quieres instalar Android Studio, usa el servicio online de Microsoft:

1. Primero **sube tu PWA a internet**. La opción más rápida:
   - Crea un repositorio en GitHub
   - Sube `index.html`, `manifest.json`, `sw.js` y la carpeta `icons/`
   - Activa GitHub Pages en Settings → Pages → main branch / root

2. Ve a **https://www.pwabuilder.com**

3. Pega la URL de tu GitHub Pages, por ejemplo:
   `https://jeffmkeyz.github.io/mkeyz-control/`

4. Haz clic en **Package for stores → Android**

5. PWA Builder genera un APK usando Bubblewrap (Google TWA)
   - Descarga el `.apk` directo o el proyecto para Android Studio

---

## TROUBLESHOOTING

### "localStorage is not available"
En Capacitor, localStorage funciona exactamente igual que en el browser. No hay problema.

### Fuentes de Google no cargan offline
Normal en la primera instalación sin internet. La segunda vez ya están en caché. Para forzar offline total, descarga las fuentes y ponlas en `www/fonts/`:
```
Space Mono: https://fonts.google.com/specimen/Space+Mono (Download family)
Syne:       https://fonts.google.com/specimen/Syne (Download family)
```
Y cambia en el HTML:
```html
<!-- Elimina el <link> de Google Fonts y añade: -->
<style>
  @font-face { font-family:'Space Mono'; src:url('./fonts/SpaceMono-Regular.ttf'); font-weight:400; }
  @font-face { font-family:'Space Mono'; src:url('./fonts/SpaceMono-Bold.ttf'); font-weight:700; }
  @font-face { font-family:'Syne'; src:url('./fonts/Syne-Bold.ttf'); font-weight:700; }
  @font-face { font-family:'Syne'; src:url('./fonts/Syne-ExtraBold.ttf'); font-weight:800; }
</style>
```

### Error "SDK location not found"
En Android Studio: File → Project Structure → SDK Location → apunta a tu Android SDK.

### Gradle build falla con versión de Java
En Android Studio: File → Project Structure → SDK Location → JDK Location → usa el JDK bundled de Android Studio.

---

## COMANDOS DE REFERENCIA RÁPIDA

```bash
# Flujo de trabajo normal
npx cap copy android     # después de cada cambio en www/
npx cap open android     # abrir Android Studio

# Si quieres sincronizar + abrir directo
npx cap sync android
npx cap open android
```

---

## NOTAS FINALES

- Tu app usa **localStorage**: los datos persisten en el dispositivo igual que en el browser.
- El APK de debug pesa ~5MB. El release puede optimizarse más.
- Para subir a la Play Store necesitas el APK firmado + cuenta de desarrollador ($25 única vez).
- Para distribución directa (sin Play Store), el APK de debug o release sin firma funciona perfecto — solo necesita "Instalar apps de fuentes desconocidas" activado.
