import { existsSync } from "fs";
import path from "path";
import { Download, FileText } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import { LEAGUE_DOCUMENTS } from "@/lib/documents";

export const dynamic = "force-dynamic";
export const metadata = { title: "Belgeler" };

function documentHref(fileName: string) {
  return `/documents/${fileName}`;
}

function isDocumentReady(fileName: string) {
  return existsSync(path.join(process.cwd(), "public", "documents", fileName));
}

export default function DocumentsPage() {
  const docs = LEAGUE_DOCUMENTS.map((doc) => ({
    ...doc,
    ready: isDocumentReady(doc.fileName)
  }));

  return (
    <PublicShell
      title="Belgeler"
      description="Maç öncesi ve sonrası takımların indireceği formlar. PDF dosyalarını indirip doldurun."
    >
      <section className="site-panel">
        {docs.length ? (
          <ul className="doc-list">
            {docs.map((doc) => (
              <li className="doc-item" key={doc.id}>
                <div className="doc-item__icon" aria-hidden="true">
                  <FileText size={22} strokeWidth={1.75} />
                </div>
                <div className="doc-item__body">
                  <strong>{doc.title}</strong>
                  <p>{doc.description}</p>
                  <small>PDF · {doc.fileName}</small>
                </div>
                {doc.ready ? (
                  <a
                    className="button button--primary"
                    href={documentHref(doc.fileName)}
                    download={doc.fileName}
                  >
                    <Download size={16} />
                    İndir
                  </a>
                ) : (
                  <span className="button button--quiet" aria-disabled="true">
                    Yakında
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="site-empty">Henüz belge eklenmedi.</div>
        )}
      </section>
    </PublicShell>
  );
}
