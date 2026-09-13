import Link from "next/link";
import { Plus } from "lucide-react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: { href: string; label: string };
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="admin-page-header">
      <div>
        <p className="admin-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? (
        <Link href={action.href} className="admin-primary-action">
          <Plus aria-hidden="true" size={17} strokeWidth={2} />
          {action.label}
        </Link>
      ) : null}
    </header>
  );
}
