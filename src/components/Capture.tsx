import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, AlertCircle } from 'lucide-react';
import { Task, EnergyLevel, ConsequenceLevel, LeverageLevel } from '../types';
import { inferMetadata } from '../data';
import { Language, t, translatePersonName } from '../i18n';

interface CaptureProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdDate' | 'buried' | 'state'>) => string; // returns created task ID
  onUpdateTaskPerson: (taskId: string, person: string) => void;
  directions: { id: string; name: string; active: boolean }[];
  people: string[];
  lang: Language;
}

export default function Capture({ onAddTask, onUpdateTaskPerson, directions, people, lang }: CaptureProps) {
  const [title, setTitle] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [justParkedTaskId, setJustParkedTaskId] = useState<string | null>(null);
  const [parkedTitle, setParkedTitle] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  // Voice input support check
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechSupport(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'ru' ? 'ru-RU' : 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setTitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handlePark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Infer meta from title
    const { energy, directionId } = inferMetadata(title, directions);

    // Add task to backlog (frozen)
    const newId = onAddTask({
      title: title.trim(),
      energy,
      directionId,
      consequence: 'minor', // Default is minor, engine recalculates if customized
      leverageLevel: 'neutral',
      daydreamAnticipation: 2
    });

    setParkedTitle(title.trim());
    setJustParkedTaskId(newId);
    setTitle('');
    setStatusMessage(t(lang, 'parkedAndFrozen'));

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handlePersonSelect = (person: string) => {
    if (justParkedTaskId) {
      onUpdateTaskPerson(justParkedTaskId, person);
      setJustParkedTaskId(null);
      const localizedPerson = translatePersonName(person, lang);
      setStatusMessage(t(lang, 'parkedAndConnected', { person: localizedPerson }));
      
      // Clear status message after delay
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    }
  };

  return (
    <div id="capture-container" className="max-w-xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-10">
        <h1 id="capture-title" className="text-3xl font-sans font-medium tracking-tight text-neutral-100">
          {t(lang, 'captureTitle')}
        </h1>
        <p id="capture-subtitle" className="mt-3 text-sm text-neutral-400 font-mono tracking-wide leading-relaxed">
          {t(lang, 'captureSubtitle')}
        </p>
      </div>

      {!justParkedTaskId ? (
        <form onSubmit={handlePark} id="capture-form" className="space-y-6">
          <div className="relative rounded-lg shadow-sm">
            <input
              type="text"
              id="task-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t(lang, 'taskInputPlaceholder')}
              className="block w-full rounded-md border-0 py-4 pl-4 pr-12 bg-neutral-900 text-neutral-100 ring-1 ring-inset ring-neutral-800 placeholder:text-neutral-500 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-base focus:outline-none"
              required
              autoFocus
              maxLength={200}
            />
            {hasSpeechSupport && (
              <button
                type="button"
                id="voice-input-btn"
                onClick={toggleListening}
                className={`absolute inset-y-0 right-0 flex items-center pr-4 transition-colors ${
                  isListening ? 'text-amber-500 animate-pulse' : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title={isListening ? t(lang, 'listening') : t(lang, 'tapToSpeak')}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Mic className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              id="park-btn"
              disabled={!title.trim()}
              className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-md text-sm font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 focus:ring-amber-500 disabled:opacity-30 disabled:hover:bg-amber-500 transition-colors tracking-wide uppercase"
            >
              {t(lang, 'parkIt')}
            </button>
          </div>
        </form>
      ) : (
        <div id="affected-question-box" className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-500 mb-1">
              <Check className="h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">{t(lang, 'silentConfirmation')}</span>
            </div>
            <p className="font-sans text-sm text-neutral-300 italic">
              {lang === 'ru' ? `«${parkedTitle}» сохранено без шума.` : `"${parkedTitle}" stored quietly.`}
            </p>
          </div>

          <div className="border-t border-neutral-800 pt-5 space-y-3">
            <h3 className="text-sm font-sans font-medium text-neutral-200">
              {t(lang, 'affectedQuestion')}
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              {t(lang, 'affectedDesc')}
            </p>

            <div id="people-options-grid" className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-3">
              {people.map((person) => (
                <button
                  key={person}
                  type="button"
                  id={`affected-person-${person}`}
                  onClick={() => handlePersonSelect(person)}
                  className="rounded px-3 py-2.5 text-xs font-mono tracking-wide text-neutral-300 bg-neutral-950 border border-neutral-800 hover:border-amber-500 hover:text-amber-400 transition-colors uppercase text-center"
                >
                  {translatePersonName(person, lang)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div id="status-alert-box" className="mt-8 flex items-center justify-center space-x-2 text-neutral-500 font-mono text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
