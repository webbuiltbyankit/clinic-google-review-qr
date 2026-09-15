import React, { useState } from 'react';
import {
  QrCode,
  Trash2,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  FileCode,
  FileImage,
} from 'lucide-react';
import { generateQRPng, generateQRSvg, triggerDownload } from './utils/qrGenerator';

const SAMPLE_GOOGLE_REVIEW_URL =
  'https://www.google.com/maps/place/Artistry+Clinic/@18.4506052,73.8969507,17z/data=!4m8!3m7!1s0x3bc2eb90ca4aefa3:0x8848ab3e2ea6a762!8m2!3d18.4506052!4d73.8969507!9m1!1b1!16s%2Fg%2F11sywx930y!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D';

export const App: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>(SAMPLE_GOOGLE_REVIEW_URL);
  const [activeUrl, setActiveUrl] = useState<string>('');
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [svgData, setSvgData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-generate on initial load for Artistry Clinic
  React.useEffect(() => {
    handleGenerate(SAMPLE_GOOGLE_REVIEW_URL);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleGenerate = async (targetUrl?: string) => {
    const urlToUse = (targetUrl !== undefined ? targetUrl : urlInput).trim();

    if (!urlToUse) {
      setError('Please enter a Google Maps or Google Review URL.');
      setPngDataUrl('');
      setSvgData('');
      setActiveUrl('');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Generate both PNG and SVG locally using the qrcode library
      const [png, svg] = await Promise.all([
        generateQRPng(urlToUse, 2048), // 2048px high resolution for print
        generateQRSvg(urlToUse),
      ]);

      setPngDataUrl(png);
      setSvgData(svg);
      setActiveUrl(urlToUse);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate QR code. Please check the URL.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setActiveUrl('');
    setPngDataUrl('');
    setSvgData('');
    setError(null);
    showToast('Cleared input and QR code');
  };

  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    triggerDownload(pngDataUrl, 'clinic-google-review-qr.png', false);
    showToast('Downloaded clinic-google-review-qr.png');
  };

  const handleDownloadSvg = () => {
    if (!svgData) return;
    triggerDownload(svgData, 'clinic-google-review-qr.svg', true);
    showToast('Downloaded clinic-google-review-qr.svg');
  };

  const handleCopyUrl = async () => {
    if (!activeUrl) return;
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('URL copied to clipboard');
    } catch (err) {
      showToast('Failed to copy URL');
    }
  };

  const handleUseSample = () => {
    setUrlInput(SAMPLE_GOOGLE_REVIEW_URL);
    handleGenerate(SAMPLE_GOOGLE_REVIEW_URL);
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-badge">
          <ShieldCheck size={16} /> 100% Client-Side & High Precision
        </div>
        <h1>Clinic Google Review QR Generator</h1>
        <p>
          Convert your clinic's Google Maps or Google Review link into a crisp, high-resolution static
          QR code for counters, business cards, and print materials.
        </p>
      </header>

      {/* Main Grid Layout */}
      <main className="app-grid">
        {/* Left Column: Form & Controls */}
        <section className="card">
          <h2 className="card-title">
            <QrCode className="text-primary" size={22} /> Generator Settings
          </h2>

          {toastMessage && (
            <div className="toast toast-success">
              <CheckCircle2 size={18} /> {toastMessage}
            </div>
          )}

          {error && (
            <div className="toast toast-error">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="clinic-url-input" className="form-label">
                Google Maps / Review URL
              </label>
              <button type="button" className="sample-btn" onClick={handleUseSample}>
                Use Sample URL
              </button>
            </div>

            <div className="input-container">
              <input
                id="clinic-url-input"
                type="text"
                className="url-input"
                placeholder="Paste Google Maps or Review URL (e.g. https://g.page/r/...)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
              />
              {urlInput && (
                <button
                  type="button"
                  className="input-clear-btn"
                  onClick={() => setUrlInput('')}
                  title="Clear text"
                  aria-label="Clear input text"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons: Generate & Clear */}
          <div className="btn-group">
            <button
              id="btn-generate-qr"
              type="button"
              className="btn btn-primary"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
            >
              <Zap size={18} /> {isGenerating ? 'Generating...' : 'Generate QR'}
            </button>

            <button
              id="btn-clear"
              type="button"
              className="btn btn-danger-outline"
              onClick={handleClear}
              title="Clear all fields"
            >
              <Trash2 size={18} /> Clear
            </button>
          </div>

          {/* Quality & Specification Checklist */}
          <div className="spec-list">
            <div className="spec-item">
              <CheckCircle2 size={16} className="spec-icon" /> 30% Error Correction (Level H)
            </div>
            <div className="spec-item">
              <CheckCircle2 size={16} className="spec-icon" /> High-Res 2048px PNG Output
            </div>
            <div className="spec-item">
              <CheckCircle2 size={16} className="spec-icon" /> Pure Black & White Contrast
            </div>
            <div className="spec-item">
              <CheckCircle2 size={16} className="spec-icon" /> Professional Vector SVG
            </div>
            <div className="spec-item">
              <CheckCircle2 size={16} className="spec-icon" /> 4-Module White Quiet Zone
            </div>
            <div className="spec-item">
              <CheckCircle2 size={16} className="spec-icon" /> Unmodified Exact URL
            </div>
          </div>
        </section>

        {/* Right Column: Preview & Downloads */}
        <section className="card qr-preview-container">
          <h2 className="card-title" style={{ width: '100%' }}>
            <Sparkles className="text-primary" size={22} /> QR Code Preview
          </h2>

          {/* QR Code White Container */}
          <div className="qr-box-wrapper">
            {pngDataUrl ? (
              <img
                src={pngDataUrl}
                alt="Clinic Google Review QR Code"
                className="qr-image"
                id="qr-preview-img"
              />
            ) : (
              <div className="qr-empty-placeholder">
                <QrCode size={54} opacity={0.4} />
                <p>Enter your clinic URL and click "Generate QR" to preview</p>
              </div>
            )}
          </div>

          {/* Verification Box - Displays Entered URL */}
          <div className="verification-box">
            <div className="verification-header">
              <span>Encoded URL Verification</span>
              {activeUrl && <span style={{ color: '#10b981' }}>● Encoded</span>}
            </div>

            <div className="url-display" id="encoded-url-display">
              {activeUrl || 'No URL encoded yet'}
            </div>

            {activeUrl && (
              <div className="verification-actions">
                <button
                  type="button"
                  className="mini-btn"
                  onClick={handleCopyUrl}
                  title="Copy encoded URL"
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy URL'}
                </button>

                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mini-btn"
                  title="Test link in new tab"
                >
                  <ExternalLink size={14} /> Test Open Link
                </a>
              </div>
            )}
          </div>

          {/* Download Buttons */}
          <div className="download-grid">
            <button
              id="btn-download-png"
              type="button"
              className="btn btn-emerald"
              onClick={handleDownloadPng}
              disabled={!pngDataUrl}
              title="Download high-resolution PNG for printing"
            >
              <FileImage size={18} /> Download PNG
            </button>

            <button
              id="btn-download-svg"
              type="button"
              className="btn btn-secondary"
              onClick={handleDownloadSvg}
              disabled={!svgData}
              title="Download scalable SVG vector for signage"
            >
              <FileCode size={18} /> Download SVG
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          Standalone Clinic QR Code Generator &bull; Built with React + Vite &bull; Standard Compliant ISO/IEC 18004
        </p>
      </footer>
    </div>
  );
};

export default App;
