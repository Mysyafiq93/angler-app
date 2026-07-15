export type Privacy = "Approximate area" | "State only" | "Private";

export interface Angler {
  id: string;
  name: string;
  handle: string;
  location: string;
  avatar: string;
  level: string;
}

export interface CatchPost {
  id: string;
  author: Angler;
  title: string;
  story: string;
  species: string;
  weight: string;
  technique: string;
  location: string;
  privacy: Privacy;
  image: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface FishingSpot {
  id: string;
  name: string;
  state: string;
  type: "Jetty" | "Kelong" | "Offshore" | "Freshwater" | "Pond";
  latitude: number;
  longitude: number;
  species: string[];
  score: number;
  image: string;
  description: string;
}

export interface Trip {
  id: string;
  name: string;
  location: string;
  date: string;
  price: number;
  seats: number;
  image: string;
}
