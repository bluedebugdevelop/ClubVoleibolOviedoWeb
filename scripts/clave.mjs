#!/usr/bin/env node
// ==========================================================================
// Genera las variables de acceso al panel.
//
//   node scripts/clave.mjs                 → inventa una contraseña segura
//   node scripts/clave.mjs "mi contraseña" → usa la que le digas
//
// Escupe las tres líneas que hay que pegar en las variables de Railway. La
// contraseña en claro solo se enseña por pantalla: a partir de ahí lo único
// que existe es su huella, y de una huella no se saca la contraseña.
//
// Si se pierde, no se recupera: se genera otra y se cambia PANEL_CLAVE_HASH.
// ==========================================================================

import crypto from 'node:crypto'
import { hashear } from '../api/_acceso.js'

// Sin i/I/l/1/0/O: en un papel o en un chat se confunden, y esta contraseña se
// va a copiar a mano más de una vez.
const ALFABETO = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789-_'

function inventar(largo = 20) {
  const bytes = crypto.randomBytes(largo * 2)
  let clave = ''
  // Se descartan los bytes que caen fuera del múltiplo exacto del alfabeto:
  // usar el módulo a pelo haría unos caracteres más probables que otros.
  const tope = Math.floor(256 / ALFABETO.length) * ALFABETO.length
  for (const b of bytes) {
    if (b >= tope) continue
    clave += ALFABETO[b % ALFABETO.length]
    if (clave.length === largo) break
  }
  return clave.length === largo ? clave : inventar(largo)
}

const dada = process.argv[2]
const clave = dada || inventar()

if (dada && dada.length < 12) {
  console.error('\n  La contraseña es corta. Doce caracteres como mínimo.\n')
  process.exit(1)
}

const usuario = process.env.PANEL_USUARIO || 'admin'

console.log(`
  ────────────────────────────────────────────────────────────────
   Acceso al panel
  ────────────────────────────────────────────────────────────────

   Usuario:     ${usuario}
   Contraseña:  ${clave}

   Apúntala AHORA (gestor de contraseñas). No se puede recuperar.

  ────────────────────────────────────────────────────────────────
   Variables para Railway
  ────────────────────────────────────────────────────────────────

PANEL_USUARIO=${usuario}
PANEL_CLAVE_HASH=${hashear(clave)}
PANEL_SECRETO=${crypto.randomBytes(32).toString('base64url')}

   PANEL_SECRETO firma la cookie de sesión. Cambiarlo cierra la sesión
   en todos los dispositivos de golpe.
`)
