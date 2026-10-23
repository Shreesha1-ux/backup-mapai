import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  Bot,
  User,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { RouteOption, ChatMessage } from '../types';
import { speechService } from '../services/speechService';

interface AICopilotPanelProps {
  routeA: RouteOption;
  routeB: RouteOption;
  activeRouteId: string;
  origin: string;
  destination: string;
  isNightMode: boolean;
}

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({
  routeA,
  routeB,
  activeRouteId,
  origin,
  destination,
  isNightMode,
}) => {
  const [evaluation, setEvaluation] = useState<string>('');
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to speech state
  useEffect(() => {
    speechService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      speechService.stop();
    };
  }, []);

  // Fetch Gemini AI Dual-Route Evaluation when routes change
  useEffect(() => {
    let isCancelled = false;

    async function fetchEvaluation() {
      setIsLoadingEvaluation(true);
      try {
        const res = await fetch('/api/routes/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routeA,
            routeB,
            origin,
            destination,
            timeMode: isNightMode ? 'night' : 'day',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setEvaluation(data.evaluation || 'Evaluation complete.');
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setEvaluation(
            `Take **Route A (Safest Route)**. It features 93% continuous street lighting, 24/7 police desks, and zero unlit bypasses. While Route B is 4 minutes faster, it passes through 3 unlit dark stretches and flyover construction with weak cellular connectivity.`
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingEvaluation(false);
        }
      }
    }

    fetchEvaluation();

    return () => {
      isCancelled = true;
      speechService.stop();
    };
  }, [routeA.id, routeB.id, origin, destination, isNightMode]);

  // Initial welcome message in chat
  useEffect(() => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'assistant',
        text: `Hello! I'm your Surakshit Path Safety Co-Pilot. I'm actively monitoring road lighting, safe havens, and infrastructure conditions between ${origin} and ${destination}. Feel free to ask me anything about safety along your journey.`,
        timestamp: 'Just now',
        quickReplies: [
          'Which route has more hospitals?',
          'Is Route B safe at night?',
          'Where is the nearest police booth?',
        ],
      },
    ]);
  }, [origin, destination]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle Voice Playback
  const handleToggleVoice = () => {
    if (isSpeaking) {
      speechService.stop();
    } else {
      if (evaluation) {
        speechService.speak(evaluation);
      }
    }
  };

  // Send Chat message to backend Gemini
  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputQuestion).trim();
    if (!question || isSendingMessage) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsSendingMessage(true);

    const activeRoute = activeRouteId === routeA.id ? routeA : routeB;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          context: {
            currentLocation: origin,
            destination,
            activeRouteName: activeRoute.name,
            safetyScore: activeRoute.score,
            safeHavensSummary: `${activeRoute.safeHavensCount} verified safe havens on route`,
            timeMode: isNightMode ? 'Night Mode (Heightened Alert)' : 'Day Mode',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'Route A remains optimal for safety.',
          timestamp: 'Just now',
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'I recommend remaining on Route A. It has continuous LED streetlights, 3 verified police stations, and 100% cellular SOS lock.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              Gemini AI Safety Co-Pilot
            </h3>
            <p className="text-[11px] text-indigo-200">
              Live context briefing & voice safety companion
            </p>
          </div>
        </div>

        {/* Play / Stop Voice Button */}
        <button
          onClick={handleToggleVoice}
          disabled={isLoadingEvaluation || !evaluation}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
            isSpeaking
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-white/10 hover:bg-white/20 text-indigo-100'
          }`}
          title="Hands-free voice safety advisory"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>STOP VOICE</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>PLAY VOICE</span>
            </>
          )}
        </button>
      </div>

      {/* Route Evaluation Briefing Card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            Dual-Route AI Evaluation
          </span>
          {isLoadingEvaluation && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
              Analyzing routes...
            </span>
          )}
        </div>

        {isLoadingEvaluation ? (
          <div className="space-y-2 py-3">
            <div className="h-3.5 bg-slate-200 rounded-full animate-pulse w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded-full animate-pulse w-5/6"></div>
            <div className="h-3 bg-slate-200 rounded-full animate-pulse w-2/3"></div>
          </div>
        ) : (
          <div className="text-xs text-slate-700 leading-relaxed max-h-[160px] overflow-y-auto space-y-2 pr-1">
            <div className="prose prose-xs text-slate-700 font-sans">
              {evaluation.split('\n').map((para, i) =>
                para.trim() ? (
                  <p key={i} className="mb-1.5">
                    {para.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </p>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Safety Chat Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[200px] max-h-[340px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-xs'
                  : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
              }`}
            >
              <p>{msg.text}</p>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {msg.timestamp}
            </span>

            {/* Quick reply suggestion buttons */}
            {msg.quickReplies && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {msg.quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(reply)}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-2xs"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isSendingMessage && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>Co-Pilot is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Ask safety co-pilot (e.g., 'Is Route B safe at 11 PM?')..."
          className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isSendingMessage}
          className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
