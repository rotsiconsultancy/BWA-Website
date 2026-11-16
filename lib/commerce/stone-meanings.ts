/**
 * Stone meanings: what each stone is, what people have believed about it,
 * how to wear it, and a closing line that pairs a look with the belief.
 *
 * Source: the owner's customer guide (Assets/stones/guides/build_sales.py,
 * 2026-11-14) and Assets/stones/stone-beliefs-research.md. On the website the
 * guide's health-adjacent lines (circulation, "eased eye and liver troubles",
 * "stop bleeding", bites) and the religious aqeeq line are left out.
 *
 * Rules: every belief names a place and time, or says "today". No health
 * claims. A close describes the stone, never claims the bead is ancient or
 * comes from the place in the story.
 */

import { isProductSlug } from "@/lib/commerce/product-redirects";
import type { CommerceProduct } from "@/lib/commerce/types";

export type StoneBelief = { where: string; what: string };

export type StoneMeaning = {
  /** Anchor on /stone-meanings, e.g. "tigers-eye". */
  id: string;
  name: string;
  /** Taxonomy value (lib/commerce/taxonomy.ts) shared with the stone pages. */
  stoneType: string;
  /** Short material label, e.g. "Genuine natural tiger's eye". */
  material: string;
  headline: string;
  pitch: string;
  wear: string;
  beliefs: StoneBelief[];
  /** Completes "Today, …". */
  today: string;
  /** Style + belief close; the lead bracelet's name and price follow it. */
  close: string;
  /** Bracelets in this stone, lead first (current slugs). */
  products: string[];
};

export type FeelingGroup = { title: string; stones: string[] };

export const STONE_MEANINGS_PATH = "/stone-meanings";

export const STONE_DISCLAIMER =
  "Beliefs are shared as history and culture, not as medical advice. No stone treats or cures any condition.";

export const stoneMeanings: StoneMeaning[] = [
  {
    id: "tigers-eye",
    name: "Tiger's eye",
    stoneType: "tiger_eye",
    material: "Genuine natural tiger's eye",
    headline: "Gold that moves when you move.",
    pitch:
      "Turn your wrist and a band of light slides across every bead. That's tiger's eye: warm gold and brown, and one of Africa's most famous stones, from South Africa's Northern Cape.",
    wear: "Navy suit, white shirt, steel watch. Or a plain tee on a Saturday. It works with both.",
    beliefs: [
      {
        where: "Across the Mediterranean, the Middle East, South Asia and East Africa",
        what: "many people believe in the evil eye, and wear a stone with an \"eye\" of light inside as a shield against envy and bad intentions.",
      },
    ],
    today:
      "crystal lovers call it the stone of courage, focus and confidence, and wear it for luck and prosperity because of its gold.",
    close:
      "Picture it: a navy suit, a crisp white shirt, and a band of gold light sliding across your wrist every time you reach for your pen. The stone people wear for courage.",
    products: [
      "simba-gold-tigers-eye-stone-bracelet",
      "mara-dusk-red-tigers-eye-stone-bracelet",
    ],
  },
  {
    id: "bloodstone",
    name: "Bloodstone",
    stoneType: "bloodstone",
    material: "Bloodstone",
    headline: "Dark green, with sparks of red.",
    pitch:
      "Deep green with red flecks like sparks. Roman writers said the best bloodstone came from Æthiopia, in Africa.",
    wear: "Charcoal or grey suits, white linen, earthy tones.",
    beliefs: [
      {
        where: "Ancient Rome",
        what: "some people believed bloodstone dropped into sunlit water turned the sun's reflection blood-red, and that with the right prayers it could even make its wearer invisible.",
      },
      {
        where: "Medieval Europe",
        what: "Christians saw its red spots as drops of Christ's blood.",
      },
      {
        where: "First World War Britain",
        what: "a soldier carried a bloodstone amulet into battle. It is now in London's Science Museum.",
      },
    ],
    today:
      "crystal lovers call it a stone of courage and strength under pressure. It's also the birthstone of March.",
    close:
      "Picture it: a charcoal suit on the morning of the big meeting, and on your wrist the same stone a soldier carried into battle for courage.",
    products: ["taita-spark-bloodstone-bracelet"],
  },
  {
    id: "lava-stone",
    name: "Lava stone",
    stoneType: "lava_stone",
    material: "Genuine volcanic lava stone",
    headline: "A volcano, on your wrist.",
    pitch:
      "Light, textured and full of tiny holes: every one is a gas bubble trapped the moment fire turned to rock. Black, or naturally rust-red where hot iron met air. Our lava is not dyed.",
    wear: "Black lava with a black watch for the full dark look. Rust lava to warm up denim and khaki.",
    beliefs: [
      {
        where: "Hawaiʻi",
        what: "people believe volcanic rock belongs to Pele, goddess of fire, and that taking lava rock home brings bad luck until it's returned. Packages of rock are still posted back to the national park every year.",
      },
    ],
    today:
      "crystal lovers call lava a grounding stone that keeps you steady when life moves fast. Add a drop of perfume or oil: the pores hold the scent all day.",
    close:
      "Picture it: a charcoal suit, a white shirt, and on your wrist rock that cooled under an open sky, worn for grounding when the day moves fast.",
    products: [
      "chyulu-black-lava-stone-bracelet",
      "longonot-black-lava-stone-bracelet",
      "suswa-rust-red-lava-stone-bracelet",
      "menengai-rust-red-lava-stone-bracelet",
      "moto-lava-orange-lava-stone-bracelet",
    ],
  },
  {
    id: "obsidian",
    name: "Obsidian",
    stoneType: "obsidian",
    material: "Genuine obsidian",
    headline: "Glass, made by a volcano.",
    pitch:
      "Obsidian is natural volcanic glass, and Kenya's Rift Valley is one of the richest obsidian landscapes on Earth. People here were shaping it a million years ago. Mahogany obsidian mixes glossy black with warm red-brown; snowflake obsidian is black with white flecks.",
    wear: "Rich browns, cream, gold jewellery, evening wear. It shines like a polished watch face.",
    beliefs: [
      {
        where: "Aztec Mexico",
        what: "polished obsidian mirrors belonged to Tezcatlipoca, the \"Smoking Mirror\", a god of sorcerers.",
      },
      {
        where: "Elizabethan England",
        what: "Queen Elizabeth I's adviser John Dee used an Aztec obsidian mirror to try to see spirits. It's now in the British Museum.",
      },
    ],
    today:
      "crystal lovers call obsidian a protective stone that shows you the truth about yourself. Mahogany obsidian is linked with strength and steadiness.",
    close:
      "Picture it: a dinner jacket, a gold watch, and on your wrist glass made by a Rift Valley volcano, the stone kept close for protection.",
    products: [
      "njorowa-ember-mahogany-obsidian-stone-bracelet",
      "kahawa-ember-mahogany-obsidian-stone-bracelet",
      "nelion-snow-snowflake-obsidian-stone-bracelet",
      "kinangop-frost-snowflake-obsidian-stone-chip-bracelet",
    ],
  },
  {
    id: "malachite",
    name: "Malachite",
    stoneType: "malachite",
    material: "Genuine malachite",
    headline: "The green that grew from copper.",
    pitch:
      "Rings and swirls of deep green, built layer by layer over thousands of years. Much of the world's malachite comes from Africa's Copperbelt in Congo and Zambia. Ancient Egyptians ground it into green eye paint.",
    wear: "Bold enough to wear alone. Lovely with white, gold and black.",
    beliefs: [
      {
        where: "Ancient Rome",
        what: "people believed malachite worn as an amulet guarded children and kept danger away.",
      },
      {
        where: "Europe",
        what: "parents hung malachite beads on babies' cradles to keep off evil spirits.",
      },
      {
        where: "Parts of Italy",
        what: "people wore eye-shaped malachite set in silver against the evil eye.",
      },
    ],
    today: "crystal lovers call it the stone of transformation and protection.",
    close:
      "Picture it: a white linen shirt, sleeves rolled, and a ring of deep copper green on your wrist, the stone Romans wore to keep danger away.",
    products: ["msitu-malachite-stone-bracelet"],
  },
  {
    id: "lapis-lazuli",
    name: "Lapis lazuli",
    stoneType: "lapis_lazuli",
    material: "Genuine lapis lazuli",
    headline: "The blue of pharaohs.",
    pitch:
      "Deep royal blue with flecks that shine like gold. Lapis has been mined in the mountains of Afghanistan for 6,000 years, and it's the blue around the eyes of Tutankhamun's golden mask.",
    wear: "Navy, white and gold. One lapis bracelet with a white shirt is all it takes.",
    beliefs: [
      {
        where: "Ancient Egypt",
        what: "people carved lapis into scarabs, believing they protected and renewed the wearer. Its blue was tied to the night sky and the gods.",
      },
      {
        where: "Ancient Sumer (today's Iraq)",
        what: "people believed lapis kept sadness away and guarded against evil.",
      },
    ],
    today: "crystal lovers call lapis the stone of wisdom and truth, a stone for kings.",
    close:
      "Picture it: a navy suit, a white shirt, and on your wrist the same deep blue that frames Tutankhamun's golden mask. A stone for kings.",
    products: ["watamu-deep-lapis-lazuli-stone-bracelet"],
  },
  {
    id: "sodalite",
    name: "Sodalite",
    stoneType: "sodalite",
    material: "Genuine natural sodalite",
    headline: "Calm, in two shades of blue.",
    pitch:
      "Lapis lazuli's cousin: a rich blue stone with white veins like clouds. Choose Diani Denim (blue and white, like denim on white sand) or Anga Blue (soft sky blue).",
    wear: "The easiest blue to wear: jeans, white shirts, linen, beachwear.",
    beliefs: [
      {
        where: "Royal Britain, early 1900s",
        what: "sodalite from Bancroft, Canada is said to have been chosen to decorate Marlborough House in London after the Princess of Wales admired it. It's still called \"Princess Blue\".",
      },
    ],
    today: "crystal lovers call sodalite the stone of calm, clear thinking and honest words.",
    close:
      "Picture it: jeans, a white shirt, a slow Saturday at the coast, and a blue they called Princess Blue on your wrist. The stone of a calm, clear head.",
    products: [
      "diani-denim-sodalite-stone-bracelet",
      "anga-blue-sodalite-stone-bracelet",
    ],
  },
  {
    id: "hematite",
    name: "Hematite",
    stoneType: "hematite",
    material: "Hematite",
    headline: "Iron, polished to a mirror.",
    pitch:
      "Heavy, cool and shining like polished steel. Hematite is iron oxide, and its name comes from the Greek for blood, because crushed it turns blood-red.",
    wear: "Silver watches, black and grey suits, monochrome outfits.",
    beliefs: [
      {
        where: "Ancient Rome",
        what: "some people believed hematite helped soldiers win battles. They said the best came from Ethiopia, Arabia and Africa.",
      },
      {
        where: "Ancient Greece and Rome",
        what: "warriors were said to wear hematite before battle.",
      },
    ],
    today: "crystal lovers call it the most grounding stone of all.",
    close:
      "Picture it: a grey suit, a steel watch, and polished iron on the other wrist, the stone warriors were said to wear before battle.",
    products: [
      "chuma-link-hematite-stone-bracelet",
      "chuma-facet-hematite-stone-bracelet",
    ],
  },
  {
    id: "howlite",
    name: "Howlite",
    stoneType: "howlite",
    material: "Natural howlite",
    headline: "White, with a crackle of black.",
    pitch:
      "Clean white stone traced with fine grey and black veins, like cracks in fresh snow. First described in Nova Scotia, Canada, in 1868.",
    wear: "Brilliant with all-black outfits and summer whites. A calm, clean look.",
    beliefs: [],
    today:
      "crystal lovers call howlite the stone of calm and patience, and keep it close for a quiet mind.",
    close:
      "Picture it: all black, head to toe, and one clean white line of stone on your wrist. The stone people keep close for a quiet mind.",
    products: [
      "lenana-crackle-howlite-stone-bracelet",
      "kirinyaga-cloud-white-howlite-stone-bracelet",
      "batian-white-howlite-stone-bracelet",
      "ukungu-grey-howlite-stone-bracelet",
      "sirimon-white-howlite-stone-chip-bracelet",
    ],
  },
  {
    id: "red-jasper",
    name: "Red jasper",
    stoneType: "red_jasper",
    material: "Genuine red jasper",
    headline: "The colour of Tsavo's red earth.",
    pitch:
      "Brick-red, solid and hard-wearing: red jasper is fine-grained quartz coloured by iron. One of the oldest amulet stones in the world.",
    wear: "Earth tones, olive, denim and white. Stacks well with lava and tiger's eye.",
    beliefs: [
      {
        where: "Ancient Egypt",
        what: "a knot of blood-red jasper, the tyet or \"knot of Isis\", was placed at the throat of the dead in the belief that it gave them the protection of the goddess Isis.",
      },
    ],
    today: "crystal lovers call red jasper the stone of endurance and stamina, for days that run long.",
    close:
      "Picture it: an olive shirt, khaki trousers, and the red of Tsavo's earth on your wrist, a stone Egyptians trusted to the protection of Isis.",
    products: ["tsavo-clay-red-jasper-stone-bracelet"],
  },
  {
    id: "carnelian-agate",
    name: "Carnelian agate",
    stoneType: "agate",
    material: "Banded carnelian agate",
    headline: "A sunset in every bead.",
    pitch:
      "Warm orange and red with soft bands of light. Carnelian has been treasured for at least 4,600 years: carnelian beads from the Indus Valley were buried in the royal graves of Ur.",
    wear: "Whites, denim, khaki and beach days. A natural for coast season.",
    beliefs: [
      {
        where: "Ancient Rome",
        what: "some people believed agate could turn away storms.",
      },
    ],
    today: "crystal lovers call carnelian the stone of energy, motivation and confidence.",
    close:
      "Picture it: white linen at the coast, the sun going down, and a stone kings were buried with glowing on your wrist.",
    products: ["malindi-sunset-carnelian-agate-stone-bracelet"],
  },
  {
    id: "moss-agate",
    name: "Moss agate",
    stoneType: "agate",
    material: "Genuine moss agate",
    headline: "A forest inside every bead.",
    pitch:
      "Soft green threads inside clear stone, like moss or tiny trees. No two beads hold the same garden.",
    wear: "Greens, browns, cream and linen. Lovely for anyone who loves plants.",
    beliefs: [
      {
        where: "Farming communities in Europe",
        what: "people believed moss agate brought good crops, and hung it on trees and on the horns of cattle.",
      },
    ],
    today:
      "it's sometimes called the gardener's stone, and crystal lovers call it the stone of growth, new beginnings and patience.",
    close:
      "Picture it: a cream linen shirt on a Sunday morning, and a small forest on your wrist. The stone of new beginnings.",
    products: ["mau-evergreen-moss-agate-stone-bracelet"],
  },
  {
    id: "unakite",
    name: "Unakite",
    stoneType: "unakite",
    material: "Genuine unakite",
    headline: "Pink and green, growing together.",
    pitch:
      "Two colours in one stone: pink feldspar and green epidote, side by side. Named after the Unaka Mountains in the USA, where it was first described in 1874.",
    wear: "Perfect for matching sets: one for you, one for the person you're building a life with.",
    beliefs: [],
    today:
      "crystal lovers call unakite the stone of balance between heart and mind, and of love and partnership.",
    close:
      "Picture it: one for you, one for them, the same two colours growing side by side. The stone of love and partnership.",
    products: [
      "pwani-sand-unakite-stone-bracelet",
      "savannah-mosaic-unakite-stone-chip-bracelet",
    ],
  },
  {
    id: "rhodonite",
    name: "Rhodonite",
    stoneType: "rhodonite",
    material: "Genuine rhodonite",
    headline: "Pink, with strength running through it.",
    pitch:
      "Rose pink with bold black veins. Its name comes from the Greek for rose. Russia's tsars prized it: the tomb of Empress Maria Alexandrovna in St Petersburg is carved from rhodonite.",
    wear: "Gorgeous with white, navy and black. A gift that says love without saying it.",
    beliefs: [
      {
        where: "Imperial Russia",
        what: "rhodonite from the Ural Mountains was carved for palaces and imperial tombs, a stone fit for royalty.",
      },
    ],
    today: "crystal lovers call rhodonite the stone of compassion, forgiveness and love.",
    close:
      "Picture it: a navy dress or a navy suit, and a rose-pink stone the tsars carved for an empress. A gift that says love without saying it.",
    products: [
      "rose-murram-rhodonite-stone-bracelet",
      "waridi-shadow-rhodonite-stone-bracelet",
    ],
  },
  {
    id: "picture-jasper",
    name: "Picture jasper",
    stoneType: "jasper",
    material: "Genuine picture jasper",
    headline: "Every bead holds a landscape.",
    pitch:
      "Tan, cream and brown patterns that look like hills, rivers and deserts. Look closely: each bead is its own little map.",
    wear: "Earth tones, safari colours, linen and leather.",
    beliefs: [
      {
        where: "Ancient Egypt",
        what: "jasper was one of the great protective stones; a red jasper knot was worn for the protection of Isis.",
      },
    ],
    today:
      "crystal lovers call picture jasper the landscape stone, for calm, grounding and seeing the bigger picture.",
    close:
      "Picture it: linen, leather and a long road north, with a little map of the land on your wrist. The stone for seeing the bigger picture.",
    products: [
      "samburu-map-picture-jasper-stone-bracelet",
      "chalbi-map-picture-jasper-stone-bracelet",
    ],
  },
  {
    id: "fancy-jasper",
    name: "Fancy jasper",
    stoneType: "jasper",
    material: "Genuine fancy jasper",
    headline: "All the colours of the land.",
    pitch:
      "Swirls of forest green, earth red and cream in one stone. Aberdare Pine goes deep green; Kerio Earth carries the warm earth tones of the valley.",
    wear: "Olive, khaki, brown leather, weekend wear.",
    beliefs: [
      {
        where: "Ancient Egypt",
        what: "jasper was one of the great protective stones; a red jasper knot was worn for the protection of Isis.",
      },
    ],
    today:
      "crystal lovers call jasper the nurturing, grounding stone that steadies you through long days.",
    close:
      "Picture it: an olive jacket, brown leather boots, and the forest colours of the Aberdares on your wrist. A grounding stone for long days.",
    products: [
      "aberdare-pine-fancy-jasper-stone-bracelet",
      "kerio-earth-fancy-jasper-stone-bracelet",
    ],
  },
  {
    id: "picasso-jasper",
    name: "Picasso jasper",
    stoneType: "jasper",
    material: "Natural Picasso stone",
    headline: "Brush strokes in stone.",
    pitch:
      "Matte grey with dark lines that look painted by hand, which is how it got its name. A quiet, modern look.",
    wear: "Grey suits, black tees, minimalist outfits.",
    beliefs: [],
    today: "crystal lovers call it the artist's stone, for creativity and fresh starts.",
    close:
      "Picture it: a grey suit, no tie, and brush strokes in stone on your wrist. The artist's stone, for fresh starts.",
    products: ["mvua-slate-picasso-jasper-stone-bracelet"],
  },
  {
    id: "pink-zebra-jasper",
    name: "Pink zebra jasper",
    stoneType: "jasper",
    material: "Pink zebra jasper",
    headline: "Soft pink, with stripes.",
    pitch: "Blush pink with dark stripes and speckles, like the flats of Lake Magadi.",
    wear: "Pastels, white, denim. Sweet stacked with pink opal.",
    beliefs: [],
    today: "crystal lovers call it a stone of love and kindness.",
    close:
      "Picture it: white denim, a pastel top, and the soft pink of Magadi's flats on your wrist. A stone of love and kindness.",
    products: ["magadi-dust-pink-zebra-jasper-stone-bracelet"],
  },
  {
    id: "pink-opal",
    name: "Pink opal",
    stoneType: "opal",
    material: "Pink opal",
    headline: "Soft pink, like Bogoria's flamingos.",
    pitch: "A gentle, milky pink stone. Pink opal is best known from the Andes in Peru.",
    wear: "White, cream and soft colours. Lovely as a gift.",
    beliefs: [],
    today: "crystal lovers call pink opal the stone of gentle love and calm, kind to the heart.",
    close:
      "Picture it: a cream dress, a slow afternoon, and the pink of Bogoria's flamingos on your wrist. The stone of gentle love.",
    products: ["bogoria-blush-pink-opal-stone-bracelet"],
  },
];

/** Not stone, and we say so. */
export const notStone = [
  {
    name: "Maziwa Glow",
    label: "Mother of pearl (shell)",
    text: "The shiny inner layer of a shell, the same material pearls are made of. Milky white with a soft glow. Maziwa means milk.",
    today: "crystal lovers call mother of pearl calming, a gift from the sea and the moon.",
    product: "maziwa-glow-mother-of-pearl-bracelet",
  },
  {
    name: "Nyota Night",
    label: "Blue goldstone (glass)",
    text: "A man-made glass full of tiny sparkles, like a night sky. It was first made by glassmakers on Murano, near Venice. Nyota means star.",
    today: "crystal lovers call goldstone the stone of ambition: reach for the stars.",
    product: "nyota-night-blue-goldstone-bracelet",
  },
];

export const feelingGroups: FeelingGroup[] = [
  { title: "Courage & confidence", stones: ["tigers-eye", "bloodstone", "carnelian-agate"] },
  { title: "Calm & a quiet mind", stones: ["howlite", "sodalite", "pink-opal"] },
  { title: "Grounding & strength", stones: ["lava-stone", "hematite", "red-jasper"] },
  { title: "Protection", stones: ["obsidian", "malachite", "lapis-lazuli"] },
  { title: "Love & partnership", stones: ["rhodonite", "unakite", "pink-zebra-jasper"] },
  { title: "Growth & new beginnings", stones: ["moss-agate", "fancy-jasper", "picture-jasper"] },
];

export function getStoneMeaning(id: string) {
  return stoneMeanings.find((stone) => stone.id === id);
}

/** The meanings for one stone page (several jaspers share "jasper"). */
export function stoneMeaningsForType(stoneType: string) {
  return stoneMeanings.filter((stone) => stone.stoneType === stoneType);
}

/** The page for one stone, e.g. /stone-meanings/tigers-eye. */
export function stoneMeaningPath(id: string) {
  return `${STONE_MEANINGS_PATH}/${id}`;
}

/** "Tiger's eye" → "Tiger's Eye", for titles. */
export function stoneTitle(name: string) {
  return name.replace(/(^|\s)(\p{L})/gu, (_, space, letter) => space + letter.toUpperCase());
}

/** Journal stories about each stone (shown only once published). */
export const stoneStories: Record<string, string[]> = {
  "tigers-eye": [
    "tigers-eye-the-stone-with-light-inside",
    "the-stone-worn-against-the-evil-eye",
  ],
  "lava-stone": ["lava-stone-the-volcano-on-your-wrist"],
  obsidian: ["obsidian-the-rift-valleys-volcanic-glass"],
  malachite: [
    "malachite-africas-copper-green",
    "the-stone-worn-against-the-evil-eye",
  ],
  "lapis-lazuli": ["lapis-lazuli-the-blue-of-pharaohs"],
  bloodstone: ["bloodstone-the-soldiers-amulet"],
  rhodonite: ["rhodonite-the-tsars-rose-stone"],
};

/** The feeling groups a stone belongs to, and the other stones in them. */
export function stoneFeelings(id: string) {
  return feelingGroups.filter((group) => group.stones.includes(id));
}

/** The listed bracelets for a set of slugs, in order (old slugs still match). */
export function findStoneProducts(catalogue: CommerceProduct[], slugs: string[]) {
  return slugs.flatMap((slug) => {
    const product = catalogue.find((item) => isProductSlug(item.slug, slug));
    return product ? [product] : [];
  });
}
