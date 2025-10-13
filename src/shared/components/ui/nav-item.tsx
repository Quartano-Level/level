import Link from "next/link";
import { Button } from "./button";
import { cn } from "@/shared/lib/utils";

interface NavItemProps {
    label: string
    href: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    isActive?: boolean
}

export default function NavItem({ label, href, icon: Icon, isActive }: NavItemProps) {
    return (
      <Button
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "w-full justify-start gap-4 !px-8 py-3.5 h-auto",
          isActive ? "bg-primary text-secondary" : "text-disable hover:text-foreground"
        )}
        asChild
      >
        <Link href={href}>
          <Icon 
            className={cn(
              "h-5 w-5",
              isActive ? "text-secondary" : "text-disable"
            )} 
            aria-hidden="true" 
          />
          <span className="font-medium">{label}</span>
        </Link>
      </Button>
    )
  }