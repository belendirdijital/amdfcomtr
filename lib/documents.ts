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
  }
];
