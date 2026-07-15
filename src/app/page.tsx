import { CloudSun, MapPin, Trophy } from "lucide-react";
import Image from "next/image";
import { HomeFeed } from "@/components/feed/home-feed";
import { currentAngler, fishingSpots, trips } from "@/data/mock-data";

export default function HomePage() {
  return <div className="three-column page-container">
    <aside className="left-rail"><section className="profile-summary surface"><Image src={currentAngler.avatar} width={76} height={76} alt="" /><h2>{currentAngler.name}</h2><p>{currentAngler.handle}</p><span>{currentAngler.level}</span><div className="stat-row"><div><strong>48</strong><small>Catches</small></div><div><strong>326</strong><small>Followers</small></div><div><strong>12</strong><small>Trips</small></div></div></section><section className="rail-list surface"><h3>Achievements</h3><p><Trophy />First 10 catches</p><p><MapPin />5 states explored</p></section></aside>
    <HomeFeed />
    <aside className="right-rail"><section className="weather-brief surface"><div><p className="eyebrow">Batu Maung</p><h2>Good morning</h2></div><CloudSun /><strong>8.6</strong><span>Fishing score</span><p>Light wind and a falling rain chance make sunrise the strongest window.</p></section><section className="rail-list surface"><h3>Upcoming trips</h3>{trips.slice(0, 2).map((trip) => <p key={trip.id}><span><strong>{trip.name}</strong><small>{trip.date} · RM{trip.price}</small></span></p>)}</section><section className="rail-list surface"><h3>Popular locations</h3>{fishingSpots.slice(0, 3).map((spot) => <p key={spot.id}><span><strong>{spot.name}</strong><small>{spot.type} · {spot.score}/10</small></span></p>)}</section></aside>
  </div>;
}
