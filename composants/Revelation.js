export default function Revelation({ children, classe = "" }) {
  return <div className={`revelation ${classe}`}>{children}</div>;
}
