import { customPieceUrl } from "./custom-piece";

export type FaqItem = {
  question: string;
  answer: string;
  link?: { href: string; label: string };
};

// Answers stick to what the site already promises (checkout, terms, returns).
// Do not add delivery times, guarantees or material claims without the owner.
export const shoppingFaqs: FaqItem[] = [
  {
    question: "How do I order a bracelet?",
    answer:
      "Choose your bracelet and size, add it to your bag and place your order. WhatsApp then opens with your order already written: press Send, and we confirm payment and delivery with you there.",
  },
  {
    question: "How do I pay?",
    answer:
      "We confirm payment with you on WhatsApp, by M-Pesa or bank transfer. Payment is made before your order is dispatched.",
  },
  {
    question: "How much is delivery in Kenya?",
    answer:
      "Doorstep delivery within Nairobi costs the same as an Uber or Bolt ride to your location. Outside Nairobi, include your location when you order and we confirm the delivery cost with you on WhatsApp. You can also collect your order from BWA for free.",
  },
  {
    question: "Which size should I choose?",
    answer:
      "Wrap a tape measure or a piece of string snugly around your wrist and add 1 to 2 cm for a comfortable fit. Our sizes are Small (16 cm), Medium (18 cm) and Large (20 cm), and some pieces are adjustable. Not sure? Message us on WhatsApp and we will help.",
  },
  {
    question: "Can I return or exchange my bracelet?",
    answer:
      "Yes. Contact us within 7 days of delivery to return or exchange an unworn piece.",
    link: { href: "/returns", label: "Read the returns policy" },
  },
  {
    question: "How do I care for my bracelet?",
    answer:
      "Take it off before swimming, showering or training, keep it away from perfume and lotions, and store it somewhere dry. A soft dry cloth is all it needs to clean.",
  },
  {
    question: "Can I buy BWA bracelets in a shop?",
    answer:
      "Yes. Our display is at ManCave, Mwanzi Market (1st floor), where you can try the bracelets on. ManCave's Nairobi Street Kitchen and Kitengela (Danka Plaza, 2nd floor) branches can also get them for you.",
    link: { href: "/stockists", label: "Get directions" },
  },
  {
    question: "Can you make a custom bracelet?",
    answer:
      "Yes. Tell us the feeling, colours and wrist size you have in mind on WhatsApp and we will design a piece with you.",
    link: { href: customPieceUrl(), label: "Ask on WhatsApp" },
  },
];
