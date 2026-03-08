export const getFreshnessInfo = (harvestDate: string) => {
  const now = new Date();
  const harvest = new Date(harvestDate);
  const diffHours = (now.getTime() - harvest.getTime()) / (1000 * 60 * 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 24) {
    return { label: "Just Harvested", emoji: "🟢", color: "text-primary", daysAgo: "Today" };
  } else if (diffDays <= 2) {
    return { label: "Very Fresh", emoji: "🟢", color: "text-primary", daysAgo: `${diffDays} day${diffDays > 1 ? "s" : ""} ago` };
  } else if (diffDays <= 4) {
    return { label: "Fresh", emoji: "🟡", color: "text-farm-orange", daysAgo: `${diffDays} days ago` };
  } else {
    return { label: "Harvest Soon", emoji: "🟠", color: "text-farm-orange", daysAgo: `${diffDays} days ago` };
  }
};
