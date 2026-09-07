# BAB

Web app, ricostruita dal file Figma `TA3cGQAArcaxt4tnCSQWJw`.

## La regola che tiene in piedi tutto

Il disegno e' fatto su frame da 402x874 con ogni elemento in **posizione
assoluta**. Qui quelle coordinate non si copiano: si copia il risultato.

Ogni schermo e' una colonna larga al massimo 402, centrata, con il contenuto
nel flusso normale e le distanze misurate dal frame. Il bottone principale sta
in fondo, fuori dallo scorrimento.

Il motivo e' pratico: con le coordinate assolute un testo piu' lungo del
previsto finisce sopra a quello che viene dopo, e fuori da 402x874 non
funziona niente. Su ~40 schermi con dati veri e' la differenza fra un
prototipo e un'app.

## Dove sta cosa

    src/ui/        i componenti condivisi: sono loro il sistema di design
    src/screens/   uno schermo, un file, col node-id Figma nel commento
    src/data/      i contenuti: domande, livelli, parole
    src/lib/       supabase e il resto dell'impianto
    src/assets/    gli asset scaricati da Figma (i link scadono in 7 giorni)
    supabase/      lo schema: 19 tabelle, 16 politiche, 10 funzioni
    ../figma/frames.json   l'indice dei 372 frame: nome, node-id, link

## I token

Il file Figma non usa variabili: i colori stanno come valori diretti dentro ai
frame. La fonte di verita' e' `src/index.css`, ricavata misurando gli schermi.
Un valore ci finisce solo se compare almeno due volte nel disegno.

## Tre blocchi su quattro sono contenuto, non schermi

Dal censimento dei 372 frame:

    body-language   138 frame  ->  8 livelli x ~9 tipi di schermo
    onboarding      104 frame  ->  ~20 schermi, ~6 layout
    body-sense       42 frame  ->  6 esercizi x ~5 passi
    word-cards       33 frame  ->  UNA card x 16 parole

Costruiti come schermi sono 317 lavori. Costruiti come un riproduttore piu' un
elenco sono ~20 schermi e 4 file di dati.
