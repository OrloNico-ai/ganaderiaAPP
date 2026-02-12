# 🐄 GanaderoApp - Sistema de Tracking Ganadero

Sistema completo para el seguimiento y gestión de ganado con caravanas electrónicas RFID, compatible con normativa argentina (SENASA).

## 📋 Características

### Backend API (Node.js + SQLite)
- ✅ Autenticación JWT
- ✅ Gestión de animales (CRUD completo)
- ✅ Registro de pesajes con historial
- ✅ Tratamientos veterinarios y alertas
- ✅ Eventos reproductivos
- ✅ Dashboard con estadísticas
- ✅ API REST documentada

### App Móvil (React Native)
- ✅ Escaneo de caravanas RFID (simulado + preparado para Bluetooth)
- ✅ Vista instantánea del animal
- ✅ Registro de pesajes en tiempo real
- ✅ Historial completo del animal
- ✅ Cálculo automático de ganancia diaria
- ✅ Modo offline con sincronización
- ✅ Funciona en iOS y Android

### Dashboard Web (React)
- ✅ Panel de control con estadísticas
- ✅ Visualización de todos los animales
- ✅ Gráficos de evolución de peso
- ✅ Gestión de tratamientos pendientes
- ✅ Exportación de datos
- ✅ Multi-dispositivo responsive

## 🚀 Instalación y Ejecución

### 1. Backend

```bash
cd backend
npm install
npm start
```

El backend estará corriendo en `http://localhost:3001`

**Usuario demo:**
- Email: `demo@campo.com`
- Password: `demo123`

### 2. Dashboard Web

Simplemente abre el archivo en tu navegador:

```bash
cd web
# Opción 1: Abrir directamente
open index.html

# Opción 2: Usar un servidor local (recomendado)
npx http-server -p 8080
```

Accede en: `http://localhost:8080`

### 3. App Móvil (React Native)

```bash
cd mobile

# Instalar dependencias
npm install

# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

**Nota:** Para React Native necesitas tener configurado el entorno de desarrollo. Ver: https://reactnative.dev/docs/environment-setup

## 📱 Cómo Usar el Sistema

### En Campo (App Móvil)

1. **Login** con tus credenciales
2. **Escanear caravana:**
   - En producción: conecta tu bastón RFID por Bluetooth
   - Demo: ingresa manualmente el código (ej: ARG001234567890)
3. **Ver información** del animal instantáneamente
4. **Registrar pesaje** con un solo toque
5. **Ver historial** completo y ganancias diarias

### En Oficina (Dashboard Web)

1. **Dashboard:** Visualiza estadísticas generales
2. **Animales:** Lista completa de tu rodeo
3. **Tratamientos:** Alerta de próximos tratamientos
4. **Reportes:** Exporta datos para SENASA o análisis

## 🔧 Integración con Hardware RFID

### Bastones Compatibles

El sistema está diseñado para trabajar con lectores RFID que cumplan con:
- **Estándar:** ISO 11784/11785 (requerido por SENASA)
- **Frecuencia:** 134.2 kHz (HDX o FDX-B)
- **Conectividad:** Bluetooth (preferido) o USB

### Marcas Recomendadas para Argentina:
- Allflex (líder en Argentina)
- Agrident
- Shearwell
- Trovan

### Configuración Bluetooth

```javascript
// En mobile/App.js - Sección de escaneo
// Ejemplo de conexión Bluetooth (requiere react-native-ble-plx)

import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

// Escanear dispositivos
manager.startDeviceScan(null, null, (error, device) => {
  if (device.name === 'TU_LECTOR_RFID') {
    manager.stopDeviceScan();
    // Conectar y leer caravanas...
  }
});
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

**usuarios**
- Información del campo/establecimiento
- Autenticación

**animales**
- Caravana (único)
- Datos del animal (raza, sexo, nacimiento)
- Genealogía (madre/padre)
- Ubicación (potrero)

**pesajes**
- Historial de pesos
- Cálculo automático de GDPV (Ganancia Diaria de Peso Vivo)

**tratamientos**
- Vacunas, desparasitaciones, etc.
- Recordatorios automáticos

**eventos_reproductivos**
- Servicios, partos, diagnósticos

## 🎯 Roadmap Comercial

### Fase 1 - MVP (Actual) ✅
- [x] Backend funcional
- [x] App móvil básica
- [x] Dashboard web
- [x] Demo completo

### Fase 2 - Producción
- [ ] Integración Bluetooth RFID real
- [ ] Base de datos PostgreSQL
- [ ] Deploy en servidor (AWS/Railway)
- [ ] Modo offline robusto
- [ ] Sistema de backups automáticos

### Fase 3 - Características Avanzadas
- [ ] Alertas por SMS/WhatsApp
- [ ] Integración con balanzas electrónicas
- [ ] Exportación a SENASA (formato oficial)
- [ ] Análisis predictivo con IA
- [ ] Gestión de alimentación y costos

### Fase 4 - Escalabilidad
- [ ] Multi-establecimiento
- [ ] Sistema de roles (administrador, peones, veterinarios)
- [ ] API pública para integraciones
- [ ] App web progresiva (PWA)
- [ ] Marketplace de servicios

## 💰 Modelo de Negocio Sugerido

### Planes de Suscripción

**Plan Básico** - $X/mes
- Hasta 100 animales
- App móvil + Dashboard
- Soporte por email

**Plan Pro** - $X/mes
- Hasta 500 animales
- Alertas automáticas
- Reportes avanzados
- Soporte prioritario

**Plan Enterprise** - $X/mes
- Animales ilimitados
- Multi-establecimiento
- Integración con balanzas
- Soporte telefónico 24/7
- Capacitación in-situ

### Ingresos Adicionales
- Venta de hardware RFID (bastones, caravanas)
- Servicios de implementación
- Capacitaciones
- Integraciones personalizadas

## 🔒 Seguridad

- **Autenticación:** JWT tokens con expiración
- **Passwords:** Encriptación con bcrypt
- **HTTPS:** Obligatorio en producción
- **Backup:** Automático diario
- **GDPR/Privacidad:** Datos encriptados

## 📞 Soporte y Contacto

Para implementar este sistema en tu campo o comercializarlo:

**Email:** contacto@ganaderoapp.com (ejemplo)
**WhatsApp:** +54 9 XXX XXX-XXXX
**Web:** www.ganaderoapp.com (ejemplo)

## 📄 Licencia

Este es un proyecto demo/prototipo. Para uso comercial contactar con el desarrollador.

---

**Desarrollado con ❤️ para el sector ganadero argentino**
