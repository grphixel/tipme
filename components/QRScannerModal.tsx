'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerModalProps {
  onScan: (text: string) => void;
  onClose: () => void;
}

const SCANNER_ID = 'tip-qr-scanner';

export default function QRScannerModal({ onScan, onClose }: QRScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;
    let isActive = true;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          if (!isActive) return;
          isActive = false;
          onScan(decodedText);
        },
        () => {
          // ignore per-frame "no QR found" errors
        }
      )
      .catch(() => {
        // camera failed to start (permissions, no camera, etc.)
        // user can close the modal and type/paste the address instead
      });

    return () => {
      isActive = false;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-200">Scan address QR</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="text-zinc-500 transition hover:text-zinc-300"
          >
            ✕
          </button>
        </div>
        <div id={SCANNER_ID} className="overflow-hidden rounded-xl bg-black" />
        <p className="mt-3 text-xs text-zinc-500">
          Point the camera at a wallet address QR code.
        </p>
      </div>
    </div>
  );
}
