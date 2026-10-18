import React from 'react';
import { X, Download, FileText } from 'lucide-react';

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  photoUrl?: string;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  photoUrl
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {photoUrl && (
              <a
                href={photoUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="p-1.5 text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Buka / Unduh Lampiran"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 flex items-center justify-center overflow-auto bg-neutral-950 min-h-[360px]">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={title}
              referrerPolicy="no-referrer"
              className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md border border-neutral-800"
            />
          ) : (
            <div className="text-center p-12 text-neutral-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Belum ada lampiran foto yang diunggah.</p>
              <p className="text-xs text-neutral-500 mt-1">
                Foto fisik dokumen SPB atau nota kas dapat diunggah saat mengubah data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
