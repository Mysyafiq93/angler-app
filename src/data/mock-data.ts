import type { Angler, CatchPost, FishingSpot, Trip } from "@/types/domain";

export const currentAngler: Angler = {
  id: "you",
  name: "Ain Hidayah",
  handle: "@ainangler",
  location: "Penang, Malaysia",
  avatar: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=300&q=80",
  level: "Coastal Explorer",
};

const anglers: Angler[] = [
  {
    id: "farid",
    name: "Farid Rahman",
    handle: "@faridcasts",
    location: "Kedah, Malaysia",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    level: "Kelong Specialist",
  },
  {
    id: "azlan",
    name: "Azlan Ismail",
    handle: "@lanlaut",
    location: "Johor, Malaysia",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    level: "Offshore Angler",
  },
];

export const initialPosts: CatchPost[] = [
  {
    id: "catch-1",
    author: anglers[0],
    title: "Early bite at Pulau Aman",
    story: "The current picked up just after sunrise. Live prawn worked close to the structure.",
    species: "Jenahak",
    weight: "3.4 kg",
    technique: "Bottom fishing",
    location: "Pulau Aman, Penang",
    privacy: "Approximate area",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85",
    createdAt: "18 min ago",
    likes: 84,
    comments: 12,
  },
  {
    id: "catch-2",
    author: anglers[1],
    title: "A good morning offshore",
    story: "Calm sea, light wind, and a steady drift. Released after a quick photo.",
    species: "Kerapu",
    weight: "2.8 kg",
    technique: "Slow jigging",
    location: "Johor east coast",
    privacy: "State only",
    image: "https://images.unsplash.com/photo-1498623116890-37e912163d5d?auto=format&fit=crop&w=1200&q=85",
    createdAt: "1 hr ago",
    likes: 57,
    comments: 8,
  },
];

export const fishingSpots: FishingSpot[] = [
  { id: "batu-maung", name: "Batu Maung Fishing Port", state: "Penang", type: "Jetty", latitude: 5.2826, longitude: 100.2865, species: ["Siakap", "Jenahak", "Kerapu"], score: 8.6, image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=85", description: "Coastal fishing area for shore sessions, jetty fishing, and nearby boat departures." },
  { id: "pulau-aman", name: "Pulau Aman Kelong", state: "Penang", type: "Kelong", latitude: 5.2715, longitude: 100.3905, species: ["Gelama", "Jenahak", "Kerapu"], score: 8.2, image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1000&q=85", description: "A bottom-fishing location with sheltered island access and kelong facilities." },
  { id: "pangkor", name: "Pangkor Fishing Port", state: "Perak", type: "Offshore", latitude: 4.211, longitude: 100.573, species: ["Jenahak", "Talang", "Tenggiri"], score: 7.5, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=85", description: "A gateway for island, offshore, and jetty fishing around Pangkor and Lumut." },
  { id: "temenggor", name: "Tasik Temenggor", state: "Perak", type: "Freshwater", latitude: 5.545, longitude: 101.345, species: ["Toman", "Sebarau", "Baung"], score: 8.1, image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85", description: "A large rainforest lake known for casting and Malaysian freshwater species." },
  { id: "klang-pond", name: "Klang Valley Fishing Pond", state: "Selangor", type: "Pond", latitude: 3.0738, longitude: 101.5183, species: ["Siakap", "Patin", "Rohu"], score: 8, image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85", description: "A managed fishing pond suitable for beginners and scheduled sessions." },
];

export const trips: Trip[] = [
  { id: "trip-1", name: "Pulau Aman Kelong Weekend", location: "Penang", date: "2 Aug 2026", price: 80, seats: 2, image: fishingSpots[1].image },
  { id: "trip-2", name: "Pangkor Offshore Run", location: "Perak", date: "9 Aug 2026", price: 220, seats: 3, image: fishingSpots[2].image },
  { id: "trip-3", name: "Temenggor Casting Day", location: "Perak", date: "16 Aug 2026", price: 150, seats: 4, image: fishingSpots[3].image },
];
