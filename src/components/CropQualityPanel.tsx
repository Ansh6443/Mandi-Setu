"use client";

import { Camera, Check, CheckCircle, ImageSquare, Leaf, Sparkle, SpeakerHigh } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useLanguage } from "@/lib/i18n";

const qualityCriteria = ["qualityAppearance", "qualityDamage", "qualityCleanliness", "qualityMoisture"] as const;

export default function CropQualityPanel() {
  const { t, language } = useLanguage(); // language yahan se mil jayegi (jaise 'hindi', 'gujarati', etc.)
  const [qualityChecks, setQualityChecks] = useState<Record<string, boolean>>({});
  const [qualitySubmitted, setQualitySubmitted] = useState(false);
  const [qualityPhoto, setQualityPhoto] = useState<File | null>(null);
  const [qualityPhotoUrl, setQualityPhotoUrl] = useState<string | null>(null);
  const [qualityPhotoError, setQualityPhotoError] = useState<string | null>(null);

  // States for Backend & Voice Integration
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const qualityPhotoUrlRef = useRef<string | null>(null);
  const checkedQualityCount = qualityCriteria.filter((criterion) => qualityChecks[criterion]).length;
  const qualityComplete = checkedQualityCount === qualityCriteria.length;

  useEffect(() => () => {
    if (qualityPhotoUrlRef.current) URL.revokeObjectURL(qualityPhotoUrlRef.current);
  }, []);

  const selectQualityPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0];
    event.target.value = "";
    if (!photo) return;
    if (!photo.type.startsWith("image/")) {
      setQualityPhotoError(t("qualityPhotoTypeError"));
      return;
    }
    if (photo.size > 10 * 1024 * 1024) {
      setQualityPhotoError(t("qualityPhotoSizeError"));
      return;
    }

    setQualityPhotoError(null);
    setAnalysisResult(null);
    setAudioBase64(null);
    setAnalysisError(null);
    setQualityChecks({});
    setQualitySubmitted(false);
    if (qualityPhotoUrlRef.current) URL.revokeObjectURL(qualityPhotoUrlRef.current);
    const photoUrl = URL.createObjectURL(photo);
    qualityPhotoUrlRef.current = photoUrl;
    setQualityPhoto(photo);
    setQualityPhotoUrl(photoUrl);
  };

  // Function to send image and target language to live Render backend
  const handleAnalyzeCrop = async () => {
    if (!qualityPhoto) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      formData.append("file", qualityPhoto);
      // Pass the selected portal language to the backend for localized AI & audio response
      formData.append("target_language", language || "Hindi");

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://kisan-q-backend.onrender.com";
      const apiEndpoint = `${apiBaseUrl.replace(/\/+$/, "")}/crop-disease/detect`;
      console.info(`[CropQualityPanel] POST ${apiEndpoint}`);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json() as {
        success?: boolean;
        analysis?: string;
        audio_base64?: string;
        detail?: string | Array<{ msg?: string }>;
      };

      if (!response.ok || !data.success || typeof data.analysis !== "string") {
        const detail = typeof data.detail === "string"
          ? data.detail
          : data.detail?.map((issue) => issue.msg).filter(Boolean).join("; ");
        throw new Error(detail || "Failed to analyze crop image.");
      }

      setQualityChecks(Object.fromEntries(qualityCriteria.map((criterion) => [criterion, true])));
      setAnalysisResult(data.analysis);
      if (data.audio_base64) {
        setAudioBase64(data.audio_base64);
      }
      setQualitySubmitted(true);
    } catch (error: unknown) {
      setAnalysisError(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Play localized audio response for farmers
  const playAudioAnswer = () => {
    if (!audioBase64) return;
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    audio.play();
  };

  return (
    <section className="panel-card quality-panel" aria-labelledby="quality-panel-title">
      <div className="quality-intro">
        <span className="quality-icon"><Leaf size={22} aria-hidden="true" /></span>
        <div>
          <p className="quality-eyebrow">{t("qualityGuide")}</p>
          <h2 id="quality-panel-title">{t("qualityInspectionTitle")}</h2>
          <p>{t("qualityInspectionIntro")}</p>
        </div>
      </div>

      <div className="quality-photo-panel">
        <div className="quality-photo-copy">
          <strong><Sparkle size={18} aria-hidden="true" /> {t("qualityPhotoTitle")}</strong>
          <p>{t("qualityPhotoDescription")}</p>
        </div>
        <div className="quality-photo-actions">
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden tabIndex={-1} onChange={selectQualityPhoto} />
          <input ref={galleryInputRef} type="file" accept="image/*" hidden tabIndex={-1} onChange={selectQualityPhoto} />
          <button type="button" className="quality-camera-btn" onClick={() => cameraInputRef.current?.click()}><Camera size={18} aria-hidden="true" /> {t("qualityTakePhoto")}</button>
          <button type="button" className="quality-gallery-btn" onClick={() => galleryInputRef.current?.click()}><ImageSquare size={18} aria-hidden="true" /> {t("qualityChoosePhoto")}</button>
        </div>
        {qualityPhotoUrl && qualityPhoto && (
          <div className="quality-photo-preview-wrap">
            <Image src={qualityPhotoUrl} alt={t("qualityPhotoPreview")} width={640} height={320} unoptimized className="quality-photo-preview" />
            <span>{qualityPhoto.name}</span>
          </div>
        )}
        {qualityPhotoError && <p className="quality-photo-error" role="alert">{qualityPhotoError}</p>}
      </div>

      <div className={`quality-progress ${qualityComplete ? "complete" : ""}`} aria-live="polite">
        <span className="quality-progress-icon">
          {qualityComplete ? <Check size={25} weight="bold" aria-hidden="true" /> : <Sparkle size={23} aria-hidden="true" />}
        </span>
        <span className="quality-progress-copy">
          <strong>{qualityComplete ? t("qualityReady") : t("qualityInProgress")}</strong>
          <small>{qualityComplete ? t("qualityReadyHint") : `${checkedQualityCount}/${qualityCriteria.length} ${t("qualityProgressHint")}`}</small>
        </span>
        <span className="quality-progress-track" role="progressbar" aria-label={t("qualityProgressHint")} aria-valuemin={0} aria-valuemax={qualityCriteria.length} aria-valuenow={checkedQualityCount}>
          <span style={{ width: `${(checkedQualityCount / qualityCriteria.length) * 100}%` }} />
        </span>
      </div>

      {analysisResult && (
        <div className="analysis-result-box" style={{ marginTop: "1rem", padding: "1rem", background: "#f4f6f4", borderRadius: "8px", border: "1px solid #d0dcd0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkle size={20} weight="fill" color="#2e7d32" /> AI Diagnosis & Treatment Plan
            </h3>
            {audioBase64 && (
              <button
                type="button"
                onClick={playAudioAnswer}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "#2e7d32", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
              >
                <SpeakerHigh size={18} weight="bold" /> Jawab Suniye (Listen)
              </button>
            )}
          </div>
          <div style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem", lineHeight: "1.5" }}>
            {analysisResult}
          </div>
        </div>
      )}

      <div className="quality-checklist">
        {qualityCriteria.map((criterion) => (
          <label className={`quality-check-row ${qualityChecks[criterion] ? "passed" : ""}`} key={criterion}>
            <input
              type="checkbox"
              checked={Boolean(qualityChecks[criterion])}
              onChange={(event) => {
                const isChecked = event.target.checked;
                setQualityChecks((current) => ({ ...current, [criterion]: isChecked }));
                setQualitySubmitted(false);
                setAnalysisResult(null);
                setAudioBase64(null);
              }}
            />
            <span><strong>{t(criterion)}</strong><small>{t(`${criterion}Hint`)}</small></span>
            <span className={`quality-check-status ${qualityChecks[criterion] ? "passed" : "pending"}`}>
              {qualityChecks[criterion] ? t("qualityPass") : t("qualityCheckNow")}
            </span>
          </label>
        ))}
      </div>

      <p className="quality-disclaimer">{t("qualityDisclaimer")}</p>

      {qualityPhoto && (
        <div className="quality-submit-row">
          {qualitySubmitted ? (
            <p className="quality-submit-status" role="status">
              <CheckCircle size={20} aria-hidden="true" />
              {"Analysis Complete!"}
            </p>
          ) : (
            <button
              type="button"
              className="quality-submit-button"
              onClick={handleAnalyzeCrop}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>Analyzing crop health...</>
              ) : (
                <><Check size={18} aria-hidden="true" /> {t("qualitySubmit")}</>
              )}
            </button>
          )}
        </div>
      )}

      {analysisError && (
        <p className="quality-photo-error" role="alert" style={{ marginTop: "1rem" }}>
          Error: {analysisError}
        </p>
      )}
    </section>
  );
}