import { setField } from '../ui/state'

/**
 * Il prototipo parte da foglio bianco.
 *
 * I componenti hanno come default lo stato del FRAME Figma: il chip gia'
 * scelto, gli slider dove li ha messi il designer, "2 spots added". E' giusto
 * che sia cosi' — e' quello che il diff confronta, e senza sarebbe impossibile
 * verificare la fedelta'. Ma aprire l'app e trovare le risposte gia' date non
 * e' un'app: e' una fotografia.
 *
 * Quindi il vuoto vive QUI, nel prototipo, non nei componenti. Riempiamo lo
 * store prima del primo render: chi legge trova il vuoto, e il probe del diff
 * (che lo store non lo tocca) continua a cadere sui default del frame.
 *
 * Gli slider fanno eccezione: un cursore non ha uno stato "vuoto", ha una
 * posizione. Partono dal mezzo, che su una scala 1–7 e' il 4 e su una 0–10 e'
 * il 5 — la risposta neutra, non una risposta gia' data. Sono tutti larghi 302
 * con pallino da 24, quindi il mezzo e' 139 per tutti; quello del pannello e'
 * largo 370, mezzo a 173.
 */
const MID_302 = 139
const MID_370 = 173

const BLANK: Record<string, unknown> = {
  // check-in
  'checkin.tempo': null,
  'checkin.sleep': MID_302,
  'checkin.energy': MID_302,
  'checkin.mood': MID_302,
  'checkin.school': MID_302,
  'checkin.sleepDuration': null,
  'checkin.spotsBase': 0,
  'checkin.sheet.chips': [],
  'checkin.sheet.side': null,
  'checkin.sheet.intensity': MID_370,
  'checkin.sheet.note': '',

  // check-out
  'checkout.tempo': null,
  'checkout.rpe': MID_302,
  'checkout.face': null,
  'checkout.takeHome': [],
  'checkout.energy': MID_302,
  'checkout.spotsBase': 0,
  'checkout.sheet.chips': [],
  'checkout.sheet.side': null,
  'checkout.sheet.intensity': MID_370,
  'checkout.sheet.note': '',
  'checkout.protective': null,
}

let done = false

/** Da chiamare una volta sola, prima che gli schermi leggano lo store. */
export function startBlank() {
  if (done) return true
  done = true
  for (const [k, v] of Object.entries(BLANK)) setField(k, v)
  return true
}
