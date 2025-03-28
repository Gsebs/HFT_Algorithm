import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";

interface StatsCardProps {
  title: string;
  value: string;
  trend?: "up" | "down";
  className?: string;
}

export function StatsCard({ title, value, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{value}</div>
            {trend && (
              <div
                className={cn(
                  "flex items-center text-xs font-medium",
                  trend === "up" ? "text-green-500" : "text-red-500"
                )}
              >
                {trend === "up" ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 