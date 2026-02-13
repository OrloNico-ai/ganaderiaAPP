# 🚀 Guía de Deploy - GanaderoApp

## 📋 Tabla de Contenidos

- [Deploy Local con Docker](#deploy-local-con-docker)
- [Deploy en Railway](#deploy-en-railway)
- [Deploy en Render](#deploy-en-render)
- [Deploy en AWS](#deploy-en-aws)
- [Variables de Entorno](#variables-de-entorno)
- [Troubleshooting](#troubleshooting)

---

## 🐳 Deploy Local con Docker

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Crear archivo .env
cp .env.example .env

# 2. Editar .env con tus valores
nano .env

# 3. Construir y levantar servicios
docker-compose up -d

# 4. Ver logs
docker-compose logs -f

# 5. Detener servicios
docker-compose down
```

### Opción 2: Docker Solo Backend

```bash
# Build
docker build -t ganadero-backend ./backend

# Run
docker run -d \
  --name ganadero-backend \
  -p 3001:3001 \
  -e JWT_SECRET="tu_secret_super_seguro" \
  -v $(pwd)/backend/data:/app/data \
  ganadero-backend

# Ver logs
docker logs -f ganadero-backend

# Detener
docker stop ganadero-backend
docker rm ganadero-backend
```

---

## 🚂 Deploy en Railway

**Railway** es gratuito para empezar y super fácil.

### Paso 1: Preparar el proyecto

```bash
# 1. Asegúrate de tener un repo en GitHub
git add .
git commit -m "feat: prepare for railway deployment"
git push origin main
```

### Paso 2: Deploy desde Railway Dashboard

1. Ve a [railway.app](https://railway.app)
2. Click en "Start a New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway y selecciona tu repo `ganaderiaAPP`
5. Railway detectará automáticamente Node.js

### Paso 3: Configurar Variables de Entorno

En el dashboard de Railway:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=genera_un_string_random_super_largo_y_seguro_minimo_32_caracteres
JWT_EXPIRY=30d
DB_PATH=/app/data/ganadero.db
```

### Paso 4: Configurar Railway.json (Opcional)

Crea `railway.json` en la raíz:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Paso 5: Deploy!

Railway deployará automáticamente. Tu API estará en:
```
https://tu-app.railway.app
```

---

## 🎨 Deploy en Render

**Render** también tiene tier gratuito.

### Paso 1: Crear Web Service

1. Ve a [render.com](https://render.com)
2. Click en "New +" → "Web Service"
3. Conecta tu repo de GitHub
4. Configuración:

```
Name: ganadero-backend
Environment: Node
Region: Oregon (o el más cercano)
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

### Paso 2: Variables de Entorno

```
NODE_ENV=production
JWT_SECRET=tu_secret_super_seguro_aqui
```

### Paso 3: Deploy

Render deployará automáticamente. URL:
```
https://ganadero-backend.onrender.com
```

**⚠️ Nota:** El tier gratuito de Render pone el servicio a dormir después de 15 min de inactividad. La primera request tarda ~30 segundos.

---

## ☁️ Deploy en AWS (EC2)

Para producción real con más control.

### Paso 1: Crear instancia EC2

```bash
# 1. Lanza una instancia Ubuntu 22.04 LTS
# 2. Tipo: t2.micro (gratis por 1 año)
# 3. Security Group: Abrir puerto 22 (SSH) y 3001 (API)
```

### Paso 2: Conectarse y configurar

```bash
# SSH a tu instancia
ssh -i tu-key.pem ubuntu@tu-ip-publica

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Clonar repo
git clone https://github.com/jota1308/ganaderiaAPP.git
cd ganaderiaAPP/backend

# Instalar dependencias
npm install

# Crear .env
nano .env
# (Pegar tus variables)

# Iniciar con PM2
pm2 start server.js --name ganadero-backend

# Auto-start on reboot
pm2 startup
pm2 save

# Ver logs
pm2 logs ganadero-backend
```

### Paso 3: Configurar Nginx (Opcional pero recomendado)

```bash
sudo apt install nginx

# Crear config
sudo nano /etc/nginx/sites-available/ganadero
```

Contenido:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar
sudo ln -s /etc/nginx/sites-available/ganadero /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Paso 4: SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## 🌐 Deploy Frontend (Vercel)

### Backend ya deployado en Railway/Render

```bash
# 1. Actualizar API_URL en web/index.html
const API_URL = 'https://tu-backend.railway.app/api';

# 2. Deploy en Vercel
cd web
npx vercel
```

O directo desde GitHub:
1. Ve a [vercel.com](https://vercel.com)
2. Import proyecto
3. Root Directory: `web`
4. Deploy!

---

## 🔐 Variables de Entorno

### Obligatorias

```bash
NODE_ENV=production
JWT_SECRET=<generar con: openssl rand -base64 32>
```

### Opcionales

```bash
PORT=3001
DB_PATH=/app/data/ganadero.db
JWT_EXPIRY=30d
FRONTEND_URL=https://tu-frontend.vercel.app
```

### Generar JWT_SECRET seguro

```bash
# En tu terminal
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# O con openssl
openssl rand -base64 32
```

---

## 🐛 Troubleshooting

### Error: "JWT_SECRET no configurado"

```bash
# Asegúrate de tener .env configurado
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

### Error: "Cannot find module dotenv"

```bash
cd backend
npm install dotenv
```

### Base de datos se borra al reiniciar (Railway/Render)

**Problema:** Railway/Render usan contenedores efímeros.

**Solución:** Usar PostgreSQL o volumen persistente.

```bash
# En Railway
1. Add service → PostgreSQL
2. Conectar a tu app
3. Actualizar código para usar PostgreSQL en vez de SQLite
```

### Port already in use

```bash
# Matar proceso en puerto 3001
lsof -ti:3001 | xargs kill -9

# O usar otro puerto
PORT=3002 npm start
```

---

## 📊 Monitoreo

### Logs en Railway

```bash
railway logs
```

### Logs en Render

Ver en el dashboard web.

### Logs en AWS

```bash
pm2 logs ganadero-backend
pm2 monit
```

---

## 🔄 Actualización

### Railway/Render

```bash
# Simplemente push a GitHub
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# Auto-deploy automático
```

### AWS

```bash
ssh ubuntu@tu-ip

cd ganaderiaAPP
git pull origin main

cd backend
npm install

pm2 restart ganadero-backend
```

---

## 💾 Backup de Base de Datos

### Local

```bash
# Copiar archivo SQLite
cp backend/data/ganadero.db backup-$(date +%Y%m%d).db
```

### En Servidor

```bash
# Script de backup automático
crontab -e

# Agregar (backup diario a las 2 AM):
0 2 * * * cp /ruta/ganadero.db /backups/ganadero-$(date +\%Y\%m\%d).db
```

---

## ✅ Checklist Pre-Deploy

- [ ] `.env` configurado con valores de producción
- [ ] `JWT_SECRET` generado de forma segura
- [ ] Tests pasando (`npm test`)
- [ ] CORS configurado correctamente
- [ ] Base de datos respaldada
- [ ] Logs configurados
- [ ] Health check funcionando (`/health`)
- [ ] Variables de entorno documentadas

---

**¿Problemas?** Abre un issue en GitHub o contacta: contacto@ganaderoapp.com
