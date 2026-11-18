// lib/catalog.ts — Live catalog data, 16 systems + open cases + weighted stem decoder

export interface CaseId {
  id: string;
  title: string;
  free: boolean;
}

export interface SystemDef {
  id: string;
  name: string;
  shortName: string;
  cases: number;
  syndromes: number;
  color: string;
  bgTint: string;
  borderTint: string;
  badgeText: string;
  description: string;
  freeCases: CaseDemo[]; // open sample cases
  paidCaseSample: CaseSample[]; // locked preview examples
}

export interface CaseSample {
  id: string;
  title: string;
  syndrome: string;
  buzzword: string;
}

export interface CaseDemo {
  id: string;
  systemId: string;
  systemName: string;
  syndrome: string;
  buzzword: string;
  diagnosis: string;
  vignette: string;
  mechanism: string;
  labSignature: string;
  trap: string;
  question: { stem: string; options: string[]; correct: number; explanation: string };
  facts: string[];
}

// ————————————————————————————
// OPEN CLINICAL CASES ACROSS SYSTEMS
// ————————————————————————————

export const DEMO_CASES: Record<string, CaseDemo> = {
  psgn: {
    id: 'psgn',
    systemId: 'renal',
    systemName: 'Renal & Nephrology',
    syndrome: 'Nephritic syndrome',
    buzzword: 'Cola urine 2–3 wks post-strep',
    diagnosis: 'Poststreptococcal GN (PSGN)',
    vignette: 'An 8-year-old boy presents with dark, tea-colored urine and periorbital edema three weeks after crusted honey-colored skin lesions on his face. BP is 142/92 mmHg. Urinalysis reveals dysmorphic RBCs and RBC casts. Serum C3 is markedly decreased.',
    mechanism: 'Type III hypersensitivity: immune-complex deposition in the subepithelial space ("lumpy-bumpy" humps on EM) → alternative complement activation → low C3.',
    labSignature: 'Low C3 (normalizes in 6–8 wks), normal C4, dysmorphic RBCs & RBC casts, elevated ASO / anti-DNase B titers, proteinuria < 3.5 g/day.',
    trap: 'IgA nephropathy presents 1–5 days post-URI ("synpharyngitic") with NORMAL C3. PSGN presents 2–3 weeks post-pharyngitis or impetigo with LOW C3.',
    question: {
      stem: 'What electron microscopy finding is pathognomonic for Poststreptococcal GN?',
      options: ['Diffuse podocyte foot process effacement', 'Subepithelial electron-dense humps', 'Tram-track GBM splitting', 'Linear IgG along the GBM'],
      correct: 1,
      explanation: 'Subepithelial electron-dense humps represent immune complex deposits and are classic for PSGN. Foot process effacement → MCD; tram-track → MPGN; linear IgG → Goodpasture.',
    },
    facts: [
      'Most common cause of acute nephritic syndrome in children.',
      'Triggered by nephritogenic Group A Streptococcus (pharyngitis or impetigo).',
      'Antibiotics for strep pharyngitis prevent rheumatic fever, NOT PSGN.',
      'Supportive care in >95% of children; adults have higher risk of RPGN.',
    ],
  },

  goodpasture: {
    id: 'goodpasture',
    systemId: 'renal',
    systemName: 'Renal & Nephrology',
    syndrome: 'Pulmonary-renal syndrome',
    buzzword: 'Linear IgG + hemoptysis',
    diagnosis: 'Goodpasture syndrome',
    vignette: 'A 24-year-old male smoker presents with hemoptysis, dyspnea, and dark urine. Chest X-ray shows bilateral patchy alveolar infiltrates. Urinalysis reveals dysmorphic RBCs and RBC casts. Serum anti-GBM antibodies are positive.',
    mechanism: 'Type II cytotoxic hypersensitivity: IgG autoantibodies target the non-collagenous (NC1) domain of the α3 chain of type IV collagen in glomerular and alveolar basement membranes.',
    labSignature: 'Circulating anti-GBM antibodies, smooth linear IgG on renal biopsy IF, crescentic RPGN on LM, normal serum complement (C3/C4).',
    trap: 'Granulomatosis with polyangiitis (GPA) also causes hemoptysis + crescentic GN, but GPA is c-ANCA (PR3) positive, pauci-immune on IF, and has upper airway/sinus disease.',
    question: {
      stem: 'Which immunofluorescence pattern on renal biopsy distinguishes Goodpasture syndrome from GPA and SLE?',
      options: ['Granular "full-house" deposits', 'Smooth linear IgG along the GBM', 'Mesangial IgA1 deposition', 'Pauci-immune (negative IF)'],
      correct: 1,
      explanation: 'Direct antibody binding to intrinsic GBM collagen produces smooth linear IgG staining. Granular → immune-complex (PSGN/SLE); mesangial IgA → Berger; pauci-immune → ANCA vasculitides.',
    },
    facts: [
      'Targets α3(IV) collagen present exclusively in specialized GBM and alveolar BM.',
      'Cigarette smoking damages alveolar capillaries and unmasks cryptic GBM epitopes.',
      'Emergent treatment: plasmapheresis + high-dose corticosteroids + cyclophosphamide.',
    ],
  },

  mcd: {
    id: 'mcd',
    systemId: 'renal',
    systemName: 'Renal & Nephrology',
    syndrome: 'Nephrotic syndrome',
    buzzword: 'Foot process effacement, normal LM',
    diagnosis: 'Minimal change disease (MCD)',
    vignette: 'A 4-year-old girl presents with morning periorbital edema, ankle swelling, and frothy urine a week after a mild viral URI. Serum albumin is 1.5 g/dL, total cholesterol is 340 mg/dL, and 24-hour urine protein is 5.2 g.',
    mechanism: 'T-cell cytokine-mediated injury to podocytes → loss of polyanionic heparan sulfate charge barrier → selective albuminuria without immune deposits.',
    labSignature: '> 3.5 g/day selective albuminuria, hypoalbuminemia, hyperlipidemia, Maltese-cross fatty casts; LM normal, IF negative, EM shows diffuse foot process effacement.',
    trap: 'Light microscopy appears completely normal! If a nephrotic patient has foot process effacement on EM PLUS segmental sclerosis on LM or fails steroids, think FSGS.',
    question: {
      stem: 'What is the first-line pharmacotherapy for pediatric minimal change disease?',
      options: ['Oral cyclophosphamide', 'High-dose corticosteroids (prednisone)', 'ACE inhibitor monotherapy', 'Urgent plasmapheresis'],
      correct: 1,
      explanation: 'Over 90% of children with MCD achieve complete remission with corticosteroid therapy (steroid-sensitive nephrotic syndrome).',
    },
    facts: [
      'Most common cause of nephrotic syndrome in children.',
      'Classically associated with Hodgkin lymphoma in adults (excess T-cell cytokines).',
      'Selective proteinuria spares large immunoglobulins (unlike membranous/FSGS).',
    ],
  },

  apl: {
    id: 'apl',
    systemId: 'heme',
    systemName: 'Hematology & Oncology',
    syndrome: 'Acute leukemia + DIC',
    buzzword: 'Auer rods + t(15;17) + DIC',
    diagnosis: 'Acute Promyelocytic Leukemia (APL / M3)',
    vignette: 'A 29-year-old woman presents with fatigue, gingival bleeding, and continuous oozing from venipuncture sites. Platelets are 18,000/mm³, D-dimer is markedly elevated, fibrinogen is 75 mg/dL, and peripheral smear shows blasts packed with bundles of needle-like eosinophilic rods.',
    mechanism: 'Balanced translocation t(15;17) fuses PML with RARα → blocks myeloid differentiation at the promyelocyte stage; release of tissue factor & annexin II triggers fulminant DIC.',
    labSignature: 'Promyelocytic blasts with Auer rod bundles ("faggot cells"), MPO positive, t(15;17) PML-RARα, prolonged PT/aPTT, low fibrinogen, high D-dimer.',
    trap: 'Start all-trans retinoic acid (ATRA) IMMEDIATELY upon suspicion—even before genetic confirmation—to prevent fatal intracranial hemorrhage from DIC. Watch for differentiation syndrome.',
    question: {
      stem: 'How does all-trans retinoic acid (ATRA) induce remission in t(15;17) APL?',
      options: ['Inhibits BCR-ABL tyrosine kinase', 'Binds PML-RARα to force blast maturation into neutrophils', 'Cross-links DNA in dividing myeloblasts', 'Targets CD20 on leukemic cells'],
      correct: 1,
      explanation: 'ATRA (a vitamin A derivative) binds the altered RARα receptor, lifting the transcriptional block so promyelocytes differentiate into mature, short-lived neutrophils.',
    },
    facts: [
      'Medical hematologic emergency due to high risk of fatal hemorrhagic DIC.',
      'Curable in >85% of patients with ATRA + arsenic trioxide.',
      'Differentiation syndrome presents with fever, dyspnea, edema, and pulmonary infiltrates; treat with dexamethasone.',
    ],
  },

  hocm: {
    id: 'hocm',
    systemId: 'cardio',
    systemName: 'Cardiology & Vascular',
    syndrome: 'Dynamic outflow obstruction',
    buzzword: 'Murmur ↑ with Valsalva, ↓ with squatting',
    diagnosis: 'Hypertrophic Cardiomyopathy (HOCM)',
    vignette: 'A 19-year-old collegiate basketball player experiences syncope during wind sprints. His uncle died suddenly at age 31. Auscultation at the left sternal border reveals an S4 gallop and a harsh crescendo-decrescendo systolic murmur that intensifies when he stands abruptly from a squat.',
    mechanism: 'Autosomal dominant missense mutation in β-myosin heavy chain or myosin-binding protein C → asymmetric septal hypertrophy & myofibrillar disarray → systolic anterior motion (SAM) of mitral valve.',
    labSignature: 'ECG: LVH + deep dagger-like septal Q waves; Echo: asymmetric septal thickness ≥15 mm, dynamic LVOT gradient; Histology: myofibrillar disarray.',
    trap: 'Decreased preload (Valsalva, abrupt standing, nitrates, diuretics) WORSENS the HOCM murmur by shrinking the LV cavity. Squatting, leg raise, and handgrip INCREASE LV volume and SOFTEN the murmur (opposite of aortic stenosis!).',
    question: {
      stem: 'Which medication is first-line to reduce dynamic LV outflow tract obstruction and sudden exertional symptoms in HOCM?',
      options: ['Sublingual nitroglycerin', 'Furosemide', 'Metoprolol (β-blocker)', 'Digoxin'],
      correct: 2,
      explanation: 'β-blockers slow heart rate (increasing diastolic filling time and LV end-diastolic volume) and reduce contractility, widening the LVOT. Nitrates, diuretics, and digoxin worsen obstruction!',
    },
    facts: [
      'Leading genetic cause of sudden cardiac death in young competitive athletes (via ventricular fibrillation).',
      'Associated with Friedreich ataxia (GAA trinucleotide repeat).',
      'Bifid ("jerky" / bisferiens) carotid pulse and prominent S4 from stiff, noncompliant ventricle.',
    ],
  },

  graves: {
    id: 'graves',
    systemId: 'endo',
    systemName: 'Endocrinology & Reproductive',
    syndrome: 'Primary hyperthyroidism',
    buzzword: 'Pretibial myxedema + exophthalmos + diffuse RAIU',
    diagnosis: 'Graves Disease',
    vignette: 'A 32-year-old woman reports 12-lb weight loss despite increased appetite, heat intolerance, palpitations, and gritty protruding eyes. Exam shows lid lag, a diffusely enlarged nontender thyroid with an audible bruit, and waxy nonpitting plaques over her shins.',
    mechanism: 'Type II (stimulatory) hypersensitivity: Thyroid-stimulating immunoglobulins (TSI) agonize TSH receptors on follicular cells AND orbital/dermal fibroblasts → GAG deposition + T3/T4 overproduction.',
    labSignature: 'Suppressed TSH, elevated free T4 & T3, positive TSI / TRAb, homogeneously increased radioactive iodine uptake (RAIU); histology shows tall scalloped colloid.',
    trap: 'Exophthalmos and pretibial myxedema are UNIQUE to Graves (driven by TSH-receptor fibroblast stimulation)—they do NOT occur in toxic multinodular goiter, thyroiditis, or exogenous levothyroxine!',
    question: {
      stem: 'Which antithyroid medication is preferred specifically during the FIRST trimester of pregnancy?',
      options: ['Methimazole', 'Propylthiouracil (PTU)', 'Radioactive iodine (I-131)', 'Potassium perchlorate'],
      correct: 1,
      explanation: 'PTU is used in the 1st trimester because methimazole carries risk of aplasia cutis congenita; switch to methimazole in the 2nd/3rd trimesters due to PTU hepatotoxicity risk.',
    },
    facts: [
      'β-blockers (propranolol) rapidly control adrenergic symptoms AND inhibit peripheral 5′-deiodinase (T4 → T3).',
      'Methimazole and PTU can cause idiosyncratic agranulocytosis (check absolute neutrophil count if sore throat/fever develops!).',
    ],
  },

  wilson: {
    id: 'wilson',
    systemId: 'gi',
    systemName: 'Gastroenterology & Hepatobiliary',
    syndrome: 'Metabolic cirrhosis + movement disorder',
    buzzword: 'Kayser-Fleischer rings + low ceruloplasmin',
    diagnosis: 'Wilson Disease (Hepatolenticular Degeneration)',
    vignette: 'A 21-year-old college student develops declining grades, slurred speech, wing-beating tremor, and uncharacteristic emotional lability. AST and ALT are elevated, Coombs-negative hemolytic anemia is present, and slit-lamp exam reveals golden-brown rings at the corneal limbus.',
    mechanism: 'Autosomal recessive mutation in ATP7B (chromosome 13) → defective hepatocyte copper transport into bile and failure to incorporate copper into apoceruloplasmin → free radical copper toxicity in liver, putamen/basal ganglia, and Descemet membrane.',
    labSignature: 'Decreased serum ceruloplasmin, increased 24-hour urinary copper, increased hepatic copper on biopsy, Coombs-negative hemolysis, Fanconi-like renal wasting.',
    trap: 'Total serum copper is paradoxically LOW (because 90% of circulating copper is bound to ceruloplasmin, which is low), whereas FREE serum copper and URINARY copper are HIGH!',
    question: {
      stem: 'Which basal ganglia structure is most classically damaged in Wilson disease, producing parkinsonism and dystonia?',
      options: ['Caudate head alone', 'Putamen (lentiform nucleus)', 'Subthalamic nucleus', 'Mammillary bodies'],
      correct: 1,
      explanation: 'Copper accumulates heavily in the lentiform nucleus (putamen + globus pallidus), hence the classic name "hepatolenticular degeneration."',
    },
    facts: [
      'Treat with copper chelators (penicillamine or trientine) plus oral zinc (induces enterocyte metallothionein to block gut copper absorption).',
      'Consider Wilson disease in ANY patient under age 40 with unexplained liver disease + neuropsychiatric symptoms.',
    ],
  },

  taysachs: {
    id: 'taysachs',
    systemId: 'biochem',
    systemName: 'Biochemistry & Genetics',
    syndrome: 'Lysosomal storage disease',
    buzzword: 'Cherry-red macula + NO hepatosplenomegaly',
    diagnosis: 'Tay-Sachs Disease',
    vignette: 'A 7-month-old infant of Ashkenazi Jewish descent loses the ability to sit upright, startles exaggeratedly to sudden noises, and becomes progressively hypotonic. Fundoscopic exam shows a bright cherry-red spot at the fovea. Abdominal palpation shows NO organomegaly.',
    mechanism: 'Autosomal recessive deficiency of β-hexosaminidase A → toxic accumulation of GM2 ganglioside inside neuronal lysosomes ("onion-skin" lamellar bodies on EM).',
    labSignature: 'Absent hexosaminidase A activity, EM shows whorled onion-skin lysosomes in neurons, cherry-red macula, normal liver/spleen size.',
    trap: 'Both Tay-Sachs and Niemann-Pick A present in Ashkenazi infants with neurodegeneration + cherry-red macula. The decisive splitter: Tay-Sachs has NO hepatosplenomegaly ("Tay-SaX lacks visceromegaly"); Niemann-Pick HAS hepatosplenomegaly + foam cells.',
    question: {
      stem: 'Which substrate accumulates in the lysosomes of patients with Tay-Sachs disease?',
      options: ['Sphingomyelin', 'GM2 ganglioside', 'Glucocerebroside', 'Galactocerebroside'],
      correct: 1,
      explanation: 'Hexosaminidase A cleaves GM2 ganglioside. Sphingomyelin → Niemann-Pick; Glucocerebroside → Gaucher; Galactocerebroside → Krabbe.',
    },
    facts: [
      'Hyperacusis (exaggerated startle reflex to noise) is an early classic vignette clue.',
      'Cherry-red spot represents normal choroidal vasculature seen through thin fovea surrounded by pale lipid-laden retinal ganglion cells.',
    ],
  },

  ms: {
    id: 'ms',
    systemId: 'neuro',
    systemName: 'Neurology & CNS Pathology',
    syndrome: 'CNS demyelination in space & time',
    buzzword: 'INO + optic neuritis + CSF oligoclonal bands',
    diagnosis: 'Multiple Sclerosis (MS)',
    vignette: 'A 27-year-old woman from Seattle presents with painful monocular vision loss on eye movement. Six months ago she had transient numbness in her left leg that resolved. On lateral gaze to the left, her right eye fails to adduct while her left eye exhibits abducting nystagmus.',
    mechanism: 'Type IV (CD4+ Th1/Th17) autoimmune destruction of CNS oligodendrocytes and myelin → periventricular white matter plaques (Dawson fingers) separated in space and time.',
    labSignature: 'CSF: IgG oligoclonal bands + elevated myelin basic protein; MRI: periventricular plaques (Dawson fingers) & MLF lesion; Marcus Gunn afferent pupillary defect.',
    trap: 'Internuclear ophthalmoplegia (INO) is caused by a lesion in the IPSILATERAL medial longitudinal fasciculus (MLF)—right eye fails to adduct = right MLF lesion, with nystagmus in the contralateral abducting eye!',
    question: {
      stem: 'Which disease-modifying agent prevents lymphocyte egress into the CNS by blocking α4-integrin?',
      options: ['Acute IV methylprednisolone', 'Natalizumab', 'Baclofen', 'Pyridostigmine'],
      correct: 1,
      explanation: 'Natalizumab is a monoclonal antibody against α4-integrin (VLA-4). Always screen for JC virus antibodies first due to risk of progressive multifocal leukoencephalopathy (PML)!',
    },
    facts: [
      'Uhthoff phenomenon: transient neurologic worsening with heat/hot showers or fever.',
      'Acute flares: high-dose IV corticosteroids; spasticity: baclofen; bladder urgency: oxybutynin.',
    ],
  },

  sarcoidosis: {
    id: 'sarcoidosis',
    systemId: 'pulm',
    systemName: 'Pulmonology & Critical Care',
    syndrome: 'Granulomatous lung disease + hypercalcemia',
    buzzword: 'Bilateral hilar adenopathy + noncaseating granulomas',
    diagnosis: 'Sarcoidosis',
    vignette: 'A 34-year-old African American woman presents with dry cough, exertional dyspnea, anterior uveitis, and tender erythematous nodules on her shins. Chest X-ray reveals prominent bilateral hilar lymphadenopathy. Serum calcium and ACE levels are elevated.',
    mechanism: 'CD4+ Th1-driven formation of noncaseating epithelioid granulomas; activated epithelioid macrophages express unregulated 1α-hydroxylase → excess conversion of 25-OH vitamin D to active 1,25-(OH)₂ vitamin D (calcitriol).',
    labSignature: 'Bilateral hilar lymphadenopathy, noncaseating granulomas (asteroid & Schaumann bodies), elevated serum ACE, hypercalcemia with SUPPRESSED PTH, restrictive PFTs, high BAL CD4:CD8 ratio.',
    trap: 'Hypercalcemia in sarcoidosis is PTH-independent (PTH is LOW!) and driven by macrophage 1α-hydroxylase—so corticosteroids dramatically lower calcium by suppressing macrophage calcitriol synthesis!',
    question: {
      stem: 'What hormone abnormality explains hypercalcemia in patients with sarcoidosis?',
      options: ['Paraneoplastic PTHrP secretion', 'Ectopic macrophage 1α-hydroxylase increasing 1,25-(OH)₂D', 'Primary parathyroid hyperplasia', 'Osteolytic IL-6 bone resorption'],
      correct: 1,
      explanation: 'Granuloma macrophages convert 25-(OH)D into active 1,25-(OH)₂D without feedback inhibition, increasing gut calcium absorption and suppressing endogenous PTH.',
    },
    facts: [
      'Löfgren syndrome (good prognosis): erythema nodosum + bilateral hilar adenopathy + migratory polyarthritis + fever.',
      'Always rule out infectious granulomas (Histoplasma, TB) before initiating systemic glucocorticoids.',
    ],
  },
};

// ————————————————————————————
// WEIGHTED CLINICAL STEM DECODER ENGINE
// ————————————————————————————

export interface DecoderMatch {
  caseId: string;
  diagnosis: string;
  system: string;
  detail: string;
  confidence: 'top' | 'possible' | 'unlikely';
  matchedClues?: string[];
}

export interface DecoderStem {
  id: string;
  label: string;
  text: string;
  matches: DecoderMatch[];
}

export const DECODER_STEMS: DecoderStem[] = [
  {
    id: 'stem-psgn',
    label: 'Cola urine post-strep',
    text: '8-year-old boy with cola-colored urine and periorbital edema 2 weeks after sore throat / impetigo, RBC casts, low serum C3, subepithelial humps.',
    matches: [
      { caseId: 'psgn', diagnosis: 'Poststreptococcal GN (PSGN)', system: 'Renal', detail: '2–3 wk latency post-GAS, low C3, subepithelial humps on EM, RBC casts', confidence: 'top', matchedClues: ['cola-colored urine', '2 weeks after', 'low C3', 'subepithelial humps'] },
      { caseId: 'psgn', diagnosis: 'IgA Nephropathy (Berger)', system: 'Renal', detail: 'Look-alike trap: 1–5 days post-URI (synpharyngitic) with NORMAL C3', confidence: 'possible' },
      { caseId: 'goodpasture', diagnosis: 'Membranoproliferative GN', system: 'Renal', detail: 'Persistent low C3 + tram-track GBM splitting rather than transient humps', confidence: 'unlikely' },
    ],
  },
  {
    id: 'stem-mcd',
    label: 'Child morning edema + Maltese cross',
    text: '4-year-old with periorbital edema worst in the morning, frothy urine, Maltese cross fatty casts, serum albumin 1.4, normal light microscopy.',
    matches: [
      { caseId: 'mcd', diagnosis: 'Minimal Change Disease (MCD)', system: 'Renal', detail: 'Diffuse foot process effacement on EM, normal LM, >90% steroid-responsive', confidence: 'top', matchedClues: ['periorbital edema', 'Maltese cross', 'normal light microscopy'] },
      { caseId: 'mcd', diagnosis: 'FSGS', system: 'Renal', detail: 'Also has foot process effacement, but segmental sclerosis on LM & steroid-resistant', confidence: 'possible' },
      { caseId: 'mcd', diagnosis: 'Membranous Nephropathy', system: 'Renal', detail: 'Spike-and-dome subepithelial deposits, anti-PLA2R, predominantly adults', confidence: 'unlikely' },
    ],
  },
  {
    id: 'stem-apl',
    label: 'Auer rods + oozing IV sites',
    text: '29-year-old with gingival bleeding, oozing from venipuncture sites, low fibrinogen, promyelocytes with Auer rod bundles, t(15;17).',
    matches: [
      { caseId: 'apl', diagnosis: 'APL (AML M3)', system: 'Heme/Onc', detail: 't(15;17) PML-RARα; Auer rod bundles + fulminant DIC; treat immediately with ATRA', confidence: 'top', matchedClues: ['oozing', 'Auer rod', 't(15;17)', 'promyelocytes'] },
      { caseId: 'apl', diagnosis: 'AML M2 (myeloblastic)', system: 'Heme/Onc', detail: 'Can show single Auer rods & t(8;21), rarely triggers fulminant DIC', confidence: 'possible' },
      { caseId: 'apl', diagnosis: 'Sepsis-induced DIC', system: 'Heme/Onc', detail: 'Explains coagulopathy, but lacks Auer-rod blasts', confidence: 'unlikely' },
    ],
  },
  {
    id: 'stem-hocm',
    label: 'Athlete syncope + Valsalva ↑ murmur',
    text: '19-year-old basketball player collapses after sprinting. Harsh systolic murmur at LLSB increases with Valsalva / standing and softens with squatting.',
    matches: [
      { caseId: 'hocm', diagnosis: 'Hypertrophic Cardiomyopathy (HOCM)', system: 'Cardio', detail: 'Dynamic LVOT obstruction, β-myosin heavy chain mutation, myofibrillar disarray', confidence: 'top', matchedClues: ['basketball player', 'increases with Valsalva', 'softens with squatting'] },
      { caseId: 'hocm', diagnosis: 'Valvular Aortic Stenosis', system: 'Cardio', detail: 'Opposite hemodynamics: murmur DECREASES with Valsalva and radiates to carotids', confidence: 'possible' },
    ],
  },
  {
    id: 'stem-wilson',
    label: 'Young adult tremor + Kayser-Fleischer',
    text: '21-year-old with wing-beating tremor, personality changes, elevated AST/ALT, low ceruloplasmin, Kayser-Fleischer corneal rings.',
    matches: [
      { caseId: 'wilson', diagnosis: 'Wilson Disease', system: 'GI / Neuro', detail: 'ATP7B mutation → copper deposition in liver, putamen & Descemet membrane', confidence: 'top', matchedClues: ['tremor', 'low ceruloplasmin', 'Kayser-Fleischer'] },
      { caseId: 'wilson', diagnosis: 'Hereditary Hemochromatosis', system: 'GI', detail: 'HFE C282Y iron overload (cirrhosis + bronze diabetes), lacks KF rings & basal ganglia signs in youth', confidence: 'possible' },
    ],
  },
  {
    id: 'stem-taysachs',
    label: 'Cherry-red macula, no organomegaly',
    text: '7-month-old Ashkenazi Jewish infant with startle reflex to noise, regression, cherry-red macula, and NO hepatosplenomegaly.',
    matches: [
      { caseId: 'taysachs', diagnosis: 'Tay-Sachs Disease', system: 'Biochem', detail: 'Hexosaminidase A deficiency → GM2 ganglioside; onion-skin lysosomes; NO hepatosplenomegaly', confidence: 'top', matchedClues: ['Ashkenazi', 'startle', 'cherry-red macula', 'NO hepatosplenomegaly'] },
      { caseId: 'taysachs', diagnosis: 'Niemann-Pick Disease Type A', system: 'Biochem', detail: 'Look-alike trap: cherry-red spot WITH hepatosplenomegaly (sphingomyelinase deficiency)', confidence: 'possible' },
    ],
  },
];

interface ScoringRule {
  keywords: Array<{ phrase: string; weight: number }>;
  stemRef: string;
  customMatches?: DecoderMatch[];
}

const SCORING_RULES: ScoringRule[] = [
  {
    stemRef: 'stem-psgn',
    keywords: [
      { phrase: 'cola', weight: 5 },
      { phrase: 'tea-colored', weight: 4 },
      { phrase: 'post-strep', weight: 6 },
      { phrase: 'sore throat', weight: 4 },
      { phrase: 'pharyngitis', weight: 4 },
      { phrase: 'impetigo', weight: 5 },
      { phrase: 'crusted', weight: 3 },
      { phrase: 'subepithelial humps', weight: 7 },
      { phrase: 'lumpy-bumpy', weight: 6 },
      { phrase: 'low c3', weight: 5 },
      { phrase: 'decreased c3', weight: 5 },
      { phrase: 'two weeks', weight: 3 },
      { phrase: '2 weeks', weight: 3 },
      { phrase: 'three weeks', weight: 3 },
      { phrase: 'rbc casts', weight: 2 },
    ],
  },
  {
    stemRef: 'stem-mcd',
    keywords: [
      { phrase: 'maltese cross', weight: 7 },
      { phrase: 'foot process', weight: 6 },
      { phrase: 'frothy urine', weight: 4 },
      { phrase: 'normal light microscopy', weight: 6 },
      { phrase: 'selective albuminuria', weight: 6 },
      { phrase: 'morning', weight: 2 },
      { phrase: 'albumin 1.', weight: 4 },
      { phrase: 'hodgkin', weight: 3 },
    ],
  },
  {
    stemRef: 'stem-apl',
    keywords: [
      { phrase: 'auer rod', weight: 7 },
      { phrase: '15;17', weight: 8 },
      { phrase: 'pml-rar', weight: 8 },
      { phrase: 'promyelocyt', weight: 6 },
      { phrase: 'faggot', weight: 6 },
      { phrase: 'atra', weight: 5 },
      { phrase: 'oozing', weight: 3 },
      { phrase: 'venipuncture', weight: 3 },
      { phrase: 'dic', weight: 3 },
    ],
  },
  {
    stemRef: 'stem-hocm',
    keywords: [
      { phrase: 'valsalva', weight: 6 },
      { phrase: 'squatting', weight: 6 },
      { phrase: 'basketball', weight: 4 },
      { phrase: 'athlete', weight: 4 },
      { phrase: 'septal hypertrophy', weight: 7 },
      { phrase: 'myofibrillar disarray', weight: 8 },
      { phrase: 'myosin', weight: 5 },
      { phrase: 'sprinting', weight: 3 },
    ],
  },
  {
    stemRef: 'stem-wilson',
    keywords: [
      { phrase: 'kayser-fleischer', weight: 8 },
      { phrase: 'kayser', weight: 6 },
      { phrase: 'ceruloplasmin', weight: 7 },
      { phrase: 'atp7b', weight: 8 },
      { phrase: 'copper', weight: 5 },
      { phrase: 'wing-beating', weight: 6 },
      { phrase: 'corneal ring', weight: 6 },
      { phrase: 'putamen', weight: 4 },
      { phrase: 'penicillamine', weight: 5 },
    ],
  },
  {
    stemRef: 'stem-taysachs',
    keywords: [
      { phrase: 'cherry-red', weight: 6 },
      { phrase: 'hexosaminidase', weight: 8 },
      { phrase: 'gm2', weight: 7 },
      { phrase: 'onion-skin', weight: 7 },
      { phrase: 'startle', weight: 4 },
      { phrase: 'hyperacusis', weight: 6 },
      { phrase: 'no hepatosplenomegaly', weight: 6 },
      { phrase: 'ashkenazi', weight: 3 },
    ],
  },
  {
    stemRef: 'goodpasture-rule',
    keywords: [
      { phrase: 'linear igg', weight: 8 },
      { phrase: 'anti-gbm', weight: 8 },
      { phrase: 'hemoptysis', weight: 5 },
      { phrase: 'type iv collagen', weight: 7 },
      { phrase: 'pulmonary-renal', weight: 6 },
    ],
    customMatches: [
      { caseId: 'goodpasture', diagnosis: 'Goodpasture Syndrome', system: 'Renal / Pulm', detail: 'Anti-GBM (α3 type IV collagen), smooth linear IgG on IF, hemoptysis + hematuria', confidence: 'top' },
      { caseId: 'goodpasture', diagnosis: 'Granulomatosis with Polyangiitis (GPA)', system: 'Renal / Pulm', detail: 'c-ANCA (PR3) positive, pauci-immune IF, sinusitis/saddle-nose deformity', confidence: 'possible' },
    ],
  },
  {
    stemRef: 'graves-rule',
    keywords: [
      { phrase: 'pretibial myxedema', weight: 8 },
      { phrase: 'exophthalmos', weight: 7 },
      { phrase: 'proptosis', weight: 5 },
      { phrase: 'tsi', weight: 5 },
      { phrase: 'heat intolerance', weight: 4 },
      { phrase: 'low tsh', weight: 4 },
      { phrase: 'suppressed tsh', weight: 5 },
    ],
    customMatches: [
      { caseId: 'graves', diagnosis: 'Graves Disease', system: 'Endo', detail: 'TSI receptor autoantibodies, diffuse RAIU, exophthalmos + pretibial myxedema', confidence: 'top' },
      { caseId: 'graves', diagnosis: 'Subacute (de Quervain) Thyroiditis', system: 'Endo', detail: 'Painful jaw-radiating thyroid + LOW radioactive iodine uptake', confidence: 'possible' },
    ],
  },
  {
    stemRef: 'ms-rule',
    keywords: [
      { phrase: 'oligoclonal', weight: 8 },
      { phrase: 'dawson', weight: 7 },
      { phrase: 'optic neuritis', weight: 6 },
      { phrase: 'mlf', weight: 6 },
      { phrase: 'internuclear', weight: 7 },
      { phrase: 'adduct', weight: 4 },
      { phrase: 'periventricular', weight: 5 },
    ],
    customMatches: [
      { caseId: 'ms', diagnosis: 'Multiple Sclerosis (MS)', system: 'Neuro', detail: 'CNS demyelination in space & time, INO (MLF), optic neuritis, CSF IgG oligoclonal bands', confidence: 'top' },
      { caseId: 'ms', diagnosis: 'Neuromyelitis Optica (NMO)', system: 'Neuro', detail: 'Anti-aquaporin-4 antibodies, bilateral optic neuritis + longitudinal transverse myelitis', confidence: 'possible' },
    ],
  },
  {
    stemRef: 'sarcoid-rule',
    keywords: [
      { phrase: 'bilateral hilar', weight: 8 },
      { phrase: 'noncaseating', weight: 7 },
      { phrase: 'erythema nodosum', weight: 5 },
      { phrase: '1α-hydroxylase', weight: 7 },
      { phrase: 'schaumann', weight: 6 },
      { phrase: 'asteroid bod', weight: 6 },
    ],
    customMatches: [
      { caseId: 'sarcoidosis', diagnosis: 'Sarcoidosis', system: 'Pulm', detail: 'Bilateral hilar adenopathy, noncaseating granulomas, macrophage 1α-hydroxylase → high Ca²⁺', confidence: 'top' },
      { caseId: 'sarcoidosis', diagnosis: 'Berylliosis', system: 'Pulm', detail: 'Also noncaseating granulomas + hilar nodes; aerospace/nuclear manufacturing exposure', confidence: 'possible' },
    ],
  },
];

export function decodeClinicalStem(input: string): {
  matches: DecoderMatch[];
  detectedClues: string[];
  noMatch: boolean;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { matches: [], detectedClues: [], noMatch: false };
  }

  // Exact match to sample stem first
  const exact = DECODER_STEMS.find((s) => s.text.toLowerCase() === trimmed.toLowerCase());
  if (exact) {
    return {
      matches: exact.matches,
      detectedClues: exact.matches[0]?.matchedClues ?? [],
      noMatch: false,
    };
  }

  const lower = trimmed.toLowerCase();
  let bestScore = 0;
  let bestRule: ScoringRule | null = null;
  let bestClues: string[] = [];

  for (const rule of SCORING_RULES) {
    let score = 0;
    const clues: string[] = [];
    for (const kw of rule.keywords) {
      if (lower.includes(kw.phrase)) {
        score += kw.weight;
        clues.push(kw.phrase);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
      bestClues = clues;
    }
  }

  if (bestRule && bestScore >= 3) {
    const baseMatches =
      bestRule.customMatches ??
      DECODER_STEMS.find((s) => s.id === bestRule!.stemRef)?.matches ??
      [];
    const matches = baseMatches.map((m, idx) =>
      idx === 0 ? { ...m, matchedClues: bestClues } : m
    );
    return { matches, detectedClues: bestClues, noMatch: false };
  }

  return {
    matches: [],
    detectedClues: [],
    noMatch: trimmed.length >= 6,
  };
}

// ————————————————————————————
// 16 SYSTEMS (official catalog with populated preview cases)
// ————————————————————————————

export const SYSTEMS: SystemDef[] = [
  {
    id: 'renal', name: 'Renal & Nephrology', shortName: 'Renal',
    cases: 95, syndromes: 20,
    color: '#D97706', bgTint: '#FFFBEB', borderTint: '#FDE68A', badgeText: '#92400E',
    description: 'Glomerular EM/IF buzzwords, renal tubular defects & urinary casts',
    freeCases: [DEMO_CASES.psgn, DEMO_CASES.goodpasture, DEMO_CASES.mcd],
    paidCaseSample: [
      { id: 'fsgs',   title: 'FSGS',             syndrome: 'Nephrotic', buzzword: 'Segmental sclerosis, HIV / heroin / sickle cell' },
      { id: 'mpgn',   title: 'MPGN Type I & II', syndrome: 'Mixed',     buzzword: 'Tram-track GBM splitting, C3 nephritic factor' },
      { id: 'alport', title: 'Alport syndrome',  syndrome: 'Nephritic', buzzword: 'Basket-weave GBM, sensorineural deafness, COL4A5' },
      { id: 'iga',    title: 'IgA nephropathy',  syndrome: 'Nephritic', buzzword: 'Synpharyngitic hematuria (1–3 d), normal C3' },
    ],
  },
  {
    id: 'heme', name: 'Hematology & Oncology', shortName: 'Heme/Onc',
    cases: 108, syndromes: 18,
    color: '#BE123C', bgTint: '#FFF1F2', borderTint: '#FECDD3', badgeText: '#881337',
    description: 'Peripheral smear buzzwords, leukemia/lymphoma translocations & coagulopathies',
    freeCases: [DEMO_CASES.apl],
    paidCaseSample: [
      { id: 'cml',     title: 'CML',                syndrome: 'Myeloproliferative', buzzword: 't(9;22) BCR-ABL, low LAP, basophilia' },
      { id: 'burkitt', title: 'Burkitt lymphoma',   syndrome: 'Non-Hodgkin',        buzzword: 't(8;14) c-MYC, starry-sky macrophages' },
      { id: 'ttp',     title: 'TTP',                syndrome: 'Microangiopathic',   buzzword: 'ADAMTS13 deficiency, schistocytes, normal PT/PTT' },
    ],
  },
  {
    id: 'cardio', name: 'Cardiology & Vascular', shortName: 'Cardio',
    cases: 108, syndromes: 11,
    color: '#E11D48', bgTint: '#FFF1F2', borderTint: '#FECDD3', badgeText: '#9F1239',
    description: 'Complete Step 1 multimedia module: 11 chapters, 108 topics, 254 clinical figures, 12 auscultation/echo videos & 393 Q&As',
    freeCases: [DEMO_CASES.hocm],
    paidCaseSample: [],
  },
  {
    id: 'endo', name: 'Endocrinology & Metabolic', shortName: 'Endo',
    cases: 79, syndromes: 20,
    color: '#0D9488', bgTint: '#F0FDFA', borderTint: '#99F6E4', badgeText: '#115E59',
    description: 'Thyroid/parathyroid axes, MEN syndromes, adrenal steroidogenesis & pituitary',
    freeCases: [DEMO_CASES.graves],
    paidCaseSample: [
      { id: 'pheo',      title: 'Pheochromocytoma',     syndrome: 'Adrenal Medulla', buzzword: 'Episodic 5 Ps, plasma metanephrines, α-blockade first' },
      { id: 'hashimoto', title: 'Hashimoto Thyroiditis',syndrome: 'Hypothyroidism',  buzzword: 'Hürthle cells, lymphoid follicles, anti-TPO' },
      { id: 'cah21',     title: '21-Hydroxylase Def.',  syndrome: 'Adrenal Cortex',  buzzword: 'Salt wasting, hyperkalemia, elevated 17-OH progesterone' },
    ],
  },
  {
    id: 'gi', name: 'Gastroenterology & Hepatobiliary', shortName: 'GI',
    cases: 118, syndromes: 29,
    color: '#EA580C', bgTint: '#FFF7ED', borderTint: '#FED7AA', badgeText: '#9A3412',
    description: 'Cirrhosis & biliary pathology, malabsorption buzzwords & GI polyposis',
    freeCases: [DEMO_CASES.wilson],
    paidCaseSample: [
      { id: 'pbc',     title: 'Primary Biliary Cholangitis', syndrome: 'Cholestatic', buzzword: 'Anti-mitochondrial Ab (AMA), florid bile duct lesion' },
      { id: 'whipple', title: 'Whipple Disease',             syndrome: 'Malabsorption',buzzword: 'PAS+ foamy macrophages, arthralgias, T. whipplei' },
      { id: 'celiac',  title: 'Celiac Disease',              syndrome: 'Malabsorption',buzzword: 'Anti-tTG IgA, blunted villi, dermatitis herpetiformis' },
    ],
  },
  {
    id: 'neuro', name: 'Neurology & CNS Pathology', shortName: 'Neuro',
    cases: 42, syndromes: 20,
    color: '#7C3AED', bgTint: '#F5F3FF', borderTint: '#DDD6FE', badgeText: '#5B21B6',
    description: 'CNS tumor histology, demyelinating syndromes & brainstem stroke localization',
    freeCases: [DEMO_CASES.ms],
    paidCaseSample: [
      { id: 'gbm',        title: 'Glioblastoma (GBM)',   syndrome: 'Adult CNS Tumor', buzzword: 'Butterfly corpus callosum lesion, pseudopalisading necrosis' },
      { id: 'wallenberg', title: 'Lateral Medullary',    syndrome: 'Brainstem Stroke',buzzword: 'PICA occlusion, dysphagia/hoarseness (nucleus ambiguus) + Horner' },
      { id: 'gbs',        title: 'Guillain-Barré',       syndrome: 'PNS Demyelination',buzzword: 'Ascending paralysis post-Campylobacter, albuminocytologic dissociation' },
    ],
  },
  {
    id: 'biochem', name: 'Biochemistry & Genetics', shortName: 'Biochem',
    cases: 76, syndromes: 21,
    color: '#4F46E5', bgTint: '#EEF2FF', borderTint: '#C7D2FE', badgeText: '#3730A3',
    description: 'Metabolism, lysosomal/glycogen storage diseases, collagen & vitamin deficiencies',
    freeCases: [DEMO_CASES.taysachs],
    paidCaseSample: [
      { id: 'pku',     title: 'Phenylketonuria (PKU)', syndrome: 'Amino Acid', buzzword: 'Musty body odor, fair skin, BH4 / phenylalanine hydroxylase' },
      { id: 'gaucher', title: 'Gaucher Disease',       syndrome: 'Lysosomal',  buzzword: 'Crumpled tissue-paper macrophages, avascular femur necrosis' },
      { id: 'pompe',   title: 'Pompe Disease (Type II)',syndrome: 'Glycogen',  buzzword: 'Cardiomegaly + hypotonia in infant, α-1,4-glucosidase' },
    ],
  },
  {
    id: 'pulm', name: 'Pulmonology & Critical Care', shortName: 'Pulm',
    cases: 93, syndromes: 23,
    color: '#0284C7', bgTint: '#F0F9FF', borderTint: '#BAE6FD', badgeText: '#075985',
    description: 'Pneumoconioses, interstitial lung disease, lung cancer paraneoplastics & ARDS',
    freeCases: [DEMO_CASES.sarcoidosis],
    paidCaseSample: [
      { id: 'sclc',       title: 'Small Cell Lung Cancer', syndrome: 'Paraneoplastic', buzzword: 'Central smoker mass, Kulchitsky cells, SIADH / ACTH / Lambert-Eaton' },
      { id: 'asbestosis', title: 'Asbestosis',             syndrome: 'Pneumoconiosis', buzzword: 'Shipyard/roofing, calcified pleural plaques, ferruginous bodies' },
    ],
  },
  {
    id: 'micro', name: 'Microbiology & Immunology', shortName: 'Micro/Immuno',
    cases: 82, syndromes: 26,
    color: '#059669', bgTint: '#ECFDF5', borderTint: '#A7F3D0', badgeText: '#065F46',
    description: 'Dimorphic fungi, bacterial toxins, viral inclusions & primary immunodeficiencies',
    freeCases: [DEMO_CASES.psgn],
    paidCaseSample: [
      { id: 'cgd',    title: 'Chronic Granulomatous Disease', syndrome: 'Immunodeficiency', buzzword: 'NADPH oxidase defect, abnormal DHR test, catalase+ organisms' },
      { id: 'crypto', title: 'Cryptococcus neoformans',       syndrome: 'Fungal Opportunist',buzzword: 'Pigeon droppings, India ink halo, soap-bubble brain lesions' },
    ],
  },
  {
    id: 'msk', name: 'Musculoskeletal & Rheumatology', shortName: 'MSK/Rheum',
    cases: 46, syndromes: 22,
    color: '#A16207', bgTint: '#FEFCE8', borderTint: '#FDE68A', badgeText: '#854D0E',
    description: 'Brachial/lumbosacral nerve injuries, bone tumors, crystal arthropathies & SLE',
    freeCases: [DEMO_CASES.goodpasture],
    paidCaseSample: [
      { id: 'gout', title: 'Acute Gouty Arthritis', syndrome: 'Crystal Arthropathy', buzzword: 'Needle-shaped negatively birefringent MSU crystals (yellow parallel)' },
      { id: 'ewing',title: 'Ewing Sarcoma',         syndrome: 'Pediatric Bone Tumor',buzzword: 't(11;22) EWS-FLI1, onion-skin periosteal reaction, small blue cells' },
    ],
  },
  {
    id: 'derm', name: 'Dermatology', shortName: 'Derm',
    cases: 24, syndromes: 12,
    color: '#C026D3', bgTint: '#FDF2F8', borderTint: '#FBCFE8', badgeText: '#9D174D',
    description: 'Autoimmune blistering diseases, cutaneous infections & skin malignancies',
    freeCases: [DEMO_CASES.graves],
    paidCaseSample: [
      { id: 'pemphigus', title: 'Pemphigus Vulgaris', syndrome: 'Blistering', buzzword: 'Anti-desmoglein 1/3, Nikolsky+, tombstone basal cells, net-like IF' },
    ],
  },
  {
    id: 'repro', name: 'Reproductive & Breast', shortName: 'Repro',
    cases: 124, syndromes: 13,
    color: '#65A30D', bgTint: '#F7FEE7', borderTint: '#D9F99D', badgeText: '#365314',
    description: 'Embryology, DSDs, obstetric pathology, ovarian/testicular & breast tumors',
    freeCases: [DEMO_CASES.graves],
    paidCaseSample: [
      { id: 'granulosa', title: 'Granulosa Cell Tumor', syndrome: 'Sex Cord-Stromal', buzzword: 'Call-Exner bodies, excess estrogen → endometrial hyperplasia, inhibin+' },
    ],
  },
  {
    id: 'epi', name: 'Epidemiology & Biostatistics', shortName: 'Epi/Biostats',
    cases: 32, syndromes: 5,
    color: '#0F766E', bgTint: '#F0FDFA', borderTint: '#99F6E4', badgeText: '#134E4A',
    description: 'Study designs, sensitivity/specificity, likelihood ratios, bias & ethics',
    freeCases: [DEMO_CASES.mcd],
    paidCaseSample: [
      { id: 'leadtime', title: 'Lead-Time Bias', syndrome: 'Screening Bias', buzzword: 'Early detection inflates apparent survival without delaying death' },
    ],
  },
  {
    id: 'path', name: 'General Pathology', shortName: 'Gen Path',
    cases: 28, syndromes: 5,
    color: '#7E22CE', bgTint: '#FAF5FF', borderTint: '#E9D5FF', badgeText: '#581C87',
    description: 'Cell injury/necrosis patterns, acute/chronic inflammation, amyloid & neoplasia',
    freeCases: [DEMO_CASES.sarcoidosis],
    paidCaseSample: [
      { id: 'amyloid', title: 'AL vs AA Amyloidosis', syndrome: 'Protein Misfolding', buzzword: 'Congo red apple-green birefringence, β-pleated sheets' },
    ],
  },
  {
    id: 'psych', name: 'Psychiatry', shortName: 'Psych',
    cases: 45, syndromes: 21,
    color: '#BE185D', bgTint: '#FDF2F8', borderTint: '#FBCFE8', badgeText: '#9D174D',
    description: 'Psychosis timelines, mood/anxiety, personality clusters, sleep & toxidromes',
    freeCases: [DEMO_CASES.wilson],
    paidCaseSample: [
      { id: 'nms', title: 'Neuroleptic Malignant Syndrome', syndrome: 'Drug Emergency', buzzword: 'Lead-pipe rigidity + fever + high CK after D2 antagonist; dantrolene' },
    ],
  },
  {
    id: 'pharm', name: 'Autonomic & General Pharmacology', shortName: 'Pharm',
    cases: 13, syndromes: 2,
    color: '#9333EA', bgTint: '#FAF5FF', borderTint: '#E9D5FF', badgeText: '#6B21A8',
    description: 'Pharmacokinetics, dose-response curves, autonomic receptors & antidotes',
    freeCases: [DEMO_CASES.hocm],
    paidCaseSample: [
      { id: 'organophos', title: 'Organophosphate Poisoning', syndrome: 'Cholinergic Crisis', buzzword: 'DUMBBELSS after crop spraying; atropine + pralidoxime (2-PAM)' },
    ],
  },
];

// ————————————————————————————
// CROSS-SYSTEM REPEAT LABEL ("alsoIn")
//
// Some rapid-fire questions deliberately repeat in more than one system as
// spaced repetition. The data marks those items with `alsoIn: string[]`
// (system ids). This helper turns that field into the label shown in Drill
// and in the Atlas Hub Q&A list. Returns null when there is nothing to show.
// ————————————————————————————

const SYSTEM_NAME_MAP = new Map<string, string>(SYSTEMS.map((s) => [s.id, s.name]));

/** Map a system id to its display name (falls back to the raw id). */
export function getSystemName(systemId: string): string {
  return SYSTEM_NAME_MAP.get(systemId) ?? systemId;
}

/**
 * Label for a question that also appears in other systems.
 * - alsoIn lists other systems → "Also in <Name>, <Name> — spaced repetition"
 * - alsoIn lists only the current system → "Repeated in this system — spaced repetition"
 * - no alsoIn / empty → null (render nothing)
 */
export function getAlsoInLabel(
  alsoIn: string[] | undefined,
  currentSystemId: string | null | undefined
): string | null {
  if (!alsoIn || alsoIn.length === 0) return null;
  const others = alsoIn.filter((id) => id !== currentSystemId);
  if (others.length === 0) return 'Repeated in this system — spaced repetition';
  const names = others.map((id) => getSystemName(id));
  return `Also in ${names.join(', ')} — spaced repetition`;
}

// ————————————————————————————
// 5-STEP DIAGNOSTIC FRAMEWORKS
// ————————————————————————————

export interface FrameworkBranch {
  badge: string;
  title: string;
  detail: string;
  tone: 'teal' | 'amber' | 'navy';
}

export interface Framework {
  system: string;
  caseLinkId: string;
  steps: string[];
  branches: FrameworkBranch[];
}

export const FRAMEWORKS: Framework[] = [
  {
    system: 'Endocrine System',
    caseLinkId: 'graves',
    steps: [
      'Identify the Organ / Axis (Thyroid, Adrenal, Pituitary, Ca²⁺)',
      'Assess Hormone Output (Hyperfunction vs. Hypofunction)',
      'Localize Defect via Tropic Hormone (Primary vs. Secondary)',
      'Check Feedback Loops & Dynamic Suppression Tests',
      'Confirm with Antibodies, RAIU, or Pathognomonic Clues',
    ],
    branches: [
      { badge: 'Low TSH + High FT4', title: 'Primary Hyperthyroidism', detail: 'Check RAIU: Diffuse uptake + exophthalmos → Graves. Patchy → Toxic MNG. Low RAIU → Thyroiditis / exogenous T4.', tone: 'amber' },
      { badge: 'High TSH + Low FT4', title: 'Primary Hypothyroidism', detail: 'Anti-TPO + Hürthle cells + painless goiter → Hashimoto. Post-thyroidectomy / iodine deficiency.', tone: 'teal' },
      { badge: 'High TSH + High FT4', title: 'Secondary (TSH-oma) / Resistance', detail: 'Loss of negative feedback: pituitary thyrotroph adenoma → MRI sella.', tone: 'navy' },
    ],
  },
  {
    system: 'Renal System',
    caseLinkId: 'psgn',
    steps: [
      'Localize Compartment (Glomerular vs. Tubular vs. Prerenal/Postrenal)',
      'Classify Glomerular Syndrome (Nephritic vs. Nephrotic vs. Mixed)',
      'Stratify by Serum Complement (Low C3 vs. Normal C3)',
      'Inspect Immunofluorescence Pattern (Linear vs. Granular vs. Pauci)',
      'Lock Diagnosis on Electron Microscopy + Vignette Latency',
    ],
    branches: [
      { badge: 'Nephritic + Low C3', title: 'Immune-Complex Complement Consumption', detail: '2–3 wks post-strep + subepithelial humps → PSGN. Tram-track → MPGN. Full-house IF → Diffuse proliferative SLE.', tone: 'amber' },
      { badge: 'Nephritic + Normal C3', title: 'IgA / Anti-GBM / ANCA', detail: '1–3 days post-URI → IgA. Linear IgG + hemoptysis → Goodpasture. Pauci-immune → GPA / MPA / EGPA.', tone: 'teal' },
      { badge: 'Nephrotic (>3.5 g/d)', title: 'Podocyte Barrier Loss', detail: 'Child + normal LM → Minimal Change. Adult Black/HIV → FSGS. Anti-PLA2R spike & dome → Membranous.', tone: 'navy' },
    ],
  },
  {
    system: 'Respiratory System',
    caseLinkId: 'sarcoidosis',
    steps: [
      'Classify Spirometry (FEV1/FVC < 70% Obstructive vs. Restrictive TLC ↓)',
      'Compute A-a Gradient & DLCO (Parenchymal vs. Extraparenchymal)',
      'Map Lobar / Hilar / Interstitial Distribution on Chest Imaging',
      'Evaluate Bronchoalveolar Lavage, Sputum & Granuloma Histology',
      'Link Paraneoplastic or Systemic Autoimmune Hooks',
    ],
    branches: [
      { badge: 'Restrictive + Low DLCO', title: 'Intrinsic Interstitial / Granulomatous', detail: 'Bilateral hilar nodes + high Ca²⁺ → Sarcoidosis. Honeycomb lower lobes → IPF. Shipyard plaques → Asbestosis.', tone: 'teal' },
      { badge: 'Restrictive + Normal DLCO', title: 'Chest Wall / Neuromuscular Hypoventilation', detail: 'Normal A-a gradient: Myasthenia gravis, ALS, Guillain-Barré, severe obesity/kyphoscoliosis.', tone: 'navy' },
      { badge: 'Central Smoker Mass', title: 'Neuroendocrine vs. Squamous Paraneoplastics', detail: 'SIADH / ACTH / Lambert-Eaton → Small Cell. PTHrP hypercalcemia + keratin pearls → Squamous Cell.', tone: 'amber' },
    ],
  },
  {
    system: 'Gastrointestinal & Hepatobiliary',
    caseLinkId: 'wilson',
    steps: [
      'Separate Hepatocellular (AST/ALT ↑↑) vs. Cholestatic (ALP/GGT ↑↑)',
      'Fractionate Bilirubin (Unconjugated/Indirect vs. Conjugated/Direct)',
      'Screen Inherited Metabolic vs. Autoimmune Liver Signatures',
      'Evaluate Endoscopy, Barium Contrast, or Biliary Tree Imaging',
      'Confirm with Special Stains, Serology & Genetic Mutations',
    ],
    branches: [
      { badge: 'Age <40 + Neuro + Liver', title: 'Copper Overload (ATP7B)', detail: 'Low ceruloplasmin + Kayser-Fleischer rings + dysarthria/tremor → Wilson disease.', tone: 'amber' },
      { badge: 'High ALP + Pruritus', title: 'Autoimmune Biliary Destruction', detail: 'Middle-aged woman + AMA+ → PBC. Man with UC + "beads-on-a-string" MRCP → PSC.', tone: 'teal' },
      { badge: 'AST:ALT > 2:1', title: 'Mitochondrial AST Release', detail: 'Mallory-Denk hyaline bodies + macrocytosis → Alcoholic hepatitis.', tone: 'navy' },
    ],
  },
  {
    system: 'Neurology & Neuroanatomy',
    caseLinkId: 'ms',
    steps: [
      'Localize Neuraxis Level (Cortex, Subcortex, Brainstem, Cord, NMJ, Nerve)',
      'Pair Long-Tract Findings with Cranial Nerve "Rule of 4s" Nuclei',
      'Establish Tempo (Hyperacute Vascular vs. Relapsing Demyelinating)',
      'Analyze CSF Profile, Autoantibodies & MRI Contrast Patterns',
      'Confirm with Histopathology & Classic Eponymous Syndromes',
    ],
    branches: [
      { badge: 'Relapsing Space & Time', title: 'CNS Oligodendrocyte Autoimmunity', detail: 'Young woman + optic neuritis + INO (MLF) + CSF oligoclonal bands → Multiple Sclerosis.', tone: 'navy' },
      { badge: 'Ascending Areflexia', title: 'PNS Schwann Cell Molecular Mimicry', detail: 'Post-Campylobacter diarrhea + high CSF protein with normal WBCs → Guillain-Barré.', tone: 'teal' },
      { badge: 'Fatigable Ptosis/Diplopia', title: 'Postsynaptic vs. Presynaptic NMJ', detail: 'Worsens late in day + thymoma → Myasthenia Gravis (anti-AChR). Improves with use + SCLC → Lambert-Eaton.', tone: 'amber' },
    ],
  },
  {
    system: 'Hematology & Oncology',
    caseLinkId: 'apl',
    steps: [
      'Identify Affected Lineage (RBC/MCV, WBC Differential, Platelets/Coag)',
      'Stratify Anemia by MCV + Reticulocyte Index + Hemolysis Labs',
      'Separate Platelet (Mucosal/PT normal) vs. Factor (Deep/PT-PTT ↑) Bleeding',
      'Inspect Peripheral Blood Smear Morphology (Schistocytes, Smudge, Rods)',
      'Lock Diagnosis with Cytogenetic Translocation or Flow Cytometry',
    ],
    branches: [
      { badge: 'Blasts + Auer Rods + DIC', title: 't(15;17) PML-RARα Emergency', detail: 'Oozing IV sites + low fibrinogen → APL (AML M3). Give ATRA immediately!', tone: 'amber' },
      { badge: 'Schistocytes + Low Plt', title: 'MAHA vs. Consumptive Coagulopathy', detail: 'Normal PT/PTT + neuro/renal + low ADAMTS13 → TTP. Prolonged PT/PTT + high D-dimer → DIC.', tone: 'teal' },
      { badge: 'Lymphocytosis >55 yo', title: 'Mature B-Cell Smudge Cells', detail: 'CD5+ CD20+ CD23+ smudge cells → CLL (watch for Richter transformation to DLBCL).', tone: 'navy' },
    ],
  },
  {
    system: 'Cardiology & Hemodynamics',
    caseLinkId: 'hocm',
    steps: [
      'Pinpoint Auscultation Post & Timing (Systolic vs. Diastolic)',
      'Test Dynamic Preload/Afterload Maneuvers (Valsalva, Squat, Handgrip)',
      'Correlate JVP Waveforms, Arterial Pulse & Pericardial Signs',
      'Read ECG Axis, Conduction Blocks & ST-Segment Territory',
      'Confirm Structural/Genetic Cause on Echo or Biopsy',
    ],
    branches: [
      { badge: 'Murmur ↑ w/ Valsalva', title: 'Volume-Sensitive Dynamic Obstruction', detail: 'Less LV blood = louder murmur → HOCM (harsher) or MVP (earlier mid-systolic click).', tone: 'amber' },
      { badge: 'Murmur ↑ w/ Squatting', title: 'Flow-Dependent Valvular Lesions', detail: 'More venous return = more flow across stenotic/regurgitant valve → AS, MR, VSD.', tone: 'teal' },
      { badge: 'Hypotension + High JVP', title: 'Obstructive / Right-Heart Shock', detail: 'Clear lungs + muffled heart sounds + pulsus paradoxus → Cardiac Tamponade.', tone: 'navy' },
    ],
  },
  {
    system: 'Biochemistry & Storage Diseases',
    caseLinkId: 'taysachs',
    steps: [
      'Recognize Clinical Cluster (Fasting Hypoglycemia vs. Regression/Coarse Facies)',
      'Check Key Physical Splitter (Hepatosplenomegaly vs. Corneal Clouding)',
      'Examine Fundoscopy & Smear (Cherry-Red Spot vs. Foam/Gaucher Cells)',
      'Identify Deficient Lysosomal or Metabolic Enzyme',
      'Map Accumulated Substrate & Inheritance Pattern (X-linked vs. AR)',
    ],
    branches: [
      { badge: 'Cherry-Red + NO Organomegaly', title: 'GM2 Gangliosidosis', detail: 'Hexosaminidase A deficiency + hyperacusis + onion-skin lysosomes → Tay-Sachs.', tone: 'amber' },
      { badge: 'Cherry-Red + Hepatosplenomegaly', title: 'Sphingomyelin Accumulation', detail: 'Sphingomyelinase deficiency + lipid-laden foam cells → Niemann-Pick.', tone: 'teal' },
      { badge: 'Pancytopenia + Bone Crises', title: 'Most Common Lysosomal Disease', detail: 'Glucocerebrosidase deficiency + crumpled tissue-paper macrophages → Gaucher.', tone: 'navy' },
    ],
  },
];
