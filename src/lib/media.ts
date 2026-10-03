/**
 * وسائط المنتج والخلطة: صورة رئيسية (تظهر في البطاقات والسلة والفاتورة)، صور إضافية،
 * ومقاطع فيديو. في اللوحة والمعرض تُعامَل كقائمة واحدة: الصور أولاً ثم الفيديو.
 */
export const isVideoUrl = (url: string) => /\.(mp4|webm|mov)$/i.test(url);

export function joinMedia(m: { image: string | null; images: string[]; videos: string[] }) {
  return [...(m.image ? [m.image] : []), ...m.images, ...m.videos];
}

export function splitMedia(list: string[]) {
  const photos = list.filter((url) => !isVideoUrl(url));
  return {
    image: photos[0] ?? null,
    images: photos.slice(1),
    videos: list.filter(isVideoUrl),
  };
}
