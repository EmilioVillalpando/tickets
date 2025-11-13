import { $, to2, left, right, monoLine, isAndroid } from "../utils.js";
import { STORE_NAME } from "../config.js";
import { getNota, saveNotaObs } from "../services/notas.js";

export async function imprimirNotaA4(nota_id) {
  const { nota, det } = await getNota(nota_id);

  const el = $("#printArea");
  el.style.display = "block";
  el.classList.remove("ticket80");

  el.innerHTML = `
    <h3>Nota — ${nota.clientes?.nombre || ""}</h3>
    <div><b>Folio:</b> ${nota.folio} &nbsp; <b>Fecha:</b> ${nota.fecha} &nbsp; <b>Vence:</b> ${nota.vence || ""}</div>
    <div><b>Total:</b> $${to2(nota.total)} &nbsp; <b>Saldo:</b> $${to2(nota.saldo)}</div>
    ${nota.observaciones ? `<div style="margin-top:6mm"><b>Notas del cliente:</b><br>${(nota.observaciones || "").replace(/\n/g, "<br>")}</div>` : ""}
    <br/>
    <table>
      <thead><tr><th>Fecha/Hora</th><th>Producto</th><th>Kg</th><th>P.Unit</th><th>Importe</th></tr></thead>
      <tbody>${(det || []).map((d) => `<tr><td>${new Date(d.created_at).toLocaleString()}</td><td>${d.producto}</td><td>${to2(d.cantidad)}</td><td>$${to2(d.precio)}</td><td>$${to2(d.importe)}</td></tr>`).join("")}</tbody>
    </table>`;

  window.print();
  setTimeout(() => {
    el.style.display = "none";
    el.innerHTML = "";
  }, 500);
}

export async function imprimirNota80mm(nota_id) {
  await saveNotaObs($("#notaObs").value);
  const { nota, det } = await getNota(nota_id);

  const el = $("#printArea");
  el.style.display = "block";

  const items = (det || [])
    .map(
      (d) =>
        `<tr><td>${d.producto}</td><td class="right">${to2(d.cantidad)}</td><td>kg</td><td>$${to2(d.precio)}</td><td>$${to2(d.importe)}</td></tr>`
    )
    .join("");

  let totalKg = 0;
  (det || []).forEach((d) => {
    totalKg += parseFloat(d.cantidad || 0);
  });

  el.innerHTML = `
    <div class="center">${STORE_NAME}</div>
    <div class="center">Nota a Crédito</div>
    <div style="font-size:11px;margin:4px 0;">Folio: ${nota.folio}</div>
    <div style="font-size:11px;margin-bottom:6px;">
      Cliente: ${nota.clientes?.nombre || ""}<br>
      Fecha: ${nota.fecha} • Vence: ${nota.vence || "—"}<br>
      ${nota.observaciones ? `Obs: ${nota.observaciones}<br>` : ""}
    </div>
    <table>
      <thead><tr><th>Prod</th><th class="right">Cant</th><th>U</th><th>P.Unit</th><th>Importe</th></tr></thead>
      <tbody>${items}</tbody>
      <tfoot>
        <tr><td>Total kg</td><td class="right" colspan="4">${to2(totalKg)}</td></tr>
        <tr><td>Total $</td><td class="right" colspan="4">$${to2(nota.total)}</td></tr>
        <tr><td>Saldo</td><td class="right" colspan="4">$${to2(nota.saldo)}</td></tr>
      </tfoot>
    </table>
    <div style="height:18px"></div>
    <div style="border-top:1px solid #000; padding-top:6px; text-align:center; font-size:11px;">Firma de recibido</div>
  `;

  window.print();
  setTimeout(() => {
    el.style.display = "none";
    el.innerHTML = "";
  }, 500);
}

export async function imprimirNota80mmRawBT(nota_id) {
  await saveNotaObs($("#notaObs").value);
  const { nota, det } = await getNota(nota_id);
  const clienteNombre = nota.clientes?.nombre || "";

  const text = buildRawbtText(nota, det || [], clienteNombre);

  if (!isAndroid()) {
    alert('RawBT es solo para Android. Usa "Imprimir 80mm".');
    return;
  }

  try {
    const uri = "rawbt:" + encodeURIComponent(text);
    window.location.href = uri;
    setTimeout(() => {
      window.open(uri, "_blank");
    }, 400);
  } catch (e) {
    console.error(e);
    alert("No se pudo abrir RawBT. Verifica que la app esté instalada.");
    window.open(
      "https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter",
      "_blank"
    );
  }
}

function buildRawbtText(nota, det, clienteNombre) {
  let out = "";
  out += `${STORE_NAME}\n`;
  out += `Nota a Crédito\n`;
  out += monoLine();
  out += `Cliente: ${clienteNombre}\n`;
  out += `Folio: ${nota.folio}\n`;
  out += `Fecha: ${nota.fecha}  Vence: ${nota.vence || ""}\n`;
  out += monoLine();
  (det || []).forEach((d) => {
    out += `${left(d.producto, 32)}\n`;
    const izq = `${to2(d.cantidad)}kg x $${to2(d.precio)}`;
    const der = `$${to2(d.importe)}`;
    out += `${left(izq, 20)}${right(der, 12)}\n`;
  });
  out += monoLine();
  out += `Total: $${to2(nota.total)}\n`;
  out += `Saldo: $${to2(nota.saldo)}\n`;
  if (nota.observaciones) {
    out += monoLine();
    out += `Notas:\n${nota.observaciones}\n`;
  }
  out += "\n¡Gracias por su preferencia!\n\n\n";
  return out;
}
