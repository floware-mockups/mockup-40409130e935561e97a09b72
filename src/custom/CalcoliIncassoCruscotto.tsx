// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("CalcoliIncassoCruscotto");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("CalcoliIncassoCruscotto");
import { useEffect } from "react";
import { Card, useTable } from "../floware";

function numero(testo) {__mk();
  const pulito = String(testo).replaceAll("€", "").replaceAll("%", "").split(".").join("").replace(",", ".").trim();
  return pulito === "" ? Number.NaN : Number(pulito);
}

function decimale(valore) {__mk();
  const arrotondato = Math.round(valore * 10) / 10;
  return (arrotondato === 0 ? 0 : arrotondato).toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function CalcoliIncassoCruscotto(props) {__mk();
  const table = useTable(props.pageId);
  const nomi = ["Importo residuo", "Incassato", "Incasso previsto", "Percentuale incassata", "Scostamento previsto/effettivo (punti percentuali)"];
  const disponibili = Boolean(table && nomi.every((nome) => (__mk(), table.column(nome) >= 0)));

  useEffect(() => {__mk();
    if (!table || !disponibili) return;
    table.rows.forEach((riga, indice) => {__mk();
      const residuo = numero(table.value(riga, "Importo residuo"));
      const incassato = numero(table.value(riga, "Incassato"));
      const previsto = numero(table.value(riga, "Incasso previsto"));
      const totale = residuo + incassato;
      const importiValidi = Number.isFinite(residuo) && Number.isFinite(incassato) && residuo >= 0 && incassato >= 0 && Number.isFinite(totale) && totale > 0;
      const percentuale = importiValidi ? incassato / totale * 100 : Number.NaN;
      const scostamento = percentuale - previsto;
      const testoPercentuale = Number.isFinite(percentuale) ? decimale(percentuale) + "%" : "Non disponibile";
      const testoScostamento = Number.isFinite(scostamento) ? decimale(scostamento) : "Non disponibile";
      if (table.value(riga, "Percentuale incassata") !== testoPercentuale) {
        table.setCell(indice, "Percentuale incassata", testoPercentuale);
      }
      if (table.value(riga, "Scostamento previsto/effettivo (punti percentuali)") !== testoScostamento) {
        table.setCell(indice, "Scostamento previsto/effettivo (punti percentuali)", testoScostamento);
      }
    });
  }, [table, disponibili]);

  if (!table) return null;
  if (!disponibili) return <p className="text-sm text-(--mk-muted)">Per il calcolo automatico occorrono le colonne degli importi, dell’incasso previsto e dei due risultati.</p>;
  return (
    <Card title="Colonne calcolate automaticamente">
      <div className="space-y-2 text-sm text-(--mk-muted)">
        <p>Percentuale incassata = Incassato / (Importo residuo + Incassato) × 100.</p>
        <p>Scostamento = percentuale incassata − Incasso previsto, in punti percentuali. Un valore positivo indica un incasso superiore alla previsione.</p>
        <p>I risultati in tabella si aggiornano dai dati e sono mostrati con una cifra decimale. Con importi mancanti, negativi o totale pari a zero, il risultato è «Non disponibile».</p>
      </div>
    </Card>
  );
}
