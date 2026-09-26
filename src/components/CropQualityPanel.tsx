"use client";

import { Camera, Check, CheckCircle, ImageSquare, Leaf, Sparkle, SpeakerHigh } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useLanguage } from "@/lib/i18n";

type CropKey = "onion" | "wheat" | "potato" | "tomato" | "soybean";

const cropCatalogEnglish: Record<CropKey, string> = {
  onion: "Onion",
  wheat: "Wheat",
  potato: "Potato",
  tomato: "Tomato",
  soybean: "Soybean",
};

const qualityCriteria = ["qualityAppearance", "qualityDamage", "qualityCleanliness", "qualityMoisture"] as const;
const qualityStandards: Record<CropKey, string> = {
  onion: "qualityOnionStandard",
  wheat: "qualityWheatStandard",
  potato: "qualityPotatoStandard",
  tomato: "qualityTomatoStandard",
  soybean: "qualitySoybeanStandard",
};
const referencePrices: Record<CropKey, string> = {
  onion: "₹1,850",
  wheat: "₹2,275",
  potato: "₹1,200",
  tomato: "₹900",
  soybean: "₹4,700",
};

export default function CropQualityPanel() {
  const { t } = useLanguage();
  const [qualityCrop, setQualityCrop] = useState<CropKey>("onion");
  const [qualityChecks, setQualityChecks] = useState<Record<string, boolean>>({});
  const [qualityDemoMode, setQualityDemoMode] = useState(false);
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
    if (qualityDemoMode) {
      setQualityChecks({});
      setQualityDemoMode(false);
    }
    setQualitySubmitted(false);
    if (qualityPhotoUrlRef.current) URL.revokeObjectURL(qualityPhotoUrlRef.current);
    const photoUrl = URL.createObjectURL(photo);
    qualityPhotoUrlRef.current = photoUrl;
    setQualityPhoto(photo);
    setQualityPhotoUrl(photoUrl);
  };

  const runQualityDemo = () => {
    setQualityChecks(Object.fromEntries(qualityCriteria.map((criterion) => [criterion, true])));
    setQualityDemoMode(true);
    setQualitySubmitted(false);
    setAnalysisResult(null);
    setAudioBase64(null);
  };

  const resetQualityForCrop = (crop: CropKey) => {
    setQualityCrop(crop);
    setQualityChecks({});
    setQualityDemoMode(false);
    setQualitySubmitted(false);
    setQualityPhoto(null);
    setQualityPhotoUrl(null);
    setQualityPhotoError(null);
    setAnalysisResult(null);
    setAudioBase64(null);
    setAnalysisError(null);
    if (qualityPhotoUrlRef.current) URL.revokeObjectURL(qualityPhotoUrlRef.current);
    qualityPhotoUrlRef.current = null;
  };

  // Function to send image to live Render backend & get audio/text response
  const handleAnalyzeCrop = async () => {
    if (!qualityPhoto) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      formData.append("file", qualityPhoto);

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

  // Play audio response for farmers
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

      <div className={`quality-progress ${qualityComplete ? "complete" : ""}`} aria-live="polite">
        <span className="quality-progress-icon">
          {qualityComplete ? <Check size={25} weight="bold" aria-hidden="true" /> : <Sparkle size={23} aria-hidden="true" />}
        </span>
        <span className="quality-progress-copy">
          <strong>{qualityDemoMode ? t("qualityDemoComplete") : qualityComplete ? t("qualityReady") : t("qualityInProgress")}</strong>
          <small>{qualityDemoMode ? t("qualityDemoNotice") : qualityComplete ? t("qualityReadyHint") : `${checkedQualityCount}/${qualityCriteria.length} ${t("qualityProgressHint")}`}</small>
        </span>
        <span className="quality-progress-track" role="progressbar" aria-label={t("qualityProgressHint")} aria-valuemin={0} aria-valuemax={qualityCriteria.length} aria-valuenow={checkedQualityCount}>
          <span style={{ width: `${(checkedQualityCount / qualityCriteria.length) * 100}%` }} />
        </span>
      </div>

      <div className="quality-crop-row">
        <div className="quality-crop-picker">
          <label className="field-label" htmlFor="quality-crop">{t("qualityCrop")}</label>
          <select id="quality-crop" className="input-control quality-crop-select" value={qualityCrop} onChange={(event) => resetQualityForCrop(event.target.value as CropKey)}>
            {Object.keys(cropCatalogEnglish).map((crop) => (
              <option key={crop} value={crop}>{t(crop)} ({cropCatalogEnglish[crop as CropKey]})</option>
            ))}
          </select>
        </div>
        <div className="quality-reference" aria-live="polite">
          <div><small>{t("qualityStandardLabel")}</small><strong>{t(qualityStandards[qualityCrop])}</strong></div>
          <div><small>{t("qualityReferencePrice")}</small><strong>{referencePrices[qualityCrop]} / {t("quintal")}</strong></div>
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
          <button type="button" className="quality-demo-btn" onClick={runQualityDemo}>{t("qualityDemoTest")}</button>
        </div>
        {qualityPhotoUrl && qualityPhoto && (
          <div className="quality-photo-preview-wrap">
            <Image src={qualityPhotoUrl} alt={t("qualityPhotoPreview")} width={640} height={320} unoptimized className="quality-photo-preview" />
            <span>{qualityPhoto.name}</span>
          </div>
        )}
        {qualityPhotoError && <p className="quality-photo-error" role="alert">{qualityPhotoError}</p>}
        <p className="quality-photo-note">{t("qualityPhotoPrivacy")}</p>
      </div>

      <div className="quality-checklist">
        {qualityCriteria.map((criterion) => (
          <label className={`quality-check-row ${qualityChecks[criterion] ? "passed" : ""}`} key={criterion}>
            <input
              type="checkbox"
              checked={Boolean(qualityChecks[criterion])}
              onChange={(event) => {
                const isChecked = event.target.checked;
                setQualityChecks((current) => qualityDemoMode ? { [criterion]: isChecked } : { ...current, [criterion]: isChecked });
                setQualityDemoMode(false);
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
              {qualityDemoMode ? t("qualityDemoSubmissionSaved") : "Analysis Complete!"}
            </p>
          ) : (
            <button
              type="button"
              className="quality-submit-button"
              onClick={handleAnalyzeCrop}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>Analyzing with Gemini AI...</>
              ) : (
                <><Check size={18} aria-hidden="true" /> {t("qualitySubmit")}</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Display Gemini AI Analysis Result & Audio Play Button */}
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

      {/* Display Error if API fails */}
      {analysisError && (
        <p className="quality-photo-error" role="alert" style={{ marginTop: "1rem" }}>
          Error: {analysisError}
        </p>
      )}
    </section>
  );
}