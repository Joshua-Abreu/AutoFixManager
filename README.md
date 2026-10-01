# 🚗 AutoFix Manager

Sistema integral de gestión y control operativo para talleres automotrices, enfocado en el seguimiento de órdenes de trabajo, inventario de repuestos, catálogo de servicios y flujo financiero en tiempo real.

---

## 📌 Características Principales

- **Gestión de Órdenes de Trabajo:**
  - Ciclo de vida completo de órdenes: Apertura, En Proceso, Entregada y Cancelada.
  - Bloqueo de modificaciones en órdenes finalizadas o canceladas.
  - Detalle unificado con desglose de servicios prestados, piezas empleadas y registro de evidencias fotográficas.

- **Inventario y Repuestos:**
  - Control de stock actual y umbrales de stock mínimo con alertas de bajo inventario.
  - Deducción automática de inventario al asociar piezas a una orden de trabajo.
  - Reversión y reingreso de existencias al eliminar repuestos o cancelar órdenes.

- **Cálculo Financiero y Fiscal:**
  - Liquidación automática en cascada: Subtotal Servicios + Subtotal Piezas = Subtotal General.
  - Gestión de descuentos porcentuales o de monto fijo con validación contra subtotal.
  - Base imponible y cálculo de ITBIS/impuesto paramétrico (0% - 100%).
  - Prevención de saldos negativos y presentación homogénea a dos decimales.

- **Módulo de Evidencias:**
  - Carga de imágenes de diagnóstico y entrega (JPEG, PNG, WebP) mediante Multer.
  - Límite de tamaño por archivo (máximo 2 MB) y almacenamiento de referencias locales.

- **Catálogos Base:**
  - Registro y mantenimiento de Marcas de vehículos y Servicios del taller.

---

## 🛠️ Tecnologías Empleadas

- **Entorno de ejecución:** Node.js
- **Framework Web:** Express.js
- **Motor de Plantillas:** Express Handlebars (`.hbs`)
- **ORM / Base de Datos:** Sequelize
- **Gestión de Cargas:** Multer
- **Diseño de Interfaz:** Bootstrap 5 (recursos locales), Bootstrap Icons

---

## 🚀 Instalación y Despliegue Local

Sigue estos pasos para clonar y ejecutar el entorno de desarrollo:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/TU-USUARIO/AutoFixManager.git](https://github.com/TU-USUARIO/AutoFixManager.git)
cd AutoFixManager
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de entorno
Crea un archivo `.env` en la raíz del proyecto tomando como referencia tus credenciales locales de base de datos y puerto:

```env
PORT=3000
DB_NAME=autofix_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contrasena
DB_HOST=localhost
DB_DIALECT=sqlite
```

### 4. Iniciar la aplicación
```bash
npm start
```
O en modo desarrollo si tienes Nodemon configurado:
```bash
npm run dev
```

La aplicación estará accesible en: `http://localhost:3000`

---

## 📂 Estructura del Proyecto

```text
AutoFixManager/
├── controllers/          # Controladores y lógica de peticiones
├── middlewares/          # Middlewares de validación y seguridad
├── models/               # Modelos Sequelize y asociaciones
├── public/               # Archivos estáticos locales (CSS, JS, Assets)
│   ├── assets/           # Librería de Bootstrap compilada
│   └── uploads/          # Directorio de evidencias cargadas
├── routes/               # Definición de rutas del sistema
├── utils/                # Funciones auxiliares y cálculos financieros
├── views/                # Vistas Handlebars (.hbs)
│   ├── layouts/          # Layout maestro de la aplicación
│   ├── marcas/           # Vistas del módulo de marcas
│   ├── ordenes/          # Vistas de órdenes y detalle operativo
│   ├── piezas/           # Vistas de inventario y repuestos
│   └── servicios/        # Vistas del catálogo de servicios
├── .gitignore            # Exclusiones de Git (node_modules, .env*, etc.)
├── app.js                # Punto de entrada y configuración del servidor
├── package.json          # Metadatos del proyecto y dependencias
└── README.md             # Documentación del sistema
```


