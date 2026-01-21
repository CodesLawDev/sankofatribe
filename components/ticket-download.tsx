'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

interface TicketDownloadProps {
  ticketId: string;
  elementId: string;
  filename?: string;
}

export default function TicketDownload({ ticketId, elementId, filename }: TicketDownloadProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error('Element not found:', elementId);
        throw new Error('Ticket element not found');
      }

      // Wait a bit for images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure the cloned element is visible
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.display = 'block';
            clonedElement.style.position = 'relative';
          }
        }
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to generate image');
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `ticket-${ticketId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setDownloading(false);
      }, 'image/png');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download ticket. Please try again.');
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download as Image
        </>
      )}
    </button>
  );
}
