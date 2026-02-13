# 📚 Documentación API - GanaderoApp

Base URL: `http://localhost:3001/api`

## 🔐 Autenticación

### POST /auth/login
Iniciar sesión

**Request:**
```json
{
  "email": "demo@campo.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 1,
    "email": "demo@campo.com",
    "nombre_campo": "Estancia Los Álamos"
  }
}
```

### POST /auth/registro
Crear nueva cuenta

**Request:**
```json
{
  "email": "nuevo@campo.com",
  "password": "password123",
  "nombre_campo": "Mi Establecimiento"
}
```

---

## 🐄 Animales

**Todas las rutas requieren header:**
```
Authorization: Bearer {token}
```

### GET /animales
Obtener todos los animales del usuario

**Response:**
```json
[
  {
    "id": 1,
    "caravana": "ARG001234567890",
    "nombre": "Margarita",
    "raza": "Aberdeen Angus",
    "sexo": "hembra",
    "fecha_nacimiento": "2022-03-15",
    "peso_nacimiento": 35,
    "madre_caravana": null,
    "padre_caravana": null,
    "potrero": "Potrero Norte",
    "estado": "activo",
    "peso_actual": 465,
    "fecha_ultimo_peso": "2025-01-15"
  }
]
```

### GET /animales/caravana/:caravana
Buscar animal por número de caravana (para escaneo)

**Response:**
```json
{
  "id": 1,
  "caravana": "ARG001234567890",
  "nombre": "Margarita",
  "raza": "Aberdeen Angus",
  "sexo": "hembra",
  "peso_actual": 465,
  "fecha_ultimo_peso": "2025-01-15",
  "pesajes": [
    {
      "id": 2,
      "peso": 465,
      "fecha": "2025-01-15",
      "notas": "Ganancia 15kg en 45 días"
    },
    {
      "id": 1,
      "peso": 450,
      "fecha": "2024-12-01",
      "notas": "Peso estable"
    }
  ],
  "tratamientos": [
    {
      "id": 1,
      "tipo": "vacuna",
      "descripcion": "Antiaftosa",
      "fecha": "2025-01-10",
      "proxima_fecha": "2025-07-10",
      "veterinario": "Dr. Martínez"
    }
  ],
  "eventos_reproductivos": []
}
```

### POST /animales
Crear nuevo animal

**Request:**
```json
{
  "caravana": "ARG001234567893",
  "nombre": "Tornado",
  "raza": "Hereford",
  "sexo": "macho",
  "fecha_nacimiento": "2024-02-10",
  "peso_nacimiento": 38,
  "madre_caravana": "ARG001234567890",
  "padre_caravana": null,
  "potrero": "Potrero Sur"
}
```

**Response:**
```json
{
  "id": 4,
  "caravana": "ARG001234567893",
  "nombre": "Tornado",
  ...
}
```

### PUT /animales/:id
Actualizar datos del animal

**Request:**
```json
{
  "nombre": "Tornado Jr",
  "raza": "Hereford",
  "potrero": "Potrero Este",
  "estado": "activo"
}
```

---

## ⚖️ Pesajes

### POST /pesajes
Registrar nuevo pesaje

**Request:**
```json
{
  "animal_id": 1,
  "peso": 470,
  "fecha": "2025-02-11",
  "notas": "Animal en excelente estado"
}
```

**Response:**
```json
{
  "id": 3,
  "animal_id": 1,
  "peso": 470,
  "fecha": "2025-02-11",
  "notas": "Animal en excelente estado"
}
```

---

## 💉 Tratamientos

### POST /tratamientos
Registrar tratamiento veterinario

**Request:**
```json
{
  "animal_id": 1,
  "tipo": "desparasitacion",
  "descripcion": "Ivermectina",
  "fecha": "2025-02-11",
  "proxima_fecha": "2025-05-11",
  "veterinario": "Dra. González",
  "costo": 1500
}
```

### GET /tratamientos/pendientes
Obtener tratamientos próximos (30 días)

**Response:**
```json
[
  {
    "id": 1,
    "animal_id": 1,
    "caravana": "ARG001234567890",
    "animal_nombre": "Margarita",
    "tipo": "vacuna",
    "descripcion": "Antiaftosa",
    "fecha": "2025-01-10",
    "proxima_fecha": "2025-07-10",
    "veterinario": "Dr. Martínez"
  }
]
```

---

## 🔄 Eventos Reproductivos

### POST /eventos-reproductivos
Registrar evento reproductivo

**Request:**
```json
{
  "animal_id": 1,
  "tipo": "servicio",
  "fecha": "2025-02-05",
  "notas": "Servicio con toro Aberdeen",
  "toro_caravana": "ARG001234567891"
}
```

**Tipos de eventos:**
- `servicio`: Inseminación o servicio natural
- `diagnostico`: Diagnóstico de preñez
- `parto`: Nacimiento
- `destete`: Separación de la cría

---

## 📊 Dashboard

### GET /dashboard
Obtener estadísticas generales

**Response:**
```json
{
  "total_animales": 3,
  "total_hembras": 2,
  "total_machos": 1,
  "evolucion_peso": [
    {
      "fecha": "2024-12-01",
      "peso_promedio": 416.67
    },
    {
      "fecha": "2025-01-15",
      "peso_promedio": 421.67
    }
  ]
}
```

---


## ✅ Reglas de validación efectivas

### POST /auth/login
- `email` es obligatorio.
- `password` es obligatorio.
- Si falta alguno, responde **400**.

### POST /auth/registro
- `email`, `password` y `nombre_campo` son obligatorios.
- `password` debe tener al menos 6 caracteres.
- Si no cumple, responde **400**.

### POST /animales
- `caravana` es obligatoria.
- `sexo` (si se envía) debe ser `hembra` o `macho`.
- Si no cumple, responde **400**.

### POST /pesajes
- `animal_id` y `peso` son obligatorios.
- `peso` debe ser mayor a 0.
- Si no cumple, responde **400**.

### POST /tratamientos
- `animal_id`, `tipo` y `descripcion` son obligatorios.
- `tipo` debe ser uno de: `vacuna`, `desparasitacion`, `antibiotico`, `vitamina`, `otro`.
- Si no cumple, responde **400**.

---

## ❌ Códigos de Error

- **400** - Bad Request (datos inválidos)
- **401** - Unauthorized (token inválido o ausente)
- **404** - Not Found (recurso no encontrado)
- **500** - Internal Server Error

**Formato de error:**
```json
{
  "error": "Mensaje descriptivo del error"
}
```

---

## 📱 Ejemplos de Uso

### Flujo de Escaneo en Campo

```javascript
// 1. Usuario escanea caravana
const caravana = "ARG001234567890";

// 2. Buscar animal
const response = await fetch(`/api/animales/caravana/${caravana}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const animal = await response.json();

// 3. Mostrar datos al usuario
console.log(`${animal.nombre} - ${animal.peso_actual}kg`);

// 4. Registrar nuevo pesaje
await fetch('/api/pesajes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    animal_id: animal.id,
    peso: 475,
    fecha: new Date().toISOString().split('T')[0],
    notas: 'Pesaje mensual'
  })
});
```

### Calcular Ganancia Diaria

```javascript
function calcularGananciaDiaria(pesajes) {
  if (pesajes.length < 2) return null;
  
  const ultimo = pesajes[0];
  const anterior = pesajes[1];
  
  const diffPeso = ultimo.peso - anterior.peso;
  const diffDias = Math.abs(
    (new Date(ultimo.fecha) - new Date(anterior.fecha)) / (1000 * 60 * 60 * 24)
  );
  
  return (diffPeso / diffDias).toFixed(3);
}
```

---

## 🔄 Rate Limiting

En producción implementar:
- **100 requests/minuto** por usuario
- **1000 requests/hora** por IP

---

## 🚀 Próximas Versiones

### v2.0 (Planificado)
- [ ] Paginación en listados
- [ ] Filtros avanzados
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Exportación a CSV/Excel
- [ ] Integración con SENASA

### v3.0 (Futuro)
- [ ] GraphQL API
- [ ] API de imágenes (fotos de animales)
- [ ] Geolocalización de animales
- [ ] Análisis con IA

---

**Última actualización:** Febrero 2025
