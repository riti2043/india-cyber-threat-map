import VillageGame from "@/components/game/VillageGame";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-full bg-zinc-50 font-sans dark:bg-black m-0 p-0 overflow-hidden">
      <VillageGame />
    </div>
  );
}
