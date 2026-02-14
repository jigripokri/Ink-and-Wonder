const names = [
  { name: "Nani's Notebook", tagline: "Stories Worth Keeping" },
  { name: "Dadi's Diary", tagline: "Stories Worth Keeping" },
] as const;

const chosen = names[Math.random() < 0.5 ? 0 : 1];

export const siteName = chosen.name;
export const siteTagline = chosen.tagline;
