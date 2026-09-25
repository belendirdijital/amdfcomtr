"use client";

import { Download, Eye, FileBadge2, Plus, Trash2, Upload } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { PlayerLicense, Team } from "@/lib/types";
import { saveLicensePdf } from "@/lib/licensePdf";
import LicenseCard from "./LicenseCard";
import Modal from "./Modal";

function resizeImage(file: File, maxSize: number, useJpeg: boolean) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Görsel işlenemedi."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL(useJpeg ? "image/jpeg" : "image/png", useJpeg ? 0.82 : undefined));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Görsel okunamadı."));
    };
    image.src = objectUrl;
  });
}

export function LicenseView({
  licenses,
  onAdd,
  onDelete,
  notify
}: {
  licenses: PlayerLicense[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  notify: (message: string) => void;
}) {
  const [preview, setPreview] = useState<PlayerLicense | null>(null);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const savePdf = async () => {
    if (!preview || !cardRef.current || saving) return;
    try {
      setSaving(true);
      const result = await saveLicensePdf(cardRef.current, preview);
      if (!result?.canceled) notify("Lisans PDF dosyası kaydedildi.");
    } catch {
      notify("PDF oluşturulurken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (!licenses.length) {
    return (
      <section className="license-empty">
        <span>
          <FileBadge2 size={33} />
        </span>
        <h2>İlk oyuncu lisansını hazırlayın</h2>
        <p>
          Futbolcunun kimlik, kulüp, fotoğraf ve vize bilgilerini girerek baskıya hazır PDF
          oluşturabilirsiniz.
        </p>
        <button className="button button--primary" onClick={onAdd}>
          <Plus size={18} /> Lisans oluştur
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="license-summary">
        <div>
          <span className="license-summary__icon">
            <FileBadge2 size={27} />
          </span>
          <div>
            <span>Toplam lisans</span>
            <strong>{licenses.length}</strong>
          </div>
        </div>
        <p>Hazırlanan lisanslar önizlenebilir ve A5 yatay PDF olarak kaydedilebilir.</p>
        <button className="button button--primary" onClick={onAdd}>
          <Plus size={18} /> Yeni lisans
        </button>
      </section>

      <section className="license-record-grid">
        {licenses.map((license) => (
          <article className="license-record-card" key={license.id}>
            <div className="license-record-card__photo">
              {license.playerPhoto ? (
                <img
                  src={license.playerPhoto}
                  alt={`${license.firstName} ${license.lastName}`}
                />
              ) : (
                <span>
                  {license.firstName[0]}
                  {license.lastName[0]}
                </span>
              )}
            </div>
            <div className="license-record-card__body">
              <span>{license.licenseNo}</span>
              <h3>
                {license.firstName} {license.lastName}
              </h3>
              <p>{license.club}</p>
              <small>{license.visaSeason} sezonu</small>
            </div>
            <div className="license-record-card__actions">
              <button className="button button--quiet" onClick={() => setPreview(license)}>
                <Eye size={16} /> Önizle / PDF
              </button>
              <button
                className="icon-button icon-button--danger"
                onClick={() => onDelete(license.id)}
                aria-label={`${license.firstName} ${license.lastName} lisansını sil`}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
      </section>

      <Modal
        open={Boolean(preview)}
        title={preview ? `${preview.firstName} ${preview.lastName} lisansı` : "Lisans önizleme"}
        eyebrow="Baskı önizleme"
        onClose={() => setPreview(null)}
      >
        {preview && (
          <div className="license-preview-modal">
            <div className="license-preview-scroll">
              <LicenseCard license={preview} ref={cardRef} />
            </div>
            <div className="license-preview-actions">
              <span>A5 yatay · Yüksek çözünürlüklü PDF</span>
              <button className="button button--primary" onClick={savePdf} disabled={saving}>
                <Download size={18} /> {saving ? "PDF hazırlanıyor..." : "PDF olarak kaydet"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export function LicenseFormModal({
  open,
  teams,
  licenseCount,
  lockedTeamId,
  onClose,
  onSave
}: {
  open: boolean;
  teams: Team[];
  licenseCount: number;
  lockedTeamId?: string;
  onClose: () => void;
  onSave: (license: PlayerLicense) => void;
}) {
  const currentYear = new Date().getFullYear();
  const availableTeams = lockedTeamId
    ? teams.filter((team) => team.id === lockedTeamId)
    : teams;
  const [licenseNo, setLicenseNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [teamId, setTeamId] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [visaSeason, setVisaSeason] = useState(`${currentYear}-${currentYear + 1}`);
  const [playerPhoto, setPlayerPhoto] = useState("");
  const [clubLogo, setClubLogo] = useState("");
  const [federationLogo, setFederationLogo] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (!open) return;
    const defaultTeam = availableTeams[0];
    setLicenseNo(`${currentYear}-${String(licenseCount + 1).padStart(4, "0")}`);
    setFirstName("");
    setLastName("");
    setNationalId("");
    setBirthDate("");
    setBirthPlace("");
    setBloodType("");
    setTeamId(lockedTeamId || defaultTeam?.id || "");
    setRegistrationDate(new Date().toISOString().slice(0, 10));
    setVisaSeason(`${currentYear}-${currentYear + 1}`);
    setPlayerPhoto("");
    setClubLogo("");
    setFederationLogo("");
    setImageError("");
  }, [open, currentYear, licenseCount, availableTeams, lockedTeamId]);

  const loadImage = async (
    file: File | undefined,
    setter: (value: string) => void,
    useJpeg: boolean
  ) => {
    if (!file) return;
    try {
      setImageError("");
      setter(await resizeImage(file, useJpeg ? 700 : 500, useJpeg));
    } catch {
      setImageError("Seçilen görsel okunamadı. PNG veya JPG dosyası deneyin.");
    }
  };

  const selectedTeam = availableTeams.find((team) => team.id === teamId) || availableTeams[0];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!playerPhoto || !clubLogo || nationalId.length !== 11 || !selectedTeam) return;
    onSave({
      id: crypto.randomUUID(),
      teamId: selectedTeam.id,
      licenseNo: licenseNo.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nationalId,
      birthDate,
      birthPlace: birthPlace.trim(),
      bloodType,
      club: selectedTeam.name,
      registrationDate,
      visaSeason,
      playerPhoto,
      clubLogo,
      federationLogo,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <Modal open={open} title="Yeni oyuncu lisansı" eyebrow="Lisans bilgileri" onClose={onClose}>
      <form className="form license-form" onSubmit={submit}>
        <div className="license-form__notice">
          Formdaki yıldızlı alanların tamamı lisans tasarımına basılır.
        </div>
        <div className="form-row">
          <label className="form-field">
            <span>Lisans numarası *</span>
            <input value={licenseNo} onChange={(event) => setLicenseNo(event.target.value)} required />
          </label>
          <label className="form-field">
            <span>Vize başlangıç sezonu *</span>
            <input
              value={visaSeason}
              onChange={(event) => setVisaSeason(event.target.value)}
              placeholder="2026-2027"
              pattern="\d{4}-\d{4}"
              required
            />
          </label>
        </div>
        <div className="form-row">
          <label className="form-field">
            <span>Adı *</span>
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
          </label>
          <label className="form-field">
            <span>Soyadı *</span>
            <input value={lastName} onChange={(event) => setLastName(event.target.value)} required />
          </label>
        </div>
        <label className="form-field">
          <span>T.C. kimlik numarası *</span>
          <input
            value={nationalId}
            onChange={(event) => setNationalId(event.target.value.replace(/\D/g, "").slice(0, 11))}
            inputMode="numeric"
            pattern="\d{11}"
            placeholder="11 hane"
            required
          />
        </label>
        <div className="form-row">
          <label className="form-field">
            <span>Doğum tarihi *</span>
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span>Doğum yeri *</span>
            <input
              value={birthPlace}
              onChange={(event) => setBirthPlace(event.target.value)}
              required
            />
          </label>
        </div>
        <div className="form-row">
          <label className="form-field">
            <span>Kan grubu *</span>
            <select value={bloodType} onChange={(event) => setBloodType(event.target.value)} required>
              <option value="">Seçin</option>
              {["A Rh+", "A Rh-", "B Rh+", "B Rh-", "AB Rh+", "AB Rh-", "0 Rh+", "0 Rh-"].map(
                (type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                )
              )}
            </select>
          </label>
          <label className="form-field">
            <span>Tescil tarihi *</span>
            <input
              type="date"
              value={registrationDate}
              onChange={(event) => setRegistrationDate(event.target.value)}
              required
            />
          </label>
        </div>
        <label className="form-field">
          <span>Kulüp *</span>
          <select
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            required
            disabled={Boolean(lockedTeamId)}
          >
            {availableTeams.map((team) => (
              <option value={team.id} key={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <div className="license-upload-grid">
          <label className={playerPhoto ? "license-upload license-upload--ready" : "license-upload"}>
            <Upload size={20} />
            <strong>Futbolcu fotoğrafı *</strong>
            <span>{playerPhoto ? "Fotoğraf hazır" : "JPG veya PNG seçin"}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => loadImage(event.target.files?.[0], setPlayerPhoto, true)}
            />
          </label>
          <label className={clubLogo ? "license-upload license-upload--ready" : "license-upload"}>
            <Upload size={20} />
            <strong>Kulüp logosu *</strong>
            <span>{clubLogo ? "Logo hazır" : "PNG tercih edilir"}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => loadImage(event.target.files?.[0], setClubLogo, false)}
            />
          </label>
          <label
            className={federationLogo ? "license-upload license-upload--ready" : "license-upload"}
          >
            <Upload size={20} />
            <strong>Federasyon logosu</strong>
            <span>{federationLogo ? "Logo hazır" : "Boşsa standart amblem"}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => loadImage(event.target.files?.[0], setFederationLogo, false)}
            />
          </label>
        </div>
        {imageError && <p className="form-error">{imageError}</p>}
        <div className="form-actions">
          <button type="button" className="button button--quiet" onClick={onClose}>
            Vazgeç
          </button>
          <button
            type="submit"
            className="button button--primary"
            disabled={!playerPhoto || !clubLogo || nationalId.length !== 11}
          >
            <FileBadge2 size={17} /> Lisansı hazırla
          </button>
        </div>
      </form>
    </Modal>
  );
}
