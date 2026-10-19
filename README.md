# FormaSCRM — Forma, CRM per una scuola di formazione

Struttura iniziale in italiano, senza dipendenze di compilazione. Il sito parte con un archivio vuoto. I dati demo sono facoltativi e fittizi.

## Download del progetto

- [Scarica il pacchetto ZIP per uso locale](https://raw.githubusercontent.com/larry6285-cmyk/FormaSCRM/main/downloads/forma-crm-locale.zip): estrai tutto, installa Node.js LTS e avvia `Avvia Forma.bat` su Windows.
- [Scarica tutto il repository](https://github.com/larry6285-cmyk/FormaSCRM/archive/refs/heads/main.zip): include anche lo ZIP pronto e lo script PowerShell `Installa-Forma-Windows.ps1`.

Lo script PowerShell contiene lo stesso ZIP incorporato: ricrea una nuova cartella e l’archivio sul Desktop senza sovrascrivere cartelle esistenti. Non installa Node.js e non richiede privilegi di amministratore. Per evitare le restrizioni di esecuzione degli script PowerShell puoi semplicemente estrarre lo ZIP e usare `Avvia Forma.bat`.

## Avvio locale

Installa [Node.js LTS](https://nodejs.org) (versione 20 o successiva), estrai il pacchetto e apri un terminale nella cartella `forma-crm-locale`. Esegui:

```sh
npm start
```

Non serve `npm install`: vengono utilizzati solo moduli integrati di Node.js. Il browser si apre su **http://127.0.0.1:4173**; se necessario apri manualmente questo indirizzo. Mantieni aperto il terminale e usa `Ctrl+C` per fermare il server. Non aprire direttamente `dist/index.html`.

Sono inclusi anche `Avvia Forma.bat` per Windows, `Avvia Forma.command` per macOS e `avvia-forma.sh` per Linux. Se il doppio clic non è consentito dal sistema, usa `npm start`; su Linux puoi anche eseguire `sh avvia-forma.sh`.

Il server ascolta solo su `127.0.0.1`, non sulla rete locale, e non espone altri file della cartella. Il funzionamento locale non richiede Sites, credenziali, pubblicazione o connessione Internet. Sono utilizzati i font di sistema.

## Funzionalità disponibili

### Panoramica della scuola

- Riepilogo degli allievi iscritti, delle classi attive e delle classi in partenza.
- Agenda della giornata, con selezione del giorno nella settimana visualizzata.
- Visualizzazione delle lezioni con orari, classe, docente e aula.
- Riepilogo delle aule con e senza lezioni nella giornata selezionata, distinto per fascia.
- Accesso rapido alle classi e alla pianificazione delle lezioni.

### Gestione allievi

- Creazione, modifica, consultazione ed eliminazione delle anagrafiche.
- Nome, cognome, email, telefono e note della segreteria.
- Assegnazione di ciascun allievo a una classe oppure mantenimento senza classe.
- Stati disponibili: attivo, in attesa, non attivo.
- Ricerca per nome, email o classe e filtri per stato o assenza di classe.
- Controllo automatico del limite di 15 iscritti per classe.

### Classi e corsi

- Creazione e modifica di classi con nome e corso o area formativa.
- Assegnazione di un docente, della fascia oraria e di un’aula di riferimento.
- Date facoltative di inizio e fine del percorso.
- Stati disponibili: in partenza, attiva, conclusa.
- Elenco degli allievi della classe e indicazione dei posti occupati su 15.
- Ricerca delle classi e filtro tra mattino e pomeriggio.
- Eliminando una classe, gli allievi restano in anagrafica senza assegnazione; le lezioni collegate vengono rimosse.

Il corso è attualmente descritto nella scheda della classe: non esiste un catalogo corsi separato. L’aula di riferimento è una preferenza; la prenotazione effettiva avviene con l’inserimento delle lezioni.

### Gestione docenti

- Anagrafica con nome, cognome, area formativa, email e telefono.
- Inserimento, modifica, ricerca ed eliminazione dei docenti.
- Assegnazione del docente alle classi e conteggio delle classi assegnate.
- Eliminando un docente, le classi rimangono disponibili senza docente assegnato.

### Calendario e lezioni

- Calendario settimanale con navigazione tra le settimane e ritorno alla settimana corrente.
- Inserimento di singole lezioni con classe, data, aula, ora di inizio, ora di fine e note.
- Modifica o cancellazione delle lezioni già pianificate.
- Controllo degli orari rispetto alla fascia della classe e alle eventuali date del percorso.
- Blocco delle sovrapposizioni per la stessa aula, la stessa classe o lo stesso docente.
- Possibilità di riutilizzare un’aula nella stessa giornata in orari diversi.

### Gestione aule e vincoli

| Vincolo | Configurazione attuale |
| --- | --- |
| Allievi per classe | Massimo 15, includendo tutti gli allievi assegnati |
| Aule disponibili al mattino | 10: aule 01–10 |
| Aule disponibili al pomeriggio | 4: aule 01–04 |
| Orario iniziale mattino | 08:00–13:00, modificabile |
| Orario iniziale pomeriggio | 14:00–19:00, modificabile |

La sezione Aule permette di scegliere una data e una fascia, consultare le prenotazioni e avviare la pianificazione. Un’aula indicata come prenotata ha almeno una lezione nella fascia selezionata: può comunque essere disponibile in altri orari della stessa fascia. Le aule 01–04 al pomeriggio sono una configurazione iniziale assunta per questa versione.

### Impostazioni, ricerca e strumenti

- Personalizzazione del nome della scuola e degli orari delle due fasce.
- Verifica della compatibilità dei nuovi orari con le lezioni esistenti.
- Ricerca globale di allievi, classi e docenti, anche con `Ctrl+K` o `Cmd+K`.
- Registro delle ultime attività effettuate in questo browser.
- Guida ai primi passi integrata nell’interfaccia.
- Caricamento facoltativo di dati dimostrativi fittizi.
- Esportazione e ripristino dell’archivio in formato JSON.
- Svuotamento dell’archivio e conferme prima delle operazioni di sostituzione o eliminazione.
- Interfaccia in italiano, con layout adattabile a desktop e schermi piccoli.

## Flusso di utilizzo consigliato

1. Imposta il nome della scuola e gli orari di mattino e pomeriggio.
2. Inserisci i docenti.
3. Crea le classi, indicando corso, fascia e aula di riferimento.
4. Inserisci gli allievi e assegnali alle classi.
5. Pianifica le singole lezioni nel calendario.
6. Consulta agenda e disponibilità delle aule; esporta regolarmente un backup.

## Stato del progetto e funzioni non incluse

Forma è una struttura iniziale funzionante per una scuola di formazione generica. Parte con un archivio vuoto e consente di gestire i flussi descritti sopra.

Questa versione non comprende:

- Database condiviso, account del personale, ruoli o permessi applicativi.
- Sincronizzazione tra dispositivi o utilizzo collaborativo tra più operatori.
- Registro presenze, valutazioni, attestati o certificazioni.
- Rette, fatturazione, pagamenti o contabilità.
- Invio di email o messaggi agli allievi.
- Lezioni ricorrenti automatiche, iscrizioni multiple dello stesso allievo o più docenti per classe.
- Importazione da Excel o CSV; il ripristino supporta gli archivi JSON di Forma.

Il funzionamento offline e locale non richiede una pubblicazione online. Per continuare lo sviluppo sono inclusi tutti i sorgenti leggibili e modificabili.

## Salvataggio

Archivio locale in `localStorage`, chiave `forma-school-crm-v1`. Nessun database condiviso o account del personale. I dati non vengono condivisi tra browser o dispositivi e non vengono scritti nella cartella del progetto. Esportare regolarmente una copia JSON da **Impostazioni → Esporta archivio**. Gli orari iniziali 08:00–13:00 e 14:00–19:00 sono modificabili. La configurazione iniziale assume le stesse quattro aule al pomeriggio (01–04).

Usa sempre lo stesso browser e profilo, con l'indirizzo **http://127.0.0.1:4173**. `localhost`, un'altra porta, il browser in incognito o un altro profilo hanno archivi separati. Cancellando i dati del browser si può perdere l'archivio locale.

Per trasferire dati da una copia precedente, esporta lì un JSON e importalo qui da **Impostazioni → Ripristina archivio**. Il pacchetto contiene sorgenti e test, nessuna anagrafica reale. Non include pagamenti, registro presenze o sincronizzazione tra dispositivi.

## Struttura dei sorgenti

```text
dist/index.html       Pagina di ingresso
dist/styles.css       Stili responsive, font di sistema
dist/app.js           Interfaccia, anagrafiche, calendario e backup
dist/model.js         Modello dati e controlli dei vincoli
server.mjs            Server locale, senza dipendenze esterne
tests/                Test del modello e delle risorse locali
LEGGIMI-PRIMA.txt      Istruzioni rapide in italiano
```

Apri la cartella con il tuo editor e modifica direttamente i file: non esiste un passaggio di compilazione. Aggiorna la pagina nel browser dopo le modifiche. Se modifichi il server, fermalo e riavvialo.

## Modello dati

`students.classId` rappresenta l’iscrizione a una classe. `classes.teacherId` associa il docente; `classes.roomId` è solo l’aula di riferimento. `lessons` prenota un’aula in data e orari espliciti. L’aula di riferimento della classe non crea una prenotazione. Le date delle lezioni devono rientrare nelle eventuali date della classe. Il limite di 15 include ogni allievo assegnato, indipendentemente dallo stato dell’anagrafica.

I dati vengono validati prima di ogni salvataggio e ripristino: riferimenti esistenti, identificativi univoci, orari, fascia e aula ammesse, capienza, conflitti di aula/classe/docente. Il caricamento dei dati demo e lo svuotamento richiedono una conferma nell’interfaccia.

## Verifiche

`npm run check` verifica la sintassi JavaScript; `npm test` verifica i vincoli del modello e il gestore HTTP locale, senza aprire porte di rete. L'avvio effettivo del browser non è stato verificato in questo ambiente: i permessi disponibili bloccano il processo Chromium e l'apertura delle porte locali.
