// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ObiettiviResidui");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ObiettiviResidui");
import { useState } from "react";
import { Card, Badge, TextInput, useTable } from "../floware";

const iniziali = { "E-104": "30", "E-218": "25", "E-306": "22", "E-412": "25", "E-510": "70", "E-511": "75" };

function percentuale(testo) {__mk();
  const pulito = String(testo).replaceAll("%", "").replace(",", ".").trim();
  return pulito === "" ? Number.NaN : Number(pulito);
}

function importo(testo) {__mk();
  const pulito = String(testo).replaceAll("€", "").split(".").join("").replace(",", ".").trim();
  return pulito === "" ? Number.NaN : Number(pulito);
}

function dataScadenza(testo) {__mk();
  const parti = testo.split("/");
  if (parti.length !== 3) return "";
  const giorno = Number(parti[0]);
  const mese = Number(parti[1]);
  const anno = Number(parti[2]);
  const data = new Date(anno, mese - 1, giorno);
  if (data.getFullYear() !== anno || data.getMonth() !== mese - 1 || data.getDate() !== giorno) return "";
  return String(anno) + "-" + (mese < 10 ? "0" : "") + String(mese) + "-" + (giorno < 10 ? "0" : "") + String(giorno);
}

export default function ObiettiviResidui(props) {__mk();
  const table = useTable(props.pageId);
  const [obiettivi, setObiettivi] = useState({});
  const [verifica, setVerifica] = useState(() => {__mk();
    const oggi = new Date();
    const mese = oggi.getMonth() + 1;
    const giorno = oggi.getDate();
    return String(oggi.getFullYear()) + "-" + (mese < 10 ? "0" : "") + String(mese) + "-" + (giorno < 10 ? "0" : "") + String(giorno);
  });
  if (!table) return null;
  const nomi = ["Tipologia di entrata", "Capitolo", "Importo previsto", "Importo incassato", "Scadenza"];
  if (nomi.some((nome) => (__mk(), table.column(nome) < 0))) return <p>Per il confronto servono tipologia, capitolo, importo previsto, importo incassato e scadenza.</p>;
  return (
    <Card title="Obiettivi di incasso">
      <div className="space-y-4">
        <p className="text-sm text-(--mk-muted)">Percentuale incassata = importo incassato / importo previsto × 100. Scostamento = percentuale incassata − obiettivo, in punti percentuali. Il calcolo si aggiorna dagli importi senza modificare la tabella. Gli obiettivi dimostrativi restano in memoria.</p>
        <TextInput label="Data di verifica (modificabile per simulazione)" type="date" value={verifica} onChange={setVerifica} />
        <div className="grid gap-3 md:grid-cols-2">
          {table.rows.map((riga, indice) => {__mk();
            const nome = table.value(riga, "Tipologia di entrata");
            const capitolo = table.value(riga, "Capitolo");
            const chiave = capitolo + "|" + nome;
            const testo = obiettivi[chiave] !== undefined ? obiettivi[chiave] : (iniziali[capitolo] || "50");
            const obiettivo = percentuale(testo);
            const previsto = importo(table.value(riga, "Importo previsto"));
            const incassato = importo(table.value(riga, "Importo incassato"));
            const importiValidi = Number.isFinite(previsto) && previsto > 0 && Number.isFinite(incassato) && incassato >= 0;
            const incassata = importiValidi ? incassato / previsto * 100 : Number.NaN;
            const valido = importiValidi && Number.isFinite(incassata) && Number.isFinite(obiettivo) && obiettivo >= 0 && obiettivo <= 100;
            const scostamento = valido ? Math.round((incassata - obiettivo) * 10) / 10 : 0;
            const scadenzaTesto = table.value(riga, "Scadenza");
            const scadenza = dataScadenza(scadenzaTesto);
            const raggiunto = valido && incassata >= obiettivo;
            const scaduto = Boolean(scadenza && verifica && verifica >= scadenza);
            const esito = !valido ? "Controllare importi e obiettivo" : raggiunto ? "Obiettivo raggiunto" : !scadenza || !verifica ? "Data da completare" : scaduto ? "Da raggiungere: scadenza raggiunta o superata" : "Obiettivo ancora da raggiungere";
            return (
              <div key={chiave + indice} className="rounded-lg border border-(--mk-border) bg-(--mk-surface) p-4 space-y-3">
                <h3 className="font-semibold text-(--mk-text)">{nome}</h3>
                <p className="text-sm text-(--mk-muted)">{capitolo} · Incassata calcolata: {importiValidi ? incassata.toLocaleString("it-IT", { maximumFractionDigits: 1 }) + "%" : "Non disponibile"} · Scadenza: {scadenzaTesto}</p>
                <TextInput label="Obiettivo percentuale (0–100)" value={testo} onChange={(valore) => (__mk(), setObiettivi((precedenti) => {__mk();
                  const nuovi = { ...precedenti };
                  nuovi[chiave] = valore;
                  return nuovi;
                }))} />
                <div><Badge tone={!valido ? "neutral" : scostamento < 0 ? "danger" : scostamento > 0 ? "primary" : "neutral"}>{valido ? "Scostamento: " + (scostamento > 0 ? "+" : "") + scostamento.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " p.p. · " + (scostamento > 0 ? "Sopra obiettivo" : scostamento < 0 ? "Sotto obiettivo" : "In linea con l’obiettivo") : "Scostamento non disponibile"}</Badge></div>
                <Badge tone={!valido || (!raggiunto && scaduto) ? "danger" : raggiunto ? "primary" : "neutral"}>{esito}</Badge>
                {!importiValidi && <p className="text-sm text-(--mk-muted)">Occorrono un importo previsto maggiore di zero e un importo incassato non negativo.</p>}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
