import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CaptionedContentProps {
  videoUrl: string;
  captionUrl?: string;
  transcriptText?: string;
  title?: string;
  description?: string;
  videoAlt?: string;
}

export function CaptionedContent({
  videoUrl,
  captionUrl,
  transcriptText,
  title,
  description,
  videoAlt = 'Video with captions',
}: CaptionedContentProps) {
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  return (
    <div className="space-y-4" role="region" aria-label="Accessible video content">
      {/* Video Container */}
      <div className="space-y-2">
        {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
        {description && <p className="text-sm text-gray-300">{description}</p>}

        <div className="relative w-full bg-black rounded-lg overflow-hidden">
          <video
            controls
            className="w-full h-auto rounded-lg focus-visible:outline-2 focus-visible:outline-red-500"
            aria-label={videoAlt}
          >
            <source src={videoUrl} type="video/mp4" />
            {captionUrl && (
              <track
                kind="captions"
                src={captionUrl}
                srcLang="en"
                label="English"
                default
              />
            )}
            {transcriptText && (
              <track
                kind="descriptions"
                src={captionUrl}
                srcLang="en"
                label="English Description"
              />
            )}
            <span className="text-white">
              Your browser does not support HTML5 video playback.
              <a
                href={videoUrl}
                className="underline text-red-500 ml-2"
              >
                Download the video instead
              </a>
            </span>
          </video>
        </div>

        {/* Caption Status */}
        {captionUrl && (
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <span
              className="w-2 h-2 bg-green-500 rounded-full"
              role="status"
              aria-label="Captions available"
            />
            Captions available
          </p>
        )}
      </div>

      {/* Transcript Section */}
      {transcriptText && (
        <details
          open={isTranscriptOpen}
          onToggle={(e) => setIsTranscriptOpen((e.target as HTMLDetailsElement).open)}
          className="bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden"
          role="region"
          aria-label="Video transcript"
        >
          <summary
            className="flex items-center justify-between cursor-pointer px-4 py-3 hover:bg-zinc-800 transition-colors font-semibold text-white select-none"
            role="button"
            aria-expanded={isTranscriptOpen}
            tabIndex={0}
          >
            <span className="flex items-center gap-2">
              <span>📝 Full Transcript</span>
            </span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isTranscriptOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </summary>

          <div className="px-4 py-4 bg-black border-t border-zinc-700 space-y-4">
            <div
              className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed"
              role="doc-transcript"
            >
              {transcriptText}
            </div>

            {/* Transcript Actions */}
            <div className="flex gap-2 pt-4 border-t border-zinc-700">
              <button
                onClick={() => {
                  // Copy transcript to clipboard
                  navigator.clipboard.writeText(transcriptText);
                }}
                className="flex-1 px-3 py-2 rounded bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700 transition-colors focus-visible:outline-2 focus-visible:outline-red-500"
                aria-label="Copy transcript to clipboard"
              >
                Copy
              </button>
              <button
                onClick={() => {
                  // Download transcript
                  const element = document.createElement('a');
                  element.setAttribute(
                    'href',
                    'data:text/plain;charset=utf-8,' + encodeURIComponent(transcriptText)
                  );
                  element.setAttribute('download', 'transcript.txt');
                  element.style.display = 'none';
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="flex-1 px-3 py-2 rounded bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700 transition-colors focus-visible:outline-2 focus-visible:outline-red-500"
                aria-label="Download transcript as text file"
              >
                Download
              </button>
            </div>
          </div>
        </details>
      )}

      {/* Accessibility Info */}
      <div
        className="p-4 rounded-lg bg-blue-900/20 border border-blue-700/50 text-blue-200 text-xs"
        role="complementary"
        aria-label="Accessibility information"
      >
        <p className="font-semibold mb-2">Accessibility Features:</p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>Captions available for audio content</li>
          <li>Full transcript available for download</li>
          <li>Keyboard navigation fully supported</li>
          <li>Works with screen readers</li>
          <li>Compatible with high contrast mode</li>
        </ul>
      </div>
    </div>
  );
}
