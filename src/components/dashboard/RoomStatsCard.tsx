
import { DoorClosed, Users, Home } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RoomStatsCardProps {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  t: (key: string) => string;
}

export function RoomStatsCard({ totalRooms, occupiedRooms, vacantRooms, t }: RoomStatsCardProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("dashboard.totalRooms")}
          </CardTitle>
          <DoorClosed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRooms}</div>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <div className="flex w-full items-center gap-2">
              <div className="flex h-2 w-full overflow-hidden rounded bg-secondary">
                <div
                  className="bg-primary"
                  style={{
                    width: `${
                      (occupiedRooms / totalRooms) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div>
                {Math.round((occupiedRooms / totalRooms) * 100)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("dashboard.occupiedRooms")}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{occupiedRooms}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("dashboard.vacantRooms")}
          </CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{vacantRooms}</div>
        </CardContent>
      </Card>
    </>
  );
}
