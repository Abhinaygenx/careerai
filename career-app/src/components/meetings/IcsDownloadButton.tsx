import React, { useState } from 'react';

export interface IcsDownloadButtonProps {
  meetingId: string;
}

export default function IcsDownloadButton({ meetingId }: IcsDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);

    try {
      // Trigger file download directly by pointing the browser to the API route
      const downloadUrl = `/api/meetings/${meetingId}/ics`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `meeting-${meetingId}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download .ics calendar file:', error);
      alert('Failed to generate calendar file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="px-2.5 py-1.5 bg-[#262626] hover:bg-[#363636] border border-white/5 text-gray-300 hover:text-white rounded text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 select-none"
      title="Export RFC 5545 .ics file for Google Calendar, Outlook, or Apple Calendar"
    >
      <span>📅</span>
      <span>{loading ? 'Exporting...' : 'Export ICS'}</span>
    </button>
  );
}
