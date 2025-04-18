import React, { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";

export default function QRCodeGenerator() {
  const [text, setText] = useState("https://www.domo.com");
  const [containerWidth, setContainerWidth] = useState(0); // Width of the container
  const [exportSize, setExportSize] = useState(456); // Size for export/download
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [fgColor, setFgColor] = useState("#000000");
  const [enableMargin, setEnableMargin] = useState(true); // Toggle for margin (1 or none)
  const [enableShadow, setEnableShadow] = useState(true);
  const [cornerRadius, setCornerRadius] = useState(8); // For container corners

  // Popovers visibility states
  const [showMarginPopover, setShowMarginPopover] = useState(false);
  const [showFgColorPopover, setShowFgColorPopover] = useState(false);
  const [showBgColorPopover, setShowBgColorPopover] = useState(false);
  const [showCornerPopover, setShowCornerPopover] = useState(false);
  const [showShadowPopover, setShowShadowPopover] = useState(false);
  const [showErrorPopover, setShowErrorPopover] = useState(false);
  const [showExportSizePopover, setShowExportSizePopover] = useState(false);

  // Default to High error correction as it's most reliable for general use
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState("L");

  const qrRef = useRef(null);
  const containerRef = useRef(null);

  // Close all popovers when clicking outside of them
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close popovers if clicking outside any popover or QR code display
      if (!event.target.closest(".popover") && !event.target.closest(".qr-container")) {
        setShowMarginPopover(false);
        setShowFgColorPopover(false);
        setShowBgColorPopover(false);
        setShowCornerPopover(false);
        setShowShadowPopover(false);
        setShowErrorPopover(false);
        setShowExportSizePopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update container width on resize and initial load
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    // Initial width
    updateWidth();

    // Update on resize
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const downloadQRCode = () => {
    // Use the QR code reference
    const svg = qrRef.current;
    if (!svg) return;

    // Create a clone of the SVG to avoid modifying the original
    const clonedSvg = svg.cloneNode(true);

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = exportSize;
      canvas.height = exportSize;

      // Apply corner radius to the canvas if needed
      if (cornerRadius > 0) {
        ctx.beginPath();
        ctx.moveTo(cornerRadius, 0);
        ctx.lineTo(canvas.width - cornerRadius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, cornerRadius);
        ctx.lineTo(canvas.width, canvas.height - cornerRadius);
        ctx.quadraticCurveTo(
          canvas.width,
          canvas.height,
          canvas.width - cornerRadius,
          canvas.height
        );
        ctx.lineTo(cornerRadius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - cornerRadius);
        ctx.lineTo(0, cornerRadius);
        ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
        ctx.closePath();
        ctx.clip();
      }

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate effective size with margin
      const marginPx = enableMargin ? exportSize / 25 : 0; // 1 unit margin if enabled, none if disabled
      const contentWidth = exportSize - marginPx * 2;
      const contentHeight = exportSize - marginPx * 2;

      // Calculate scaling and positioning to center the QR code with margin
      const scale = Math.min(contentWidth / img.width, contentHeight / img.height);
      const x = marginPx + (contentWidth - img.width * scale) / 2;
      const y = marginPx + (contentHeight - img.height * scale) / 2;

      // Draw QR code with proper scaling and margin
      ctx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * scale, img.height * scale);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "qrcode.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Helper function to get shadow CSS
  const getShadowStyle = () => {
    if (!enableShadow) return {};
    return {
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    };
  };

  // Calculate QR code size based on container width and margin
  const getQRCodeSize = () => {
    // Account for padding and margin
    const effectiveMargin = enableMargin ? 32 : 0; // 16px padding on both sides
    return Math.max(containerWidth - effectiveMargin, 0);
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      {/* Option 3: Modern with Border */}
      <div className="flex flex-col items-center justify-center mb-4 gap-y-1">
        <h1 className="text-3xl font-bold text-gray-800 border-b-2 border-blue-700 inline-block">
          QR Codes
        </h1>
        <p className="text-xl text-blue-500">FREE Online Generator</p>
      </div>

      <div
        className="w-full flex flex-col items-center gap-6"
        ref={containerRef}>
        {/* URL Input */}
        <div className="w-full space-y-1">
          <label
            htmlFor="text"
            className="text-sm font-medium text-gray-700 flex items-center pl-1">
            URL link
          </label>

          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <span className="text-gray-600 bg-gray-100 py-1 px-1.5 rounded-sm sm:text-sm">
                https://
              </span>
            </div>
            <input
              id="text"
              type="text"
              className="w-full px-1 py-1.5 pl-18 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={text.replace(/^https?:\/\//, "")}
              onChange={(e) => {
                const val = e.target.value;
                setText(val.startsWith("http") ? val : `https://${val}`);
              }}
              placeholder="www.domo.com"
            />
          </div>
        </div>

        {/* QR Code with Floating Controls */}
        <div className="relative w-full">
          {/* QR Code */}
          <div
            className="qr-container bg-white flex items-center justify-center relative w-full"
            style={{
              padding: enableMargin ? "16px" : "0px", // Increased padding for more visible margin
              borderRadius: cornerRadius + "px",
              ...getShadowStyle(),
              aspectRatio: "1 / 1",
            }}>
            <QRCode
              ref={qrRef}
              value={text || " "}
              size={getQRCodeSize()}
              bgColor={bgColor}
              fgColor={fgColor}
              level={errorCorrectionLevel}
              includeMargin={false}
              style={{ width: "100%", height: "100%" }}
            />
            <div className="absolute w-full h-full bottom-2 px-3 flex justify-between items-end">
              {/* Export Size Button */}
              <button
                className={`group w-auto h-8 pl-1 pr-2  rounded border shadow-sm flex items-center justify-center bg-white cursor-pointer hover:bg-blue-50 transition-all hover:border-blue-700 ${
                  showExportSizePopover ? "text-blue-700 border-blue-700" : "border-gray-300"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExportSizePopover(!showExportSizePopover);
                  setShowFgColorPopover(false);
                  setShowBgColorPopover(false);
                  setShowMarginPopover(false);
                  setShowCornerPopover(false);
                  setShowShadowPopover(false);
                  setShowErrorPopover(false);
                }}>
                <svg
                  className="group-hover:text-blue-700 w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 8V4m0 0h4m-4 0l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5"
                  />
                </svg>
                <div className="flex items-center text-xs font-semibold group-hover:text-blue-700">
                  <span>{exportSize}</span>
                  <span className="pl-[1px]">px</span>
                  <span className="mx-1 font-extralight">×</span>
                  <span>{exportSize}</span>
                  <span className="pl-[1px]">px</span>
                </div>
              </button>
            </div>
            <div className="absolute w-full top-2 px-3 flex justify-between">
              <div className="flex gap-x-2">
                {/* Corner Radius Button */}
                <button
                  className={`group w-9 h-9 rounded border shadow-sm flex items-center justify-center bg-white cursor-pointer hover:bg-blue-50 transition-all hover:border-blue-700 ${
                    showCornerPopover ? "text-blue-700 border-blue-700" : "border-gray-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCornerPopover(!showCornerPopover);
                    setShowFgColorPopover(false);
                    setShowBgColorPopover(false);
                    setShowMarginPopover(false);
                    setShowShadowPopover(false);
                    setShowErrorPopover(false);
                    setShowExportSizePopover(false);
                  }}>
                  <svg
                    className="group-hover:text-blue-700 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx={Math.max(1, cornerRadius / 5)}
                      ry={Math.max(1, cornerRadius / 5)}
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>

                {/* Shadow Button */}
                <button
                  className={`group w-9 h-9 rounded border shadow-sm flex items-center justify-center bg-white cursor-pointer hover:bg-blue-50 transition-all hover:border-blue-700 ${
                    showShadowPopover ? "text-blue-700 border-blue-700" : "border-gray-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShadowPopover(!showShadowPopover);
                    setShowFgColorPopover(false);
                    setShowBgColorPopover(false);
                    setShowMarginPopover(false);
                    setShowCornerPopover(false);
                    setShowErrorPopover(false);
                    setShowExportSizePopover(false);
                  }}>
                  <svg
                    className="group-hover:text-blue-700 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      strokeWidth="2"
                      strokeDasharray="2 2"
                    />
                    <path
                      d="M15 9L9 15"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="5"
                      fill="currentColor"
                      fillOpacity="0.2"
                    />
                  </svg>
                </button>

                {/* Error Correction Button */}
                <button
                  className={`group w-9 h-9 rounded border shadow-sm flex items-center justify-center bg-white cursor-pointer hover:bg-blue-50 transition-all hover:border-blue-700 ${
                    showErrorPopover ? "text-blue-700 border-blue-700" : "border-gray-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowErrorPopover(!showErrorPopover);
                    setShowFgColorPopover(false);
                    setShowBgColorPopover(false);
                    setShowMarginPopover(false);
                    setShowCornerPopover(false);
                    setShowShadowPopover(false);
                    setShowExportSizePopover(false);
                  }}>
                  <svg
                    className="group-hover:text-blue-700 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>

                {/* Margin Button */}
                <button
                  className={`group w-9 h-9 rounded border shadow-sm flex items-center justify-center bg-white cursor-pointer hover:bg-blue-50 transition-all hover:border-blue-700 ${
                    showMarginPopover ? "text-blue-700 border-blue-700" : "border-gray-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMarginPopover(!showMarginPopover);
                    setShowFgColorPopover(false);
                    setShowBgColorPopover(false);
                    setShowCornerPopover(false);
                    setShowShadowPopover(false);
                    setShowErrorPopover(false);
                    setShowExportSizePopover(false);
                  }}>
                  <svg
                    className="group-hover:text-blue-700 w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <rect
                      x="5"
                      y="5"
                      width="14"
                      height="14"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="7"
                      y="7"
                      width="10"
                      height="10"
                      strokeWidth="1.5"
                      strokeDasharray="1 1"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex gap-x-2">
                {/* FG Color Button */}
                <button
                  className={`group w-9 h-9 rounded-full border shadow-sm flex items-center justify-center cursor-pointer transition-all hover:border-blue-700 ${
                    showFgColorPopover ? "border-blue-700" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: fgColor }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFgColorPopover(!showFgColorPopover);
                    setShowBgColorPopover(false);
                    setShowMarginPopover(false);
                    setShowCornerPopover(false);
                    setShowShadowPopover(false);
                    setShowErrorPopover(false);
                    setShowExportSizePopover(false);
                  }}></button>

                {/* BG Color Button */}
                <button
                  className={`group w-9 h-9 rounded-full border shadow-sm flex items-center justify-center cursor-pointer transition-all hover:border-blue-700 ${
                    showBgColorPopover ? "border-blue-700" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: bgColor }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBgColorPopover(!showBgColorPopover);
                    setShowFgColorPopover(false);
                    setShowMarginPopover(false);
                    setShowCornerPopover(false);
                    setShowShadowPopover(false);
                    setShowErrorPopover(false);
                    setShowExportSizePopover(false);
                  }}></button>
              </div>
            </div>

            {/* Margin Popover */}
            {showMarginPopover && (
              <div className="popover absolute top-12 left-40 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10 min-w-40">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">MARGIN</span>
                  <button
                    onClick={() => setShowMarginPopover(false)}
                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 cursor-pointer rounded transition-all">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center mt-2">
                  <input
                    id="enableMarginPopover"
                    type="checkbox"
                    checked={enableMargin}
                    onChange={(e) => setEnableMargin(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="enableMarginPopover"
                    className="ml-2 block text-sm text-gray-700">
                    Apply margins to the sides
                  </label>
                </div>
              </div>
            )}

            {/* FG Color Popover */}
            {showFgColorPopover && (
              <div className="popover absolute top-12 right-2 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">FOREGROUND COLOR</span>
                  <button
                    onClick={() => setShowFgColorPopover(false)}
                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 cursor-pointer rounded transition-all">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded border-0"
                  />
                  <span className="ml-2 text-sm text-gray-500">{fgColor}</span>
                </div>
              </div>
            )}

            {/* BG Color Popover */}
            {showBgColorPopover && (
              <div className="popover absolute top-12 right-10 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">BACKGROUND COLOR</span>
                  <button
                    onClick={() => setShowBgColorPopover(false)}
                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 cursor-pointer rounded transition-all">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border-0"
                  />
                  <span className="ml-2 text-sm text-gray-500">{bgColor}</span>
                </div>
              </div>
            )}

            {/* Corner Radius Popover */}
            {showCornerPopover && (
              <div className="popover absolute top-12 left-10 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10 min-w-40">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">CORNER RADIUS</span>
                  <button
                    onClick={() => setShowCornerPopover(false)}
                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 cursor-pointer rounded transition-all">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">0</span>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={cornerRadius}
                    onChange={(e) => setCornerRadius(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-xs text-gray-500">20</span>
                </div>
                <div className="text-xs text-center text-gray-500 mt-1">
                  Current: {cornerRadius}px
                </div>
              </div>
            )}

            {/* Shadow Popover */}
            {showShadowPopover && (
              <div className="popover absolute top-12 left-20 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">SHADOW</span>
                  <button
                    onClick={() => setShowShadowPopover(false)}
                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 cursor-pointer rounded transition-all">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center">
                  <input
                    id="enableShadow"
                    type="checkbox"
                    checked={enableShadow}
                    onChange={(e) => setEnableShadow(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="enableShadow"
                    className="ml-2 block text-sm text-gray-700">
                    Enable shadow
                  </label>
                </div>
              </div>
            )}

            {/* Error Correction Level Popover */}
            {showErrorPopover && (
              <div className="popover absolute top-12 left-30 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10 min-w-40">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">ERROR CORRECTION</span>
                  <button
                    onClick={() => setShowErrorPopover(false)}
                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 cursor-pointer rounded transition-all">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="mt-2">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="errorL"
                        type="radio"
                        checked={errorCorrectionLevel === "L"}
                        onChange={() => setErrorCorrectionLevel("L")}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="errorL"
                        className="ml-2 block text-xs text-gray-700">
                        Low (7%)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="errorM"
                        type="radio"
                        checked={errorCorrectionLevel === "M"}
                        onChange={() => setErrorCorrectionLevel("M")}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="errorM"
                        className="ml-2 block text-xs text-gray-700">
                        Medium (15%)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="errorQ"
                        type="radio"
                        checked={errorCorrectionLevel === "Q"}
                        onChange={() => setErrorCorrectionLevel("Q")}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="errorQ"
                        className="ml-2 block text-xs text-gray-700">
                        Quartile (25%)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="errorH"
                        type="radio"
                        checked={errorCorrectionLevel === "H"}
                        onChange={() => setErrorCorrectionLevel("H")}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="errorH"
                        className="ml-2 block text-xs text-gray-700">
                        High (30%)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Export Size Popover */}
            {showExportSizePopover && (
              <div className="popover absolute bottom-12 left-20 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10 min-w-40">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">EXPORT SIZE</span>
                  <button
                    onClick={() => setShowExportSizePopover(false)}
                    className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 cursor-pointer rounded transition-all">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="popoverExportSize"
                      className="text-xs text-gray-700">
                      Size:
                    </label>
                    <input
                      id="popoverExportSize"
                      type="number"
                      min="128"
                      max="1024"
                      step="8"
                      value={exportSize}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 128 && value <= 1024) {
                          setExportSize(value);
                        }
                      }}
                      className="w-16 p-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-xs text-gray-500">px</span>
                  </div>
                  <div className="mt-2">
                    <input
                      type="range"
                      min="128"
                      max="1024"
                      step="8"
                      value={exportSize}
                      onChange={(e) => setExportSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>128px</span>
                      <span>1024px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={downloadQRCode}
            className="w-full cursor-pointer mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
}
