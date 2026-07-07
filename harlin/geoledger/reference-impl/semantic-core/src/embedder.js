/**
 * @file Pluggable embedders for GeoLedger semantic search.
 *
 * The Embedder interface (duck-typed, no class inheritance required):
 *
 *   interface Embedder {
 *     name: string;                                  // identifies model/version (persisted in index header)
 *     dim:  number;                                  // output vector dimensionality
 *     embed(texts: string[]): Promise<Float32Array[]>; // one vector per input text
 *   }
 *
 * Two implementations ship with this package:
 *
 *   - {@link HashingEmbedder} — the DEFAULT. Fully deterministic, fully offline,
 *     zero model download. Character n-gram (3-5) + word-token feature hashing
 *     with TF weighting and a built-in geological synonym/abbreviation expansion
 *     table applied before hashing. Quality is "strong lexical-semantic recall":
 *     it bridges logging shorthand ("ser alt, qv") to full terms ("sericite
 *     alteration, quartz vein") and is stable across machines and runs — ideal
 *     for tests and for the offline-first baseline.
 *
 *   - {@link ExternalEmbedder} — adapter for a real neural model. You supply the
 *     async embed function; this package contains NO network or model code.
 *
 * @module embedder
 */

/**
 * Built-in geological synonym / abbreviation expansion table.
 *
 * Keys are lower-cased tokens as they commonly appear in drill-core logs;
 * values are the expansion (may contain multiple words). Expansion is
 * *additive*: the original token is kept AND the expansion tokens are added,
 * so exact-code search ("py", "qv") still works while "pyrite" and
 * "quartz vein" queries also match.
 *
 * Extend or replace via the `synonyms` constructor option.
 *
 * @type {Record<string, string>}
 */
export const GEO_SYNONYMS = Object.freeze({
  // --- minerals: silicates / alteration minerals ---
  qtz: 'quartz',
  qz: 'quartz',
  ser: 'sericite',
  chl: 'chlorite',
  bt: 'biotite',
  ms: 'muscovite',
  kspar: 'k feldspar potassium feldspar',
  ksp: 'k feldspar potassium feldspar',
  plag: 'plagioclase',
  fsp: 'feldspar',
  carb: 'carbonate',
  cb: 'carbonate',
  dol: 'dolomite',
  cal: 'calcite',
  gt: 'garnet',
  gnt: 'garnet',
  amph: 'amphibole',
  amp: 'amphibole',
  hbl: 'hornblende',
  px: 'pyroxene',
  cpx: 'clinopyroxene',
  opx: 'orthopyroxene',
  ol: 'olivine',
  olv: 'olivine',
  serp: 'serpentine serpentinite',
  epi: 'epidote',
  ep: 'epidote',
  tour: 'tourmaline',
  tur: 'tourmaline',
  act: 'actinolite',
  tlc: 'talc',
  kln: 'kaolinite',
  kaol: 'kaolinite',
  // --- minerals: sulphides / oxides ---
  py: 'pyrite',
  cpy: 'chalcopyrite',
  cp: 'chalcopyrite',
  ccp: 'chalcopyrite',
  po: 'pyrrhotite',
  aspy: 'arsenopyrite',
  asp: 'arsenopyrite',
  bn: 'bornite',
  mo: 'molybdenite',
  moly: 'molybdenite',
  gn: 'galena',
  sp: 'sphalerite',
  sph: 'sphalerite',
  hem: 'hematite',
  mag: 'magnetite',
  mt: 'magnetite',
  gth: 'goethite',
  lim: 'limonite',
  // --- alteration / texture / structure shorthand ---
  sil: 'silicification silica silicified',
  alt: 'altered alteration',
  bx: 'breccia brecciated',
  brx: 'breccia brecciated',
  vn: 'vein',
  vns: 'veins',
  qv: 'quartz vein',
  qcv: 'quartz carbonate vein',
  stwk: 'stockwork',
  diss: 'disseminated',
  dissem: 'disseminated',
  fol: 'foliation foliated',
  shr: 'shear sheared',
  foh: 'fault',
  flt: 'fault',
  fz: 'fault zone',
  jnt: 'joint',
  fract: 'fracture fractured',
  frac: 'fracture fractured',
  lam: 'laminated lamination',
  xln: 'crystalline',
  // --- intensity / weathering shorthand ---
  wk: 'weak',
  mod: 'moderate',
  stg: 'strong',
  str: 'strong',
  tr: 'trace',
  perv: 'pervasive',
  ox: 'oxide oxidised oxidation',
  wx: 'weathered weathering',
  sap: 'saprolite',
  lat: 'laterite',
  fr: 'fresh',
  // --- lithology codes ---
  fels: 'felsic',
  maf: 'mafic',
  um: 'ultramafic',
  gran: 'granite',
  grt: 'granite',
  gd: 'granodiorite',
  dio: 'diorite',
  gab: 'gabbro',
  dlr: 'dolerite',
  bas: 'basalt',
  and: 'andesite',
  rhy: 'rhyolite',
  dac: 'dacite',
  per: 'peridotite',
  kom: 'komatiite',
  porph: 'porphyry porphyritic',
  ped: 'pegmatite',
  peg: 'pegmatite',
  sst: 'sandstone',
  ss: 'sandstone',
  slst: 'siltstone',
  slt: 'siltstone',
  mdst: 'mudstone',
  sh: 'shale',
  lst: 'limestone',
  cgl: 'conglomerate',
  cong: 'conglomerate',
  chert: 'chert',
  bif: 'banded iron formation',
  sch: 'schist',
  gns: 'gneiss',
  qzt: 'quartzite',
  mbl: 'marble',
  amphib: 'amphibolite',
  mylo: 'mylonite',
  tuff: 'tuff',
  volc: 'volcanic volcanics',
  sed: 'sediment sedimentary',
  intr: 'intrusive intrusion',
  min: 'mineralised mineralisation',
  minz: 'mineralised mineralisation',
  sulph: 'sulphide',
  sulf: 'sulphide sulfide',
});

/**
 * Lower-case and split text into alphanumeric tokens.
 * "Mod ser-alt; qv 2%" -> ["mod","ser","alt","qv","2"]
 *
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
}

/**
 * Tokenize text and additively expand abbreviations via a synonym table.
 * Original tokens are always retained; expansions are appended immediately
 * after the token they expand, preserving locality.
 *
 * @param {string} text
 * @param {Record<string, string>} [synonyms=GEO_SYNONYMS]
 * @returns {string[]} expanded token stream
 */
export function expandTokens(text, synonyms = GEO_SYNONYMS) {
  const out = [];
  for (const tok of tokenize(text)) {
    out.push(tok);
    const exp = synonyms[tok];
    if (exp) {
      for (const e of exp.split(' ')) if (e && e !== tok) out.push(e);
    }
  }
  return out;
}

/**
 * 32-bit FNV-1a hash.
 * @param {string} str
 * @param {number} [seed=0x811c9dc5]
 * @returns {number} unsigned 32-bit hash
 */
function fnv1a(str, seed = 0x811c9dc5) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Deterministic, offline, zero-dependency embedder.
 *
 * Pipeline per text:
 *   1. tokenize + additive synonym expansion ({@link expandTokens})
 *   2. features = word tokens (weight 2.0) + boundary-padded character
 *      n-grams, n = 3..5, of each token (weight 1.0)
 *   3. TF weighting: value = weight * (1 + ln(tf)) per distinct feature
 *   4. signed feature hashing (FNV-1a bucket + independent sign hash)
 *      into a `dim`-length vector
 *   5. L2 normalisation
 *
 * Determinism: same text + same options -> byte-identical Float32Array,
 * on any machine, any run. No network, no model files.
 *
 * @implements {Embedder}
 */
export class HashingEmbedder {
  /**
   * @param {object} [opts]
   * @param {number} [opts.dim=384] output dimensionality
   * @param {number} [opts.ngramMin=3] smallest character n-gram
   * @param {number} [opts.ngramMax=5] largest character n-gram
   * @param {number} [opts.wordWeight=2.0] weight of whole-word features vs n-grams
   * @param {Record<string,string>} [opts.synonyms=GEO_SYNONYMS] expansion table
   */
  constructor(opts = {}) {
    const {
      dim = 384,
      ngramMin = 3,
      ngramMax = 5,
      wordWeight = 2.0,
      synonyms = GEO_SYNONYMS,
    } = opts;
    if (!Number.isInteger(dim) || dim <= 0) throw new RangeError(`dim must be a positive integer, got ${dim}`);
    if (ngramMin > ngramMax) throw new RangeError('ngramMin must be <= ngramMax');
    /** @type {string} */
    this.name = `hashing-ngram-v1-d${dim}`;
    /** @type {number} */
    this.dim = dim;
    this.ngramMin = ngramMin;
    this.ngramMax = ngramMax;
    this.wordWeight = wordWeight;
    this.synonyms = synonyms;
  }

  /**
   * Embed one text synchronously (internal; use embed() for the interface).
   * @param {string} text
   * @returns {Float32Array}
   */
  embedOneSync(text) {
    const vec = new Float32Array(this.dim);
    const tokens = expandTokens(text, this.synonyms);
    if (tokens.length === 0) return vec;

    /** @type {Map<string, {count: number, weight: number}>} */
    const feats = new Map();
    const bump = (key, weight) => {
      const f = feats.get(key);
      if (f) f.count += 1;
      else feats.set(key, { count: 1, weight });
    };

    for (const tok of tokens) {
      bump(`w:${tok}`, this.wordWeight);
      const padded = `^${tok}$`;
      for (let n = this.ngramMin; n <= this.ngramMax; n++) {
        if (padded.length < n) break;
        for (let i = 0; i + n <= padded.length; i++) {
          bump(`g:${padded.slice(i, i + n)}`, 1.0);
        }
      }
    }

    for (const [key, { count, weight }] of feats) {
      const value = weight * (1 + Math.log(count));
      const h = fnv1a(key);
      const sign = fnv1a(key, 0x9747b28c) & 1 ? 1 : -1;
      vec[h % this.dim] += sign * value;
    }

    // L2 normalise
    let ss = 0;
    for (let i = 0; i < this.dim; i++) ss += vec[i] * vec[i];
    if (ss > 0) {
      const inv = 1 / Math.sqrt(ss);
      for (let i = 0; i < this.dim; i++) vec[i] *= inv;
    }
    return vec;
  }

  /**
   * Embed a batch of texts.
   * @param {string[]} texts
   * @returns {Promise<Float32Array[]>}
   */
  async embed(texts) {
    return texts.map((t) => this.embedOneSync(t));
  }
}

/**
 * Adapter for an externally supplied embedding function — e.g. transformers.js
 * running `Xenova/all-MiniLM-L6-v2` locally in the Electron main process, or a
 * remote embedding API. This package contains no network or model-loading
 * code; you own the function.
 *
 * Example hookup (in GeoLedger's Electron main process, NOT in this package):
 *
 *   import { pipeline } from '@xenova/transformers';        // local ONNX inference
 *   const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
 *   const embedder = new ExternalEmbedder({
 *     name: 'all-MiniLM-L6-v2',
 *     dim: 384,
 *     embed: async (texts) => {
 *       const out = await pipe(texts, { pooling: 'mean', normalize: true });
 *       return out.tolist().map((v) => Float32Array.from(v));
 *     },
 *   });
 *
 * Because dim (384) matches HashingEmbedder's default, the index file format
 * is unchanged — swap embedder, rebuild the index, done.
 *
 * @implements {Embedder}
 */
export class ExternalEmbedder {
  /**
   * @param {object} opts
   * @param {string} [opts.name='external'] model identifier (persisted with the index)
   * @param {number} opts.dim expected output dimensionality
   * @param {(texts: string[]) => Promise<ArrayLike<number>[]>} opts.embed user embedding fn
   */
  constructor({ name = 'external', dim, embed }) {
    if (!Number.isInteger(dim) || dim <= 0) throw new RangeError(`dim must be a positive integer, got ${dim}`);
    if (typeof embed !== 'function') throw new TypeError('embed must be a function (texts) => Promise<vectors>');
    this.name = name;
    this.dim = dim;
    this._fn = embed;
  }

  /**
   * Embed a batch of texts via the user-supplied function, validating shape.
   * @param {string[]} texts
   * @returns {Promise<Float32Array[]>}
   */
  async embed(texts) {
    const raw = await this._fn(texts);
    if (!Array.isArray(raw) || raw.length !== texts.length) {
      throw new Error(
        `ExternalEmbedder(${this.name}): expected ${texts.length} vectors, got ${Array.isArray(raw) ? raw.length : typeof raw}`,
      );
    }
    return raw.map((v, i) => {
      const f = v instanceof Float32Array ? v : Float32Array.from(v);
      if (f.length !== this.dim) {
        throw new Error(`ExternalEmbedder(${this.name}): vector ${i} has dim ${f.length}, expected ${this.dim}`);
      }
      return f;
    });
  }
}
