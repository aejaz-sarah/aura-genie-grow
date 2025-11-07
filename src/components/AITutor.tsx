import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmotion } from '@/context/EmotionContext';
import { fadeIn, staggerContainer } from '@/utils/motion';
import AvatarViewer from "./AvatarViewer";

// ✅ Use only YOUR avatar
const avatarLinks = [
  "https://models.readyplayer.me/690dfa43786317131c82d478.glb"
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ✅ Gemini server call
async function callGeminiServerSide(prompt: string): Promise<string> {
  try {
    const res = await fetch("http://localhost:5000/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    return data.reply || "No response from Genie.";
  } catch (err: any) {
    console.error("Error contacting backend:", err);
    return "Genie had trouble responding. Please try again later.";
  }
}

const AITutor = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm GENIE, your AI companion. Pick an avatar and let's talk!" },
  ]);
  const [input, setInput] = useState('');
  const { currentEmotion } = useEmotion();
  
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(avatarLinks[0]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setMessages(prev => [...prev, { role: 'assistant', content: 'Genie is thinking...' }]);

    try {
      const mood = currentEmotion || 'neutral';
      const prompt = `You are GENIE, user's mood: ${mood}. User asked: "${input}"`;
      const replyText = await callGeminiServerSide(prompt);

      setMessages(prev => {
        const withoutThinking = prev.filter(m => m.content !== 'Genie is thinking...');
        return [...withoutThinking, { role: 'assistant', content: replyText }];
      });
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops — Genie had trouble responding.' }]);
    } finally {
      setInput('');
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      
      {/* --- Avatar Section --- */}
      <AvatarViewer avatarUrl={selectedAvatarUrl} />
      
      {/* Avatar Selection Buttons */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {avatarLinks.map((url, index) => (
          <Button
            key={index}
            variant={selectedAvatarUrl === url ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedAvatarUrl(url)}
          >
            Avatar {index + 1}
          </Button>
        ))}
      </div>
      {/* --- End of Avatar Section --- */}

      {/* Chat Messages */}
      <motion.div 
        className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2" 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show"
      >
        {messages.map((message, index) => (
          <motion.div 
            key={index} 
            variants={fadeIn('up', index * 0.1)} 
            className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-primary/20' : 'bg-secondary/20'}`}>
              {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl ${message.role === 'user' ? 'bg-primary/10 border border-primary/20' : 'bg-card border border-border'}`}>
              <p className="text-sm">{message.content}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Input Section */}
      <div className="flex gap-2">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} 
          placeholder="Type your message..." 
          className="flex-1"
        />
        <Button onClick={handleSend} size="icon">
          <Send className="w-4 h-4"/>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Current emotion: <span className="text-primary capitalize">{currentEmotion}</span>
      </p>
    </div>
  );
};

export default AITutor;