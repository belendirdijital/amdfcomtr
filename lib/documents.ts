export type LeagueDocument = {
  id: string;
  title: string;
  description: string;
  /** Dosya adı: `public/documents/` altına konur */
  fileName: string;
};

export const LEAGUE_DOCUMENTS: LeagueDocument[] = [
  {
    id: "esame-listesi",
    title: "Esame Listesi",
    description: "Maç öncesi takımların dolduracağı oyuncu esame formu.",
    fileName: "esame-listesi.pdf"
  },
  {
    id: "hakem-raporu",
    title: "Hakem Raporu",
    description: "Maç sonrası hakem rapor formu.",
    fileName: "hakem-raporu.pdf"
  },
  {
    id: "lig-statusu-2026-2027",
    title: "2026-2027 Lig Statüsü",
    description: "Lige katılım şartları, takım ve futbolcu uygunluğu, müsabaka düzeni ve kuralları.",
    fileName: "lig-statusu-2026-2027.pdf"
  },
  {
    id: "sozlesme-taahhutnamesi",
    title: "Takım/Kulüp ve Oyuncu Sözleşme Taahhütnamesi",
    description: "Takımların ve oyuncuların imzalayarak teslim edeceği katılım taahhütnamesi.",
    fileName: "sozlesme-taahhutnamesi.pdf"
  },
  {
    id: "disiplin-talimati",
    title: "Futbol Ligi Disiplin Talimatı",
    description: "Disiplin kurulu, disiplin ihlalleri ve cezaları, kart uygulamaları ve Fair-Play kupası.",
    fileName: "disiplin-talimati.pdf"
  }
];
