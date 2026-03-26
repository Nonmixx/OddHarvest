import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
  <div className="stat-card group">
    <div className={`icon-blob h-14 w-14 rounded-[40%_60%_55%_45%/60%_40%_60%_40%] flex items-center justify-center ${color || "bg-farm-green-light"}`}>
      <Icon className="h-6 w-6 text-primary relative z-10" />
    </div>
    <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default StatCard;
