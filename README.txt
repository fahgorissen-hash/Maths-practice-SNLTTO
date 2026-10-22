README - Maths practice pages (St. Nicolaas Lyceum TTO) - handover notes
=========================================================================
Owner: Frank (teacher; classes 1HVT, 2HT, 2VT(b), 3HT, 3VT). Student practice pages on GitHub Pages.
Repo: fahgorissen-hash/Maths-practice-SNLTTO (GitHub says it moved; use that URL). Local clone used so far: /home/claude/maths-practice-snltto
Last pushed commit: 0418000 "Add pilot 2HT Probability chapter, frac answer form, page build tooling".
Commit trailers to use: Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com> / Claude-Session: https://claude.ai/code/session_012tVRDneqzDuCNdSF72MmSh

1. HOW THE SITE WORKS
---------------------
- One self-contained index.html per chapter: <class>-chapter-N/index.html (e.g. 2ht-chapter-4). No server needed.
- Each page = head/CSS/nav + script1 (NX core engine: tokenizer, parser, grading, formCheck, gridSVG) + script2 (chapter content) + script3 (shared UI).
- Only the nav/title/h1 and script2 differ between pages. Template page for new builds: 2ht-chapter-2/index.html.
- Home page: /index.html shows class buttons; each class is a <section class="cls" id="c-<class>"> of cards like <a class="card" href="2ht-chapter-4/" title="Title: topics"><i>4</i><b>Title</b><span>topics</span></a>. Every new chapter needs a card in its class section. Fits one screen (4 columns, 2 on phones); #2ht in the URL opens that class.
- Student progress is stored in localStorage, key nx-<cls>-chN-vX.

2. BUILD TOOLING (in _src/)
---------------------------
- _src/pages.json : registry {slug: {cls, title, note?}} - drives the chapter menus. Add every new page here.
- _src/<slug>.js  : content file for a chapter (function body of (NX,P), returns the content object).
- python3 _src/build.py <slug>   -> builds <slug>/index.html from template + content
- python3 _src/build.py --nav <cls>  -> regenerates the chapter menu in all pages of a class (e.g. --nav 2ht)
- Content object: { key:'nx-2ht-ch4-v1', SECTIONS:[{id,title,sub}], LESSONS:[] (empty = by-paragraph mode), G:{sec:[gen fns]}, XG:{sec:[extra gens]}, defaultMode:'para', GOALS:[[sec,"I can...",[genNames],tip]] }
- Generators: named functions (level)=>question. Helpers ch (choice), ex (typed expression), nu (number), p (paragraph), LR/PL (level scaling), frq (fraction answer), treeSVG/vennSVG/targetSVG/sfrac (figures).
- ex(html, ans, form, hint, steps, extra): form is 'frac', 'lowest', 'any'/null etc. (forgetting the form argument shifts everything - this was a real bug.)
- Question fields: type num|expr|choice|multi|point|click; hint (shown on click); steps (worked solution); needStep (student must type working); ansText.
- Engine detail: stepMode() decides if typed working is enforced; check() splits typed answers on '='; labels like "x=" and degree signs are stripped; number words are accepted on 1hvt-chapter-1.
- Pages on the OLD engine (1hvt-chapter-2, 1hvt-chapter-3, 2ht-chapter-3) cannot accept typed working (no E.parse), so they only show a "steps count" note. Frank has not yet answered whether to migrate them.
- Mandatory page-level ideas: demand an in-between step for angle calculations; degree symbol optional.

3. TESTING (do this for every new chapter)
------------------------------------------
- Playwright with chromium: module /opt/npm-tools/node_modules/playwright, executablePath /opt/pw-browsers/chromium.
- window.Ch3 exposes make(sec, level, recent), check(q, answer), SECTIONS, GOALS etc.
- Fuzz: for every section and level 0-3 generate ~150 questions; assert no throw, no NaN/undefined in html/steps/hint, and that check(q, correct answer) is ok. (Scripts fz.js/shot.js lived in the old scratchpad; rewrite if needed - ~30 lines.)
- Screenshot figures (trees, Venn, targets) and look at them; overlapping labels were fixed once already.
- Verify answers independently (brute force in the test) wherever a generator computes by formula.

4. TEXTBOOK SCOPE (KERN Wiskunde, English TTO edition) - CONFIRMED THIS SESSION
-------------------------------------------------------------------------------
Year 2 (2HT and 2VT use the same books):
  2-A:  1 Numbers | 2 Solid geometry | 3 Relationships | 4 Probability
  2-B:  5 Pythagoras' theorem | 6 Equations and inequalities | 7 Geometric reasoning | 8 Algebra
  (plus a short "MR" file in 2-B - not yet looked at; probably a mathematical-reasoning/revision part)
Year 3 (3HT uses "H3-TTO" = KERN 3 havo in English):
  1 Numbers and variables | 2 Geometric reasoning | 3 Relations | 4 Statistics | 5 Equations and inequalities | 6 Trigonometry | 7 Exponential growth | 8 Select topics from mathematics A, B and D
  3VT uses "V3-TTO" (vwo 3) - NO FILES RECEIVED YET, chapter list unknown.
Existing pages vs books: 2ht/2vt ch1 Numbers, ch2 Solid geometry, ch3 Relationships (2ht-3 already merges linear/proportional/quadratic/vertex form); 2ht-chapter-4 Probability (pilot, 5 sections 4.1-4.5, NOT yet on home page - numbering now confirmed as ch 4). 3ht ch1 Numbers and variables, ch2 Geometric reasoning; 3vt ch1 Numbers, ch2 Trigonometry (3VT numbering to be checked against V3-TTO). 1hvt ch1-3: Numbers, Plane figures, Relations.

SCOPE RULES FROM FRANK
- 2HT must NOT go beyond regular 2 havo (KERN 2 havo, Dutch). 2VT needs "a lot more maths" than 2HT (what extra: unknown - ask or infer from the TTO book sections vs the havo scope).
- Regular 2 havo scope (Dutch worked solutions H1-H8 were supplied): H1 Getallen, H2 Ruimtemeetkunde, H3 Lineaire verbanden, H4 Kansrekening, H5 Algebra, H6 Pythagoras, H7 Verbanden en vergelijkingen (parabolas), H8 Meetkundig redeneren. Chapter order and subjects inside chapters are shuffled in the TTO books -> cross-reference before writing questions.
- Students are ~half Flemish, half Dutch, know less than Dutch-curriculum materials assume -> simple English, little assumed background.
- Use the English book's notation: y = mx + b (gradient m, y-intercept b), "gradient", etc.
- Worked solutions should show full intermediate steps; use fresh numbers, not the textbook's own example numbers.

5. SOURCE FILES (attached by Frank; in the old session at /mnt/user-data/attachments/...; must be re-attached to a new project)
- H2-Uitwerkingen-H1..H8 (KERN 2 havo, Dutch; text extractable with pdftotext, headings partly missing)
- H3-TTO_Worked_solutions_Ch1..Ch8 (text PDFs, extractable)
- 2TTOA_Solutions_Ch1..Ch4, 2hvB-tto_H5..H8, 2hvB-tto_MR: SCANNED images (no text). pdftotext gives nothing. tesseract is installed (/usr/bin/tesseract): rasterize with pdftoppm -r 200 -gray, then OCR (was about to do this when interrupted - Frank declined that bulk command, so ask before running it again or read pages as images with the Read tool, pages parameter, max 20 pages per call).
- Not received: V3-TTO (3VT), the study guides.

6. STATE OF WORK / NEXT STEPS
-----------------------------
Done and pushed: number words on 1hvt-ch1; label/degree handling in typed step chains; demanded steps for angle calculations; older-engine trap fix; form:'frac' answer check (9 newer pages); build tooling; 2ht-chapter-4 Probability pilot (fuzz-tested, ~3000 questions, visuals checked).
Frank's main request (Oct 22): "add all the chapters for all the classes". By-lesson sorting is NOT wanted yet (he will supply the study guides) - keep LESSONS:[] / by-paragraph mode. Most effort goes into content.
Suggested order:
 1. Add the 2ht-chapter-4 card to the home page + run python3 _src/build.py --nav 2ht; commit/push.
 2. 2HT chapters 5-8 (Pythagoras, Equations and inequalities, Geometric reasoning, Algebra), restricted to the 2 havo scope. Read the book sections (OCR/images) for section lists and question styles, write _src/2ht-chapter-N.js, add to pages.json, build, fuzz, screenshot, push.
 3. 2VT: same chapters 4-8 plus the extra material beyond 2HT (find out what with Frank / from the books: sections present in the TTO book but absent from 2 havo).
 4. 3HT chapters 3-8 (Relations, Statistics, Equations and inequalities, Trigonometry, Exponential growth, Select topics A/B/D); ch1-2 exist. Worked solutions are text-extractable.
 5. 3VT after V3-TTO is supplied (existing 3vt pages: Numbers, Trigonometry).
 6. 1HVT: chapters beyond 3 once a book/chapter list is known (not supplied).
 7. Ask Frank whether to migrate the 3 old-engine pages (1hvt-ch2, 1hvt-ch3, 2ht-ch3).
 8. By-lesson mode when the study guides arrive.
Each new chapter: read solutions -> design generators (levels 0-2 + extras) -> write _src/<slug>.js -> build -> fuzz test -> screenshots -> update pages.json, home page, nav -> commit -> push. Keep a task list; finish with a check of answers.

7. KNOWN GOTCHAS
----------------
- Frank's computer folders (e.g. "The Straet") were not reachable (device bridge disconnected); if linked again, sync there too.
- The repo remote prints "repository moved" warnings on push; pushes still succeed.
- The user's stop hook complains about unpushed commits - always push after committing.
- Frank's tone: wants results, short reports, one clear next step; asks questions only when truly blocked.
