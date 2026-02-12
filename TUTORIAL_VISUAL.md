# 🎥 Tutorial Visual - GanaderoApp

## 📖 Guía Paso a Paso para Comenzar

---

## 🚀 PARTE 1: Instalación (5 minutos)

### Paso 1: Descargar el Proyecto
```
✓ Descarga la carpeta ganadero-app completa
✓ Asegúrate de tener Node.js instalado
```

### Paso 2: Iniciar el Sistema
```bash
# Opción A: Automático (recomendado)
cd ganadero-app
./start.sh

# Opción B: Manual
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Web
cd web
npx http-server -p 8080
```

### Paso 3: Verificar que Todo Funciona
```
✓ Backend: http://localhost:3001 (debe responder)
✓ Web: http://localhost:8080 (debe cargar el login)
```

---

## 💻 PARTE 2: Dashboard Web (10 minutos)

### Pantalla 1: Login
```
┌─────────────────────────────────┐
│                                 │
│           🐄                    │
│       GanaderoApp               │
│   Dashboard Web                 │
│                                 │
│   Email: [demo@campo.com     ] │
│   Password: [●●●●●●●●●        ] │
│                                 │
│   [   Ingresar   ]              │
│                                 │
│   Demo: demo@campo.com/demo123  │
└─────────────────────────────────┘
```

**Acción:** Ingresa las credenciales demo y haz clic en "Ingresar"

### Pantalla 2: Dashboard Principal
```
┌────────────────────────────────────────────────────┐
│  🐄 Estancia Los Álamos          [🔄][Cerrar Sesión]│
├────────────────────────────────────────────────────┤
│  📊 Dashboard  │  🐄 Animales  │  💉 Tratamientos  │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │   🐄    │  │   🐮    │  │   🐂    │           │
│  │    3    │  │    2    │  │    1    │           │
│  │Animales │  │ Hembras │  │ Machos  │           │
│  └─────────┘  └─────────┘  └─────────┘           │
│                                                    │
│  Evolución de Peso Promedio                       │
│  ┌──────────────────────────────────────┐         │
│  │     [GRÁFICO DE LÍNEA]               │         │
│  │                  /\                   │         │
│  │                /    \                 │         │
│  │              /        \               │         │
│  └──────────────────────────────────────┘         │
│                                                    │
│  🔔 Próximos Tratamientos                         │
│  ┌──────────────────────────────────────┐         │
│  │ Margarita - Antiaftosa - 2025-07-10  │         │
│  │ Tornado - Desparasitación - 2025-03-15│        │
│  └──────────────────────────────────────┘         │
└────────────────────────────────────────────────────┘
```

**Observa:**
- ✓ Estadísticas generales de tu rodeo
- ✓ Gráfico de evolución de peso
- ✓ Alertas de tratamientos próximos

### Pantalla 3: Listado de Animales
```
┌────────────────────────────────────────────────────┐
│  Mis Animales (3)                          [🔄]    │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌────────────────────┐  ┌────────────────────┐  │
│  │ 🐄 Margarita       │  │ 🐂 Tornado         │  │
│  │ ARG001234567890    │  │ ARG001234567891    │  │
│  │ Aberdeen Angus     │  │ Hereford           │  │
│  │ Potrero Norte      │  │ Potrero Sur        │  │
│  │        465 kg      │  │        620 kg      │  │
│  └────────────────────┘  └────────────────────┘  │
│                                                    │
│  ┌────────────────────┐                           │
│  │ 🐄 Luna            │                           │
│  │ ARG001234567892    │                           │
│  │ Brangus            │                           │
│  │ Potrero Norte      │                           │
│  │        180 kg      │                           │
│  └────────────────────┘                           │
└────────────────────────────────────────────────────┘
```

**Acción:** Haz clic en cualquier tarjeta para ver más detalles

---

## 📱 PARTE 3: App Móvil (15 minutos)

### Pantalla 1: Home
```
┌─────────────────────────────┐
│ 🐄 Estancia Los Álamos      │
│ demo@campo.com       [Salir]│
├─────────────────────────────┤
│                             │
│  ┌───┐  ┌───┐  ┌───┐       │
│  │ 3 │  │ 2 │  │ 1 │       │
│  │🐄 │  │🐮 │  │🐂 │       │
│  └───┘  └───┘  └───┘       │
│                             │
│  ┌─────────────────────┐   │
│  │ 📷 Escanear Caravana│   │
│  └─────────────────────┘   │
│                             │
│  Mis Animales         [🔄] │
│                             │
│  ┌─────────────────────┐   │
│  │ 🐄 Margarita        │   │
│  │ ARG001234567890     │   │
│  │ Aberdeen Angus      │   │
│  │ Potrero Norte       │   │
│  │           465 kg    │   │
│  └─────────────────────┘   │
│                             │
│  [Toca para ver más...]    │
│                             │
├─────────────────────────────┤
│  🏠 Inicio    📷 Escanear   │
└─────────────────────────────┘
```

### Pantalla 2: Escaneo de Caravana
```
┌─────────────────────────────┐
│ ← Volver                    │
│                             │
│ Escanear Caravana           │
│                             │
│ ┌─────────────────────┐     │
│ │ARG001234567890  [🔍]│     │
│ └─────────────────────┘     │
│                             │
│ 💡 En producción: conecta   │
│    tu bastón Bluetooth RFID │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🐄 Margarita            │ │
│ │ ARG001234567890         │ │
│ │                         │ │
│ │ Raza: Aberdeen Angus    │ │
│ │ Potrero: Norte          │ │
│ │ Peso Actual: 465 kg     │ │
│ │ Último Pesaje: 2025-01-15│ │
│ │                         │ │
│ │ Registrar Nuevo Pesaje  │ │
│ │                         │ │
│ │ Peso (kg): [        ]   │ │
│ │ Notas:     [        ]   │ │
│ │                         │ │
│ │ [  Guardar Pesaje  ]    │ │
│ │                         │ │
│ │ 📊 Historial de Pesajes │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ 2025-01-15  465 kg  │ │ │
│ │ │ Ganancia 15kg/45días│ │ │
│ │ └─────────────────────┘ │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ 2024-12-01  450 kg  │ │ │
│ │ │ Peso estable        │ │ │
│ │ └─────────────────────┘ │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Flujo de Uso:**
1. Toca "Escanear Caravana" en el home
2. Ingresa el número de caravana (o escanea con bastón)
3. Toca "Buscar"
4. Ve toda la información del animal
5. Ingresa nuevo peso
6. Agrega notas (opcional)
7. Toca "Guardar Pesaje"
8. ✓ ¡Listo! El sistema calcula automáticamente la ganancia diaria

---

## 🎯 PARTE 4: Casos de Uso Reales

### Caso 1: Pesaje Mensual del Rodeo
```
Situación: Es día de pesaje en el campo

Paso 1: Vas al corral con tu celular
Paso 2: Abres GanaderoApp
Paso 3: Para cada animal:
   - Escaneas la caravana con el bastón
   - Ves el peso anterior y fecha
   - Ingresas el peso actual
   - Guardas
Paso 4: Al terminar, sincroniza datos
Paso 5: Desde la oficina, exportas el reporte

Tiempo estimado: 2-3 min por animal
Antes (papel): 5-7 min por animal + riesgo de errores
```

### Caso 2: Alerta de Vacunación
```
Situación: Se acerca la fecha de revacunación antiaftosa

Dashboard Web muestra:
🔔 Próximos Tratamientos
   - Margarita: Antiaftosa - 2025-07-10 (en 5 meses)
   - Luna: Antiaftosa - 2025-07-15 (en 5 meses)

En el campo:
1. Escaneas Margarita
2. Ves la alerta "⚠️ Próximo: 2025-07-10"
3. Aplicas la vacuna
4. Registras el tratamiento
5. Sistema programa próxima fecha automáticamente
```

### Caso 3: Control de Ganancia de Peso
```
Situación: Quieres saber si la alimentación está funcionando

Dashboard Web:
- Gráfico muestra tendencia ascendente ✓
- Peso promedio subió de 416kg a 465kg en 45 días
- Ganancia diaria promedio: 1.088 kg/día

Por animal:
- Margarita: +15kg en 45 días = 0.333 kg/día ✓
- Tornado: Estable (es toro adulto) ✓
- Luna: +10kg en 20 días = 0.500 kg/día (ternera) ✓

Decisión: Mantener plan de alimentación actual
```

---

## 📊 PARTE 5: Reportes y Análisis

### Exportar Datos
```
Próximamente:
- Exportar a Excel
- Formato SENASA
- Gráficos PDF
```

### Estadísticas Disponibles
```
✓ Total de animales por categoría
✓ Distribución por potrero
✓ Evolución de peso promedio
✓ Tratamientos pendientes
✓ Próximos eventos reproductivos
```

---

## 🔧 PARTE 6: Troubleshooting

### Problema: No carga el dashboard
**Solución:**
```bash
# Verifica que el backend esté corriendo
curl http://localhost:3001/api/dashboard

# Si no responde, reinicia:
cd backend
npm start
```

### Problema: No encuentra animales
**Solución:**
- Verifica que iniciaste sesión con demo@campo.com
- Los datos demo se cargan automáticamente al iniciar el backend
- Si no hay datos, reinicia el servidor

### Problema: Error de CORS
**Solución:**
- El backend tiene CORS habilitado
- Verifica que uses http://localhost:8080 (no file://)
- Usa http-server o similar

---

## 📱 PARTE 7: Próximos Pasos

### Para Producción
1. [ ] Migrar a PostgreSQL
2. [ ] Configurar dominio y SSL
3. [ ] Integrar Bluetooth RFID real
4. [ ] Agregar modo offline
5. [ ] Implementar backups automáticos

### Mejoras Futuras
1. [ ] Fotos de animales
2. [ ] Mapa de potreros
3. [ ] Gestión de alimentación
4. [ ] Análisis predictivo con IA
5. [ ] Alertas por WhatsApp

---

## 💡 Tips y Trucos

### En el Campo
- Usa modo avión + GPS para ahorrar batería
- Escanea siempre en el mismo orden (ej: izquierda a derecha)
- Toma notas de cualquier anomalía
- Sincroniza datos al volver al WiFi

### En la Oficina
- Revisa el dashboard semanalmente
- Configura alertas para tratamientos
- Exporta reportes mensuales
- Analiza tendencias de peso

### Gestión
- Mantén datos actualizados
- Registra todos los tratamientos
- Usa nombres memorables para los animales
- Documenta cambios de potrero

---

## 🎓 Recursos de Aprendizaje

### Video Tutoriales (próximamente)
- Setup inicial (5 min)
- Primer escaneo (3 min)
- Registrar tratamiento (4 min)
- Análisis de datos (8 min)

### Documentación
- ✓ README.md - Instalación y uso general
- ✓ API_DOCS.md - Documentación técnica de la API
- ✓ INTEGRACION_RFID.md - Cómo conectar bastones Bluetooth
- ✓ PLAN_COMERCIAL.md - Estrategia de negocio

### Soporte
- Email: soporte@ganaderoapp.com
- WhatsApp: +54 9 XXX XXX-XXXX
- FAQ: www.ganaderoapp.com/faq

---

## ✅ Checklist de Implementación

### Semana 1: Setup
- [ ] Instalar sistema
- [ ] Cargar datos iniciales
- [ ] Capacitar usuarios
- [ ] Probar flujo completo

### Semana 2-3: Piloto
- [ ] Usar en campo 5 días
- [ ] Registrar 100+ escaneos
- [ ] Identificar mejoras
- [ ] Ajustar procesos

### Mes 2+: Producción
- [ ] Integrar hardware RFID
- [ ] Migrar datos históricos
- [ ] Configurar backups
- [ ] Entrenar todo el personal

---

**¡Estás listo para revolucionar tu gestión ganadera! 🚀**
