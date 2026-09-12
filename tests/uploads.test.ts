import { describe, it, expect } from 'vitest';
import { detectMedia, isMediaFilename, parseRange, readUploadForm } from '@/lib/uploads';

describe('VPS media safety', () => {
  it('rejects path traversal and scripts', () => {
    expect(isMediaFilename('00000000-0000-4000-8000-000000000001.webp')).toBe(true);
    for (const name of ['../secret', '../../app/.env', 'test.svg', 'x.html'])
      expect(isMediaFilename(name)).toBe(false);
    expect(detectMedia(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull();
    expect(detectMedia(Buffer.from('RIFF1234WEBPpayload'))).toBe('webp');
  });
  it('supports bounded, open-ended and suffix video ranges', () => {
    expect(parseRange('bytes=0-49', 100)).toEqual({ start: 0, end: 49 });
    expect(parseRange('bytes=50-', 100)).toEqual({ start: 50, end: 99 });
    expect(parseRange('bytes=-10', 100)).toEqual({ start: 90, end: 99 });
    for (const invalid of ['bytes=100-', 'bytes=9-2', 'bytes=-0', 'bytes=0-2,4-6', 'nonsense'])
      expect(parseRange(invalid, 100)).toBeNull();
  });
  it('rejects oversize multipart before parsing', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=x', 'Content-Length': '999999999' },
    });
    await expect(readUploadForm(request)).rejects.toThrow();
  });
});
