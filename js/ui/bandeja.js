import { supabase } from "../supabase-client.js";
import { $, todayISO, to2 } from "../utils.js";
import { setSlotNota, setActiveSlot } from "./slots.js";
import { slotState, getClient } from "../state.js";
import { imprimirNotaA4, imprimirNota80mm } from "./print.js";
import { waNota } from "./whatsapp.js";

export async function loadBandeja() {
  const bandejaFecha = $("#bandejaFecha");
  const bandejaBody = $("#bandejaBody");

  const f = bandejaFecha.value || todayISO();
  const { data } = await supabase
    .from("notas_credito")
    .select("id,folio,saldo,estado,clientes(nombre),cliente_id")
    .eq("fecha", f)
    .eq("estado", "abierta")
    .order("created_at");

  const rows = data || [];
  bandejaBody.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td>${r.folio}</td>
      <td>${r.clientes?.nombre || ""}</td>
      <td>$${to2(r.saldo || 0)}</td>
      <td>${r.estado || "abierta"}</td>
      <td class="flex">
        <button class="btn btn-ghost" data-usea="${r.id}" data-cid="${r.cliente_id}">Usar en A</button>
        <button class="btn btn-ghost" data-useb="${r.id}" data-cid="${r.cliente_id}">Usar en B</button>
        <button class="btn btn-ghost" data-a4="${r.id}">A4</button>
        <button class="btn btn-ghost" data-80="${r.id}">80mm</button>
        <button class="btn btn-ghost" data-wa="${r.id}">WA</button>
      </td>
    </tr>`
    )
    .join("");

  bandejaBody
    .querySelectorAll("[data-usea]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        cargarEnSlot("A", b.dataset.usea, b.dataset.cid)
      )
    );

  bandejaBody
    .querySelectorAll("[data-useb]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        cargarEnSlot("B", b.dataset.useb, b.dataset.cid)
      )
    );

  bandejaBody
    .querySelectorAll("[data-a4]")
    .forEach((b) =>
      b.addEventListener("click", () => imprimirNotaA4(b.dataset.a4))
    );

  bandejaBody
    .querySelectorAll("[data-80]")
    .forEach((b) =>
      b.addEventListener("click", () => imprimirNota80mm(b.dataset["80"]))
    );

  bandejaBody
    .querySelectorAll("[data-wa]")
    .forEach((b) => b.addEventListener("click", () => waNota(b.dataset.wa)));
}

async function cargarEnSlot(slot, nota_id, cliente_id) {
  const { data: nota } = await supabase
    .from("notas_credito")
    .select("*")
    .eq("id", nota_id)
    .single();

  if (!nota) return;

  setSlotNota(slot, nota);
  slotState[slot].cliente_id = cliente_id || nota.cliente_id;
  const c = getClient(slotState[slot].cliente_id);
  slotState[slot].telefono = c ? c.telefono || null : null;
  setActiveSlot(slot);
}
