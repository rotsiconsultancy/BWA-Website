import type { QuizAnswer } from "@/lib/commerce/recommendations";

export type DiscoveryQuestion = {
  key: string;
  title: string;
  caption: string;
  required: boolean;
  options: QuizAnswer[];
};

export type PublishedQuiz = {
  id: string;
  title: string;
  questions: DiscoveryQuestion[];
};
