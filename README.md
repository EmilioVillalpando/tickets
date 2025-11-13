# VDC360° - Sistema de Notas a Crédito

Sistema de gestión de notas a crédito con trabajo en paralelo (Slots A/B) y reportes diarios.

## 📁 Estructura del Proyecto

```
tickets/
├── index.html              # HTML principal (limpio, solo estructura)
├── index-original.html     # Backup del archivo original
├── css/
│   └── styles.css         # Estilos globales y de impresión
└── js/
    ├── config.js          # Configuración de Supabase y constantes
    ├── utils.js           # Funciones utilitarias (fechas, formato, etc.)
    ├── state.js           # Estado global de la aplicación
    ├── supabase-client.js # Cliente de Supabase inicializado
    ├── main.js            # Punto de entrada principal
    ├── services/
    │   ├── clientes.js    # CRUD de clientes
    │   ├── productos.js   # CRUD de productos
    │   ├── notas.js       # CRUD de notas y partidas
    │   └── realtime.js    # Suscripciones en tiempo real
    └── ui/
        ├── slots.js       # Gestión de slots A/B
        ├── vista.js       # Renderizado de vista de cliente
        ├── bandeja.js     # Bandeja de notas abiertas
        ├── print.js       # Impresión A4 y 80mm
        ├── whatsapp.js    # Integración WhatsApp
        ├── reportes.js    # Reportes diarios
        └── events.js      # Event listeners y handlers
```

## 🎯 Características

- **Trabajo en paralelo**: Gestiona 2 clientes simultáneamente (Slots A/B)
- **Tiempo real**: Actualización automática con Supabase Realtime
- **Impresión múltiple**: A4, ticket 80mm, y RawBT para Android
- **Reportes**: Reporte diario general y exportación CSV
- **WhatsApp**: Envío directo de cuentas por WhatsApp
- **Exit Guard**: Protección contra pérdida de datos

## 🚀 Uso

1. Abre `index.html` en un navegador moderno
2. El sistema cargará automáticamente clientes y productos
3. Selecciona un slot (A o B) para trabajar
4. Crea o continúa una nota
5. Agrega partidas y gestiona las notas

## 📦 Módulos

### Config (`config.js`)
- Configuración de Supabase
- Constantes globales (nombre de tienda, etc.)

### Utils (`utils.js`)
- Funciones de formato de números y fechas
- Generación de folios
- Utilidades para impresión térmica

### State (`state.js`)
- Estado global de la aplicación
- Gestión de clientes, productos, y notas
- Estado de slots A/B
- Exit guard

### Services
- **clientes.js**: Carga, creación y actualización de clientes
- **productos.js**: Carga de productos y precios
- **notas.js**: CRUD completo de notas y partidas
- **realtime.js**: Suscripciones a cambios en tiempo real

### UI
- **slots.js**: Gestión de slots A/B y cambio entre ellos
- **vista.js**: Renderizado de la vista del cliente activo
- **bandeja.js**: Lista de notas abiertas del día
- **print.js**: Funciones de impresión (A4, 80mm, RawBT)
- **whatsapp.js**: Generación y envío de mensajes
- **reportes.js**: Reportes diarios y exportación CSV
- **events.js**: Configuración de event listeners

## 🔧 Mejoras del Refactor

1. **Separación de responsabilidades**: Cada módulo tiene una función específica
2. **Mantenibilidad**: Código más fácil de leer y mantener
3. **Reutilización**: Funciones modulares reutilizables
4. **Escalabilidad**: Fácil agregar nuevas funcionalidades
5. **Testing**: Módulos independientes facilitan las pruebas
6. **Tamaño**: Reducción de 881 líneas a múltiples archivos pequeños

## 📝 Notas

- El archivo original se guardó como `index-original.html`
- Todos los módulos usan ES6 modules (`import/export`)
- Se mantiene compatibilidad con la funcionalidad original
- No se requieren cambios en la base de datos

## 🛠️ Desarrollo

Para agregar nuevas funcionalidades:

1. Identifica el módulo apropiado
2. Agrega la función en el módulo correspondiente
3. Exporta la función si es necesaria en otros módulos
4. Importa y usa donde sea necesario

## 📄 Licencia

Proyecto interno - VDC360°
