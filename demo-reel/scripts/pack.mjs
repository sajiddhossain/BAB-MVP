#!/usr/bin/env node
/**
 * Prepara i file da mandare in giro, a partire dai master di record.mjs.
 *
 * Per ogni clip escono due file, stesso video, due inquadrature:
 *
 *   …-telefono.mp4   verticale 960x1904, il master ricopiato com'e'
 *   …-desktop.mp4    1920x1080, il telefono al centro sulla carta dell'app
 *
 * Perche' due: un video verticale dentro un lettore 16:9 finisce fra due
 * fasce nere enormi e il telefono si perde. Sul telefono invece il verticale
 * riempie lo schermo. Non e' il formato a cambiare — H.264 va bene ovunque —
 * e' la forma.
 *
 * Tutti e due prendono una traccia audio muta: un MP4 senza audio e'
 * legittimo, ma alcuni servizi lo ricodificano o non ne fanno l'anteprima.
 *
 *   node scripts/pack.mjs
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'out')
const DEST = join(OUT, 'consegna')

/*
 * Il master e' 960x1904 ma il telefono ne occupa 852x1796: attorno c'e' il
 * fondale della pagina, 54px per lato. Va tolto prima di rimettere il
 * telefono su un altro colore.
 *
 * Gli angoli tondi non hanno bisogno di nessuna maschera: dietro l'arco c'e'
 * il fondale scuro della pagina, che e' praticamente lo stesso colore della
 * scocca. Sul beige l'angolo si legge come parte del telefono.
 */
const RITAGLIO = 'crop=852:1796:54:54'
/** alto 980 di 1080: il testo dell'app resta appena piu' grande del vero */
const SCALA = 'scale=464:980'
/** la carta dell'app: --bab-bg */
const SFONDO = 'pad=1920:1080:(ow-iw)/2:(oh-ih)/2:0xF0EBE6'

/*
 * NIENTE sorgenti infinite nel filtro (color=…, loop 1). Con overlay su uno
 * sfondo generato, alla fine del video overlay ripete l'ultimo fotogramma e
 * lo sfondo non finisce mai: la codifica andava avanti all'infinito e il file
 * passava i 70MB senza arrivare in fondo. `pad` fa la stessa cosa ed e'
 * guidato dal video, che una fine ce l'ha.
 */
const silenzio = ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000']
const audio = ['-map', '1:a', '-c:a', 'aac', '-b:a', '64k', '-shortest', '-movflags', '+faststart']

const run = (args) =>
  new Promise((ok, ko) => {
    const p = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let err = ''
    p.stderr.on('data', (d) => (err += d))
    p.on('exit', (c) => (c === 0 ? ok() : ko(new Error(err.split('\n').slice(-6).join('\n')))))
  })

if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true })
for (const clip of ['checkin', 'checkout']) {
  const src = join(OUT, `bab-${clip}.mp4`)
  if (!existsSync(src)) {
    console.log(`✖ manca out/bab-${clip}.mp4 — lancia prima npm run record`)
    process.exit(1)
  }
  process.stdout.write(`▶ ${clip}\n`)

  const tel = join(DEST, `bab-${clip}-telefono.mp4`)
  await run(['-y', '-i', src, ...silenzio, '-map', '0:v', '-c:v', 'copy', ...audio, tel])
  process.stdout.write(`  → out/consegna/bab-${clip}-telefono.mp4\n`)

  const desk = join(DEST, `bab-${clip}-desktop.mp4`)
  await run([
    '-y', '-i', src, ...silenzio,
    '-vf', `${RITAGLIO},${SCALA},${SFONDO}`,
    '-map', '0:v',
    // si ricomprime roba gia' compressa, su un'inquadratura quasi tutta piatta
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p',
    ...audio, desk,
  ])
  process.stdout.write(`  → out/consegna/bab-${clip}-desktop.mp4\n`)
}
process.stdout.write('\nfatto.\n')
