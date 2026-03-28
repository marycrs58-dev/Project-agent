# Agente de Proyectos — Marycarmen Reséndiz
## Versión con Supabase (usuarios + datos compartidos)

---

## ⚙️ PASO 1 — Agrega tus credenciales de Supabase

Abre el archivo `src/supabase.js` y reemplaza:

```js
const SUPABASE_URL = 'https://TU_PROJECT_URL.supabase.co'
const SUPABASE_ANON_KEY = 'TU_ANON_KEY'
```

Con los valores de tu proyecto en **Supabase → Settings → API**.

---

## 🚀 PASO 2 — Publicar en Vercel

### Opción A — Sin terminal (recomendado)

1. Descomprime este ZIP
2. Ve a **github.com** → New repository → sube todos los archivos
3. Ve a **vercel.com** → Add New Project → conecta el repo
4. Clic en **Deploy** → en ~1 min tienes tu URL

### Opción B — Con terminal

```bash
npm install
npm run dev          # Para probar local en http://localhost:5173
vercel               # Para publicar
```

---

## 👤 PASO 3 — Crear el primer usuario admin

La primera vez que publiques:
1. Abre la app en tu URL de Vercel
2. Clic en "Crear cuenta" → regístrate
3. Ve a **Supabase → Table Editor → user_profiles**
4. Busca tu registro y cambia `rol` de `viewer` a `admin`
5. Recarga la app — ya tienes acceso completo de administrador

A partir de ahí, desde la app puedes crear usuarios directamente
con el botón 🔐 **Usuarios** (solo visible para admins).

---

## 🔐 Roles

| Rol    | Puede hacer |
|--------|-------------|
| admin  | Ver, crear, editar y eliminar todo. Gestionar usuarios. |
| viewer | Solo puede ver proyectos, tareas, minutas y Gantt. |

---

## 📁 Estructura

```
project-agent-v2/
├── index.html
├── vite.config.js
├── package.json
├── vercel.json
└── src/
    ├── main.jsx       ← Entrada React
    ├── supabase.js    ← ← EDITA ESTO CON TUS CREDENCIALES
    └── App.jsx        ← Toda la aplicación
```
