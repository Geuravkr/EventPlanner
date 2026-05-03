import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, MapPin, Star, Users, Wifi, Calendar as CalIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/venues/$venueId")({
  component: VenueDetail,
});

function VenueDetail() {
  const { venueId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const { data: v } = useQuery({
    queryKey: ["venue", venueId],
    queryFn: async () => (await supabase.from("venues").select("*").eq("id", venueId).single()).data,
  });
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", venueId],
    queryFn: async () => (await supabase.from("reviews").select("*").eq("venue_id", venueId).order("created_at", { ascending: false })).data ?? [],
  });
  const { data: events = [] } = useQuery({
    queryKey: ["my-events", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("events").select("id,name,event_date,budget").eq("user_id", user!.id)).data ?? [],
  });

  const [open, setOpen] = useState(false);
  const [eventId, setEventId] = useState<string>("");
  const [date, setDate] = useState("");
  const [coupon, setCoupon] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!v) return <div className="container mx-auto px-6 py-20 text-muted-foreground">Loading…</div>;

  const gallery = (v.gallery as string[]) ?? [];
  const amenities = (v.amenities as string[]) ?? [];

  const discount = coupon.toUpperCase() === "EVENT10" ? 0.1 : 0;
  const total = Number(v.price_per_day) * (1 - discount);

  const book = async () => {
    if (!user) return nav({ to: "/auth" });
    if (!date) return toast.error("Pick a booking date");
    const { data: booking, error } = await supabase.from("bookings").insert({
      user_id: user.id, venue_id: v.id, event_id: eventId || null,
      booking_date: date, total_amount: total, status: "confirmed",
    }).select().single();
    if (error || !booking) return toast.error(error?.message ?? "Could not book");
    await supabase.from("payments").insert({
      booking_id: booking.id, user_id: user.id, amount: total,
      coupon_code: coupon || null, discount: discount * Number(v.price_per_day), method: "card", status: "completed",
    });
    await supabase.from("notifications").insert({
      user_id: user.id, type: "success",
      message: `Booking confirmed at ${v.name} for ${date}`,
    });
    toast.success("Booking confirmed!");
    setOpen(false);
    nav({ to: "/dashboard" });
  };

  const submitReview = async () => {
    if (!user) return nav({ to: "/auth" });
    const { error } = await supabase.from("reviews").insert({ user_id: user.id, venue_id: v.id, rating, comment });
    if (error) return toast.error(error.message);
    setComment("");
    refetchReviews();
    toast.success("Review posted");
  };

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Gallery */}
      <div className="grid md:grid-cols-4 gap-3 rounded-3xl overflow-hidden">
        <img src={v.cover_image ?? ""} alt={v.name} className="md:col-span-2 md:row-span-2 w-full h-full object-cover aspect-[4/3]" />
        {gallery.slice(0, 4).map((g, i) => (
          <img key={i} src={g} alt="" className="w-full h-full object-cover aspect-[4/3]" />
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mt-10">
        <div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="size-4" /> {v.location}</span>
            <span className="flex items-center gap-1"><Star className="size-4 fill-gold text-gold" /> {Number(v.rating).toFixed(1)}</span>
            <span className="flex items-center gap-1"><Users className="size-4" /> Up to {v.capacity}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3">{v.name}</h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{v.description}</p>

          <div className="mt-8">
            <h3 className="font-display text-2xl font-semibold mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <Badge key={a} variant="secondary" className="px-3 py-1.5"><CheckCircle2 className="size-3.5 mr-1.5 text-gold" /> {a}</Badge>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-12">
            <h3 className="font-display text-2xl font-semibold mb-4">Reviews ({reviews.length})</h3>
            {user && (
              <div className="bg-card border rounded-2xl p-5 mb-6 shadow-card">
                <Label>Rating</Label>
                <div className="flex gap-1 mt-1.5 mb-3">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} onClick={() => setRating(n)}>
                      <Star className={`size-6 ${n <= rating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <Input placeholder="Share your experience" value={comment} onChange={(e) => setComment(e.target.value)} />
                <Button className="mt-3" onClick={submitReview}>Post review</Button>
              </div>
            )}
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b pb-4">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-4 fill-gold text-gold" />)}
                  </div>
                  <p className="text-sm">{r.comment}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
            </div>
          </div>
        </div>

        {/* Booking card */}
        <aside className="lg:sticky lg:top-20 h-fit p-6 bg-card border rounded-2xl shadow-glow">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-display text-3xl font-semibold">${Number(v.price_per_day).toLocaleString()}</span>
              <span className="text-muted-foreground"> /day</span>
            </div>
            <Badge variant="secondary"><Star className="size-3 fill-gold text-gold mr-1" /> {Number(v.rating).toFixed(1)}</Badge>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full mt-5 bg-primary text-primary-foreground"><CalIcon className="size-4" /> Book this venue</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Confirm booking</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                {events.length > 0 && (
                  <div>
                    <Label>Link to event (optional)</Label>
                    <Select value={eventId} onValueChange={setEventId}>
                      <SelectTrigger><SelectValue placeholder="Select an event" /></SelectTrigger>
                      <SelectContent>
                        {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Coupon code (try EVENT10)</Label>
                  <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="EVENT10" />
                </div>
                <div className="bg-muted rounded-xl p-4 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Venue</span><span>${Number(v.price_per_day).toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-gold"><span>Discount (10%)</span><span>-${(Number(v.price_per_day)*0.1).toFixed(0)}</span></div>}
                  <div className="flex justify-between font-semibold pt-2 border-t mt-2"><span>Total</span><span>${total.toLocaleString()}</span></div>
                </div>
                <Button className="w-full bg-primary text-primary-foreground" onClick={book}>Confirm & pay</Button>
              </div>
            </DialogContent>
          </Dialog>
          <p className="text-xs text-muted-foreground text-center mt-3">Free cancellation up to 7 days before</p>

          <div className="mt-6 pt-6 border-t flex items-center gap-2 text-sm text-muted-foreground">
            <Wifi className="size-4" /> {amenities.length} included amenities
          </div>
        </aside>
      </div>
    </div>
  );
}
