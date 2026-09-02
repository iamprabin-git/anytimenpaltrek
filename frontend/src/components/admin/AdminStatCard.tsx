import type { ReactNode } from "react";
import type { PanelIconName } from "@/components/panel/icons";
import { PanelIcon } from "@/components/panel/icons";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: PanelIconName;
  tone?: "default" | "success" | "warning" | "accent";
}

const toneClasses = {
  default: "admin-stat-icon-default",
  success: "admin-stat-icon-success",
  warning: "admin-stat-icon-warning",
  accent: "admin-stat-icon-accent",
};

export default function AdminStatCard({ label, value, icon, tone = "default" }: AdminStatCardProps) {
  return (
    <div className="admin-stat-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="admin-stat-label">{label}</p>
          <p className="admin-stat-value">{value}</p>
        </div>
        <span className={`admin-stat-icon ${toneClasses[tone]}`}>
          <PanelIcon name={icon} className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header">
      <div className="min-w-0">
        <h2 className="admin-page-title">{title}</h2>
        {description ? <p className="admin-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
