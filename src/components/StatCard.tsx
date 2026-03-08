import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
  <div className="stat-card">
    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color || "bg-farm-green-light"}`}>
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default StatCard;
