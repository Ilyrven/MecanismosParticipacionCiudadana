/**
 * server/src/achievements.js
 * Catálogo de logros y su evaluación. Los textos en español son el valor por
 * defecto guardado en SQL; la interfaz los muestra traducidos con sus claves
 * (ach.<key>.name / .desc en js/i18n/lang/*.js).
 *
 * Sin recompensas económicas ni competencia: solo reconocimiento del avance.
 */
const GAMES = ["crossword", "matching", "wordsearch", "situations", "memory", "roulette"];
const ALL_TYPES = ["quiz"].concat(GAMES);
const MECHANISMS = ["tutela", "derecho-peticion", "referendo", "plebiscito", "consulta-popular", "cabildo-abierto", "iniciativa-popular", "revocatoria-mandato"];

/**
 * `s` = estadísticas calculadas (ver stats.js):
 *   total, quizzes, bestQuizScore, bestScore, types:Set, visited, timeSeconds
 * dependsOnHistory: si la condición usa el historial de actividades (se retira al borrarlo).
 */
const ACHIEVEMENTS = [
  { key: "first_step", icon: "👣", name: "Primer paso", description: "Completaste tu primera actividad.", condition: "Completar 1 actividad.", dependsOnHistory: true, check: (s) => s.total >= 1 },
  { key: "explorer", icon: "🧭", name: "Explorador", description: "Visitaste todos los mecanismos de participación ciudadana.", condition: "Abrir la información de los 8 mecanismos.", dependsOnHistory: false, check: (s) => s.visited >= MECHANISMS.length },
  { key: "good_start", icon: "📝", name: "Buen comienzo", description: "Completaste tu primer quiz.", condition: "Completar 1 quiz.", dependsOnHistory: true, check: (s) => s.quizzes >= 1 },
  { key: "consistency", icon: "🔁", name: "Constancia", description: "Completaste cinco actividades.", condition: "Completar 5 actividades.", dependsOnHistory: true, check: (s) => s.total >= 5 },
  { key: "dedication", icon: "🏅", name: "Dedicación", description: "Completaste diez actividades.", condition: "Completar 10 actividades.", dependsOnHistory: true, check: (s) => s.total >= 10 },
  { key: "knowledge", icon: "🎓", name: "Conocimiento", description: "Alcanzaste una puntuación de 5.0 en un quiz.", condition: "Obtener 5.0 en un quiz.", dependsOnHistory: true, check: (s) => s.bestQuizScore != null && s.bestQuizScore >= 5 },
  { key: "researcher", icon: "🔎", name: "Investigador", description: "Completaste todos los juegos disponibles.", condition: "Completar los 6 juegos al menos una vez.", dependsOnHistory: true, check: (s) => GAMES.every((g) => s.types.has(g)) },
  { key: "participation", icon: "🗳️", name: "Participación", description: "Completaste todas las actividades educativas.", condition: "Completar el quiz y los 6 juegos al menos una vez.", dependsOnHistory: true, check: (s) => ALL_TYPES.every((t) => s.types.has(t)) },
  { key: "curious", icon: "🎯", name: "Curioso", description: "Probaste tres tipos de actividad distintos.", condition: "Completar 3 tipos de actividad diferentes.", dependsOnHistory: true, check: (s) => s.types.size >= 3 },
  { key: "high_grade", icon: "⭐", name: "Buen desempeño", description: "Obtuviste una calificación de 4.0 o más.", condition: "Obtener 4.0 o más en una actividad calificada.", dependsOnHistory: true, check: (s) => s.bestScore != null && s.bestScore >= 4 },
  { key: "study_time", icon: "⏱️", name: "Tiempo bien invertido", description: "Acumulaste 30 minutos de aprendizaje.", condition: "Sumar 30 minutos en actividades.", dependsOnHistory: true, check: (s) => s.timeSeconds >= 1800 }
];

module.exports = { ACHIEVEMENTS, GAMES, ALL_TYPES, MECHANISMS };
