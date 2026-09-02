import Image, { type ImageProps } from "next/image";
import { resolveMediaUrl } from "@/lib/media";

type MediaImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
};

export default function MediaImage({ src, alt, ...props }: MediaImageProps) {
  const resolved = resolveMediaUrl(src);
  if (!resolved) return null;

  return <Image src={resolved} alt={alt} unoptimized {...props} />;
}
