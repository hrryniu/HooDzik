'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Dumbbell, Apple, TrendingUp, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

export default function AIAssistantTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Cześć! Jestem Twoim osobistym trenerem AI i ekspertem ds. żywienia. Mogę pomóc Ci w:\n\n• Planowaniu treningów dostosowanych do Twoich celów\n• Tworzeniu zdrowych planów dietetycznych\n• Analizie postępów i sugestii ulepszeń\n• Odpowiedziach na pytania o zdrowie i fitness\n\nJak mogę Ci dzisiaj pomóc?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userProfile = useStore((state) => state.userProfile);
  const theme = useStore((state) => state.theme);
  const getLatestWeight = useStore((state) => state.getLatestWeight);
  const getBMI = useStore((state) => state.getBMI);
  const getBMR = useStore((state) => state.getBMR);

  const quickActions: QuickAction[] = [
    {
      icon: <Dumbbell className="w-4 h-4" />,
      label: 'Plan treningu',
      prompt: 'Stwórz dla mnie plan treningowy na ten tydzień',
    },
    {
      icon: <Apple className="w-4 h-4" />,
      label: 'Dieta',
      prompt: 'Zaproponuj mi zdrowy jadłospis na dziś',
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Analiza postępów',
      prompt: 'Przeanalizuj moje postępy i daj mi rady',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Porady na dziś',
      prompt: 'Jakie porady masz dla mnie na dzisiaj?',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulated AI response - w produkcji można podłączyć prawdziwe API (OpenAI, Claude, etc.)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const latestWeight = getLatestWeight();
    const bmi = getBMI();
    const bmr = getBMR();

    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('trening') || lowerMessage.includes('ćwicz') || lowerMessage.includes('plan')) {
      return `Doskonale! Na podstawie Twoich parametrów (waga: ${latestWeight.toFixed(1)}kg, wzrost: ${userProfile.height}cm, cel: ${userProfile.targetWeight}kg) proponuję następujący plan treningowy:\n\n**Poniedziałek - Trening siłowy (górna partia)**\n• Wyciskanie sztangi na ławce: 4x8-10\n• Wiosłowanie sztangą: 4x8-10\n• Wyciskanie nad głowę: 3x10-12\n• Podciąganie: 3x max\n• Biceps z hantlami: 3x12\n• Triceps na wyciągu: 3x12\n\n**Środa - Cardio i core**\n• Bieganie interwałowe: 30 min\n• Plank: 3x60s\n• Brzuszki: 3x20\n• Russian twists: 3x30\n\n**Piątek - Trening siłowy (dolna partia)**\n• Przysiady: 4x8-10\n• Martwy ciąg: 4x6-8\n• Wypychanie nóg: 3x12\n• Wypady: 3x10/noga\n• Łydki: 4x15\n\nPamiętaj o rozgrzewce przed każdym treningiem i stretching po!`;
    }

    if (lowerMessage.includes('diet') || lowerMessage.includes('jadłospis') || lowerMessage.includes('jedzenie') || lowerMessage.includes('kalorie')) {
      const targetCalories = Math.round(bmr * 1.5);
      return `Na podstawie Twojej przemiany materii (BMR: ${Math.round(bmr)} kcal), proponuję dzienny jadłospis z ${targetCalories} kcal:\n\n**Śniadanie (${Math.round(targetCalories * 0.3)} kcal)**\n• Owsianka z owocami i orzechami\n• 2 jajka na twardo\n• Sok pomarańczowy\n\n**Lunch (${Math.round(targetCalories * 0.35)} kcal)**\n• Grillowana pierś z kurczaka (200g)\n• Brązowy ryż (150g)\n• Surówka z warzyw\n• Oliwa z oliwek\n\n**Obiad (${Math.round(targetCalories * 0.25)} kcal)**\n• Łosoś pieczony (180g)\n• Ziemniaki pieczone (150g)\n• Brokuły gotowane\n\n**Przekąski (${Math.round(targetCalories * 0.1)} kcal)**\n• Orzechy (30g)\n• Jogurt grecki z owocami\n\nPamiętaj o piciu min. 2-3L wody dziennie!`;
    }

    if (lowerMessage.includes('postęp') || lowerMessage.includes('analiz') || lowerMessage.includes('wynik')) {
      const weightDiff = latestWeight - userProfile.targetWeight;
      const bmiStatus = bmi < 18.5 ? 'niedowaga' : bmi < 25 ? 'prawidłowa waga' : bmi < 30 ? 'nadwaga' : 'otyłość';
      
      return `Przeanalizowałem Twoje dane:\n\n**Aktualne statystyki:**\n• BMI: ${bmi.toFixed(1)} (${bmiStatus})\n• Obecna waga: ${latestWeight.toFixed(1)}kg\n• Cel: ${userProfile.targetWeight}kg\n• Do osiągnięcia: ${Math.abs(weightDiff).toFixed(1)}kg\n\n**Moje rekomendacje:**\n${weightDiff > 0 ? 
      `• Deficyt kaloryczny ~500 kcal dziennie (zdrowa utrata wagi 0.5-1kg/tydz)\n• Trening cardio 3-4x w tygodniu\n• Trening siłowy 2-3x w tygodniu (utrzymanie masy mięśniowej)\n• Wysokobiałkowa dieta (1.6-2g białka/kg masy ciała)` :
      `• Nadwyżka kaloryczna ~300-500 kcal dziennie\n• Intensywny trening siłowy 4-5x w tygodniu\n• Ograniczone cardio\n• Wysokobiałkowa dieta (2-2.5g białka/kg masy ciała)`
    }\n\nJesteś na dobrej drodze! Konsekwencja to klucz do sukcesu! 💪`;
    }

    if (lowerMessage.includes('motywacja') || lowerMessage.includes('rada') || lowerMessage.includes('porad')) {
      const tips = [
        'Pamiętaj: każdy ekspert był kiedyś początkującym. Twoja konsekwencja dzisiaj to Twój sukces jutro!',
        'Nie porównuj się z innymi - porównuj się z sobą sprzed tygodnia, miesiąca, roku. To Twoja osobista podróż!',
        'Dieta to 70% sukcesu, trening to 30%. Nie możesz "przetrenować" złej diety!',
        'Odpoczynek jest równie ważny jak trening. Mięśnie rosną podczas regeneracji, nie podczas ćwiczeń!',
        'Hydratacja jest kluczowa - Twoje ciało to w 60% woda. Pij minimum 2-3L dziennie!',
      ];
      return tips[Math.floor(Math.random() * tips.length)] + '\n\nCzy mogę pomóc Ci w czymś konkretnym? Mogę zaplanować trening, dietę lub przeanalizować Twoje postępy!';
    }

    // Default response
    return `Rozumiem! Mogę pomóc Ci w wielu kwestiach związanych z treningiem i dietą:\n\n• **Planowanie treningów** - dostosowane do Twojego poziomu i celów\n• **Plany dietetyczne** - zbilansowane posiłki dla Twoich potrzeb\n• **Analizy postępów** - ocena Twoich wyników i sugestie\n• **Porady żywieniowe** - co jeść przed/po treningu\n• **Motywacja** - wsparcie w trudnych chwilach\n\nCzy mogę pomóc Ci w którymś z tych obszarów?`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateAIResponse(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const isDark = theme === 'dark';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`${isDark ? 'bg-dark-lighter border-dark-accent' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Asystent AI
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Twój osobisty trener i dietetyk
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${isDark ? 'bg-dark-lighter border-dark-accent' : 'bg-gray-50 border-gray-200'} border-b px-6 py-4`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.prompt)}
              className={`${
                isDark 
                  ? 'bg-dark-card hover:bg-dark-accent text-gray-300' 
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              } border ${isDark ? 'border-dark-accent' : 'border-gray-200'} rounded-lg p-3 flex items-center gap-2 transition-colors`}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto px-6 py-4 space-y-4 ${isDark ? 'bg-dark-bg' : 'bg-gray-50'}`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-neon-blue to-neon-green text-white'
                  : isDark
                  ? 'bg-dark-card border border-dark-accent text-gray-200'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className={`text-xs mt-1 block ${
                message.role === 'user' ? 'text-white/70' : isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString('pl-PL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`${isDark ? 'bg-dark-card border-dark-accent' : 'bg-white border-gray-200'} border rounded-2xl px-4 py-3`}>
              <div className="flex gap-1">
                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-neon-blue' : 'bg-blue-500'} animate-bounce`} style={{ animationDelay: '0ms' }} />
                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-neon-blue' : 'bg-blue-500'} animate-bounce`} style={{ animationDelay: '150ms' }} />
                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-neon-blue' : 'bg-blue-500'} animate-bounce`} style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`${isDark ? 'bg-dark-lighter border-dark-accent' : 'bg-white border-gray-200'} border-t px-6 py-4`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Zadaj pytanie o trening lub dietę..."
            disabled={isLoading}
            className={`flex-1 ${
              isDark 
                ? 'bg-dark-card border-dark-accent text-white placeholder-gray-500' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
            } border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-neon-blue to-neon-green text-white rounded-lg px-6 py-3 flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            <span className="font-medium">Wyślij</span>
          </button>
        </div>
      </div>
    </div>
  );
}



