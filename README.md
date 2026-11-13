# MundoGlobal Travel — Frontend demo

Proyecto académico de demostración para el TPI de Reingeniería de Procesos de Negocio.

## Requisitos
- Node.js 20 o superior
- npm

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abrí en el navegador la dirección que muestra Vite (normalmente http://localhost:5173).

## Compilar para producción

```bash
npm run build
npm run preview
```

## Funcionalidades incluidas
- Navegación entre inicio, paquetes, detalle, login, registro, checkout, cuenta y asistencia.
- Buscador por destino y filtros por categoría.
- Favoritos y reservas de demostración.
- Persistencia local mediante `localStorage`.
- Diseño responsive.

## Datos de prueba
No hay credenciales reales. Podés iniciar sesión con cualquier correo válido y una contraseña de al menos 4 caracteres. El formulario es simulado y no envía datos a ningún servidor.

## Recursos visuales
Las fotografías de destinos se cargan desde Unsplash. Para usar recursos propios, reemplazá las URLs en `src/App.tsx` por archivos dentro de `public/assets/`.

## Alcance
No incluye backend, APIs de aerolíneas/hoteles, pasarela de pagos ni emisión real de pólizas. La reserva se simula para la presentación académica.
