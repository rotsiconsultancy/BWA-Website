import { catalogue } from "@/lib/commerce/catalogue";
import type { CommerceProduct } from "@/lib/commerce/types";

export type QuizAnswer = {
  key: string;
  value: string;
  weights: Record<string, number>;
};

const matches = (product: CommerceProduct, token: string) => {
  const [field, value] = token.split(":");
  const values = product[field as keyof CommerceProduct];
  return Array.isArray(values) && (values as string[]).includes(value);
};

export function recommendProducts(answers: QuizAnswer[]) {
  return catalogue
    .filter(
      (product) =>
        product.active &&
        product.variants.some(
          (variant) => variant.available && variant.stock > 0,
        ),
    )
    .map((product) => {
      const score = answers.reduce(
        (total, answer) =>
          total +
          Object.entries(answer.weights).reduce(
            (subtotal, [token, weight]) =>
              subtotal + (matches(product, token) ? weight : 0),
            0,
          ),
        0,
      );
      return { product, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.product.featured) - Number(a.product.featured),
    );
}
