import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface UserStatsCardProps {
  icon: LucideIcon;
  title: string;
  count: number;
  color: string;
  description?: string;
}

export function UserStatsCard({
  icon: Icon,
  title,
  count,
  color,
  description,
}: UserStatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{count}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
