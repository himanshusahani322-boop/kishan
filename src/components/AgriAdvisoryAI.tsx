import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Sprout, 
  HelpCircle, 
  Newspaper, 
  ExternalLink, 
  ShieldCheck, 
  User, 
  CornerDownLeft,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AgriNewsArticle } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AgriAdvisoryAI: React.FC = () => {
  const { language, currentUser } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'ai',
      text: language === 'hi'
        ? `नमस्ते ${currentUser.name} जी! मैं किसान साथी AI कृषि सलाहकार हूँ। आप मुझसे फसल रोग, खाद की मात्रा, आज के मंडी भाव के रुझान, मौसम सलाह या सरकारी योजनाओं (PM-KISAN, e-NAM, AIF) के बारे में कोई भी प्रश्न पूछ सकते हैं।`
        : `Namaste ${currentUser.name}! I am your Kisan Saathi AI Krishi Advisor. Ask me anything about crop diseases, bio-fertilizer dosages, mandi price movements, weather advice, or Central/State agricultural subsidy schemes.`
      ,
      timestamp: 'Just now'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agriArticles, setAgriArticles] = useState<AgriNewsArticle[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.articles)) {
          const mapped: AgriNewsArticle[] = data.articles.map((a: any) => ({
            id: a.id,
            title: a.title,
            category: a.category,
            summary: a.summary,
            impact: a.farmerImpactSummary || 'High relevance for kharif and rabi crop planning',
            date: new Date(a.publishedAt).toLocaleDateString(),
            source: a.sourceAgency || 'ICAR & Ministry of Agriculture',
            url: '#'
          }));
          setAgriArticles(mapped);
        }
      })
      .catch(err => console.warn('Articles fetch error:', err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sampleQuestions = language === 'hi' ? [
    'गेहूं में पीले रतुआ (Yellow Rust) के लक्षण और सटीक कीटनाशक?',
    'नासिक और लासलगांव में प्याज के भाव का अगले 15 दिन का अनुमान?',
    'सोयाबीन और मूंगफली की बुवाई के समय सही बीजोपचार की विधि?',
    'कृषि अवसंरचना कोष (AIF) में 3% ब्याज छूट का लाभ कैसे लें?'
  ] : [
    'How to prevent Yellow Rust and fungal blast in Wheat?',
    'What is the next 15-day price projection for Garwa Red Onion?',
    'Recommended fertilizer NPK schedule for Basmati Rice?',
    'How can our FPO apply for the Agriculture Infrastructure Fund (AIF)?'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          language,
          userName: currentUser.name,
          userRole: currentUser.role,
          userDistrict: currentUser.location.district,
          userState: currentUser.location.state
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('API route returned error');
      }
    } catch (err) {
      // Fallback local expert guidance in case Gemini API key is missing or server is starting
      const fallbackReplies: { [key: string]: string } = {
        default: language === 'hi'
          ? `सलाह: आपकी समस्या के समाधान के लिए कृषि विज्ञान केंद्र (KVK) के अनुसार अनुशंसित उपाय: \n1. खेत में उचित जल निकासी रखें। \n2. कवकनाशी या कीटनाशक का छिड़काव हमेशा सुबह या शाम के समय करें। \n3. मिट्टी परीक्षण (Soil Health Card) के आधार पर ही यूरिया और पोटाश का प्रयोग करें। किसी भी रासायनिक छिड़काव से पहले 500 लीटर पानी प्रति हेक्टेयर का अनुपात अवश्य रखें।`
          : `Advisory: Based on standard ICAR agronomic research: \n1. Maintain balanced irrigation to prevent soil-borne fungal pathogens. \n2. Always apply foliar sprays during early morning or late afternoon to avoid photo-degradation. \n3. Apply micronutrients (Zinc Sulfate 21% @ 10kg/acre) along with basal fertilizer to maximize crop vigor.`
      };

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: fallbackReplies.default,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold tracking-wide uppercase border border-amber-500/30">
            <Bot className="w-3.5 h-3.5" />
            <span>POWERED BY GEMINI 2.5 & ICAR AGRONOMY DATA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
            {language === 'hi' ? 'किसान साथी AI कृषि मित्र' : 'Kisan Saathi Krishi AI Advisory'}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Instant agronomic intelligence in Hindi and English: crop pest diagnosis, mandi price benchmarks, seed and fertilizer prescriptions, and central government subsidies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Advisory Interface (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Kisan Saathi Krishi AI</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online • Regional Agro-Advisory Engine</span>
                </div>
              </div>
            </div>

            <span className="text-[11px] text-stone-400 font-medium">
              Location: {currentUser.location.district}, {currentUser.location.state}
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sprout className="w-4 h-4 text-emerald-200" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-xs shadow-xs'
                      : 'bg-stone-100/90 text-stone-800 rounded-tl-xs border border-stone-200/80 leading-relaxed'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs sm:text-[13px]">{msg.text}</p>
                  <span className={`block text-[10px] text-right ${msg.sender === 'user' ? 'text-emerald-200' : 'text-stone-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                </div>
                <div className="p-3 bg-stone-100 rounded-xl text-stone-500 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                  <span>Consulting ICAR agronomy database and Mandi Bhav models...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompt suggestions */}
          <div className="p-2.5 bg-stone-50 border-t border-stone-200 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={language === 'hi' ? 'अपनी फ़सल, रोग या मंडी भाव के बारे में पूछें...' : 'Ask about crop health, dosage, weather, or mandi prices...'}
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputQuery.trim()}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Agriculture News & Policy Bulletins (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-emerald-700" />
                <h3 className="font-extrabold text-stone-900 text-sm font-display">
                  National Agri News & Schemes
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                Live Feed
              </span>
            </div>

            <div className="space-y-3.5">
              {agriArticles.map(news => (
                <div 
                  key={news.id} 
                  className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50/50 transition-colors space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider">{news.category}</span>
                    <span>{news.date}</span>
                  </div>
                  <h4 className="font-bold text-stone-900 leading-snug">{news.title}</h4>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{news.summary}</p>
                  <div className="pt-1 text-[11px] text-stone-700 bg-white p-2 rounded border border-stone-200 font-medium">
                    <strong className="text-emerald-800">Farmer Impact:</strong> {news.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
