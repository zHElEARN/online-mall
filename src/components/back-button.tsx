import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function BackButton({
  href,
  onClick,
  children,
  className = "",
}: BackButtonProps) {
  if (onClick) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={className}
        onClick={onClick}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {children}
      </Button>
    );
  }

  if (href) {
    return (
      <Button variant="outline" size="sm" className={className} asChild>
        <Link href={href}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {children}
        </Link>
      </Button>
    );
  }

  return null;
}
