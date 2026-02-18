"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface QrScannerProps {
  onDetected: (text: string) => void;
  onClose?: () => void;
}

export default function QrScanner({ onDetected, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [supported, setSupported] = useState<boolean>(true);
  const [active, setActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMethod, setScanMethod] = useState<"barcode" | "jsqr">("barcode");
  const [manualInput, setManualInput] = useState<string>("");
  const [useManual, setUseManual] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    
    const stop = () => {
      if (!isMounted) return;
      setActive(false);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    };

    const start = async () => {
      try {
        // Check if mediaDevices API is available
        if (!navigator?.mediaDevices?.getUserMedia) {
          if (isMounted) {
            setError("Camera API not available");
            setSupported(false);
          }
          return;
        }

        // Request camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        
        if (!isMounted || !videoRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        
        videoRef.current.srcObject = stream;
        
        // Play video and handle errors
        try {
          await videoRef.current.play();
        } catch (playError: any) {
          // Ignore play errors if component was unmounted
          if (!isMounted) return;
          throw playError;
        }
        
        if (!isMounted) return;
        setActive(true);
        setUseManual(false);
        setError(null);

        // Determine which scanning method to use
        // @ts-ignore
        const BarcodeDetector = (window as any).BarcodeDetector;
        const useBarcode = !!BarcodeDetector;
        
        if (useBarcode) {
          setScanMethod("barcode");
          const detector = new BarcodeDetector({ formats: ["qr_code"] });
          
          const scan = async () => {
            if (!videoRef.current) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!canvas) return;

            const w = video.videoWidth;
            const h = video.videoHeight;
            if (!w || !h) {
              requestAnimationFrame(scan);
              return;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              requestAnimationFrame(scan);
              return;
            }
            ctx.drawImage(video, 0, 0, w, h);

            try {
              const bitmap = await createImageBitmap(canvas);
              const codes = await detector.detect(bitmap);
              if (codes && codes.length > 0) {
                const text = codes[0].rawValue || codes[0].value || "";
                if (text) {
                  onDetected(text);
                  stop();
                  return;
                }
              }
            } catch (e) {
              // ignore detection errors
            }
            requestAnimationFrame(scan);
          };
          requestAnimationFrame(scan);
        } else {
          // Fallback to jsQR for browsers without BarcodeDetector (Safari, Firefox, etc.)
          setScanMethod("jsqr");
          
          const scan = () => {
            if (!videoRef.current) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!canvas) return;

            const w = video.videoWidth;
            const h = video.videoHeight;
            if (!w || !h) {
              requestAnimationFrame(scan);
              return;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              requestAnimationFrame(scan);
              return;
            }
            ctx.drawImage(video, 0, 0, w, h);

            try {
              const imageData = ctx.getImageData(0, 0, w, h);
              const code = jsQR(imageData.data, imageData.width, imageData.height);
              if (code) {
                onDetected(code.data);
                stop();
                return;
              }
            } catch (e) {
              // ignore detection errors
            }
            requestAnimationFrame(scan);
          };
          requestAnimationFrame(scan);
        }
      } catch (e: any) {
        const errMsg = e?.message || "Camera access failed";
        if (errMsg.includes("Permission denied")) {
          setError("Camera permission denied. Please enable camera access in browser settings.");
        } else if (errMsg.includes("NotFoundError")) {
          setError("No camera device found on this system.");
        } else if (errMsg.includes("NotAllowedError")) {
          setError("Camera access not allowed. Check your browser privacy settings.");
        } else {
          setError(errMsg);
        }
        setSupported(false);
      }
    };

    start();
    return () => {
      isMounted = false;
      stop();
    };
  }, [onDetected]);

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-gray-900">Scan or Enter Ticket ID</p>
          {supported && active && (
            <p className="text-xs text-gray-500">
              Using {scanMethod === "barcode" ? "hardware-accelerated" : "software"} QR detection
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
          >
            Close
          </button>
        )}
      </div>

      {/* Manual Input Fallback */}
      {!supported && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800 mb-2">{error}</p>
          <p className="text-xs text-yellow-700 mb-3">Use the field below to manually enter the ticket ID:</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., EVT-abc123-TK-xyz789"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && manualInput.trim()) {
                  onDetected(manualInput.trim());
                  setManualInput("");
                }
              }}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (manualInput.trim()) {
                  onDetected(manualInput.trim());
                  setManualInput("");
                }
              }}
              disabled={!manualInput.trim()}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded font-medium"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Camera Feed */}
      {supported && (
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div className="bg-black/80 rounded overflow-hidden">
            <video ref={videoRef} className="w-full h-64 object-cover" muted playsInline />
          </div>
          <div className="hidden">
            <canvas ref={canvasRef} />
          </div>
        </div>
      )}

      {!active && supported && (
        <p className="text-xs text-gray-600">Initializing camera…</p>
      )}
    </div>
  );
}
