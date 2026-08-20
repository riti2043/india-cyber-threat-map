import IndiaThreatMap from "@/components/IndiaThreatMap";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans p-8 dark:bg-black">
      <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">India Cyber Threat Map</h1>
      
      {/* Map container with explicit height as required by MapLibre */}
      <div className="h-[600px] w-full max-w-5xl rounded-xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800">
        <IndiaThreatMap />
      </div>
    </div>
  );
}
