import FindYourBracelet, {
  fallbackQuestions,
} from "@/components/discovery/FindYourBracelet";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { getPublishedQuiz } from "@/lib/commerce/quiz-server";

export const dynamic = "force-dynamic";

export default async function FindYourBraceletPage() {
  const [quiz, products] = await Promise.all([
    getPublishedQuiz(),
    getStorefrontCatalogue(),
  ]);
  return (
    <FindYourBracelet
      products={products}
      questions={quiz?.questions || fallbackQuestions}
    />
  );
}
