import React, { useState, useMemo, useEffect, useRef } from 'react';
import { IconX } from '@/components/icons/Icons';
import { cn } from '@/lib/cn';

interface LabValuesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LabCategory =
  | 'All'
  | 'Serum / BMP'
  | 'CBC & Coags'
  | 'ABG'
  | 'Liver & Pancreas'
  | 'Cardiac & Lipids'
  | 'Endocrine'
  | 'CSF & Urine';

interface LabRow {
  category: Exclude<LabCategory, 'All'>;
  name: string;
  conventional: string;
  si?: string;
}

const CATEGORIES: LabCategory[] = [
  'All',
  'Serum / BMP',
  'CBC & Coags',
  'ABG',
  'Liver & Pancreas',
  'Cardiac & Lipids',
  'Endocrine',
  'CSF & Urine',
];

const LAB_DATA: LabRow[] = [
  // Serum / BMP
  { category: 'Serum / BMP', name: 'Sodium (Na+)', conventional: '136–146 mEq/L', si: '136–146 mmol/L' },
  { category: 'Serum / BMP', name: 'Potassium (K+)', conventional: '3.5–5.0 mEq/L', si: '3.5–5.0 mmol/L' },
  { category: 'Serum / BMP', name: 'Chloride (Cl-)', conventional: '95–105 mEq/L', si: '95–105 mmol/L' },
  { category: 'Serum / BMP', name: 'Bicarbonate (HCO3-)', conventional: '22–28 mEq/L', si: '22–28 mmol/L' },
  { category: 'Serum / BMP', name: 'Urea nitrogen (BUN)', conventional: '7–18 mg/dL', si: '2.5–6.4 mmol/L' },
  { category: 'Serum / BMP', name: 'Creatinine (Cr)', conventional: '0.6–1.2 mg/dL', si: '53–106 µmol/L' },
  { category: 'Serum / BMP', name: 'Glucose (fasting)', conventional: '70–99 mg/dL', si: '3.9–5.5 mmol/L' },
  { category: 'Serum / BMP', name: 'Calcium (total)', conventional: '8.4–10.2 mg/dL', si: '2.1–2.6 mmol/L' },
  { category: 'Serum / BMP', name: 'Magnesium (Mg2+)', conventional: '1.5–2.0 mEq/L', si: '0.75–1.0 mmol/L' },
  { category: 'Serum / BMP', name: 'Phosphorus (PO4)', conventional: '3.0–4.5 mg/dL', si: '1.0–1.5 mmol/L' },
  { category: 'Serum / BMP', name: 'Osmolality (serum)', conventional: '275–295 mOsmol/kg', si: '275–295 mmol/kg' },
  { category: 'Serum / BMP', name: 'Uric acid', conventional: 'M: 3.4–7.0 · F: 2.4–6.0 mg/dL', si: '202–416 µmol/L' },
  { category: 'Serum / BMP', name: 'Lactate (arterial / venous)', conventional: '0.5–2.2 mEq/L', si: '0.5–2.2 mmol/L' },

  // CBC & Coags
  { category: 'CBC & Coags', name: 'Hemoglobin (Hb)', conventional: 'M: 13.5–17.5 · F: 12.0–16.0 g/dL', si: '135–175 / 120–160 g/L' },
  { category: 'CBC & Coags', name: 'Hematocrit (Hct)', conventional: 'M: 41–53% · F: 36–46%', si: '0.41–0.53 / 0.36–0.46' },
  { category: 'CBC & Coags', name: 'MCV', conventional: '80–100 µm³ (fL)', si: '80–100 fL' },
  { category: 'CBC & Coags', name: 'Reticulocyte count', conventional: '0.5%–1.5%', si: '0.005–0.015' },
  { category: 'CBC & Coags', name: 'Leukocyte count (WBC)', conventional: '4,500–11,000 /mm³', si: '4.5–11.0 × 10⁹/L' },
  { category: 'CBC & Coags', name: 'Platelet count', conventional: '150,000–400,000 /mm³', si: '150–400 × 10⁹/L' },
  { category: 'CBC & Coags', name: 'Prothrombin time (PT)', conventional: '11–15 s (INR ~1.0)', si: '11–15 s' },
  { category: 'CBC & Coags', name: 'Activated PTT (aPTT)', conventional: '25–40 s', si: '25–40 s' },
  { category: 'CBC & Coags', name: 'Bleeding time', conventional: '2–7 min', si: '2–7 min' },
  { category: 'CBC & Coags', name: 'Serum iron', conventional: 'M: 65–175 · F: 50–170 µg/dL', si: '11.6–31.3 µmol/L' },
  { category: 'CBC & Coags', name: 'Ferritin', conventional: 'M: 20–250 · F: 10–120 ng/mL', si: '20–250 µg/L' },
  { category: 'CBC & Coags', name: 'TIBC', conventional: '250–400 µg/dL', si: '45–72 µmol/L' },
  { category: 'CBC & Coags', name: 'ESR (Westergren)', conventional: 'M: 0–15 · F: 0–20 mm/hr', si: '0–20 mm/hr' },

  // ABG
  { category: 'ABG', name: 'Arterial pH', conventional: '7.35–7.45', si: 'H+: 35–45 nmol/L' },
  { category: 'ABG', name: 'PaCO2', conventional: '33–45 mm Hg', si: '4.4–5.9 kPa' },
  { category: 'ABG', name: 'PaO2 (room air)', conventional: '75–105 mm Hg', si: '10.0–14.0 kPa' },
  { category: 'ABG', name: 'Anion gap [Na - (Cl + HCO3)]', conventional: '8–12 mEq/L', si: '8–12 mmol/L' },
  { category: 'ABG', name: 'Winter formula (metabolic acidosis)', conventional: 'Expected PaCO2 = 1.5(HCO3) + 8 ± 2', si: '—' },

  // Liver & Pancreas
  { category: 'Liver & Pancreas', name: 'ALT (SGPT)', conventional: '10–40 U/L', si: '10–40 U/L' },
  { category: 'Liver & Pancreas', name: 'AST (SGOT)', conventional: '12–38 U/L', si: '12–38 U/L' },
  { category: 'Liver & Pancreas', name: 'Alkaline phosphatase (ALP)', conventional: '25–100 U/L', si: '25–100 U/L' },
  { category: 'Liver & Pancreas', name: 'Total bilirubin', conventional: '0.1–1.0 mg/dL', si: '2–17 µmol/L' },
  { category: 'Liver & Pancreas', name: 'Direct (conjugated) bilirubin', conventional: '0.0–0.3 mg/dL', si: '0–5 µmol/L' },
  { category: 'Liver & Pancreas', name: 'Albumin', conventional: '3.5–5.5 g/dL', si: '35–55 g/L' },
  { category: 'Liver & Pancreas', name: 'Total protein', conventional: '6.0–7.8 g/dL', si: '60–78 g/L' },
  { category: 'Liver & Pancreas', name: 'Amylase', conventional: '25–125 U/L', si: '25–125 U/L' },
  { category: 'Liver & Pancreas', name: 'Lipase', conventional: '13–60 U/L', si: '13–60 U/L' },
  { category: 'Liver & Pancreas', name: 'Ceruloplasmin', conventional: '20–40 mg/dL', si: '200–400 mg/L' },

  // Cardiac & Lipids
  { category: 'Cardiac & Lipids', name: 'Troponin I', conventional: '< 0.04 ng/mL', si: '< 0.04 µg/L' },
  { category: 'Cardiac & Lipids', name: 'Creatine kinase (CK)', conventional: 'M: 25–90 · F: 10–70 U/L', si: '10–90 U/L' },
  { category: 'Cardiac & Lipids', name: 'Total cholesterol', conventional: '< 200 mg/dL (desirable)', si: '< 5.2 mmol/L' },
  { category: 'Cardiac & Lipids', name: 'HDL cholesterol', conventional: 'M: > 40 · F: > 50 mg/dL', si: '> 1.0–1.3 mmol/L' },
  { category: 'Cardiac & Lipids', name: 'LDL cholesterol', conventional: '< 100 mg/dL (optimal)', si: '< 2.6 mmol/L' },
  { category: 'Cardiac & Lipids', name: 'Triglycerides', conventional: '< 150 mg/dL', si: '< 1.7 mmol/L' },

  // Endocrine
  { category: 'Endocrine', name: 'TSH (thyrotropin)', conventional: '0.5–5.0 µU/mL', si: '0.5–5.0 mIU/L' },
  { category: 'Endocrine', name: 'Free thyroxine (FT4)', conventional: '0.9–1.7 ng/dL', si: '12–22 pmol/L' },
  { category: 'Endocrine', name: 'HbA1c', conventional: '< 5.7% (DM ≥ 6.5%)', si: '< 39 mmol/mol' },
  { category: 'Endocrine', name: 'Cortisol (8 AM serum)', conventional: '5–23 µg/dL', si: '138–635 nmol/L' },
  { category: 'Endocrine', name: 'Parathyroid hormone (PTH)', conventional: '10–60 pg/mL', si: '10–60 ng/L' },
  { category: 'Endocrine', name: 'Prolactin', conventional: '< 20 ng/mL', si: '< 20 µg/L' },

  // CSF & Urine
  { category: 'CSF & Urine', name: 'CSF Opening pressure', conventional: '70–180 mm H2O', si: '—' },
  { category: 'CSF & Urine', name: 'CSF Cell count', conventional: '0–5 lymphocytes /mm³ (0 PMNs)', si: '0–5 × 10⁶/L' },
  { category: 'CSF & Urine', name: 'CSF Glucose', conventional: '40–70 mg/dL (~2/3 serum)', si: '2.2–3.9 mmol/L' },
  { category: 'CSF & Urine', name: 'CSF Protein', conventional: '15–45 mg/dL', si: '0.15–0.45 g/L' },
  { category: 'CSF & Urine', name: 'Urine specific gravity', conventional: '1.002–1.030', si: '—' },
  { category: 'CSF & Urine', name: 'Urine osmolality', conventional: '50–1,200 mOsmol/kg', si: '50–1,200 mmol/kg' },
  { category: 'CSF & Urine', name: '24-hour urine protein', conventional: '< 150 mg / 24 h (nephrotic ≥ 3.5 g)', si: '< 0.15 g/day' },
];

export default function LabValuesModal({ isOpen, onClose }: LabValuesModalProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<LabCategory>('All');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setCategory('All');
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LAB_DATA.filter((row) => {
      if (category !== 'All' && row.category !== category) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.conventional.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Normal USMLE Lab Values Reference"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] rs-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold font-display text-navy-DEFAULT dark:text-white">
              USMLE Normal Lab Values
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Adult reference intervals for Step 1 vignettes · Press <kbd className="rs-kbd">V</kbd> to toggle
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close Lab Values"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Search + Category Pills */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/80 dark:bg-navy-950/60 border-b border-slate-200 dark:border-white/10 space-y-2">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter labs (e.g. potassium, troponin, CSF, HbA1c, anion gap)…"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-navy-DEFAULT"
          />
          <div className="rs-pill-strip flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors',
                  category === cat
                    ? 'bg-navy-DEFAULT dark:bg-orange-DEFAULT text-white dark:text-navy-950'
                    : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
          {filteredRows.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching lab tests found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
              <thead className="sticky top-0 bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-white/10 z-10">
                <tr>
                  <th className="py-2 px-4 font-extrabold">Test / Panel</th>
                  <th className="py-2 px-4 font-extrabold">Reference Range</th>
                  <th className="py-2 px-4 font-extrabold hidden sm:table-cell">SI Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {filteredRows.map((row) => (
                  <tr
                    key={`${row.category}-${row.name}`}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{row.name}</div>
                      {category === 'All' && (
                        <div className="text-[10px] font-mono text-slate-400">{row.category}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-navy-DEFAULT dark:text-orange-DEFAULT font-semibold">
                      {row.conventional}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {row.si || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
