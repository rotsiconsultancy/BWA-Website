# Journal image brief (for the image agent)

You are producing photos for three posts in the BWA Journal and wiring them into the posts. Read this whole brief before generating anything.

Repo: Next.js site for Beads World Africa (BWA), handmade beaded bracelets sold in Kenya. Posts are Markdown files in `content/journal/`. The page renders them at `/journal/<slug>`.

## What "done" looks like

1. 13 new images saved as `.webp` in `public/journal/<slug>/`, with the exact filenames below.
2. Each post's `cover:` and `coverAlt:` lines updated, and image lines replaced or inserted exactly where this brief says.
3. No other text in the posts changed.
4. Checks pass (see "Check your work") and the three pages look right in a browser.

## Look and feel (all images)

- **Mood:** warm, editorial, documentary. Golden-hour or soft window light. Shallow depth of field. The bracelet is the hero of the frame even when people are in it.
- **Palette:** earthy browns, ochre, forest green, charcoal, warm cream. Match the existing site photos in `public/images/` (open two or three to calibrate).
- **People:** Kenyan, Black African, natural skin texture, relaxed and real, not posed stock-photo smiles. Men are the main wearers. Faces may be cropped or partly out of frame; hands and wrists matter most.
- **Places:** recognisably Kenyan and urban-modern where it fits: a Nairobi apartment, a café, an office, a university lawn with jacaranda trees.
- **Never:** text, logos, watermarks, brand names, recognisable watch brands, real university names or crests, extra or malformed fingers, plastic-looking skin, bracelets floating or clipping through wrists.

## Bracelet accuracy (important)

Three real products appear in these posts. When a caption or section names one of them, the bracelet in that image must match the real product. Use the product photo as a reference image (image-to-image or reference conditioning):

| Product | What it looks like | Reference photo |
|---|---|---|
| Forest Forge | One side: polished dark cylindrical beads in a sleek line. Other side: round beads in deep green, charcoal, brown and muted earth tones. Two glossy black round beads and small metallic-looking separators where the sections meet. | https://res.cloudinary.com/dkk1wsmaw/image/upload/v1790311751/ATIDI/images/x7jkevzdtlvcjvphqctl.jpg |
| Midnight Rhythm | Glossy black round beads, each with white geometric markings (zigzags, angled lines, small triangles). Monochrome. | https://res.cloudinary.com/dkk1wsmaw/image/upload/v1790314746/ATIDI/images/dicxfbdfvtujkip0psab.jpg |
| Spotted Contrast | Bright pale rounded beads with irregular black spots, two polished dark cylindrical accents at opposite points, small metallic-looking separators. | https://res.cloudinary.com/dkk1wsmaw/image/upload/v1790310603/ATIDI/images/mnbpphlpqkbut9gkxfzg.jpg |

If you cannot match a product faithfully, make the bracelet small or softly out of focus, and tell the owner in your summary which image needs a real product photo instead. Never show a bracelet that contradicts the product (wrong colours, wrong bead shapes).

Images marked **generic** below should show beaded bracelets in the BWA style (natural-looking beads, dark and earthy tones) without imitating a specific product.

## Technical spec

- **Covers:** 1600×900 (16:9). The subject should sit in the centre or upper third; the page crops covers from the top and bottom on phones.
- **Inline images:** 1600×1067 (3:2, landscape). They display full-width with a max height of 640px; portrait images will be cropped badly, so do not make any.
- **Format:** `.webp`, quality around 80, ideally under 350 KB each.
- **Filenames:** lowercase, exactly as listed.

## How images are written in a post

An image on its own line becomes a full-width photo with a caption:

```markdown
![Alt text describing what is in the photo](/journal/<slug>/<file>.webp "Caption shown under the photo")
```

- Leave a blank line before and after each image line.
- Alt text describes the photo for screen readers and Google (what is visible, no "image of").
- Never put an image directly before or after a `{{product: ...}}` line. Leave at least one paragraph between them so the page does not stack a photo and a product card together.
- Do not edit the `{{product: ...}}` lines, headings or body text.

---

## Post 1: `what-to-get-him-when-he-says-he-wants-nothing`

File: `content/journal/what-to-get-him-when-he-says-he-wants-nothing.md`
Folder: `public/journal/what-to-get-him-when-he-says-he-wants-nothing/`
Story: a woman whose partner always says he wants "nothing" finds the right gift.

### cover.webp (generic)
**Prompt:** Bright modern Nairobi apartment, late afternoon window light. A man in his early 30s relaxes on a sofa in a plain dark T-shirt, half-smiling and shrugging as if saying "I don't need anything". In the foreground, slightly out of focus, a woman's hand holds a small kraft-paper gift box behind her back. Warm earthy tones, editorial, shallow depth of field.

Replace lines 6–7:
```yaml
cover: /journal/what-to-get-him-when-he-says-he-wants-nothing/cover.webp
coverAlt: "A man relaxing on a sofa while a woman hides a small gift box behind her back"
```

### everyday.webp (generic)
**Prompt:** Close-up of a man's wrist reaching for a phone on a wooden café table in Nairobi, a dark beaded bracelet on his wrist, a coffee cup and notebook nearby. Morning light, shallow depth of field.

Replace this line:
```markdown
![A bracelet of dark and metallic beads resting on a rock at sunset](/images/final-cta-bracelet-on-a-mountain.webp "A good bracelet should look at home anywhere he goes.")
```
with:
```markdown
![A man's wrist with a dark beaded bracelet reaching for his phone on a café table](/journal/what-to-get-him-when-he-says-he-wants-nothing/everyday.webp "It goes everywhere he goes: the phone, the handshake, the meeting.")
```

### measure.webp (generic)
**Prompt:** Top-down shot of a woman's hands laying a man's leather-strap watch flat on a table and measuring the strap with a soft tailor's tape measure. A small gift box and a notepad nearby. Warm daylight, calm and practical.

Replace this line:
```markdown
![A woman resting her hands near her collar, wearing two stacked beaded bracelets](/images/wear-sth-that-story-section.webp "Stacking is easy once you know his size: start with one, add more over time.")
```
with:
```markdown
![A woman measuring the strap of a man's watch with a tape measure](/journal/what-to-get-him-when-he-says-he-wants-nothing/measure.webp "His watch strap already knows his size.")
```

### putting-it-on.webp (Forest Forge, the featured product)
**Prompt:** A man in a dark shirt sitting at a dining table, putting a bracelet onto his wrist and smiling slightly, an open kraft gift box and tissue paper in front of him. The bracelet must match the Forest Forge reference. Warm evening light, intimate and candid.

Insert after the paragraph that ends `Right there.` (in "## On the day"), before the paragraph starting `That is how you know`:
```markdown
![A man smiling as he puts on a beaded bracelet beside an open gift box](/journal/what-to-get-him-when-he-says-he-wants-nothing/putting-it-on.webp "Not tomorrow. Not for a special occasion. Right there.")
```

---

## Post 2: `how-to-wear-a-bracelet-with-a-watch`

File: `content/journal/how-to-wear-a-bracelet-with-a-watch.md`
Folder: `public/journal/how-to-wear-a-bracelet-with-a-watch/`
Story: three rules for wearing a bracelet and a watch together.

### cover.webp (generic)
**Prompt:** Close-up of a man's two forearms resting on a dark wooden boardroom table, crisp light-blue shirt cuffs rolled once. A plain dark-faced watch with no visible brand on the left wrist, a dark beaded bracelet on the right wrist. A pen and notebook between his hands. Warm side light, editorial.

Replace lines 6–7:
```yaml
cover: /journal/how-to-wear-a-bracelet-with-a-watch/cover.webp
coverAlt: "A man's forearms on a meeting table, with a watch on one wrist and a beaded bracelet on the other"
```

### same-wrist.webp (generic)
**Prompt:** Close-up of one male wrist wearing a plain steel watch with no visible brand and, about a finger's width further up the arm, a dark beaded bracelet. Rolled shirt sleeve, neutral background, soft daylight. The gap between watch and bracelet must be clearly visible.

Insert after the paragraph starting `**Same wrist.**` (in "## Rule one: pick a wrist"):
```markdown
![A watch and a beaded bracelet on the same wrist with a small gap between them](/journal/how-to-wear-a-bracelet-with-a-watch/same-wrist.webp "Same wrist? Leave about a finger's width so they sit side by side.")
```

### leather-strap.webp (generic)
**Prompt:** A man's wrist resting on a canvas bag or wooden bench, wearing a brown leather-strap watch with no visible brand and an earthy beaded bracelet in browns and greens on the same wrist. Relaxed weekend feel, warm afternoon light.

Insert after the paragraph under `### A leather strap`, before `## Rule three: let one of them lead`:
```markdown
![A brown leather watch strap worn with an earthy beaded bracelet](/journal/how-to-wear-a-bracelet-with-a-watch/leather-strap.webp "Leather is warm. Earthy beads keep it that way.")
```

### one-leads.webp (generic)
**Prompt:** A man adjusting the cuff of a dark suit jacket. A large, bold watch with no visible brand on his wrist, and next to it a slim, quiet single-colour beaded bracelet. Clean, confident, evening light.

Replace this line:
```markdown
![A man resting his chin on his hand, wearing a stack of beaded bracelets](/images/hero-image-mountain-man-wearing-beads-world-africa-bracelet.webp "Let one piece lead. Here the bracelets do the talking.")
```
with:
```markdown
![A bold watch worn with a slim, single-colour beaded bracelet](/journal/how-to-wear-a-bracelet-with-a-watch/one-leads.webp "A bold watch, a quiet bracelet: let one of them lead.")
```

---

## Post 3: `a-graduation-gift-he-will-wear-long-after-the-gown`

File: `content/journal/a-graduation-gift-he-will-wear-long-after-the-gown.md`
Folder: `public/journal/a-graduation-gift-he-will-wear-long-after-the-gown/`
Story: graduation day, told from the point of view of a girlfriend, a wife and a mother.

### cover.webp (generic)
**Prompt:** Golden hour at a Kenyan university, purple jacaranda trees in bloom behind. A young man in a dark graduation gown, cap slightly crooked, laughing as his family crowds around him for a photo. A beaded bracelet visible on his wrist as he holds his certificate folder. Joyful, candid, warm. No text, crests or university names anywhere.

Replace lines 6–7:
```yaml
cover: /journal/a-graduation-gift-he-will-wear-long-after-the-gown/cover.webp
coverAlt: "A laughing graduate in a gown surrounded by family under jacaranda trees"
```

### girlfriend.webp (Spotted Contrast)
**Prompt:** A young woman in her mid-20s hands a small kraft gift box to her boyfriend, who is wearing a graduation gown, on a sunny campus lawn. He is opening it and grinning. Inside the box, the bracelet must match the Spotted Contrast reference. Playful, warm, candid.

Insert after the paragraph starting `Your gift can be personal` (in "## If you are his girlfriend"):
```markdown
![A young woman handing a small gift box to a graduate in his gown](/journal/a-graduation-gift-he-will-wear-long-after-the-gown/girlfriend.webp "Something with a bit of fun in it, for the man he is now.")
```

### wife.webp (Midnight Rhythm)
**Prompt:** Early morning in a Nairobi home. A woman in her 30s fastens a bracelet onto her husband's wrist while he buttons a white shirt; a folded graduation gown hangs on a chair behind them. The bracelet must match the Midnight Rhythm reference. Soft window light, tender, quiet.

Delete this line (it currently sits right after the Midnight Rhythm product card):
```markdown
![A woman resting her hands near her collar, wearing stacked beaded bracelets](/images/wear-sth-that-story-section.webp "Some gifts are chosen with one person in mind for years.")
```
Then insert the new image after the paragraph starting `He did this the hard way.` (the first paragraph under "## If you are his wife"):
```markdown
![A woman fastening a bracelet on her husband's wrist as he gets ready for his graduation](/journal/a-graduation-gift-he-will-wear-long-after-the-gown/wife.webp "He did it the hard way. He should look the part.")
```

### mother.webp (Forest Forge)
**Prompt:** A mother in her 50s in a colourful headwrap straightens her son's graduation gown sleeve, her hand resting on his wrist, where the bracelet is visible. Both are emotional and proud. The bracelet must match the Forest Forge reference. Golden hour, campus background softly blurred.

Insert after the paragraph starting `And now this.` (in "## If you are his mother"):
```markdown
![A mother straightening her son's graduation gown sleeve, her hand on his wrist](/journal/a-graduation-gift-he-will-wear-long-after-the-gown/mother.webp "Another doorway he will walk through without you.")
```

### the-note.webp (generic)
**Prompt:** Top-down still life on a wooden table: an open kraft gift box with a beaded bracelet on tissue paper, and a small cream card beside it, with a few blurred lines of handwriting (no legible words). A fountain pen, a graduation cap tassel in the corner. Warm natural light.

Replace this line:
```markdown
![A beaded bracelet resting on a rock above a valley at sunset](/images/final-cta-bracelet-on-a-mountain.webp "The day ends. The bracelet stays.")
```
with:
```markdown
![An open gift box with a beaded bracelet and a handwritten card beside it](/journal/a-graduation-gift-he-will-wear-long-after-the-gown/the-note.webp "Don't skip the note. He will keep it.")
```

---

## Check your work

1. Every new file exists and is referenced exactly once; nothing in the posts still points to `/images/` except where this brief did not ask for a change.
2. Run:
   ```bash
   pnpm test
   npx tsc --noEmit -p .
   ./node_modules/.bin/next build
   ```
   The build reads every post and fails with a clear message if frontmatter is broken.
3. Start the dev server (`./node_modules/.bin/next dev`) and open:
   - `/journal` (covers on the listing)
   - `/journal/what-to-get-him-when-he-says-he-wants-nothing`
   - `/journal/how-to-wear-a-bracelet-with-a-watch`
   - `/journal/a-graduation-gift-he-will-wear-long-after-the-gown`

   Check at desktop and phone width (375px): covers crop well, no image sits right against a product card, captions read naturally.
4. Do not push. Commit with: `content: add generated journal photography`, and list in your summary any image where the product match is weak.
