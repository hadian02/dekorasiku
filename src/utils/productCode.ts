/**
 * Utility untuk mengelola Kode Barang Kriya 10-Digit Heksadesimal
 * Format:
 * - Digit 1 - 5 : Nomor urut pengrajin (Hexadecimal, 5 digit)
 * - Digit 6 - 7 : Kode bahan baku kriya (Hexadecimal, 2 digit)
 * - Digit 8 - 10: Nomor urut barang dari pengrajin tsb (Hexadecimal, 3 digit)
 * Total: 10 digit heksadesimal (0-9, A-F)
 */

export const MATERIAL_HEX_MAP: Record<string, { code: string; label: string }> = {
  keramik: { code: '01', label: 'Tanah Liat & Keramik' },
  anyaman: { code: '02', label: 'Serat Alami & Anyaman' },
  kayu: { code: '03', label: 'Kayu Solid & Pahat' },
  aromaterapi: { code: '04', label: 'Lilin Kedelai & Minyak Esensial' },
  tekstil: { code: '05', label: 'Serat Rami, Katun & Tenun' },
  logam: { code: '06', label: 'Kuningan & Logam Tempa' },
  batu: { code: '07', label: 'Batu Alam & Andesit' },
  kulit: { code: '08', label: 'Kulit Nabati Alami' },
  campuran: { code: '0A', label: 'Material Campuran / Komposit' }
};

export function getMaterialHex(category?: string, materials?: string[]): string {
  if (category && MATERIAL_HEX_MAP[category.toLowerCase()]) {
    return MATERIAL_HEX_MAP[category.toLowerCase()].code;
  }
  const matText = (materials || []).join(' ').toLowerCase();
  if (matText.includes('keramik') || matText.includes('tanah liat') || matText.includes('tembikar')) return '01';
  if (matText.includes('anyam') || matText.includes('rotan') || matText.includes('seagrass') || matText.includes('pandan')) return '02';
  if (matText.includes('kayu') || matText.includes('jati') || matText.includes('mahoni')) return '03';
  if (matText.includes('lilin') || matText.includes('soy wax') || matText.includes('cendana') || matText.includes('aroma')) return '04';
  if (matText.includes('tenun') || matText.includes('katun') || matText.includes('rami') || matText.includes('kain')) return '05';
  return '01';
}

/**
 * Menghasilkan 10 digit kode heksadesimal resmi
 * Contoh: artisanSeq=1, material='01', itemSeq=1 -> "0000101001"
 */
export function generateProductCode(
  artisanSeq: number,
  materialHexOrCategory: string | number,
  itemSeq: number
): string {
  // Digit 1 - 5 (5 digit hexa)
  const safeArtisanSeq = Math.max(1, Math.floor(Number(artisanSeq) || 1));
  const partArtisan = safeArtisanSeq.toString(16).toUpperCase().padStart(5, '0');

  // Digit 6 - 7 (2 digit hexa)
  let partMaterial = '01';
  if (typeof materialHexOrCategory === 'number') {
    partMaterial = materialHexOrCategory.toString(16).toUpperCase().padStart(2, '0');
  } else if (typeof materialHexOrCategory === 'string') {
    if (materialHexOrCategory.length === 2 && /^[0-9A-Fa-f]{2}$/.test(materialHexOrCategory)) {
      partMaterial = materialHexOrCategory.toUpperCase();
    } else {
      partMaterial = getMaterialHex(materialHexOrCategory);
    }
  }

  // Digit 8 - 10 (3 digit hexa)
  const safeItemSeq = Math.max(1, Math.floor(Number(itemSeq) || 1));
  const partItem = safeItemSeq.toString(16).toUpperCase().padStart(3, '0');

  return `${partArtisan}${partMaterial}${partItem}`;
}

/**
 * Mengurai kode 10 digit heksadesimal ke dalam bagian-bagiannya
 */
export function parseProductCode(code: string): {
  isValid: boolean;
  rawCode: string;
  artisanHex: string;
  artisanSeqDec: number;
  materialHex: string;
  materialLabel: string;
  itemHex: string;
  itemSeqDec: number;
} {
  const clean = (code || '').trim().toUpperCase();
  if (clean.length !== 10 || !/^[0-9A-F]{10}$/.test(clean)) {
    return {
      isValid: false,
      rawCode: clean,
      artisanHex: '00000',
      artisanSeqDec: 0,
      materialHex: '00',
      materialLabel: 'Tidak Diketahui',
      itemHex: '000',
      itemSeqDec: 0,
    };
  }

  const artisanHex = clean.substring(0, 5);
  const materialHex = clean.substring(5, 7);
  const itemHex = clean.substring(7, 10);

  const artisanSeqDec = parseInt(artisanHex, 16);
  const itemSeqDec = parseInt(itemHex, 16);

  // Cari label bahan
  let materialLabel = `Bahan Hex #${materialHex}`;
  for (const entry of Object.values(MATERIAL_HEX_MAP)) {
    if (entry.code === materialHex) {
      materialLabel = entry.label;
      break;
    }
  }

  return {
    isValid: true,
    rawCode: clean,
    artisanHex,
    artisanSeqDec,
    materialHex,
    materialLabel,
    itemHex,
    itemSeqDec,
  };
}
