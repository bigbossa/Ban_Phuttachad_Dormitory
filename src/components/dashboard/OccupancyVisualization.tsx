
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OccupancyVisualizationProps {
  occupiedRooms: number;
  totalRooms: number;
}

import { useLanguage } from "@/providers/LanguageProvider";

export function OccupancyVisualization({ occupiedRooms, totalRooms }: OccupancyVisualizationProps) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.roomStatus") || "Room Status"}</CardTitle>
        <CardDescription>{t("dashboard.currentRoomOccupancy") || "Current room occupancy"}</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <div className="flex flex-col h-full justify-center">
          <div className="text-center text-4xl font-bold text-primary">
            {occupiedRooms}/{totalRooms}
          </div>
          <div className="mt-4 text-muted-foreground text-center">
            {t("dashboard.roomsOccupied") || "Rooms Occupied"}
          </div>
          <div className="mt-6">
            <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{
                  width: `${(occupiedRooms / totalRooms) * 100}%`,
                }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-center">
              {Math.round((occupiedRooms / totalRooms) * 100)}% {t("dashboard.occupancy") || "Occupancy"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
