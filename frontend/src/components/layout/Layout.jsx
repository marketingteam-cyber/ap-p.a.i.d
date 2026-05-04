import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
