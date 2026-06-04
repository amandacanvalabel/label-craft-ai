// Renderiza um <svg> a partir de uma string de paths (porte dos ícones inline).
export default function Svg({
  paths,
  sw = 1.9,
  className,
  width,
  height,
}: {
  paths: string;
  sw?: number;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={width}
      height={height}
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}
