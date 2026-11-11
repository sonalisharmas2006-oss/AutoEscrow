import Image from "next/image";

export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`relative inline-flex shrink-0 overflow-hidden ${className}`}>
      <Image
        src="/branding/autoescrow-logo.jpg"
        alt=""
        fill
        sizes="40px"
        className="scale-150 object-contain"
      />
    </span>
  );
}
