import { forwardRef } from "react";
import type { PlayerLicense } from "@/lib/types";

function formatLicenseDate(date: string) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

function getVisaSeasons(season: string) {
  const firstYear = Number.parseInt(season.slice(0, 4), 10) || new Date().getFullYear();
  return Array.from({ length: 4 }, (_, index) => {
    const start = firstYear + index;
    return `${start} - ${start + 1}`;
  });
}

const LicenseCard = forwardRef<HTMLDivElement, { license: PlayerLicense }>(
  function LicenseCard({ license }, ref) {
    const seasons = getVisaSeasons(license.visaSeason);

    return (
      <article className="license-print-card" ref={ref}>
        <section className="license-print-card__left">
          <div className="license-identity-panel">
            <div className="license-federation-logo">
              <img
                src={license.federationLogo || "/logo.png?v=2"}
                alt="Anadolu Masterler Dostluk Federasyonu"
              />
            </div>
            <div className="license-player-photo">
              {license.playerPhoto ? (
                <img src={license.playerPhoto} alt={`${license.firstName} ${license.lastName}`} />
              ) : (
                <span>{license.firstName[0]}{license.lastName[0]}</span>
              )}
            </div>
            <h2>ANADOLU MASTERLER<br />DOSTLUK FEDERASYONU</h2>
          </div>

          <h1>OYUNCU LİSANSI</h1>

          <div className="license-info-panel">
            <div><strong>LİSANS NO</strong><span>:</span><em>{license.licenseNo}</em></div>
            <div><strong>ADI</strong><span>:</span><em>{license.firstName.toLocaleUpperCase("tr-TR")}</em></div>
            <div><strong>SOYADI</strong><span>:</span><em>{license.lastName.toLocaleUpperCase("tr-TR")}</em></div>
            <div><strong>T.C. NO</strong><span>:</span><em>{license.nationalId}</em></div>
            <div><strong>DOĞUM TARİHİ</strong><span>:</span><em>{formatLicenseDate(license.birthDate)}</em></div>
            <div><strong>DOĞUM YERİ</strong><span>:</span><em>{license.birthPlace.toLocaleUpperCase("tr-TR")}</em></div>
            <div><strong>KAN GRUBU</strong><span>:</span><em>{license.bloodType}</em></div>
            <div><strong>KULÜBÜ</strong><span>:</span><em>{license.club.toLocaleUpperCase("tr-TR")}</em></div>
            <div><strong>TESCİL TARİHİ</strong><span>:</span><em>{formatLicenseDate(license.registrationDate)}</em></div>
          </div>
        </section>

        <section className="license-print-card__right">
          <div className="license-club-panel">
            {license.clubLogo ? (
              <img src={license.clubLogo} alt={`${license.club} kulüp logosu`} />
            ) : (
              <div className="club-shield">
                <strong>{license.club.split(/\s+/).map((word) => word[0]).slice(0, 3).join("")}</strong>
                <span>{license.club}</span>
              </div>
            )}
          </div>

          <h1>VİZE TARİHLERİ</h1>

          <div className="visa-grid">
            {seasons.map((season, index) => (
              <div className="visa-cell" key={season}>
                <strong>{season}</strong>
                {index === 0 && (
                  <div className="visa-stamp">
                    <span>ANADOLU</span>
                    <span>MASTERLER</span>
                    <span>DOSTLUK</span>
                    <span>FEDERASYONU</span>
                    <i />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </article>
    );
  }
);

export default LicenseCard;
