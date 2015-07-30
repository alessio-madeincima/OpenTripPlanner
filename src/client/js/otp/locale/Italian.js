/* This program is free software: you can redistribute it and/or
   modify it under the terms of the GNU Lesser General Public License
   as published by the Free Software Foundation, either version 3 of
   the License, or (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

otp.namespace("otp.locale");

/**
  * @class
  */
otp.locale.Italian = {

    config :
    {
        //Name of a language written in a language itself (Used in Frontend to
        //choose a language)
        name: 'Italiano',
        //FALSE-imperial units are used
        //TRUE-Metric units are used
        metric : true,
        //Name of localization file (*.po file) in src/client/i18n
        locale_short : "it",
        //Name of datepicker localization in
        //src/client/js/lib/jquery-ui/i18n (usually
        //same as locale_short)
        //this is index in $.datepicker.regional array
        //If file for your language doesn't exist download it from here
        //https://github.com/jquery/jquery-ui/tree/1-9-stable/ui/i18n
        //into src/client/js/lib/jquery-ui/i18n
        //and add it in index.html after other localizations
        //It will be used automatically when UI is switched to this locale
        datepicker_locale_short: "it"
    },

    /**
     * Info Widgets: a list of the non-module-specific "information widgets"
     * that can be accessed from the top bar of the client display. Expressed as
     * an array of objects, where each object has the following fields:
     * - content: <string> the HTML content of the widget
     * - [title]: <string> the title of the widget
     * - [cssClass]: <string> the name of a CSS class to apply to the widget.
     * If not specified, the default styling is used.
     */
    infoWidgets : [
            {
                title: 'Il Servizio',
                                content: '<p>Il servizio di Calcolo Percorsi Regionale Pronto TPL è il nuovo strumento di infomobilità che permette di ricercare e pianificare gli spostamenti sul territorio regionale utilizzando i servizi di trasporto pubblico in tutte le sue declinazioni (bus e tram urbani, servizi extraurbani e treno) o tramite percorsi pedonali o con l’utilizzo dell’auto personale.</p>\
                <br/><br/>\
                                <p>Il servizio è un progetto sperimentale a cura della <a href="http://www.regione.piemonte.it/trasporti/">Direzione Opere pubbliche, Difesa del suolo, Montagna, Foreste, Protezione civile, Trasporti e Logistica di Regione Piemonte </a> ed è realizzato e gestito da <a href="http://www.5t.torino.it/">5T</a> in collaborazione con le Amministrazioni pubbliche e le aziende di trasporto pubblico piemontesi.</p>\
                <br/><br/>\
                                <p>Il Calcolo Percorsi Regionale Pronto TPL utilizza tecnologie open source, largamente diffuse e consolidate come <a href="https://www.openstreetmap.org/">OpenStreetMap</a> e <a href="http://www.opentripplanner.org/">OpenTripPlanner</a> e si basa sugli orari programmati forniti dagli Enti e dalle aziende piemontesi di trasporto pubblico aderenti al <a href="http://bip.piemonte.it/">sistema BIP (Biglietto Integrato Piemonte)</a>.</p>\
                <br/><br/>\
                                <p>Per maggiori informazioni su come utilizzare il servizio, si invita a consultare la <a href="http://prontotpl.5t.torino.it/ProntoTPL_Manuale_utente.pdf">Guida all’uso</a>.</p>\
                ',
                //cssClass: 'otp-contactWidget',
            },
            {
                title: 'Contatti',
                content: '<p>Il servizio Calcolo Percorsi Regionale Pronto TPL è un progetto sperimentale e in costante aggiornamento.</p>\
                                                  <p>Si invita pertanto a segnalare eventuali inesattezze e anomalie e ad inviare consigli e suggerimenti utili al miglioramento del servizio:</p>\
                                                  <p>-  via email a <a href="mailto:prontotpl@5t.torino.it">prontotpl@5t.torino.it</a></p>\
                                                  <p>-  contattando il Numero Verde Unico della Regione Piemonte 800333444</p>\
                                                  <br/><br/>\
                          <p><b>DISCLAIMER</b></p>\
                                                  <br/><br/>\
                                                  <p>Il Calcolo Percorsi Regionale di Pronto TPL utilizza OpenStreetMap (OSM) come base cartografica, un progetto collaborativo finalizzato a creare mappe mondiali a contenuto libero e aggiornato quotidianamente da utenti liberi e indipendenti. Si ricorda pertanto che, sebbene in costante miglioramento, la mappa potrebbe non essere del tutto completa o aggiornata.</p>\
                                                  <br/><br/>\
                                                  <p>Si ricorda inoltre che nel riconoscimento degli indirizzi per il punto di partenza e il punto di arrivo potranno verificarsi errori o imprecisioni.</p>\
                                                  <br/><br/>\
                                                  <p>Si ricorda infine che i dati inerenti al servizio di trasporto pubblico (quali localizzazione delle fermate, orari e percorsi) sono stati forniti <a href="http://prontotpl.5t.torino.it/ProntoTPL_Aggiornamento_Dati.pdf">dalle Amministrazioni provinciali e comunali della Regione Piemonte e dalle aziende piemontesi di trasporto pubblico</a> e sono generalmente aggiornati con cadenza trimestrale. Nel caso in cui l’aggiornamento non avvenga secondo tali tempistiche, alcune località potrebbero risultare non raggiungibili con i servizi di trasporto pubblico.</p>\
                 ',
            },
    ],



    time:
    {
        format: "DD.MM.YYYY, HH:mm", //momentjs
        date_format: "DD/MM/YYYY", //momentjs
        time_format: "HH:mm", //momentjs
        time_format_picker : "hh:mmtt", //http://trentrichardson.com/examples/timepicker/#tp-formatting
    },


    CLASS_NAME : "otp.locale.Italian"
};
