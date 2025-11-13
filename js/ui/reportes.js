import { supabase } from "../supabase-client.js";
import { $, todayISO, to2, csvEscape } from "../utils.js";

export async function imprimirDiaA4() {
  const diaFecha = $("#diaFecha");
  const diaResumen = $("#diaResumen");

  const f = diaFecha.value || todayISO();
  const { data: notas } = await supabase
    .from("notas_credito")
    .select("id, folio, fecha, clientes(nombre), cliente_id")
    .eq("fecha", f)
    .order("clientes(nombre), created_at");

  const ids = (notas || []).map((n) => n.id);
  if (!ids.length) return alert("No hay notas ese día");

  const { data: det } = await supabase
    .from("notas_detalle")
    .select("nota_id, producto, cantidad, precio, importe, created_at")
    .in("nota_id", ids)
    .order("created_at");

  const byClient = {};
  (notas || []).forEach((n) => {
    const cliente = n.clientes?.nombre || "—";
    byClient[cliente] = byClient[cliente] || { notas: [], items: [] };
    byClient[cliente].notas.push(n);
  });

  (det || []).forEach((d) => {
    const n = (notas || []).find((x) => x.id === d.nota_id);
    const cliente = n?.clientes?.nombre || "—";
    byClient[cliente].items.push({ folio: n?.folio, ...d });
  });

  const el = $("#printArea");
  el.style.display = "block";
  el.classList.remove("ticket80");

  let html = `<h3>Reporte diario — ${f}</h3>`;
  Object.entries(byClient).forEach(([cliente, pack]) => {
    const totalCliente = (pack.items || []).reduce(
      (a, b) => a + Number(b.importe || 0),
      0
    );
    html += `<div class="group"><h4>${cliente} — Total: $${to2(totalCliente)}</h4>
      <table>
        <thead><tr><th>Folio</th><th>Hora</th><th>Producto</th><th>Kg</th><th>P.Unit</th><th>Importe</th></tr></thead>
        <tbody>
          ${(pack.items || [])
            .map(
              (d) => `<tr>
            <td>${d.folio || ""}</td>
            <td>${new Date(d.created_at).toLocaleTimeString()}</td>
            <td>${d.producto}</td>
            <td>${to2(d.cantidad)}</td>
            <td>$${to2(d.precio)}</td>
            <td>$${to2(d.importe)}</td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
  });

  el.innerHTML = html;
  window.print();
  setTimeout(() => {
    el.style.display = "none";
    el.innerHTML = "";
  }, 500);

  const totalDia = (det || []).reduce((a, b) => a + Number(b.importe || 0), 0);
  diaResumen.textContent = `Clientes: ${Object.keys(byClient).length} · Total día: $${to2(totalDia)}`;
}

export async function exportDiaCSV() {
  const diaFecha = $("#diaFecha");
  const f = diaFecha.value || todayISO();

  const { data: notas } = await supabase
    .from("notas_credito")
    .select("id, folio, fecha, clientes(nombre)")
    .eq("fecha", f);

  const ids = (notas || []).map((n) => n.id);
  if (!ids.length) return alert("No hay notas ese día");

  const { data: det } = await supabase
    .from("notas_detalle")
    .select("nota_id, producto, cantidad, precio, importe, created_at")
    .in("nota_id", ids);

  const head = [
    "Cliente",
    "Folio",
    "Fecha",
    "Hora",
    "Producto",
    "Kg",
    "Precio",
    "Importe",
  ];

  const rows = (det || []).map((d) => {
    const n = (notas || []).find((x) => x.id === d.nota_id) || {};
    return [
      n.clientes?.nombre || "",
      n.folio,
      f,
      new Date(d.created_at).toLocaleTimeString(),
      d.producto,
      to2(d.cantidad),
      to2(d.precio),
      to2(d.importe),
    ];
  });

  const csv = [head, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte_${f}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
