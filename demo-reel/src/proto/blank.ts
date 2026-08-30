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
 * con pallino da 24, quindi il mezzo e' 139 per tutti.
 */
const MID_302 = 139

const BLANK: Record<string, unknown> = {
  /*
   * Le risposte del pannello stanno su una chiave per ZONA, e le zone non si
   * possono elencare qui. Segnaliamo invece che la sessione parte da foglio
   * bianco: SensationSheet legge questo e sceglie i default vuoti.
   */
  'proto.blank': true,

  // check-in
  'checkin.tempo': null,
  'checkin.sleep': MID_302,
  'checkin.energy': MID_302,
  'checkin.mood': MID_302,
  'checkin.school': MID_302,
  'checkin.sleepDuration': null,
  'checkin.spotsBase': 0,

  // check-out
  'checkout.tempo': null,
  'checkout.rpe': MID_302,
  'checkout.face': null,
  'checkout.takeHome': [],
  'checkout.energy': MID_302,
  'checkout.spotsBase': 0,
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
