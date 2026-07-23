// ============================================================
//  DATOS DE PRUEBA — Club Voleibol Oviedo
//  Sustituye estos datos por los reales cuando estén disponibles.
//  Las imágenes usan placeholders de colores del club (SVG data-uri)
//  generados en src/utils/placeholder.js
// ============================================================

import { ph } from '../utils/placeholder'

export const CLUB = {
  nombre: 'Club Voleibol Oviedo',
  siglas: 'CVO',
  lema: 'Pasión por el voleibol desde Asturias',
  fundacion: 1998,
  ciudad: 'Oviedo, Asturias',
  email: 'info@clubvoleiboloviedo.es',
  telefono: '+34 985 00 00 00',
  direccion: 'Polideportivo Municipal, Calle del Deporte 12, 33010 Oviedo',
  redes: {
    instagram: 'https://instagram.com/clubvoleiboloviedo',
    twitter: 'https://twitter.com/cvoviedo',
    facebook: 'https://facebook.com/clubvoleiboloviedo',
    youtube: 'https://youtube.com/@clubvoleiboloviedo',
  },
}

export const EQUIPOS = [
  {
    id: 'senior-masculino',
    nombre: 'Sénior Masculino',
    categoria: 'Superliga 2',
    foto: ph('Sénior Masculino', 800, 600),
    descripcion:
      'El primer equipo del club compite en Superliga 2 masculina, representando a Oviedo en la élite del voleibol nacional.',
    entrenador: 'Carlos Fernández',
    temporada: '2025/2026',
    plantilla: [
      { dorsal: 1, nombre: 'Adrián Estrada', posicion: 'Colocador' },
      { dorsal: 4, nombre: 'Diego Martín', posicion: 'Central' },
      { dorsal: 7, nombre: 'Pablo Ruiz', posicion: 'Receptor' },
      { dorsal: 9, nombre: 'Hugo Alonso', posicion: 'Opuesto' },
      { dorsal: 11, nombre: 'Marcos Vega', posicion: 'Líbero' },
      { dorsal: 12, nombre: 'Iván Solís', posicion: 'Central' },
      { dorsal: 14, nombre: 'Sergio Lanza', posicion: 'Receptor' },
    ],
    resultados: [
      { jornada: 'J8', local: 'CV Oviedo', visitante: 'CV Gijón', marcador: '3 - 1', fecha: '12 ene 2026', ganado: true },
      { jornada: 'J7', local: 'CV Avilés', visitante: 'CV Oviedo', marcador: '2 - 3', fecha: '05 ene 2026', ganado: true },
      { jornada: 'J6', local: 'CV Oviedo', visitante: 'CV León', marcador: '3 - 0', fecha: '21 dic 2025', ganado: true },
      { jornada: 'J5', local: 'CV Santander', visitante: 'CV Oviedo', marcador: '3 - 2', fecha: '14 dic 2025', ganado: false },
    ],
    proximo: { rival: 'CV Valladolid', fecha: '19 ene 2026', hora: '18:00', casa: true },
  },
  {
    id: 'senior-femenino',
    nombre: 'Sénior Femenino',
    categoria: 'Primera División',
    foto: ph('Sénior Femenino', 800, 600),
    descripcion:
      'Nuestro equipo sénior femenino lucha cada temporada por el ascenso, con una base de jugadoras formadas en la cantera del club.',
    entrenador: 'Lucía Prendes',
    temporada: '2025/2026',
    plantilla: [
      { dorsal: 2, nombre: 'Carla Nespral', posicion: 'Colocadora' },
      { dorsal: 5, nombre: 'Ana Muñiz', posicion: 'Central' },
      { dorsal: 6, nombre: 'Sara Roces', posicion: 'Receptora' },
      { dorsal: 8, nombre: 'Elena Cima', posicion: 'Opuesta' },
      { dorsal: 10, nombre: 'Nuria Baragaño', posicion: 'Líbero' },
      { dorsal: 13, nombre: 'Paula Granda', posicion: 'Central' },
    ],
    resultados: [
      { jornada: 'J8', local: 'CV Oviedo', visitante: 'VB Langreo', marcador: '3 - 0', fecha: '11 ene 2026', ganado: true },
      { jornada: 'J7', local: 'CV Mieres', visitante: 'CV Oviedo', marcador: '3 - 1', fecha: '04 ene 2026', ganado: false },
      { jornada: 'J6', local: 'CV Oviedo', visitante: 'CV Siero', marcador: '3 - 2', fecha: '20 dic 2025', ganado: true },
    ],
    proximo: { rival: 'CV Naranco', fecha: '18 ene 2026', hora: '12:00', casa: false },
  },
  {
    id: 'juvenil-masculino',
    nombre: 'Juvenil Masculino',
    categoria: 'Liga Autonómica',
    foto: ph('Juvenil Masculino', 800, 600),
    descripcion:
      'La cantera del club. Jóvenes promesas que dan el salto al voleibol de competición autonómica.',
    entrenador: 'Roberto Cuervo',
    temporada: '2025/2026',
    plantilla: [
      { dorsal: 3, nombre: 'Mario Coto', posicion: 'Colocador' },
      { dorsal: 7, nombre: 'Álex Riera', posicion: 'Receptor' },
      { dorsal: 9, nombre: 'Bruno Sela', posicion: 'Central' },
      { dorsal: 12, nombre: 'Lucas Peón', posicion: 'Líbero' },
    ],
    resultados: [
      { jornada: 'J6', local: 'CV Oviedo', visitante: 'CV Corvera', marcador: '3 - 0', fecha: '10 ene 2026', ganado: true },
      { jornada: 'J5', local: 'CV Grado', visitante: 'CV Oviedo', marcador: '1 - 3', fecha: '20 dic 2025', ganado: true },
    ],
    proximo: { rival: 'CV Llanera', fecha: '17 ene 2026', hora: '11:00', casa: true },
  },
  {
    id: 'infantil-femenino',
    nombre: 'Infantil Femenino',
    categoria: 'Escuela / Base',
    foto: ph('Infantil Femenino', 800, 600),
    descripcion:
      'Las más pequeñas del club aprenden los valores del deporte y del voleibol en un entorno divertido y seguro.',
    entrenador: 'Marta Feito',
    temporada: '2025/2026',
    plantilla: [
      { dorsal: 4, nombre: 'Daniela Fonseca', posicion: 'Colocadora' },
      { dorsal: 6, nombre: 'Irene Palacio', posicion: 'Receptora' },
      { dorsal: 8, nombre: 'Vega Corrales', posicion: 'Central' },
      { dorsal: 11, nombre: 'Alba Quirós', posicion: 'Líbero' },
    ],
    resultados: [
      { jornada: 'J4', local: 'CV Oviedo', visitante: 'CV Pravia', marcador: '2 - 1', fecha: '10 ene 2026', ganado: true },
      { jornada: 'J3', local: 'CV Noreña', visitante: 'CV Oviedo', marcador: '0 - 2', fecha: '19 dic 2025', ganado: true },
    ],
    proximo: { rival: 'CV Lugones', fecha: '17 ene 2026', hora: '10:00', casa: false },
  },
]

export const NOTICIAS = [
  {
    id: 'victoria-derbi',
    titulo: 'Victoria en el derbi asturiano ante el CV Gijón',
    resumen:
      'El sénior masculino se impuso 3-1 en un vibrante derbi disputado ante más de 500 aficionados en el Polideportivo Municipal.',
    fecha: '12 ene 2026',
    categoria: 'Competición',
    imagen: ph('Derbi CVO vs Gijón', 800, 500),
  },
  {
    id: 'nueva-equipacion',
    titulo: 'Presentamos la nueva equipación 2025/2026',
    resumen:
      'Diseño renovado en azul y blanco, los colores de siempre del Club Voleibol Oviedo. Ya disponible en nuestra tienda.',
    fecha: '02 ene 2026',
    categoria: 'Club',
    imagen: ph('Nueva equipación', 800, 500),
  },
  {
    id: 'campus-navidad',
    titulo: 'Éxito de participación en el Campus de Navidad',
    resumen:
      'Más de 80 niños y niñas disfrutaron de una semana de voleibol, juegos y valores durante las vacaciones navideñas.',
    fecha: '28 dic 2025',
    categoria: 'Cantera',
    imagen: ph('Campus de Navidad', 800, 500),
  },
  {
    id: 'nuevo-patrocinador',
    titulo: 'Nuevo acuerdo de patrocinio para la temporada',
    resumen:
      'El club refuerza su proyecto deportivo con la incorporación de un nuevo patrocinador principal comprometido con el deporte base.',
    fecha: '15 dic 2025',
    categoria: 'Club',
    imagen: ph('Acuerdo patrocinio', 800, 500),
  },
]

export const GALERIA = [
  ph('Partido 1', 600, 600),
  ph('Entreno', 600, 600),
  ph('Afición', 600, 600),
  ph('Saque', 600, 600),
  ph('Bloqueo', 600, 600),
  ph('Celebración', 600, 600),
  ph('Cantera', 600, 600),
  ph('Equipo', 600, 600),
]

export const PRODUCTOS = [
  { id: 'llavero', nombre: 'Llavero oficial CVO', precio: 4.95, imagen: ph('Llavero', 500, 500), categoria: 'Accesorios' },
  { id: 'gorra', nombre: 'Gorra bordada', precio: 14.95, imagen: ph('Gorra', 500, 500), categoria: 'Textil' },
  { id: 'sudadera', nombre: 'Sudadera con capucha', precio: 34.95, imagen: ph('Sudadera', 500, 500), categoria: 'Textil' },
  { id: 'botella', nombre: 'Botella deportiva 750ml', precio: 9.95, imagen: ph('Botella', 500, 500), categoria: 'Accesorios' },
  { id: 'camiseta', nombre: 'Camiseta oficial de juego', precio: 24.95, imagen: ph('Camiseta', 500, 500), categoria: 'Textil' },
  { id: 'bufanda', nombre: 'Bufanda de aficionado', precio: 12.95, imagen: ph('Bufanda', 500, 500), categoria: 'Accesorios' },
  { id: 'mochila', nombre: 'Mochila de entrenamiento', precio: 29.95, imagen: ph('Mochila', 500, 500), categoria: 'Textil' },
  { id: 'balon', nombre: 'Balón oficial de voleibol', precio: 27.95, imagen: ph('Balón', 500, 500), categoria: 'Material' },
]

export const PATROCINADORES = [
  { nombre: 'Asturias Deporte', imagen: ph('Asturias Deporte', 300, 150) },
  { nombre: 'Sidra El Saque', imagen: ph('Sidra El Saque', 300, 150) },
  { nombre: 'Construcciones Norte', imagen: ph('Construcciones Norte', 300, 150) },
  { nombre: 'Banco Cantábrico', imagen: ph('Banco Cantábrico', 300, 150) },
  { nombre: 'Deportes Naranco', imagen: ph('Deportes Naranco', 300, 150) },
  { nombre: 'Hotel Ovetense', imagen: ph('Hotel Ovetense', 300, 150) },
]

export const RETRANSMISIONES = [
  { titulo: 'Sénior Masculino vs CV Valladolid', plataforma: 'YouTube', fecha: '19 ene 2026 · 18:00', url: '#' },
  { titulo: 'Sénior Femenino vs CV Naranco', plataforma: 'Instagram Live', fecha: '18 ene 2026 · 12:00', url: '#' },
  { titulo: 'Resumen Jornada 8', plataforma: 'YouTube', fecha: 'Disponible ahora', url: '#' },
]
