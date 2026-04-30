import React from 'react';
import { Heart, Shield } from 'lucide-react';

const SUPPORTED_PLATFORMS = [
  { name: 'YouTube',    emoji: '▶️' },
  { name: 'TikTok',    emoji: '🎵' },
  { name: 'Instagram', emoji: '📷' },
  { name: 'Twitter/X', emoji: '🐦' },
  { name: 'Facebook',  emoji: '👥' },
  { name: 'Reddit',    emoji: '🤖' },
  { name: 'Vimeo',     emoji: '🎬' },
  { name: 'SoundCloud',emoji: '☁️' },
  { name: 'Twitch',    emoji: '🎮' },
  { name: 'Pinterest', emoji: '📌' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
      {/* Supported platforms */}
      <div
        id="supported"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        <h3 className="text-center text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
          Supported Platforms
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {SUPPORTED_PLATFORMS.map(({ name, emoji }) => (
            <div
              key={name}
              className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-default"
            >
              <span>{emoji}</span>
              <span className="font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legal / bottom bar */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center sm:text-left">
              © {new Date().getFullYear()} SocialDL. Built with{' '}
              <Heart className="w-3 h-3 inline text-red-400" /> using React &amp;
              Tailwind CSS.
            </p>

            <div className="flex items-center gap-4">
              <a
                href="#privacy"
                className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Privacy Policy
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                🐙 Source
              </a>
            </div>
          </div>

          {/* Privacy notice */}
          <div
            id="privacy"
            className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
              <Shield className="w-3.5 h-3.5 inline mr-1 text-green-500" />
              <strong className="text-gray-500 dark:text-gray-400">Privacy:</strong>{' '}
              No user data is collected or stored on our servers. All download requests
              are processed client-side or through public open-source APIs. Download
              history is stored locally in your browser only.{' '}
              <strong className="text-amber-500">
                ⚠️ Only download content you own or have permission to use.
              </strong>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
