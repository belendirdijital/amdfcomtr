import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import type { PlayerLicense } from "./types";

export async function saveLicensePdf(element: HTMLElement, license: PlayerLicense) {
  const image = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    width: 1120,
    height: 796,
    backgroundColor: "#ef1010"
  });

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a5",
    compress: true
  });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  pdf.addImage(image, "PNG", 0, 0, width, height, undefined, "FAST");

  const filename = `${license.licenseNo}-${license.firstName}-${license.lastName}-lisans.pdf`
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ_.-]/g, "");

  pdf.save(filename);
  return { canceled: false, filePath: filename };
}
