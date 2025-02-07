// Во types.ts, осигури се дека користиш imageUrl и тоа е дефинирано
export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image_url: string; // Додадено imageUrl
  working_hours: string; // Додадено workingHours
}
