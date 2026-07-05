// توليد صورة QR للطباعة — يُشغّل يدوياً: npm run qr [slug]
// الرابط المرمّز ثابت للأبد؛ تعديل بيانات الاتصال يتم في data/contacts.ts دون إعادة طباعة.
import { writeFile } from 'node:fs/promises';
import QRCode from 'qrcode';

const BASE_URL = 'https://alhaythamhoney.sy/q/';
const slug = process.argv[2] ?? 'haytham';
const target = `${BASE_URL}${slug}`;
const outFile = `./${slug}-qr.png`;

const buffer = await QRCode.toBuffer(target, {
  type: 'png',
  width: 1024,
  errorCorrectionLevel: 'H',
  margin: 2,
  color: {
    dark: '#B8860B',
    light: '#FFFDF5'
  }
});

await writeFile(outFile, buffer);
console.log(`تم توليد صورة QR: ${outFile}`);
console.log(`الرابط المرمّز: ${target}`);
