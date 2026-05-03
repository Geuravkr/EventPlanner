import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type Venue = {
  id: string;
  name: string;
  location: string;
  price_per_day: number;
  capacity: number;
  rating: number;
  cover_image: string | null;
};

export function VenueCard({ v, favorited, onToggle }: { v: Venue; favorited?: boolean; onToggle?: () => void }) {
  const { user } = useAuth();

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Please sign in to save venues");
    if (favorited) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("venue_id", v.id);
      toast.success("Removed from favorites");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, venue_id: v.id });
      toast.success("Saved to favorites");
    }
    onToggle?.();
  };

  return (
    <Link to="/venues/$venueId" params={{ venueId: v.id }} className="group block">
      <div className="overflow-hidden rounded-2xl bg-card shadow-card border transition-all hover:shadow-glow hover:-translate-y-1 duration-300">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img src={v.cover_image ?? ""} alt={v.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <button
            onClick={toggleFav}
            className="absolute top-3 right-3 size-9 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Save venue"
          >
            <Heart className={`size-4 ${favorited ? "fill-destructive text-destructive" : "text-foreground"}`} />
          </button>
          <Badge className="absolute bottom-3 left-3 bg-background/90 text-foreground backdrop-blur gap-1">
            <Star className="size-3 fill-gold text-gold" /> {Number(v.rating).toFixed(1)}
          </Badge>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight">{v.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="size-3.5" /> {v.location}
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="size-3.5" /> Up to {v.capacity}
            </span>
            <div>
              <span className="font-display text-xl font-semibold">${Number(v.price_per_day).toLocaleString()}</span>
              <span className="text-xs text-muted-foreground"> /day</span>
            </div>
          </div>
          <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">Book Now</Button>
        </div>
      </div>
    </Link>
  );
}
