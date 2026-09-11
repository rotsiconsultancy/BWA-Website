export type QuizQuestion = { id: string; title: string; options: string[] };
export const quizQuestions: QuizQuestion[] = [
  {
    id: "style",
    title: "Which one feels most like you?",
    options: [
      "Quiet & grounded",
      "Bold & confident",
      "Clean & refined",
      "Free & natural",
    ],
  },
  {
    id: "look",
    title: "Which style draws you in?",
    options: [
      "Dark & understated",
      "Earthy & natural",
      "Clean & minimal",
      "Rich & expressive",
    ],
  },
  {
    id: "express",
    title: "What would you like your bracelet to express?",
    options: [
      "Grounding",
      "Confidence",
      "Balance",
      "Individuality",
      "Connection",
      "Style",
    ],
  },
  {
    id: "wear",
    title: "Where do you see yourself wearing it most?",
    options: [
      "Every day",
      "Work & business",
      "Casual & weekend",
      "Evenings & occasions",
      "A little of everything",
    ],
  },
  {
    id: "palette",
    title: "Which palette feels most like you?",
    options: [
      "Dark & deep",
      "Earth & warm",
      "Light & neutral",
      "Mixed & textured",
      "Surprise me",
    ],
  },
  {
    id: "priority",
    title: "When choosing a bracelet, what matters most?",
    options: [
      "How it looks",
      "How it feels",
      "What it represents",
      "The materials",
      "How versatile it is",
      "The story behind it",
    ],
  },
];
