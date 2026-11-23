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
  const nomi = ["Tipologia di entrata", "Capitolo", "Percentuale incassata", "Scadenza"];
  if (nomi.some((nome) => (__mk(), table.column(nome) < 0))) return <p>Per il confronto servono tipologia, capitolo, percentuale incassata e scadenza.</p>;
  return (
    <Card title="Obiettivi di incasso">
      <div className="space-y-4">
        <p className="text-sm text-(--mk-muted)">Obiettivi dimostrativi modificabili, conservati solo in memoria. Il confronto usa la percentuale registrata e la scadenza, senza modificare i campi della tabella. La verifica parte dalla data odierna.</p>
        <TextInput label="Data di verifica (modificabile per simulazione)" type="date" value={verifica} onChange={setVerifica} />
        <div className="grid gap-3 md:grid-cols-2">
          {table.rows.map((riga, indice) => {__mk();
            const nome = table.value(riga, "Tipologia di entrata");
            const capitolo = table.value(riga, "Capitolo");
            const chiave = capitolo + "|" + nome;
            const testo = obiettivi[chiave] !== undefined ? obiettivi[chiave] : (iniziali[capitolo] || "50");
            const obiettivo = percentuale(testo);
            const incassataTesto = table.value(riga, "Percentuale incassata");
            const incassata = percentuale(incassataTesto);
            const scadenzaTesto = table.value(riga, "Scadenza");
            const scadenza = dataScadenza(scadenzaTesto);
            const valido = Number.isFinite(obiettivo) && obiettivo >= 0 && obiettivo <= 100 && Number.isFinite(incassata) && incassata >= 0 && incassata <= 100;
            const raggiunto = valido && incassata >= obiettivo;
            const scaduto = Boolean(scadenza && verifica && verifica >= scadenza);
            const esito = !valido ? "Controllare le percentuali" : raggiunto ? "Obiettivo raggiunto" : !scadenza || !verifica ? "Data da completare" : scaduto ? "Da raggiungere: scadenza raggiunta o superata" : "Obiettivo ancora da raggiungere";
            return (
              <div key={chiave + indice} className="rounded-lg border border-(--mk-border) bg-(--mk-surface) p-4 space-y-3">
                <h3 className="font-semibold text-(--mk-text)">{nome}</h3>
                <p className="text-sm text-(--mk-muted)">{capitolo} · Incassata: {incassataTesto} · Scadenza: {scadenzaTesto}</p>
                <TextInput label="Obiettivo percentuale (0–100)" value={testo} onChange={(valore) => (__mk(), setObiettivi((precedenti) => {__mk();
                  const nuovi = { ...precedenti };
                  nuovi[chiave] = valore;
                  return nuovi;
                }))} />
                <Badge tone={!valido || (!raggiunto && scaduto) ? "danger" : raggiunto ? "primary" : "neutral"}>{esito}</Badge>
                {valido && !raggiunto && <p className="text-sm text-(--mk-muted)">Mancano {(obiettivo - incassata).toLocaleString("it-IT", { maximumFractionDigits: 1 })} punti percentuali.</p>}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
