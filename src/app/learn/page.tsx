import Image from "next/image";
import { ArrowUpRight, BookOpen, Clock3, Play, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const lessons = [
  { title: "Spinning reel casting for beginners", category: "Fundamentals", duration: "Beginner", query: "spinning reel casting tutorial beginners", image: "https://images.unsplash.com/photo-1498623116890-37e912163d5d?auto=format&fit=crop&w=900&q=85", summary: "Build a smooth cast, control the line, and avoid the most common tangles." },
  { title: "Essential fishing knots", category: "Rigging", duration: "15 min", query: "improved clinch knot palomar knot fishing tutorial", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=85", summary: "Learn reliable knots for hooks, swivels, leaders, and braided line." },
  { title: "Kelong bottom-fishing setup", category: "Saltwater", duration: "Intermediate", query: "kelong bottom fishing rig tutorial Malaysia", image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=85", summary: "Choose sinker weight, leader length, bait, and tackle for moving coastal water." },
  { title: "Safe catch and release", category: "Fish care", duration: "10 min", query: "catch and release fish handling best practices", image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=85", summary: "Reduce handling time and return fish in a condition that supports survival." },
  { title: "Reading wind, rain, and waves", category: "Forecast", duration: "Intermediate", query: "how to read marine weather forecast fishing wind waves", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85", summary: "Interpret forecast conditions and know when a session should be postponed." },
  { title: "Photographing and logging a catch", category: "Community", duration: "8 min", query: "how to photograph fishing catch safely", image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=900&q=85", summary: "Capture useful species, size, technique, and location data without exposing secret spots." },
];

export default function LearnPage() {
  return <div className="page-container standard-page"><PageHeader eyebrow="AnglerMY Academy" title="Learn fishing skills" description="Practical lessons for safer, more successful fishing in Malaysian waters." />
    <section className="learning-banner surface"><ShieldCheck /><div><h2>Safety comes before the fishing score</h2><p>Check local warnings, wear a personal flotation device on boats, and stop when conditions exceed your experience.</p></div></section>
    <div className="lesson-grid">{lessons.map((lesson) => <article className="lesson-card surface" key={lesson.title}><div className="lesson-image"><Image src={lesson.image} fill sizes="(max-width: 700px) 100vw, 350px" alt="" /><span><Play fill="currentColor" />Video lesson</span></div><div className="lesson-copy"><p className="eyebrow">{lesson.category}</p><h2>{lesson.title}</h2><p>{lesson.summary}</p><div><span><Clock3 />{lesson.duration}</span><a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.query)}`} target="_blank" rel="noreferrer">Find lesson <ArrowUpRight /></a></div></div></article>)}</div>
    <section className="learning-note surface"><BookOpen /><div><h2>Creator programme later</h2><p>Verified Malaysian anglers will be able to publish local lessons after accounts, moderation, and video hosting are connected.</p></div></section>
  </div>;
}
