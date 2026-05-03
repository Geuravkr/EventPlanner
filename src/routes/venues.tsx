import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { VenueCard } from "@/components/VenueCard";
import { useAuth } from "@/lib/auth";

const search = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/venues")({
  validateSearch: search,
  component: VenuesPage,
  head: () => ({ meta: [{ title: "Browse venues — Eventide" }] }),
});

function VenuesPage() {
  const { q: initialQ } = Route.useSearch();
  const { user } = useAuth();
  const [q, setQ] = useState(initialQ ?? "");
  const [price, setPrice] = useState<[number]>([6000]);
  const [capacity, setCapacity] = useState<[number]>([0]);
  const [minRating, setMinRating] = useState<[number]>([0]);

  const { data: venues = [], refetch } = useQuery({
    queryKey: ["venues", "all"],
    queryFn: async () => (await supabase.from("venues").select("*").order("rating", { ascending: false })).data ?? [],
  });

  const { data: favs = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("favorites").select("venue_id").eq("user_id", user!.id)).data ?? [],
  });
  const favSet = useMemo(() => new Set(favs.map((f) => f.venue_id)), [favs]);

  const filtered = venues.filter((v) =>
    (q === "" || `${v.name} ${v.location}`.toLowerCase().includes(q.toLowerCase())) &&
    Number(v.price_per_day) <= price[0] &&
    v.capacity >= capacity[0] &&
    Number(v.rating) >= minRating[0]
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold">Find your venue</h1>
        <p className="text-muted-foreground mt-1">{filtered.length} stunning spaces available</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="lg:sticky lg:top-20 h-fit space-y-6 p-6 bg-card border rounded-2xl shadow-card">
          <div className="flex items-center gap-2 font-medium">
            <SlidersHorizontal className="size-4" /> Filters
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Search</Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="City or name" className="pl-9" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Max price · ${price[0].toLocaleString()}/day</Label>
            <Slider value={price} onValueChange={(v) => setPrice(v as [number])} min={500} max={6000} step={100} className="mt-3" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Min capacity · {capacity[0]} guests</Label>
            <Slider value={capacity} onValueChange={(v) => setCapacity(v as [number])} min={0} max={500} step={10} className="mt-3" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Min rating · {minRating[0].toFixed(1)} ★</Label>
            <Slider value={minRating} onValueChange={(v) => setMinRating(v as [number])} min={0} max={5} step={0.1} className="mt-3" />
          </div>
        </aside>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((v) => (
            <VenueCard key={v.id} v={v} favorited={favSet.has(v.id)} onToggle={() => refetch()} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">No venues match your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
