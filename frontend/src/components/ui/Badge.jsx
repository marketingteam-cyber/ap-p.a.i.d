export default function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default:  'bg-brand-gray-700 text-brand-gray-100',
    winning:  'bg-winning/20 text-winning border border-winning/30',
    failing:  'bg-failing/20 text-failing border border-failing/30',
    fatigue:  'bg-fatigue/20 text-fatigue border border-fatigue/30',
    neutral:  'bg-brand-gray-700 text-brand-gray-300',
    blue:     'bg-brand-blue/20 text-brand-blue-light border border-brand-blue/30',
    high:     'bg-failing/20 text-failing border border-failing/30',
    medium:   'bg-fatigue/20 text-fatigue border border-fatigue/30',
    low:      'bg-winning/20 text-winning border border-winning/30',
    new:      'bg-winning/20 text-winning border border-winning/30',
  };

  const sizes = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span className={`inline-flex items-center font-mono font-medium rounded-tag uppercase tracking-wide ${variants[variant] || variants.default} ${sizes[size]}`}>
      {children}
    </span>
  );
}
