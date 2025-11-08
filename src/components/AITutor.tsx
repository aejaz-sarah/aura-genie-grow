import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmotion } from "@/store/useEmotion"; // ✅ Correct Zustand import
import { fadeIn, staggerContainer } from "@/utils/motion";
import AvatarViewer from "./AvatarViewer";
import { useNavigate } from "react-router-dom"; // ✅ For navigation

// ✅ Avatar link
const avatarLinks = [
  "https://models.readyplayer.me/690dfa43786317131c82d478.glb",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ✅ GROQ API Call
async function callGroqAPI(prompt: string): Promise<string> {
  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    return data.answer || "No response from Genie.";
  } catch (err: any) {
    console.error("Error contacting backend:", err);
    return "Genie had trouble responding. Please try again later.";
  }
}

// ✅ Emotion-based tone enhancer
function getEmotionTone(emotion: string): string {
  const tones: Record<string, string[]> = {
    happy: [
      "😊 I’m glad to see you happy!",
      "That’s awesome! Let’s keep the good vibes going!",
      "You’re glowing with positivity today!",
    ],
    sad: [
      "Hey, it’s okay to feel down sometimes.",
      "💙 Remember, tough times don’t last forever.",
      "I’m here for you — want to talk about it?",
    ],
    angry: [
      "😤 I sense some frustration — let’s take a deep breath first.",
      "Hey, it’s okay to be upset. Let’s figure this out calmly.",
      "I understand you’re angry — let’s fix it together.",
    ],
    surprised: [
      "😲 That’s surprising indeed!",
      "Wow! Didn’t expect that, did you?",
      "Whoa — that caught me off guard too!",
    ],
    neutral: ["🙂 Got it!", "Okay, let’s see how I can help you.", "Sure thing!"],
    fearful: [
      "😨 Don’t worry, you’re safe here.",
      "It’s okay to be scared — I’ll help you through it.",
      "We can take it slow together, no rush.",
    ],
    disgusted: [
      "😬 That doesn’t sound pleasant.",
      "Ugh, I get why that feels gross!",
      "That’s definitely not ideal — let’s fix it.",
    ],
  };

  const list = tones[emotion] || tones["neutral"];
  return list[Math.floor(Math.random() * list.length)];
}

const AITutor = () => {
  const navigate = useNavigate(); // ✅ For Back to Explore navigation
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "✨ Hi! I'm GENIE, your AI companion. Pick an avatar and let's chat!",
    },
  ]);
  const [input, setInput] = useState("");
  const { emotion } = useEmotion(); // ✅ Zustand emotion store
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(avatarLinks[0]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", content: "Genie is thinking..." },
    ]);

    try {
      const mood = emotion || "neutral";
      const prompt = `You are GENIE, an AI tutor. 
User's current emotion is "${mood}". 
Respond naturally and intelligently to this question: "${input}". 
Keep your tone slightly adapted to their emotion, but always provide a helpful and factual answer.`;

      const replyText = await callGroqAPI(prompt);
      const emotionTone = getEmotionTone(mood);
      const finalReply = `${emotionTone}\n\n${replyText}`;

      setMessages((prev) => {
        const withoutThinking = prev.filter(
          (m) => m.content !== "Genie is thinking..."
        );
        return [...withoutThinking, { role: "assistant", content: finalReply }];
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops — Genie had trouble responding." },
      ]);
    } finally {
      setInput("");
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      {/* --- Back to Explore Button --- */}
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/explore")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Button>
      </div>

      {/* --- Avatar Section --- */}
      <AvatarViewer avatarUrl={selectedAvatarUrl} />

      {/* Avatar Selection */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {avatarLinks.map((url, index) => (
          <Button
            key={index}
            variant={selectedAvatarUrl === url ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedAvatarUrl(url)}
          >
            Avatar {index + 1}
          </Button>
        ))}
      </div>

      {/* --- Chat Messages --- */}
      <motion.div
        className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {messages.map((message, index) => (
          <motion.div
            key={index}
            variants={fadeIn("up", index * 0.1)}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`p-2 rounded-full ${
                message.role === "user" ? "bg-primary/20" : "bg-secondary/20"
              }`}
            >
              {message.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.role === "user"
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-card border border-border"
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.content}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* --- Input Section --- */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) =>
            e.key === "Enter" && !e.shiftKey && handleSend()
          }
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button onClick={handleSend} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        <strong>Current Emotion:</strong>{" "}
        <span className="text-primary capitalize font-semibold">
          {emotion || "neutral"}
        </span>
      </p>
    </div>
  );
};

export default AITutor;
