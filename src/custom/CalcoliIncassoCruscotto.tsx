// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("CalcoliIncassoCruscotto");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("CalcoliIncassoCruscotto");
import { useEffect } from "react";
import { Card, useTable } from "../floware";

function numero(testo) {__mk();
  const pulito = String(testo).replaceAll("€", "").replaceAll("%", "").replaceAll("−", "-").split(".").join("").replace(",", ".").trim();
  return pulito === "" ? Number.NaN : Number(pulito);
}

function decimale(valore) {__mk();
  const arrotondato = Math.round(valore * 10) / 10;
  return (arrotondato === 0 ? 0 : arrotondato).toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function CalcoliIncassoCruscotto(props) {__mk();
  const table = useTable(props.pageId);
  const colonnaScostamento = "Scostamento previsto/effettivo (punti percentuali)";
  const nomi = ["Importo residuo", "Incassato", "Incasso previsto", "Percentuale incassata", colonnaScostamento, "Esito dello scostamento"];
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
      const valoreScostamento = numero(testoScostamento);
      const esito = Number.isFinite(valoreScostamento) ? (valoreScostamento < 0 ? "Monitoraggio" : "In linea") : "Non disponibile";
      if (table.value(riga, "Percentuale incassata") !== testoPercentuale) {
        table.setCell(indice, "Percentuale incassata", testoPercentuale);
      }
      if (table.value(riga, colonnaScostamento) !== testoScostamento) {
        table.setCell(indice, colonnaScostamento, testoScostamento);
      }
      if (table.value(riga, "Esito dello scostamento") !== esito) {
        table.setCell(indice, "Esito dello scostamento", esito);
      }
    });
  }, [table, disponibili]);

  if (!table) return null;
  if (!disponibili) return <p className="text-sm text-(--mk-muted)">Per il calcolo automatico occorrono le colonne degli importi, dell’incasso previsto, della percentuale incassata, dello scostamento e dell’esito.</p>;
  return (
    <Card title="Calcolo automatico degli incassi">
      <div className="space-y-2 text-sm text-(--mk-muted)">
        <p>Percentuale incassata = Incassato / (Importo residuo + Incassato) × 100.</p>
        <p>Scostamento = percentuale incassata − Incasso previsto, in punti percentuali.</p>
        <p>Esito dello scostamento: «Monitoraggio» se negativo; «In linea» se pari o superiore a zero. L’esito usa lo scostamento mostrato in tabella, arrotondato a una cifra decimale.</p>
        <p>Tutti i risultati si aggiornano quando cambiano i dati. Con dati mancanti o non validi, il risultato è «Non disponibile».</p>
      </div>
    </Card>
  );
}
