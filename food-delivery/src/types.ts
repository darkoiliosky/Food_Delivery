// Во types.ts, осигури се дека користиш imageUrl и тоа е дефинирано
export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  imageUrl: string; // Додадено imageUrl
  workingHours: string; // Додадено workingHours
}
