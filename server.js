require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Verificar que JWT_SECRET fue configurado en producción
if (NODE_ENV === 'production' && JWT_SECRET === 'CHANGE_THIS_SECRET_IN_PRODUCTION') {
  console.error('⚠️  ERROR: JWT_SECRET no está configurado en producción!');
  console.error('Por favor configura JWT_SECRET en el archivo .env');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Crear directorio de base de datos si no existe
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ Directorio de base de datos creado');
}

// Base de datos SQLite PERSISTENTE (no in-memory)
const dbPath = process.env.DB_PATH || path.join(dbDir, 'ganadero.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
    process.exit(1);
  }
  console.log(`✅ Base de datos conectada: ${dbPath}`);
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// Inicializar base de datos
db.serialize(() => {
  // Tabla de usuarios/campos
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nombre_campo TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de animales
  db.run(`CREATE TABLE IF NOT EXISTS animales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caravana TEXT UNIQUE NOT NULL,
    usuario_id INTEGER NOT NULL,
    nombre TEXT,
    raza TEXT,
    sexo TEXT CHECK(sexo IN ('macho', 'hembra')),
    fecha_nacimiento DATE,
    peso_nacimiento REAL,
    madre_caravana TEXT,
    padre_caravana TEXT,
    potrero TEXT,
    estado TEXT DEFAULT 'activo' CHECK(estado IN ('activo', 'vendido', 'muerto', 'inactivo')),
    foto_url TEXT,
    notas TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`);

  // Tabla de pesajes
  db.run(`CREATE TABLE IF NOT EXISTS pesajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    peso REAL NOT NULL,
    fecha DATE NOT NULL,
    notas TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animales(id) ON DELETE CASCADE
  )`);

  // Tabla de tratamientos veterinarios
  db.run(`CREATE TABLE IF NOT EXISTS tratamientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('vacuna', 'desparasitacion', 'antibiotico', 'vitamina', 'cirugia', 'otro')),
    descripcion TEXT NOT NULL,
    fecha DATE NOT NULL,
    proxima_fecha DATE,
    veterinario TEXT,
    costo REAL,
    notas TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animales(id) ON DELETE CASCADE
  )`);

  // Tabla de eventos reproductivos
  db.run(`CREATE TABLE IF NOT EXISTS eventos_reproductivos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('servicio', 'diagnostico', 'parto', 'destete', 'aborto')),
    fecha DATE NOT NULL,
    notas TEXT,
    toro_caravana TEXT,
    resultado TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animales(id) ON DELETE CASCADE
  )`);

  // Índices para mejorar performance
  db.run('CREATE INDEX IF NOT EXISTS idx_animales_usuario ON animales(usuario_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_animales_caravana ON animales(caravana)');
  db.run('CREATE INDEX IF NOT EXISTS idx_pesajes_animal ON pesajes(animal_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_pesajes_fecha ON pesajes(fecha)');
  db.run('CREATE INDEX IF NOT EXISTS idx_tratamientos_animal ON tratamientos(animal_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_tratamientos_proxima_fecha ON tratamientos(proxima_fecha)');

  // Verificar si existe usuario demo
  db.get('SELECT id FROM usuarios WHERE email = ?', ['demo@campo.com'], (err, row) => {
    if (!row) {
      console.log('🔨 Creando datos de demostración...');
      
      // Crear usuario demo
      const passwordHash = bcrypt.hashSync('demo123', 10);
      db.run(`INSERT INTO usuarios (email, password, nombre_campo) VALUES (?, ?, ?)`,
        ['demo@campo.com', passwordHash, 'Estancia Los Álamos'],
        function(err) {
          if (err) {
            console.error('Error creando usuario demo:', err);
            return;
          }

          const usuarioId = this.lastID;

          // Crear animales demo
          const animalesDemo = [
            ['ARG001234567890', usuarioId, 'Margarita', 'Aberdeen Angus', 'hembra', '2022-03-15', 35, null, null, 'Potrero Norte', 'activo'],
            ['ARG001234567891', usuarioId, 'Tornado', 'Hereford', 'macho', '2021-08-20', 40, null, null, 'Potrero Sur', 'activo'],
            ['ARG001234567892', usuarioId, 'Luna', 'Brangus', 'hembra', '2023-01-10', 32, 'ARG001234567890', null, 'Potrero Norte', 'activo'],
          ];

          animalesDemo.forEach(animal => {
            db.run(`INSERT INTO animales (caravana, usuario_id, nombre, raza, sexo, fecha_nacimiento, peso_nacimiento, madre_caravana, padre_caravana, potrero, estado) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, animal);
          });

          // Crear pesajes demo
          db.run(`INSERT INTO pesajes (animal_id, peso, fecha, notas) VALUES (1, 450, '2024-12-01', 'Peso estable')`);
          db.run(`INSERT INTO pesajes (animal_id, peso, fecha, notas) VALUES (1, 465, '2025-01-15', 'Ganancia 15kg en 45 días')`);
          db.run(`INSERT INTO pesajes (animal_id, peso, fecha, notas) VALUES (2, 620, '2024-12-01', 'Toro en buen estado')`);
          db.run(`INSERT INTO pesajes (animal_id, peso, fecha, notas) VALUES (3, 180, '2025-01-20', 'Ternera creciendo bien')`);

          // Crear tratamientos demo
          db.run(`INSERT INTO tratamientos (animal_id, tipo, descripcion, fecha, proxima_fecha, veterinario) 
                  VALUES (1, 'vacuna', 'Antiaftosa', '2025-01-10', '2025-07-10', 'Dr. Martínez')`);
          db.run(`INSERT INTO tratamientos (animal_id, tipo, descripcion, fecha, proxima_fecha) 
                  VALUES (2, 'desparasitacion', 'Ivermectina', '2024-12-15', '2025-03-15')`);

          console.log('✅ Datos de demostración creados');
        }
      );
    } else {
      console.log('✅ Base de datos lista');
    }
  });
});

// Middleware de autenticación
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// ==================== RUTAS DE SALUD ====================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: dbPath
  });
});

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
    if (err) {
      console.error('Error en login:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!bcrypt.compareSync(password, usuario.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email }, 
      JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRY || '30d' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre_campo: usuario.nombre_campo
      }
    });
  });
});

// Registro
app.post('/api/auth/registro', (req, res) => {
  const { email, password, nombre_campo } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  db.run('INSERT INTO usuarios (email, password, nombre_campo) VALUES (?, ?, ?)',
    [email, passwordHash, nombre_campo || ''],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Este email ya está registrado' });
        }
        console.error('Error en registro:', err);
        return res.status(500).json({ error: 'Error al crear usuario' });
      }

      const token = jwt.sign(
        { id: this.lastID, email }, 
        JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRY || '30d' }
      );

      res.json({
        token,
        usuario: { 
          id: this.lastID, 
          email, 
          nombre_campo: nombre_campo || '' 
        }
      });
    }
  );
});

// ==================== RUTAS DE ANIMALES ====================

// Obtener todos los animales del usuario
app.get('/api/animales', verificarToken, (req, res) => {
  const query = `
    SELECT a.*, 
    (SELECT peso FROM pesajes WHERE animal_id = a.id ORDER BY fecha DESC LIMIT 1) as peso_actual,
    (SELECT fecha FROM pesajes WHERE animal_id = a.id ORDER BY fecha DESC LIMIT 1) as fecha_ultimo_peso
    FROM animales a 
    WHERE a.usuario_id = ? AND a.estado = 'activo'
    ORDER BY a.creado_en DESC
  `;

  db.all(query, [req.usuarioId], (err, animales) => {
    if (err) {
      console.error('Error obteniendo animales:', err);
      return res.status(500).json({ error: 'Error al obtener animales' });
    }
    res.json(animales);
  });
});

// Buscar animal por caravana (escaneo)
app.get('/api/animales/caravana/:caravana', verificarToken, (req, res) => {
  const { caravana } = req.params;

  const query = `
    SELECT a.*,
    (SELECT peso FROM pesajes WHERE animal_id = a.id ORDER BY fecha DESC LIMIT 1) as peso_actual,
    (SELECT fecha FROM pesajes WHERE animal_id = a.id ORDER BY fecha DESC LIMIT 1) as fecha_ultimo_peso
    FROM animales a 
    WHERE a.caravana = ? AND a.usuario_id = ?
  `;

  db.get(query, [caravana, req.usuarioId], (err, animal) => {
    if (err) {
      console.error('Error buscando animal:', err);
      return res.status(500).json({ error: 'Error al buscar animal' });
    }

    if (!animal) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }

    // Obtener historial completo
    db.all('SELECT * FROM pesajes WHERE animal_id = ? ORDER BY fecha DESC', 
      [animal.id], (err, pesajes) => {
        db.all('SELECT * FROM tratamientos WHERE animal_id = ? ORDER BY fecha DESC', 
          [animal.id], (err2, tratamientos) => {
            db.all('SELECT * FROM eventos_reproductivos WHERE animal_id = ? ORDER BY fecha DESC', 
              [animal.id], (err3, eventos) => {
                res.json({
                  ...animal,
                  pesajes: pesajes || [],
                  tratamientos: tratamientos || [],
                  eventos_reproductivos: eventos || []
                });
              }
            );
          }
        );
      }
    );
  });
});

// Crear nuevo animal
app.post('/api/animales', verificarToken, (req, res) => {
  const { caravana, nombre, raza, sexo, fecha_nacimiento, peso_nacimiento, madre_caravana, padre_caravana, potrero } = req.body;

  if (!caravana) {
    return res.status(400).json({ error: 'El número de caravana es requerido' });
  }

  if (sexo && !['macho', 'hembra'].includes(sexo)) {
    return res.status(400).json({ error: 'El sexo debe ser "macho" o "hembra"' });
  }

  const query = `
    INSERT INTO animales (caravana, usuario_id, nombre, raza, sexo, fecha_nacimiento, peso_nacimiento, madre_caravana, padre_caravana, potrero)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query,
    [caravana, req.usuarioId, nombre, raza, sexo, fecha_nacimiento, peso_nacimiento, madre_caravana, padre_caravana, potrero],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Este número de caravana ya está registrado' });
        }
        console.error('Error creando animal:', err);
        return res.status(500).json({ error: 'Error al crear animal' });
      }
      
      db.get('SELECT * FROM animales WHERE id = ?', [this.lastID], (err, animal) => {
        if (err) {
          return res.status(500).json({ error: 'Error al obtener animal creado' });
        }
        res.json(animal);
      });
    }
  );
});

// Actualizar animal
app.put('/api/animales/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  const { nombre, raza, potrero, estado, notas } = req.body;

  if (estado && !['activo', 'vendido', 'muerto', 'inactivo'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const query = `
    UPDATE animales 
    SET nombre = COALESCE(?, nombre),
        raza = COALESCE(?, raza),
        potrero = COALESCE(?, potrero),
        estado = COALESCE(?, estado),
        notas = COALESCE(?, notas),
        actualizado_en = CURRENT_TIMESTAMP
    WHERE id = ? AND usuario_id = ?
  `;

  db.run(query, [nombre, raza, potrero, estado, notas, id, req.usuarioId], function(err) {
    if (err) {
      console.error('Error actualizando animal:', err);
      return res.status(500).json({ error: 'Error al actualizar animal' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Animal no encontrado' });
    }

    res.json({ mensaje: 'Animal actualizado exitosamente' });
  });
});

// ==================== RUTAS DE PESAJES ====================

// Registrar nuevo pesaje
app.post('/api/pesajes', verificarToken, (req, res) => {
  const { animal_id, peso, fecha, notas } = req.body;

  if (!animal_id || !peso) {
    return res.status(400).json({ error: 'animal_id y peso son requeridos' });
  }

  if (peso <= 0) {
    return res.status(400).json({ error: 'El peso debe ser mayor a 0' });
  }

  // Verificar que el animal pertenece al usuario
  db.get('SELECT id FROM animales WHERE id = ? AND usuario_id = ?', 
    [animal_id, req.usuarioId], (err, animal) => {
      if (err) {
        console.error('Error verificando animal:', err);
        return res.status(500).json({ error: 'Error al verificar animal' });
      }

      if (!animal) {
        return res.status(404).json({ error: 'Animal no encontrado' });
      }

      const fechaPesaje = fecha || new Date().toISOString().split('T')[0];

      db.run('INSERT INTO pesajes (animal_id, peso, fecha, notas) VALUES (?, ?, ?, ?)',
        [animal_id, peso, fechaPesaje, notas],
        function(err) {
          if (err) {
            console.error('Error registrando pesaje:', err);
            return res.status(500).json({ error: 'Error al registrar pesaje' });
          }
          
          db.get('SELECT * FROM pesajes WHERE id = ?', [this.lastID], (err, pesaje) => {
            if (err) {
              return res.status(500).json({ error: 'Error al obtener pesaje creado' });
            }
            res.json(pesaje);
          });
        }
      );
    }
  );
});

// ==================== RUTAS DE TRATAMIENTOS ====================

// Registrar tratamiento
app.post('/api/tratamientos', verificarToken, (req, res) => {
  const { animal_id, tipo, descripcion, fecha, proxima_fecha, veterinario, costo, notas } = req.body;

  if (!animal_id || !tipo || !descripcion) {
    return res.status(400).json({ error: 'animal_id, tipo y descripcion son requeridos' });
  }

  const tiposValidos = ['vacuna', 'desparasitacion', 'antibiotico', 'vitamina', 'cirugia', 'otro'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: `Tipo debe ser uno de: ${tiposValidos.join(', ')}` });
  }

  db.get('SELECT id FROM animales WHERE id = ? AND usuario_id = ?', 
    [animal_id, req.usuarioId], (err, animal) => {
      if (!animal) {
        return res.status(404).json({ error: 'Animal no encontrado' });
      }

      const fechaTratamiento = fecha || new Date().toISOString().split('T')[0];

      db.run(`INSERT INTO tratamientos (animal_id, tipo, descripcion, fecha, proxima_fecha, veterinario, costo, notas) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [animal_id, tipo, descripcion, fechaTratamiento, proxima_fecha, veterinario, costo, notas],
        function(err) {
          if (err) {
            console.error('Error registrando tratamiento:', err);
            return res.status(500).json({ error: 'Error al registrar tratamiento' });
          }
          
          db.get('SELECT * FROM tratamientos WHERE id = ?', [this.lastID], (err, tratamiento) => {
            res.json(tratamiento);
          });
        }
      );
    }
  );
});

// Obtener tratamientos pendientes (próximos 30 días)
app.get('/api/tratamientos/pendientes', verificarToken, (req, res) => {
  const query = `
    SELECT t.*, a.caravana, a.nombre as animal_nombre
    FROM tratamientos t
    JOIN animales a ON t.animal_id = a.id
    WHERE a.usuario_id = ? 
      AND t.proxima_fecha IS NOT NULL
      AND date(t.proxima_fecha) <= date('now', '+30 days')
      AND date(t.proxima_fecha) >= date('now')
    ORDER BY t.proxima_fecha ASC
  `;

  db.all(query, [req.usuarioId], (err, tratamientos) => {
    if (err) {
      console.error('Error obteniendo tratamientos pendientes:', err);
      return res.status(500).json({ error: 'Error al obtener tratamientos pendientes' });
    }
    res.json(tratamientos);
  });
});

// ==================== RUTAS DE EVENTOS REPRODUCTIVOS ====================

app.post('/api/eventos-reproductivos', verificarToken, (req, res) => {
  const { animal_id, tipo, fecha, notas, toro_caravana, resultado } = req.body;

  if (!animal_id || !tipo) {
    return res.status(400).json({ error: 'animal_id y tipo son requeridos' });
  }

  const tiposValidos = ['servicio', 'diagnostico', 'parto', 'destete', 'aborto'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: `Tipo debe ser uno de: ${tiposValidos.join(', ')}` });
  }

  db.get('SELECT id FROM animales WHERE id = ? AND usuario_id = ?', 
    [animal_id, req.usuarioId], (err, animal) => {
      if (!animal) {
        return res.status(404).json({ error: 'Animal no encontrado' });
      }

      const fechaEvento = fecha || new Date().toISOString().split('T')[0];

      db.run(`INSERT INTO eventos_reproductivos (animal_id, tipo, fecha, notas, toro_caravana, resultado) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        [animal_id, tipo, fechaEvento, notas, toro_caravana, resultado],
        function(err) {
          if (err) {
            console.error('Error registrando evento reproductivo:', err);
            return res.status(500).json({ error: 'Error al registrar evento' });
          }
          
          db.get('SELECT * FROM eventos_reproductivos WHERE id = ?', [this.lastID], (err, evento) => {
            res.json(evento);
          });
        }
      );
    }
  );
});

// ==================== DASHBOARD / ESTADÍSTICAS ====================

app.get('/api/dashboard', verificarToken, (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_animales,
      SUM(CASE WHEN sexo = 'hembra' THEN 1 ELSE 0 END) as total_hembras,
      SUM(CASE WHEN sexo = 'macho' THEN 1 ELSE 0 END) as total_machos
    FROM animales 
    WHERE usuario_id = ? AND estado = 'activo'
  `;

  db.get(statsQuery, [req.usuarioId], (err, stats) => {
    if (err) {
      console.error('Error obteniendo estadísticas:', err);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }

    const evolucionQuery = `
      SELECT date(p.fecha) as fecha, AVG(p.peso) as peso_promedio
      FROM pesajes p
      JOIN animales a ON p.animal_id = a.id
      WHERE a.usuario_id = ?
      GROUP BY date(p.fecha)
      ORDER BY fecha DESC 
      LIMIT 30
    `;

    db.all(evolucionQuery, [req.usuarioId], (err2, pesajes) => {
      if (err2) {
        console.error('Error obteniendo evolución de peso:', err2);
        return res.status(500).json({ error: 'Error al obtener evolución de peso' });
      }

      res.json({
        total_animales: stats.total_animales || 0,
        total_hembras: stats.total_hembras || 0,
        total_machos: stats.total_machos || 0,
        evolucion_peso: pesajes.reverse() // Orden cronológico para gráficos
      });
    });
  });
});

// ==================== MANEJO DE ERRORES ====================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== INICIAR SERVIDOR ====================

const server = app.listen(PORT, () => {
  console.log('');
  console.log('════════════════════════════════════════════════════════');
  console.log('🐄 GanaderoApp Backend');
  console.log('════════════════════════════════════════════════════════');
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${NODE_ENV}`);
  console.log(`💾 Base de datos: ${dbPath}`);
  console.log('');
  console.log('👤 Usuario demo:');
  console.log('   Email:    demo@campo.com');
  console.log('   Password: demo123');
  console.log('');
  console.log('📚 Documentación API: /api/*');
  console.log('❤️  Health check: /health');
  console.log('════════════════════════════════════════════════════════');
  console.log('');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('📴 Señal SIGTERM recibida, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    db.close((err) => {
      if (err) {
        console.error('Error cerrando base de datos:', err);
        process.exit(1);
      }
      console.log('✅ Base de datos cerrada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 Señal SIGINT recibida, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    db.close((err) => {
      if (err) {
        console.error('Error cerrando base de datos:', err);
        process.exit(1);
      }
      console.log('✅ Base de datos cerrada');
      process.exit(0);
    });
  });
});

module.exports = app; // Para testing
