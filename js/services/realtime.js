import { supabase } from "../supabase-client.js";
import {
  notaA,
  notaB,
  chA,
  chB,
  setChA,
  setChB,
  slotActive,
} from "../state.js";

export function subRealtime(slot) {
  const nota = slot === "A" ? notaA : notaB;
  if (!nota) return;

  if (slot === "A" && chA) {
    supabase.removeChannel(chA);
    setChA(null);
  }
  if (slot === "B" && chB) {
    supabase.removeChannel(chB);
    setChB(null);
  }

  const ch = supabase
    .channel(`rt-${slot}-${nota.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notas_detalle",
        filter: `nota_id=eq.${nota.id}`,
      },
      async () => {
        if (slot === slotActive) {
          const { renderVista } = await import("../ui/vista.js");
          renderVista();
        }
      }
    )
    .on(
      "postgres_changes",
      {
        event: "update",
        schema: "public",
        table: "notas_credito",
        filter: `id=eq.${nota.id}`,
      },
      async () => {
        if (slot === slotActive) {
          const { renderVista } = await import("../ui/vista.js");
          renderVista();
        }
      }
    )
    .subscribe();

  if (slot === "A") setChA(ch);
  else setChB(ch);
}
