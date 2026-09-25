type BrandMarkProps = {
  className?: string;
  size?: number;
};

export default function BrandMark({
  className = "site-brand__mark",
  size = 88
}: BrandMarkProps) {
  return (
    <img
      src="/logo.png?v=2"
      alt="Anadolu Masterler Dostluk Federasyonu"
      className={className}
      width={size}
      height={size}
      decoding="async"
    />
  );
}
