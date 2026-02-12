const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'tu_secreto_super_seguro_cambiar_en_produccion';

// Middleware
app.use(cors());
app.use(express.json());

// Base de datos SQLite (en producción usar PostgreSQL)
const db = new sqlite3.Database(':memory:');

// Inicializar base de datos
db.serialize(() => {
  // Tabla de usuarios/campos
  db.run(`CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    nombre_campo TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de lotes (grupos de animales)
  db.run(`CREATE TABLE lotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    nombre TEXT NOT NULL,
    ubicacion TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`);

  // Tabla de animales
  db.run(`CREATE TABLE animales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caravana TEXT UNIQUE NOT NULL,
    usuario_id INTEGER,
    lote_id INTEGER,
    nombre TEXT,
    raza TEXT,
    sexo TEXT,
    fecha_nacimiento DATE,
    peso_nacimiento REAL,
    madre_caravana TEXT,
    padre_caravana TEXT,
    potrero TEXT,
    estado TEXT DEFAULT 'activo',
    foto_url TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (lote_id) REFERENCES lotes(id)
  )`);

  // Tabla de pesajes
  db.run(`CREATE TABLE pesajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER,
    peso REAL,
    fecha DATE,
    notas TEXT,
    FOREIGN KEY (animal_id) REFERENCES animales(id)
  )`);

  // Tabla de tratamientos veterinarios
  db.run(`CREATE TABLE tratamientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER,
    tipo TEXT,
    descripcion TEXT,
    fecha DATE,
    proxima_fecha DATE,
    veterinario TEXT,
    costo REAL,
    FOREIGN KEY (animal_id) REFERENCES animales(id)
  )`);

  // Tabla de eventos reproductivos
  db.run(`CREATE TABLE eventos_reproductivos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animal_id INTEGER,
    tipo TEXT,
    fecha DATE,
    notas TEXT,
    toro_caravana TEXT,
    FOREIGN KEY (animal_id) REFERENCES animales(id)
  )`);

  // Tabla de búsquedas recientes (por caravana)
  db.run(`CREATE TABLE busquedas_recientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    caravana TEXT,
    animal_id INTEGER,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (animal_id) REFERENCES animales(id)
  )`);

  // Crear usuario demo
  const passwordHash = bcrypt.hashSync('demo123', 10);
  db.run(`INSERT INTO usuarios (email, password, nombre_campo) VALUES (?, ?, ?)`,
    ['demo@campo.com', passwordHash, 'Estancia Los Álamos']);

  // Crear lotes demo
  db.run(`INSERT INTO lotes (usuario_id, nombre, ubicacion) VALUES (1, 'Lote Invernada 2023', 'Corral Norte')`);
  db.run(`INSERT INTO lotes (usuario_id, nombre, ubicacion) VALUES (1, 'Lote Cría 2024', 'Potrero Sur')`);

  // Crear animales demo (lote_id: 1 = Invernada, 2 = Cría)
  const animalesDemo = [
    ['ARG001234567890', 1, 1, 'Margarita', 'Aberdeen Angus', 'hembra', '2022-03-15', 35, null, null, 'Potrero Norte', 'activo'],
    ['ARG001234567891', 1, 1, 'Tornado', 'Hereford', 'macho', '2021-08-20', 40, null, null, 'Potrero Sur', 'activo'],
    ['ARG001234567892', 1, 2, 'Luna', 'Brangus', 'hembra', '2023-01-10', 32, 'ARG001234567890', null, 'Potrero Norte', 'activo'],
  ];

  animalesDemo.forEach(animal => {
    db.run(`INSERT INTO animales (caravana, usuario_id, lote_id, nombre, raza, sexo, fecha_nacimiento, peso_nacimiento, madre_caravana, padre_caravana, potrero, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, animal);
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
});

// Middleware de autenticación
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
    if (err || !usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!bcrypt.compareSync(password, usuario.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '30d' });
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
  const passwordHash = bcrypt.hashSync(password, 10);

  db.run('INSERT INTO usuarios (email, password, nombre_campo) VALUES (?, ?, ?)',
    [email, passwordHash, nombre_campo],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Email ya registrado' });
      }

      const token = jwt.sign({ id: this.lastID }, JWT_SECRET, { expiresIn: '30d' });
      res.json({
        token,
        usuario: { id: this.lastID, email, nombre_campo }
      });
    }
  );
});

// ==================== RUTAS DE ANIMALES ====================

// Obtener todos los animales del usuario
app.get('/api/animales', verificarToken, (req, res) => {
  db.all(`SELECT a.*, 
          l.nombre as lote_nombre, l.ubicacion as lote_ubicacion,
          (SELECT peso FROM pesajes WHERE animal_id = a.id ORDER BY fecha DESC LIMIT 1) as peso_actual,
          (SELECT fecha FROM pesajes WHERE animal_id = a.id ORDER BY fecha DESC LIMIT 1) as fecha_ultimo_peso
          FROM animales a 
          LEFT JOIN lotes l ON a.lote_id = l.id
          WHERE a.usuario_id = ? AND a.estado = 'activo'
          ORDER BY a.creado_en DESC`,
    [req.usuarioId],
    (err, animales) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(animales);
    }
  );
});

// Buscar animal por caravana (escaneo) - registra búsqueda reciente si existe
app.get('/api/animales/caravana/:caravana', verificarToken, (req, res) => {
  const { caravana } = req.params;

  db.get(`SELECT a.*,
          l.nombre as lote_nombre, l.ubicacion as lote_ubicacion,
          (SELECT peso FROM pesajes WHERE animal_id = a.id ORDER BY fecha DESC LIMIT 1) as peso_actual,
          (SELECT fecha FROM pesajes WHERE animal_id = a.id ORDER BY fecha DESC LIMIT 1) as fecha_ultimo_peso
          FROM animales a 
          LEFT JOIN lotes l ON a.lote_id = l.id
          WHERE a.caravana = ? AND a.usuario_id = ?`,
    [caravana, req.usuarioId],
    (err, animal) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });

      // Registrar en búsquedas recientes: quitar duplicado del mismo animal para que aparezca solo una vez y primero
      db.run('DELETE FROM busquedas_recientes WHERE usuario_id = ? AND animal_id = ?',
        [req.usuarioId, animal.id], function() {
        db.run('INSERT INTO busquedas_recientes (usuario_id, caravana, animal_id) VALUES (?, ?, ?)',
          [req.usuarioId, caravana, animal.id]);
      });

      // Obtener historial completo en paralelo (más rápido)
      let pendientes = 3;
      const resultados = { pesajes: [], tratamientos: [], eventos: [] };
      const enviar = () => {
        pendientes--;
        if (pendientes === 0) {
          res.json({
            ...animal,
            pesajes: resultados.pesajes,
            tratamientos: resultados.tratamientos,
            eventos_reproductivos: resultados.eventos
          });
        }
      };
      db.all('SELECT * FROM pesajes WHERE animal_id = ? ORDER BY fecha DESC', [animal.id], (err, rows) => {
        resultados.pesajes = rows || [];
        enviar();
      });
      db.all('SELECT * FROM tratamientos WHERE animal_id = ? ORDER BY fecha DESC', [animal.id], (err2, rows) => {
        resultados.tratamientos = rows || [];
        enviar();
      });
      db.all('SELECT * FROM eventos_reproductivos WHERE animal_id = ? ORDER BY fecha DESC', [animal.id], (err3, rows) => {
        resultados.eventos = rows || [];
        enviar();
      });
    }
  );
});

// Crear nuevo animal
app.post('/api/animales', verificarToken, (req, res) => {
  const { caravana, nombre, raza, sexo, fecha_nacimiento, peso_nacimiento, madre_caravana, padre_caravana, potrero, lote_id } = req.body;

  db.run(`INSERT INTO animales (caravana, usuario_id, lote_id, nombre, raza, sexo, fecha_nacimiento, peso_nacimiento, madre_caravana, padre_caravana, potrero)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [caravana, req.usuarioId, lote_id || null, nombre, raza, sexo, fecha_nacimiento, peso_nacimiento, madre_caravana, padre_caravana, potrero],
    function(err) {
      if (err) return res.status(400).json({ error: 'Caravana ya registrada o datos inválidos' });
      
      db.get('SELECT * FROM animales WHERE id = ?', [this.lastID], (err, animal) => {
        res.json(animal);
      });
    }
  );
});

// Obtener un animal por ID (perfil completo: pesajes, tratamientos) — consultas en paralelo
app.get('/api/animales/:id', verificarToken, (req, res) => {
  const { id } = req.params;

  db.get(`SELECT a.*,
          l.nombre as lote_nombre, l.ubicacion as lote_ubicacion,
          (SELECT peso FROM pesajes WHERE animal_id = a.id ORDER BY fecha DESC LIMIT 1) as peso_actual,
          (SELECT fecha FROM pesajes WHERE animal_id = a.id ORDER BY fecha DESC LIMIT 1) as fecha_ultimo_peso
          FROM animales a
          LEFT JOIN lotes l ON a.lote_id = l.id
          WHERE a.id = ? AND a.usuario_id = ?`,
    [id, req.usuarioId],
    (err, animal) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });

      let pendientes = 3;
      const resultados = { pesajes: [], tratamientos: [], eventos: [] };
      const enviar = () => {
        pendientes--;
        if (pendientes === 0) {
          res.json({
            ...animal,
            pesajes: resultados.pesajes,
            tratamientos: resultados.tratamientos,
            eventos_reproductivos: resultados.eventos
          });
        }
      };
      db.all('SELECT * FROM pesajes WHERE animal_id = ? ORDER BY fecha DESC', [animal.id], (e, rows) => {
        resultados.pesajes = rows || [];
        enviar();
      });
      db.all('SELECT * FROM tratamientos WHERE animal_id = ? ORDER BY fecha DESC', [animal.id], (e2, rows) => {
        resultados.tratamientos = rows || [];
        enviar();
      });
      db.all('SELECT * FROM eventos_reproductivos WHERE animal_id = ? ORDER BY fecha DESC', [animal.id], (e3, rows) => {
        resultados.eventos = rows || [];
        enviar();
      });
    }
  );
});

// Actualizar animal (incluye foto_url)
app.put('/api/animales/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  const { nombre, raza, potrero, estado, lote_id, foto_url } = req.body;

  db.run(`UPDATE animales SET nombre = ?, raza = ?, potrero = ?, estado = ?, lote_id = ?, foto_url = ? WHERE id = ? AND usuario_id = ?`,
    [
      nombre,
      raza,
      potrero,
      estado,
      lote_id !== undefined ? lote_id : null,
      foto_url !== undefined ? foto_url : null,
      id,
      req.usuarioId
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Animal actualizado' });
    }
  );
});

// ==================== RUTAS DE PESAJES ====================

// Registrar nuevo pesaje
app.post('/api/pesajes', verificarToken, (req, res) => {
  const { animal_id, peso, fecha, notas } = req.body;

  // Verificar que el animal pertenece al usuario
  db.get('SELECT * FROM animales WHERE id = ? AND usuario_id = ?', [animal_id, req.usuarioId], (err, animal) => {
    if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });

    db.run('INSERT INTO pesajes (animal_id, peso, fecha, notas) VALUES (?, ?, ?, ?)',
      [animal_id, peso, fecha || new Date().toISOString().split('T')[0], notas],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get('SELECT * FROM pesajes WHERE id = ?', [this.lastID], (err, pesaje) => {
          res.json(pesaje);
        });
      }
    );
  });
});

// ==================== RUTAS DE TRATAMIENTOS ====================

// Registrar tratamiento
app.post('/api/tratamientos', verificarToken, (req, res) => {
  const { animal_id, tipo, descripcion, fecha, proxima_fecha, veterinario, costo } = req.body;

  db.get('SELECT * FROM animales WHERE id = ? AND usuario_id = ?', [animal_id, req.usuarioId], (err, animal) => {
    if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });

    db.run('INSERT INTO tratamientos (animal_id, tipo, descripcion, fecha, proxima_fecha, veterinario, costo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [animal_id, tipo, descripcion, fecha, proxima_fecha, veterinario, costo],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get('SELECT * FROM tratamientos WHERE id = ?', [this.lastID], (err, tratamiento) => {
          res.json(tratamiento);
        });
      }
    );
  });
});

// Obtener TODOS los tratamientos del usuario (para pestaña Tratamientos)
app.get('/api/tratamientos', verificarToken, (req, res) => {
  db.all(`SELECT t.*, a.caravana, a.nombre as animal_nombre
          FROM tratamientos t
          JOIN animales a ON t.animal_id = a.id
          WHERE a.usuario_id = ?
          ORDER BY t.fecha DESC, t.id DESC`,
    [req.usuarioId],
    (err, tratamientos) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(tratamientos || []);
    }
  );
});

// Obtener tratamientos pendientes (próxima_fecha en los próximos 30 días o vencidos — para alertas)
app.get('/api/tratamientos/pendientes', verificarToken, (req, res) => {
  db.all(`SELECT t.*, a.caravana, a.nombre as animal_nombre
          FROM tratamientos t
          JOIN animales a ON t.animal_id = a.id
          WHERE a.usuario_id = ?
            AND t.proxima_fecha IS NOT NULL
            AND t.proxima_fecha <= date('now', '+30 days')
          ORDER BY t.proxima_fecha ASC`,
    [req.usuarioId],
    (err, tratamientos) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(tratamientos || []);
    }
  );
});

// ==================== RUTAS DE BÚSQUEDAS RECIENTES ====================

app.get('/api/busquedas-recientes', verificarToken, (req, res) => {
  db.all(`SELECT br.id, br.caravana, br.fecha, br.animal_id, a.nombre as animal_nombre, a.raza
          FROM busquedas_recientes br
          LEFT JOIN animales a ON br.animal_id = a.id
          WHERE br.usuario_id = ?
          ORDER BY br.fecha DESC
          LIMIT 20`,
    [req.usuarioId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ==================== RUTAS DE LOTES ====================

app.get('/api/lotes', verificarToken, (req, res) => {
  db.all(`SELECT l.*, 
          (SELECT COUNT(*) FROM animales a WHERE a.lote_id = l.id AND a.estado = 'activo') as cantidad_animales
          FROM lotes l 
          WHERE l.usuario_id = ?
          ORDER BY l.creado_en DESC`,
    [req.usuarioId],
    (err, lotes) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(lotes);
    }
  );
});

app.post('/api/lotes', verificarToken, (req, res) => {
  const { nombre, ubicacion } = req.body;
  db.run('INSERT INTO lotes (usuario_id, nombre, ubicacion) VALUES (?, ?, ?)',
    [req.usuarioId, nombre || 'Sin nombre', ubicacion || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM lotes WHERE id = ?', [this.lastID], (err, lote) => {
        res.json(lote);
      });
    }
  );
});

app.get('/api/lotes/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  db.get(`SELECT l.*, 
          (SELECT COUNT(*) FROM animales a WHERE a.lote_id = l.id AND a.estado = 'activo') as cantidad_animales
          FROM lotes l 
          WHERE l.id = ? AND l.usuario_id = ?`,
    [id, req.usuarioId],
    (err, lote) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });
      db.all(`SELECT a.*, 
              (SELECT peso FROM pesajes WHERE animal_id = a.id ORDER BY fecha DESC LIMIT 1) as peso_actual
              FROM animales a WHERE a.lote_id = ? AND a.estado = 'activo'`,
        [id],
        (err2, animales) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ ...lote, animales: animales || [] });
        }
      );
    }
  );
});

// ==================== RUTAS DE EVENTOS REPRODUCTIVOS ====================

app.post('/api/eventos-reproductivos', verificarToken, (req, res) => {
  const { animal_id, tipo, fecha, notas, toro_caravana } = req.body;

  db.get('SELECT * FROM animales WHERE id = ? AND usuario_id = ?', [animal_id, req.usuarioId], (err, animal) => {
    if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });

    db.run('INSERT INTO eventos_reproductivos (animal_id, tipo, fecha, notas, toro_caravana) VALUES (?, ?, ?, ?, ?)',
      [animal_id, tipo, fecha, notas, toro_caravana],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get('SELECT * FROM eventos_reproductivos WHERE id = ?', [this.lastID], (err, evento) => {
          res.json(evento);
        });
      }
    );
  });
});

// ==================== DASHBOARD / ESTADÍSTICAS ====================

app.get('/api/dashboard', verificarToken, (req, res) => {
  db.get(`SELECT 
            COUNT(*) as total_animales,
            SUM(CASE WHEN sexo = 'hembra' THEN 1 ELSE 0 END) as total_hembras,
            SUM(CASE WHEN sexo = 'macho' THEN 1 ELSE 0 END) as total_machos
          FROM animales WHERE usuario_id = ? AND estado = 'activo'`,
    [req.usuarioId],
    (err, stats) => {
      db.all(`SELECT DATE(fecha) as fecha, AVG(peso) as peso_promedio
              FROM pesajes p
              JOIN animales a ON p.animal_id = a.id
              WHERE a.usuario_id = ?
              GROUP BY DATE(fecha)
              ORDER BY fecha DESC LIMIT 30`,
        [req.usuarioId],
        (err2, pesajes) => {
          res.json({
            ...stats,
            evolucion_peso: pesajes
          });
        }
      );
    }
  );
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📊 Usuario demo: demo@campo.com / demo123`);
});
