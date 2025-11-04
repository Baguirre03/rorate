import CompanySearchExample from "./components/CompanySearchExample";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          Company Search Component Test
        </h1>
        <CompanySearchExample />
      </div>
    </div>
  );
}
