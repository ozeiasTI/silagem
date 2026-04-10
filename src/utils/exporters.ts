import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import type { Measurement } from "../types";
import { formatDateTime, formatVolume } from "./calculations";

async function ensureSharing() {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        throw new Error(
            "O compartilhamento não está disponível neste dispositivo.",
        );
    }
}

export async function exportHistoryAsCsv(history: Measurement[]) {
    if (!FileSystem.cacheDirectory) {
        throw new Error("Diretório temporário indisponível para exportação.");
    }

    const header = [
        "Data",
        "Diametro (mm)",
        "Profundidade (cm)",
        "Massa (g)",
        "Volume (m3)",
        "Densidade (kg/m3)",
    ];
    const rows = history.map((entry) => [
        formatDateTime(entry.createdAt),
        entry.diameterMm.toFixed(1),
        entry.depthCm.toFixed(1),
        entry.massG.toFixed(1),
        entry.volumeM3.toFixed(9),
        Math.round(entry.densityKgM3).toString(),
    ]);

    const csv = [header, ...rows]
        .map((row) =>
            row
                .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                .join(";"),
        )
        .join("\n");

    const uri = `${FileSystem.cacheDirectory}historico-silagem-${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(uri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
    });

    await ensureSharing();
    await Sharing.shareAsync(uri, {
        mimeType: "text/csv",
        dialogTitle: "Exportar histórico em CSV",
        UTI: "public.comma-separated-values-text",
    });
}

export async function exportHistoryAsPdf(
    history: Measurement[],
    diameterMm: number,
) {
    const rows = history
        .map(
            (entry) => `
        <tr>
          <td>${formatDateTime(entry.createdAt)}</td>
          <td>${entry.diameterMm.toFixed(1)}</td>
          <td>${entry.depthCm.toFixed(1)}</td>
          <td>${entry.massG.toFixed(1)}</td>
          <td>${formatVolume(entry.volumeM3)}</td>
          <td>${Math.round(entry.densityKgM3)}</td>
        </tr>
      `,
        )
        .join("");

    const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #102A22; }
          .hero { background: linear-gradient(135deg, #12372A, #436850); color: white; padding: 24px; border-radius: 18px; }
          .meta { margin-top: 12px; font-size: 12px; opacity: 0.9; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { border-bottom: 1px solid #D7CCBA; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #F3EFE5; }
          .footer { margin-top: 24px; font-size: 11px; color: #5A6B64; }
        </style>
      </head>
      <body>
        <div class="hero">
          <h1>Relatório de Densidade de Silagem</h1>
          <div class="meta">Diâmetro base configurado: ${diameterMm.toFixed(1)} mm</div>
          <div class="meta">Registros exportados: ${history.length}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Diâmetro (mm)</th>
              <th>Profundidade (cm)</th>
              <th>Massa (g)</th>
              <th>Volume (m³)</th>
              <th>Densidade (kg/m³)</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="6">Nenhum registro disponível.</td></tr>'}
          </tbody>
        </table>
        <div class="footer">Aplicativo administrativo para medição de densidade de silagens.</div>
      </body>
    </html>
  `;

    const { uri } = await Print.printToFileAsync({ html });
    await ensureSharing();
    await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Exportar relatório em PDF",
        UTI: ".pdf",
    });
}
