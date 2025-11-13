import { supabase } from "../supabase-client.js";
import {
  activeNota,
  slotActive,
  setNotaA,
  setNotaB,
  slotState,
  getClient,
  markDirty,
  clearDirty,
} from "../state.js";
import { $, to2 } from "../utils.js";
import { deleteDetalle, updateDetalle } from "../services/notas.js";
import { refreshNotaInfo, applySlotUI } from "./slots.js";

export async function renderVista() {
  const n = activeNota();
  const vFolio = $("#vFolio");
  const vEstado = $("#vEstado");
  const vSaldo = $("#vSaldo");
  const vistaBody = $("#vistaBody");
  const vistaTotal = $("#vistaTotal");
  const subtotalBox = $("#subtotalBox");
  const notaObs = $("#notaObs");

  if (!n) {
    vFolio.textContent = "—";
    vEstado.textContent = "—";
    vSaldo.textContent = "0.00";
    vistaBody.innerHTML = "";
    vistaTotal.textContent = "$0.00";
    subtotalBox.textContent = "Subtotal: $0.00";
    notaObs.value = "";
    refreshNotaInfo();
    return;
  }

  const { data: nota } = await supabase
    .from("notas_credito")
    .select("*")
    .eq("id", n.id)
    .single();

  const { data: det } = await supabase
    .from("notas_detalle")
    .select("*")
    .eq("nota_id", n.id)
    .order("created_at");

  if (slotActive === "A") setNotaA(nota);
  else setNotaB(nota);

  slotState[slotActive].cliente_id = nota.cliente_id;
  const c = getClient(nota.cliente_id);
  slotState[slotActive].telefono = c
    ? c.telefono || null
    : slotState[slotActive].telefono;

  applySlotUI(slotActive);
  vFolio.textContent = nota.folio;
  vEstado.textContent = nota.estado || "abierta";
  vSaldo.textContent = to2(nota.saldo || 0);
  notaObs.value = nota.observaciones || "";

  vistaBody.innerHTML = (det || [])
    .map(
      (d) => `
    <tr data-id="${d.id}">
      <td>${new Date(d.created_at).toLocaleString()}</td>
      <td>${d.producto}</td>
      <td class="editable" data-field="cantidad">${to2(d.cantidad)}</td>
      <td class="editable" data-field="precio">$${to2(d.precio)}</td>
      <td>$${to2(d.importe)}</td>
      <td><button class="btn btn-ghost btn-sm" data-del="${d.id}" title="Borrar">🗑️</button></td>
    </tr>
  `
    )
    .join("");

  const tot = (det || []).reduce((a, b) => a + Number(b.importe || 0), 0);
  vistaTotal.textContent = `$${to2(tot)}`;
  subtotalBox.textContent = `Subtotal: $${to2(tot)}`;

  vistaBody
    .querySelectorAll("[data-del]")
    .forEach((b) => {
      b.onclick = () => deleteDetalle(b.dataset.del);
    });

  vistaBody.querySelectorAll(".editable").forEach((td) => {
    td.addEventListener("click", () => makeCellEditable(td, n.id));
  });

  refreshNotaInfo();
}

function makeCellEditable(td, nota_id) {
  if (td.classList.contains("cell-editing")) return;

  const field = td.dataset.field;
  const row = td.closest("tr");
  const detId = row.dataset.id;
  const raw = td.textContent.replace("$", "").trim();
  const oldV = Number(raw.replace(",", ".")) || 0;

  td.classList.add("cell-editing");
  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.01";
  input.min = "0";
  input.value = oldV.toFixed(2);
  td.innerHTML = "";
  td.appendChild(input);
  input.focus();
  input.select();
  markDirty();

  const commit = async (save) => {
    const newV = Number(input.value || 0);
    td.classList.remove("cell-editing");
    td.innerHTML =
      field === "precio" ? `$${to2(save ? newV : oldV)}` : to2(save ? newV : oldV);

    if (!save) {
      clearDirty();
      return;
    }

    await updateDetalle(detId, field, newV, nota_id);
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit(true);
    if (e.key === "Escape") commit(false);
  });
  input.addEventListener("blur", () => commit(true));
}
