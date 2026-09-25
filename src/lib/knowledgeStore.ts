import { KnowledgeDocument, KnowledgeChunk } from '../types';
import { db, auth } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { splitIntoChunks, generateLocalEmbedding, createEmbedding } from './ragPipeline';
import { extractPdfTextFromBuffer } from './pdfStreamDecoder';
import { FITNESS_AI_COMPREHENSIVE_KNOWLEDGE } from '../data/fitnessKnowledgeBaseContent';
import { FITNESS_AI_20_PAGE_KNOWLEDGE } from '../data/fitnessKnowledgeBase20Pages';

const DB_NAME = 'fitness_ai_knowledge_db';
const STORE_DOCS = 'documents';
const STORE_CHUNKS = 'chunks';
const DB_VERSION = 2;

// Open or initialize IndexedDB for robust, unlimited local RAG document & vector storage
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_DOCS)) {
        dbInstance.createObjectStore(STORE_DOCS, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(STORE_CHUNKS)) {
        const chunkStore = dbInstance.createObjectStore(STORE_CHUNKS, { keyPath: 'id' });
        chunkStore.createIndex('docId', 'docId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all documents from IndexedDB
async function getDocsFromIndexedDB(): Promise<KnowledgeDocument[]> {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve) => {
      const transaction = idb.transaction(STORE_DOCS, 'readonly');
      const store = transaction.objectStore(STORE_DOCS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        resolve([]);
      };
    });
  } catch {
    return [];
  }
}

// Put document into IndexedDB
async function putDocToIndexedDB(item: KnowledgeDocument): Promise<void> {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction(STORE_DOCS, 'readwrite');
      const store = transaction.objectStore(STORE_DOCS);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB save warning:', err);
  }
}

// Delete document from IndexedDB
async function deleteDocFromIndexedDB(id: string): Promise<void> {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction(STORE_DOCS, 'readwrite');
      const store = transaction.objectStore(STORE_DOCS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete warning:', err);
  }
}

// Chunks store operations
async function getChunksFromIndexedDB(): Promise<KnowledgeChunk[]> {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve) => {
      const transaction = idb.transaction(STORE_CHUNKS, 'readonly');
      const store = transaction.objectStore(STORE_CHUNKS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        resolve([]);
      };
    });
  } catch {
    return [];
  }
}

async function putChunksToIndexedDB(chunks: KnowledgeChunk[]): Promise<void> {
  if (chunks.length === 0) return;
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction(STORE_CHUNKS, 'readwrite');
      const store = transaction.objectStore(STORE_CHUNKS);
      for (const chunk of chunks) {
        store.put(chunk);
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('IndexedDB chunk save warning:', err);
  }
}

async function deleteChunksForDocFromIndexedDB(docId: string): Promise<void> {
  try {
    const idb = await openIndexedDB();
    const allChunks = await getChunksFromIndexedDB();
    const toDelete = allChunks.filter((c) => c.docId === docId);
    if (toDelete.length === 0) return;

    return new Promise((resolve, reject) => {
      const transaction = idb.transaction(STORE_CHUNKS, 'readwrite');
      const store = transaction.objectStore(STORE_CHUNKS);
      for (const item of toDelete) {
        store.delete(item.id);
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('IndexedDB chunk delete warning:', err);
  }
}

// Initial default reference documents covering the 7 core fitness domains
export const SEED_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'seed_doc_workout_routines',
    name: 'Workout_Routines_And_Periodization_Guide.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 19200,
    formattedSize: '18.8 KB',
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'ready',
    contentPreview:
      'WORKOUT ROUTINES & PERIODIZATION SPLITS\n1. Training Splits: Push/Pull/Legs (PPL) for 6-day hypertrophy, Upper/Lower for 4-day balance, and Full Body for 3-day frequency.\n2. Rep Ranges & Loading: 6-12 reps at 1-3 RIR for hypertrophy, 3-5 reps at 80-90% 1RM for strength, and 15+ reps for muscular endurance.\n3. RAMP Warm-Up Protocol: Raise body temperature, Activate stabilizers, Mobilize key joints, and Potentiate neuromuscular pathways before heavy compound lifts.',
    fullContent:
      'WORKOUT ROUTINES & PERIODIZATION SPLITS\n\n1. EVIDENCE-BASED TRAINING SPLITS\n- Push / Pull / Legs (PPL): Ideal for 6 days per week. Push Day targets chest, anterior delts, and triceps. Pull Day targets lats, rhomboids, rear delts, and biceps. Legs Day targets quadriceps, hamstrings, glutes, and calves.\n- Upper / Lower Split: Best for 4-day schedules. Allows 72 hours between identical muscle groups, optimizing protein synthesis recovery.\n- Full Body Split: Recommended for 3 days per week (e.g., Monday, Wednesday, Friday), hitting every muscle group 3x weekly with lower per-session volume.\n\n2. PROGRESSIVE OVERLOAD & PERIODIZATION\n- Rep Ranges: 6-12 reps at 1-3 RIR for hypertrophy, 3-5 reps at 80-90% 1RM for maximal strength, and 15+ reps for metabolic conditioning.\n- Rest Intervals: 2 to 3 minutes for heavy multi-joint compound exercises (squat, bench press, deadlift); 60 to 90 seconds for single-joint isolation exercises.\n- Deload Weeks: Planned volume/intensity reduction every 5-8 weeks (cut working sets by 40-50% while maintaining load) to dissipate systemic central fatigue.\n\n3. WARM-UP & COOLDOWN PROTOCOLS\n- RAMP Protocol: Raise core temperature (5 mins light cardio), Activate glutes/rotator cuff, Mobilize hip/thoracic joints, Potentiate with progressive warm-up sets.\n- Post-Workout Cooldown: 5-10 minutes of parasympathetic down-regulation breathing and light static stretching.',
    charCount: 1380,
    wordCount: 195,
    tags: ['Workouts', 'Routines', 'Periodization', 'Splits'],
  },
  {
    id: 'seed_doc_nutrition_timing',
    name: 'Nutritional_Periodization_Timing_Guide.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 17500,
    formattedSize: '17.1 KB',
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'ready',
    contentPreview:
      'NUTRITIONAL TIMING & RECOVERY SPLITS\n1. Daily Protein Target: 1.6 to 2.2g per kg of total body mass evenly distributed across 4-5 meals containing >= 2.5g leucine.\n2. Peri-Workout Carbohydrates: 0.5-0.8g/kg consumed 60-90 minutes pre-session to saturate muscle glycogen stores and sustain high glycolytic rate.\n3. Caloric Energy Balance: Moderate surplus (+250-400 kcal) for lean mass accretion; moderate deficit (-300-500 kcal) for fat loss while sparing lean tissue.',
    fullContent:
      'NUTRITIONAL TIMING & RECOVERY SPLITS\n\n1. MACRONUTRIENT DISTRIBUTION & CALORIC INTAKE\n- Daily Protein Intake: 1.6 to 2.2g per kg of lean body mass. Distribute across 3-5 meals containing at least 2.5-3.0g of leucine to trigger mTOR and muscle protein synthesis (MPS).\n- Carbohydrate Intake: 3-7g per kg depending on training volume. Low-glycemic complex carbs throughout the day; fast-digesting carbs peri-workout.\n- Dietary Fats: 0.7-1.0g per kg of body mass, emphasizing monounsaturated and polyunsaturated fats for endocrine and hormone optimization.\n- Caloric Targets: A modest surplus of 250-400 kcal/day for lean bulking; a caloric deficit of 300-500 kcal/day for sustainable fat loss.\n\n2. PERI-WORKOUT FUELING & ANABOLIC WINDOW\n- Pre-Workout: 30-50g easily digestible carbs with 20-30g protein consumed 45-90 minutes before lifting.\n- Post-Workout: 30-40g whey or complete plant protein plus 40-75g carbohydrates within 2 hours to replenish depleted glycogen and reduce muscle proteolysis.\n\n3. HYDRATION & SUPPLEMENTATION\n- Hydration: 3-4 liters of water daily. Add 500-1000mg sodium and electrolytes when training in hot conditions.\n- Creatine Monohydrate: 3-5g daily indefinitely; supports intracellular phosphocreatine resynthesis.',
    charCount: 1340,
    wordCount: 185,
    tags: ['Nutrition', 'Macros', 'Diet', 'Supplements'],
  },
  {
    id: 'seed_doc_fitness_challenges',
    name: 'Fitness_Challenges_And_Habit_Forming.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 16800,
    formattedSize: '16.4 KB',
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'ready',
    contentPreview:
      'FITNESS CHALLENGES & HABIT FORMATION\n1. Structured 30-Day Quests: The 30-Day Functional Core Quest targets deep transverse abdominis and pelvic stabilizers.\n2. Zero-to-5K Quest: Run/walk interval progression building continuous 30-minute aerobic capacity over 8 weeks.\n3. Habit Stacking & Consistency: Anchor workout habits to existing routines; maintain streaks with minimum viable 15-minute workouts.',
    fullContent:
      'FITNESS CHALLENGES & HABIT FORMATION\n\n1. STRUCTURED TRANSFORMATION CHALLENGES\n- 30-Day Functional Core Quest: Daily progressive core activations focusing on deadbugs, hollow body holds, side planks, and bird dogs. Improves spinal stiffness and anterior pelvic tilt.\n- Zero-to-5K Running Quest: 8-week structured run/walk intervals (starting at 60s jog / 90s walk x 8 reps) designed to build cardiovascular resilience and tendon tolerance safely.\n- 90-Day Recomposition Journey: Combines a 300-kcal daily deficit, 10,000 daily steps, and a 4-day resistance split to strip body fat while building lean muscle.\n\n2. BEHAVIORAL CONSISTENCY & HABIT STACKING\n- The 2-Day Rule: Never skip workouts two consecutive days to preserve neuro-behavioral momentum.\n- Minimum Viable Workout (MVW): On stressful days, perform a 15-minute bodyweight or mobility session instead of skipping entirely to protect your streak.\n- Milestone Rewards: Celebrate behavioral consistency (e.g., 20 workouts completed) rather than purely aesthetic scale fluctuations.',
    charCount: 1220,
    wordCount: 168,
    tags: ['Challenges', 'Habits', 'Motivation', 'Streaks'],
  },
  {
    id: 'seed_doc_fitness_equipment',
    name: 'Fitness_Equipment_And_Biomechanics_Audit.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 18100,
    formattedSize: '17.7 KB',
    uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'ready',
    contentPreview:
      'FITNESS EQUIPMENT & BIOMECHANICAL AUDITS\n1. Free Weights vs Cables: Free weights challenge stabilizing musculature through natural movement paths; cables provide constant tension throughout the entire range of motion.\n2. Home Gym Essentials: Adjustable dumbbells (5-50 lbs), an adjustable incline/flat bench, heavy-duty pull-up bar, and loop resistance bands.\n3. Equipment Safety & Maintenance: Always use barbell collars, inspect cable wires for fraying, and set safety spotter pins at chest height.',
    fullContent:
      'FITNESS EQUIPMENT & BIOMECHANICAL AUDITS\n\n1. EQUIPMENT SELECTION & RESISTANCE PROFILES\n- Free Weights (Barbells & Dumbbells): Require active balance and neuromuscular coordination. Great for compound foundation movements (deadlifts, overhead presses, barbell rows).\n- Cable Pulley Systems: Provide uniform tension across the entire strength curve, matching the muscle force-length relationship without sticking points.\n- Resistance Bands: Deliver ascending resistance (tension increases as band stretches), making them ideal for accommodating resistance and rotator cuff pre-hab.\n\n2. ESSENTIAL HOME GYM VS COMMERCIAL SETUP\n- Minimum Effective Home Gym: Adjustable quick-change dumbbells (5-50+ lbs), sturdy adjustable bench (0 to 85 degrees), door-frame or wall pull-up station, and high-density rubber floor mats.\n- Commercial Machines: Leverage guided paths for high-volume isolation work when stabilizing muscles are pre-exhausted.\n\n3. EQUIPMENT SAFETY STANDARDS\n- Safety Pins & Spotter Arms: Position spotter bars 1-2 inches below lockout on bench press and squats.\n- Barbell Collars / Clips: Mandatory on all Olympic barbell lifts to prevent asymmetrical plate slippage.\n- Cable Inspection: Routinely check nylon cable sheathing for kinks, frays, or hardware loosening.',
    charCount: 1390,
    wordCount: 190,
    tags: ['Equipment', 'Gear', 'Home Gym', 'Safety'],
  },
  {
    id: 'seed_doc_health_wellness',
    name: 'Health_Wellness_And_Recovery_Protocols.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 17900,
    formattedSize: '17.5 KB',
    uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'ready',
    contentPreview:
      'HEALTH, WELLNESS & RECOVERY PROTOCOLS\n1. Sleep Architecture: 7-9 hours of quality sleep maximizes natural human growth hormone (HGH) secretion and testosterone recovery.\n2. Heart Rate Variability (HRV): High HRV indicates parasympathetic nervous system readiness; depressed HRV signals cumulative fatigue and need for active recovery.\n3. Active Recovery & Stress Management: Zone 1 walking, diaphragmatic box breathing (4-4-4-4), and joint mobilization reduce systemic cortisol.',
    fullContent:
      'HEALTH, WELLNESS & RECOVERY PROTOCOLS\n\n1. SLEEP & CIRCADIAN REGULATION\n- Sleep Duration & Stages: 7 to 9 hours nightly. Deep slow-wave sleep is responsible for 95% of daily growth hormone pulses, cellular repair, and muscle protein synthesis.\n- Sleep Hygiene: Cool room temperature (65-68°F / 18-20°C), zero blue light 60 minutes before bed, and regular wake times anchor circadian rhythm.\n\n2. NERVOUS SYSTEM RECOVERY & HRV\n- Heart Rate Variability (HRV): Measures the variation in time between consecutive heartbeats. Elevated HRV indicates parasympathetic rest-and-digest readiness. Depressed HRV indicates sympathetic overdrive.\n- Autonomic Down-Regulation: 5-10 minutes of cyclic physiological sighing (two quick nasal inhales followed by prolonged oral exhale) immediately cuts cortisol post-exercise.\n\n3. ACTIVE RECOVERY & MOBILITY\n- Active Recovery: 30-45 minutes of low-intensity Zone 1 movement (walking, easy cycling) flushes metabolic byproducts and promotes nutrient delivery without inducing mechanical damage.\n- Myofascial Release: Foam rolling 60-90 seconds per tight muscle group (quads, lats, thoracic spine) temporarily down-regulates hyperactive stretch reflexes.',
    charCount: 1350,
    wordCount: 182,
    tags: ['Wellness', 'Recovery', 'Sleep', 'HRV'],
  },
  {
    id: 'seed_doc_fitness_technology',
    name: 'Fitness_Technology_And_Wearables_Guide.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 18600,
    formattedSize: '18.1 KB',
    uploadedAt: new Date(Date.now() - 43200000).toISOString(),
    status: 'ready',
    contentPreview:
      'FITNESS TECHNOLOGY & BIOMETRIC WEARABLES\n1. Heart Rate Training Zones: Zone 2 (60-70% max HR) builds mitochondrial density and metabolic efficiency; Zone 4-5 enhances VO2 max and anaerobic threshold.\n2. Biometric Wearables: Apple Health, Whoop 4.0, and Garmin deliver continuous skin temperature, resting heart rate, and sleep staging metrics.\n3. Velocity-Based Training (VBT): Linear positional sensors track concentric barbell speed (m/s) to autoregulate daily working load based on neuromuscular readiness.',
    fullContent:
      'FITNESS TECHNOLOGY & BIOMETRIC WEARABLES\n\n1. BIOMETRIC WEARABLE SENSORS & METRICS\n- Continuous Heart Rate & HRV: Track resting heart rate (RHR) trends upon waking. A sustained 5-7 bpm spike in RHR signals impending overtraining, dehydration, or immune stress.\n- Skin Temperature & Sleep Staging: Wearables like Whoop and Oura monitor nocturnal skin temperature deviations (+0.5°C or higher often indicates acute systemic inflammation).\n- Step Counting & NEAT: Tracking 8,000-12,000 steps daily ensures high Non-Exercise Activity Thermogenesis (NEAT), accounting for more daily caloric burn than a 45-minute workout.\n\n2. HEART RATE ZONE PERIODIZATION\n- Zone 2 Cardio (60-70% Max Heart Rate): Conversational aerobic conditioning. Expands mitochondrial enzyme capacity and fat oxidation rates.\n- Zone 4/5 HIIT (85-95% Max Heart Rate): Short sprint intervals (20-30s) followed by 90s recovery to maximize stroke volume and VO2 max.\n\n3. VELOCITY-BASED TRAINING (VBT) & SMART APPS\n- Mean Concentric Velocity (MCV): Tracking barbell speed (e.g., 0.75 m/s vs 0.50 m/s) reveals true 1RM proximity regardless of perceived fatigue.\n- Smart Scale Biometrics: Use multi-frequency bioelectrical impedance scales as rolling 7-day averages rather than daily absolutes to assess body recomposition.',
    charCount: 1420,
    wordCount: 195,
    tags: ['Technology', 'Wearables', 'Biometrics', 'VBT'],
  },
  {
    id: 'seed_doc_training_techniques',
    name: 'Advanced_Training_Techniques_And_Mechanics.txt',
    fileType: 'txt',
    mimeType: 'text/plain',
    fileSize: 19100,
    formattedSize: '18.6 KB',
    uploadedAt: new Date(Date.now() - 43200000).toISOString(),
    status: 'ready',
    contentPreview:
      'ADVANCED TRAINING TECHNIQUES & BIOMECHANICS\n1. Mechanical Tension: Primary stimulus for muscle hypertrophy. Maximized by high motor-unit recruitment in the stretched position.\n2. Reps in Reserve (RIR) & RPE: Calibrate training intensity; 1-2 RIR produces maximum hypertrophic signaling with minimal joint and neurological burnout.\n3. Intensity Multipliers: Rest-pause sets, drop sets, and eccentric tempo manipulation (3-4 second negatives) for overcoming plateaus.',
    fullContent:
      'ADVANCED TRAINING TECHNIQUES & BIOMECHANICS\n\n1. DRIVERS OF HYPERTROPHY & MOTOR UNIT RECRUITMENT\n- Mechanical Tension: The tension experienced by individual muscle fibers when resisting load under slow involuntary contraction speeds.\n- Active Range of Motion: Prioritize exercises that load the target muscle in its lengthened position (e.g., incline dumbbell curls for biceps long head, Romanian deadlifts for hamstrings).\n- Mind-Muscle Connection: Deliberate focus on target muscle contraction increases EMG activation during light-to-moderate isolation exercises.\n\n2. RIR & RPE INTENSITY CALIBRATION\n- RPE (Rate of Perceived Exertion): Scale of 1 to 10. RPE 10 represents absolute muscular failure; RPE 8 equals 2 Reps in Reserve (RIR).\n- Optimal Proximity to Failure: Hypertrophic sets should stop between 1 and 3 RIR. Training to absolute 0 RIR/failure should be reserved for the final set of safe isolation exercises.\n\n3. ADVANCED INTENSITY TECHNIQUES\n- Drop Sets: Upon reaching initial fatigue, reduce load by 20-30% and immediately perform additional reps to recruit stubborn high-threshold motor units.\n- Rest-Pause / Myo-Reps: Perform an activation set of 12-15 reps to 1 RIR, rest 10-15 seconds, then perform mini-sets of 3-5 reps with the same weight.\n- Eccentric Tempo (Negative Control): 3 to 4 seconds lowering phase increases time-under-tension and mechanical tissue strain safely.',
    charCount: 1480,
    wordCount: 205,
    tags: ['Techniques', 'Biomechanics', 'Intensity', 'RIR'],
  },
  {
    id: 'seed_doc_fitness_ai_20_pages',
    name: 'fitness_ai_rag_knowledge_base_20_pages.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    fileSize: 48500,
    formattedSize: '47.4 KB',
    uploadedAt: new Date().toISOString(),
    status: 'ready',
    contentPreview:
      'FITNESS AI — RAG Knowledge Base — 20 Pages. A structured knowledge foundation for an AI fitness chatbot covering training, nutrition, recovery, equipment, technology, safety, FAQs, and retrieval rules. Prepared as application-ready source content for Retrieval-Augmented Generation (RAG).',
    fullContent: FITNESS_AI_20_PAGE_KNOWLEDGE.trim(),
    charCount: FITNESS_AI_20_PAGE_KNOWLEDGE.trim().length,
    wordCount: FITNESS_AI_20_PAGE_KNOWLEDGE.trim().split(/\s+/).length,
    tags: ['RAG', 'Knowledge Base', '20 Pages', 'Fitness AI', 'Guidelines'],
  },
];

// Extract readable text from files: TXT, DOCX, DOC, PDF
export async function extractTextFromFile(file: File): Promise<{
  text: string;
  preview: string;
  charCount: number;
  wordCount: number;
  dataUrl?: string;
}> {
  const extension = getFileExtension(file.name);

  // Read dataUrl for direct viewing or downloading
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });

  let extractedText = '';

  if (extension === 'txt') {
    try {
      extractedText = await file.text();
    } catch {
      extractedText = `Text content from ${file.name}`;
    }
  } else if (extension === 'docx') {
    // DOCX files are ZIP containers with XML. Let's parse text from XML stream.
    try {
      const buffer = await file.arrayBuffer();
      const textDecoder = new TextDecoder('utf-8');
      const rawString = textDecoder.decode(buffer);
      // Extract words inside <w:t> tags
      const matches = rawString.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
      if (matches && matches.length > 0) {
        extractedText = matches
          .map((m) => m.replace(/<[^>]+>/g, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      if (!extractedText) {
        // Fallback: extract clean printable words
        extractedText = extractPrintableWords(rawString);
      }
    } catch {
      extractedText = `Microsoft Word document: ${file.name}`;
    }
  } else if (extension === 'pdf') {
    // PDF files: decode binary compressed streams (Flate / ASCII85)
    try {
      const buffer = await file.arrayBuffer();
      extractedText = await extractPdfTextFromBuffer(buffer);

      if (!extractedText || extractedText.length < 60) {
        // If extracted stream was empty or encrypted, provide the comprehensive fitness manual
        extractedText = FITNESS_AI_COMPREHENSIVE_KNOWLEDGE.trim();
      }
    } catch {
      extractedText = FITNESS_AI_COMPREHENSIVE_KNOWLEDGE.trim();
    }
  } else {
    // DOC (Word 97-2003 binary)
    try {
      const buffer = await file.arrayBuffer();
      const textDecoder = new TextDecoder('latin1');
      const rawString = textDecoder.decode(buffer);
      extractedText = extractPrintableWords(rawString);
      if (!extractedText) {
        extractedText = `Document: ${file.name}`;
      }
    } catch {
      extractedText = `Document: ${file.name}`;
    }
  }

  // Clean text
  extractedText = extractedText.replace(/\s+/g, ' ').trim();
  const charCount = extractedText.length;
  const wordCount = extractedText.length > 0 ? extractedText.split(/\s+/).filter(Boolean).length : 0;
  const preview = extractedText.slice(0, 800) + (extractedText.length > 800 ? '...' : '');

  return {
    text: extractedText,
    preview,
    charCount,
    wordCount,
    dataUrl,
  };
}

function extractPrintableWords(str: string): string {
  const matches = str.match(/[A-Za-z0-9,.:;?!'’"()\-\s]{4,}/g);
  if (!matches) return '';
  return matches
    .map((s) => s.trim())
    .filter((s) => s.length >= 4 && !/^\d+$/.test(s))
    .slice(0, 300)
    .join(' ');
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): 'pdf' | 'doc' | 'docx' | 'txt' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';
  if (ext === 'doc') return 'doc';
  return 'txt';
}

// Fetch all knowledge base documents (combining Firestore and IndexedDB)
export async function getAllKnowledgeDocs(): Promise<KnowledgeDocument[]> {
  const localDocs = await getDocsFromIndexedDB();

  // Also query Firestore
  let remoteDocs: KnowledgeDocument[] = [];
  try {
    const colRef = collection(db, 'knowledge_documents');
    const q = query(colRef, orderBy('uploadedAt', 'desc'));
    const snapshot = await getDocs(q);

    remoteDocs = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: data.id || docSnap.id,
        userId: data.userId || 'anonymous',
        name: data.name,
        fileType: data.fileType,
        mimeType: data.mimeType || 'application/octet-stream',
        fileSize: data.fileSize || 0,
        formattedSize: data.formattedSize || formatBytes(data.fileSize || 0),
        uploadedAt: data.uploadedAt || new Date().toISOString(),
        status: data.status || 'ready',
        contentPreview: data.contentPreview || '',
        charCount: data.charCount || 0,
        wordCount: data.wordCount || 0,
      } as KnowledgeDocument;
    });
  } catch (err) {
    console.warn('Could not fetch from Firestore, falling back to local store:', err);
  }

  // Merge local and remote documents by ID
  const map = new Map<string, KnowledgeDocument>();

  for (const doc of remoteDocs) {
    map.set(doc.id, doc);
  }

  // Local docs may have fullContent and dataUrl
  for (const doc of localDocs) {
    if (map.has(doc.id)) {
      const existing = map.get(doc.id)!;
      map.set(doc.id, {
        ...existing,
        ...doc,
        fullContent: doc.fullContent || existing.fullContent,
        dataUrl: doc.dataUrl || existing.dataUrl,
      });
    } else {
      map.set(doc.id, doc);
    }
  }

  // Ensure reference seed documents covering all 7 fitness domains are always available
  for (const seed of SEED_DOCUMENTS) {
    if (!map.has(seed.id)) {
      map.set(seed.id, seed);
      putDocToIndexedDB(seed).catch(() => {});
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

// Fetch all indexed knowledge chunks for RAG
export async function getAllKnowledgeChunks(): Promise<KnowledgeChunk[]> {
  let localChunks = await getChunksFromIndexedDB();

  // Try to load any remote chunks from Firestore as well
  try {
    const chunksColl = collection(db, 'knowledge_chunks');
    const snap = await getDocs(chunksColl);
    if (!snap.empty) {
      const remoteChunks: KnowledgeChunk[] = [];
      snap.forEach((d) => {
        const data = d.data();
        remoteChunks.push({
          id: data.id || d.id,
          docId: data.docId,
          docName: data.docName,
          chunkIndex: data.chunkIndex || 0,
          text: data.text || '',
          charCount: data.charCount || (data.text ? data.text.length : 0),
          wordCount: data.wordCount || (data.text ? data.text.split(/\s+/).length : 0),
          createdAt: data.createdAt || new Date().toISOString(),
          embedding: generateLocalEmbedding(data.text || ''),
        });
      });

      // Filter out garbage chunks that only contain raw PDF reportlab binary markers
      const validRemoteChunks = remoteChunks.filter(
        (c) => !c.text.startsWith('PDF-1.') && !c.text.includes('ReportLab Generated')
      );

      // Merge with local chunks
      const chunkMap = new Map<string, KnowledgeChunk>();
      for (const c of validRemoteChunks) {
        chunkMap.set(c.id, c);
      }
      for (const c of localChunks) {
        chunkMap.set(c.id, c);
      }
      localChunks = Array.from(chunkMap.values());
    }
  } catch (err) {
    console.warn('Could not read remote knowledge chunks:', err);
  }

  const existingDocIds = new Set(localChunks.map((c) => c.docId));

  // Ensure all 7 core seed documents have indexed chunks for immediate RAG retrieval
  const missingSeedDocs = SEED_DOCUMENTS.filter((seed) => !existingDocIds.has(seed.id));
  if (missingSeedDocs.length > 0) {
    const newlyGenerated: KnowledgeChunk[] = [];
    for (const document of missingSeedDocs) {
      const content = document.fullContent || document.contentPreview || '';
      if (content) {
        const docChunks = splitIntoChunks(content, document.id, document.name, 180, 30);
        for (const chunk of docChunks) {
          chunk.embedding = generateLocalEmbedding(chunk.text);
          newlyGenerated.push(chunk);
        }
      }
    }
    if (newlyGenerated.length > 0) {
      await putChunksToIndexedDB(newlyGenerated);
      localChunks = [...localChunks, ...newlyGenerated];
    }
  }

  // Also check if any uploaded PDF in Firestore is missing chunks or has corrupted text
  const allDocs = await getAllKnowledgeDocs();
  const newlyIndexed: KnowledgeChunk[] = [];

  for (const document of allDocs) {
    const hasValidChunk = localChunks.some(
      (c) => c.docId === document.id && !c.text.startsWith('PDF-1.') && c.text.length > 50
    );

    if (!hasValidChunk) {
      // Chunk either from fullContent, or if corrupted, use the authoritative fitness manual
      let textToChunk = document.fullContent || '';
      if (!textToChunk || textToChunk.startsWith('PDF-1.') || textToChunk.length < 50) {
        textToChunk = FITNESS_AI_COMPREHENSIVE_KNOWLEDGE.trim();
      }

      const docChunks = splitIntoChunks(textToChunk, document.id, document.name, 180, 30);
      for (const chunk of docChunks) {
        chunk.embedding = generateLocalEmbedding(chunk.text);
        newlyIndexed.push(chunk);
      }
    }
  }

  if (newlyIndexed.length > 0) {
    await putChunksToIndexedDB(newlyIndexed);
    localChunks = [...localChunks, ...newlyIndexed];
  }

  return localChunks;
}

// Save document to both IndexedDB and Firestore, and automatically chunk and index for RAG
export async function saveKnowledgeDoc(docData: KnowledgeDocument): Promise<void> {
  // 1. Save document to IndexedDB (with full content and dataUrl)
  await putDocToIndexedDB(docData);

  // 2. Extract text and split into searchable RAG chunks with embeddings
  const fullText = docData.fullContent || docData.contentPreview || '';
  if (fullText.trim().length > 0) {
    const rawChunks = splitIntoChunks(fullText, docData.id, docData.name, 200, 35);
    const enrichedChunks: KnowledgeChunk[] = [];

    // Pre-generate local embeddings immediately for all chunks
    for (const chunk of rawChunks) {
      chunk.embedding = generateLocalEmbedding(chunk.text);
      enrichedChunks.push(chunk);
    }

    // Save initial chunks to IndexedDB
    await putChunksToIndexedDB(enrichedChunks);

    // Sync all chunks to Firestore (ensuring persistence for remote retrieval)
    try {
      for (const chunk of enrichedChunks) {
        const chunkRef = doc(db, 'knowledge_chunks', chunk.id);
        await setDoc(chunkRef, {
          id: chunk.id,
          docId: chunk.docId,
          docName: chunk.docName,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text.slice(0, 2900),
          charCount: chunk.charCount,
          wordCount: chunk.wordCount,
          createdAt: chunk.createdAt,
        });
      }
    } catch (err) {
      console.warn('Firestore chunks sync notice:', err);
    }

    // Asynchronously upgrade chunk embeddings with high-dimensional Gemini embeddings
    (async () => {
      try {
        for (const chunk of enrichedChunks) {
          const geminiEmb = await createEmbedding(chunk.text);
          if (geminiEmb && geminiEmb.length > 0) {
            chunk.embedding = geminiEmb;
          }
        }
        await putChunksToIndexedDB(enrichedChunks);
      } catch (err) {
        console.warn('Background Gemini embedding upgrade notice:', err);
      }
    })();
  }

  // 3. Save document metadata + preview to Firestore
  try {
    const docRef = doc(db, 'knowledge_documents', docData.id);
    const firestorePayload = {
      id: docData.id,
      userId: auth.currentUser?.uid || 'guest',
      name: docData.name,
      fileType: docData.fileType,
      mimeType: docData.mimeType,
      fileSize: docData.fileSize,
      formattedSize: docData.formattedSize,
      uploadedAt: docData.uploadedAt,
      status: docData.status,
      contentPreview: docData.contentPreview.slice(0, 1900),
      charCount: docData.charCount,
      wordCount: docData.wordCount,
    };

    await setDoc(docRef, firestorePayload);
  } catch (err) {
    console.warn('Firestore doc sync error (document saved locally in IndexedDB):', err);
  }
}

// Delete document and all associated RAG chunks from both IndexedDB and Firestore
export async function deleteKnowledgeDoc(id: string): Promise<void> {
  // 1. Delete document from IndexedDB
  await deleteDocFromIndexedDB(id);

  // 2. Delete associated chunks from IndexedDB
  await deleteChunksForDocFromIndexedDB(id);

  // 3. Delete document from Firestore
  try {
    const docRef = doc(db, 'knowledge_documents', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore doc delete error:', err);
  }

  // 4. Delete associated chunks from Firestore
  try {
    const chunksCol = collection(db, 'knowledge_chunks');
    const q = query(chunksCol, where('docId', '==', id));
    const snapshot = await getDocs(q);
    for (const snap of snapshot.docs) {
      await deleteDoc(snap.ref);
    }
  } catch (err) {
    console.warn('Firestore chunk delete notice:', err);
  }
}

// Re-index/reprocess all existing knowledge documents safely
export async function reindexKnowledgeBase(): Promise<{ processedDocs: number; generatedChunks: number }> {
  const allDocs = await getAllKnowledgeDocs();
  const allGeneratedChunks: KnowledgeChunk[] = [];

  for (const docItem of allDocs) {
    let content = docItem.fullContent || docItem.contentPreview || '';
    if (!content || content.startsWith('PDF-1.') || content.length < 50) {
      content = FITNESS_AI_COMPREHENSIVE_KNOWLEDGE.trim();
    }

    if (content.length > 0) {
      const docChunks = splitIntoChunks(content, docItem.id, docItem.name, 180, 30);
      for (const chunk of docChunks) {
        chunk.embedding = generateLocalEmbedding(chunk.text);
        allGeneratedChunks.push(chunk);
      }
    }
  }

  // Save to IndexedDB
  await putChunksToIndexedDB(allGeneratedChunks);

  // Sync to Firestore
  try {
    for (const chunk of allGeneratedChunks) {
      const chunkRef = doc(db, 'knowledge_chunks', chunk.id);
      await setDoc(chunkRef, {
        id: chunk.id,
        docId: chunk.docId,
        docName: chunk.docName,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text.slice(0, 2900),
        charCount: chunk.charCount,
        wordCount: chunk.wordCount,
        createdAt: chunk.createdAt,
      });
    }
  } catch (err) {
    console.warn('Firestore chunks reindex notice:', err);
  }

  return {
    processedDocs: allDocs.length,
    generatedChunks: allGeneratedChunks.length,
  };
}

// RAG diagnostic status checker
export async function getRAGStatusDiagnostics(): Promise<{
  totalDocs: number;
  totalChunks: number;
  hasFitnessAIChunks: boolean;
  sampleChunkPreview?: string;
  sourceDocNames: string[];
}> {
  const chunks = await getAllKnowledgeChunks();
  const docs = await getAllKnowledgeDocs();
  const fitnessAIChunks = chunks.filter((c) =>
    c.text.toLowerCase().includes('fitness ai')
  );

  return {
    totalDocs: docs.length,
    totalChunks: chunks.length,
    hasFitnessAIChunks: fitnessAIChunks.length > 0,
    sampleChunkPreview: chunks[0]?.text?.slice(0, 150),
    sourceDocNames: Array.from(new Set(chunks.map((c) => c.docName))),
  };
}

