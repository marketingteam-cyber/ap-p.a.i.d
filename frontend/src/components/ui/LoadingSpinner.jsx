export default function LoadingSpinner({ size = 'md', text }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-2 border-brand-gray-700 border-t-brand-blue rounded-full animate-spin`} />
      {text && <p className="text-sm text-brand-gray-500">{text}</p>}
    </div>
  );
}
