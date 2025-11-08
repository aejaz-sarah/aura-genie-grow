import { create } from "zustand";

type EmotionState = {
  emotion: string;
  setEmotion: (emotion: string) => void;
  updateEmotion: (emotion: string) => void;
};

export const useEmotion = create<EmotionState>((set) => ({
  emotion: "",
  setEmotion: (emotion) => set({ emotion }),
  updateEmotion: (emotion) => set({ emotion }),
}));