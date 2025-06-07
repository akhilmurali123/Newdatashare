
// @/components/ui/sidebar.tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile" // Make sure this path is correct
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Keep if used
import { Separator } from "@/components/ui/separator" // Keep if used
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton" // Keep if used
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"; // Import Link for navigation

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem" // Default expanded width
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3.5rem" // Icon-only width (increased slightly for padding)
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // Initialize _open with defaultOpen for server and initial client render
    const [_open, _setOpen] = React.useState(defaultOpen);
    
    const open = openProp ?? _open
    
    // Effect to read cookie and update _open state after client-side hydration
    React.useEffect(() => {
      if (openProp === undefined) { // Only manage cookie for uncontrolled component
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
          ?.split('=')[1];
        if (cookieValue) {
          const cookieOpenState = cookieValue === 'true';
          // Update state only if it's different from the current _open state
          // _open is initialized from defaultOpen, this syncs it if cookie differs
          if (cookieOpenState !== _open) {
            _setOpen(cookieOpenState);
          }
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openProp]); // Rerun if component switches between controlled/uncontrolled. _open is not needed here.

    React.useEffect(() => {
      // Sync _open with openProp if it's provided and changes (for controlled component)
      if (openProp !== undefined && openProp !== _open) {
        _setOpen(openProp);
      }
    }, [openProp, _open]);
    
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState); // Update internal state for uncontrolled component
        }
        // Side effect: update cookie
        if (typeof window !== 'undefined') {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [setOpenProp, open] // `open` is derived from `openProp` or `_open`
    );
    
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((currentOpen) => !currentOpen)
        : setOpen((currentOpen) => !currentOpen) // setOpen will handle cookie update
    }, [isMobile, setOpen, setOpenMobile]);

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex flex-col min-h-screen", // Changed to flex-col
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement, // Changed to HTMLDivElement as it's a div
  React.ComponentProps<"aside"> & { // Changed to aside for semantic HTML
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar", // Default to 'sidebar' variant
      collapsible = "icon", // Default to 'icon' collapsible
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile, open } = useSidebar()

    if (collapsible === "none") {
      return (
        <aside // Changed to aside
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            variant === "sidebar" && (side === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border"),
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </aside>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" // Removed SheetClose explicit class
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }
    
    // Desktop sidebar
    return (
       <aside // Changed to aside
        ref={ref}
        className={cn(
          "group hidden md:flex flex-col h-full text-sidebar-foreground transition-all duration-300 ease-in-out",
          state === "expanded" ? "w-[--sidebar-width]" : "w-[--sidebar-width-icon]",
          variant === "sidebar" && "bg-sidebar",
          variant === "sidebar" && (side === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border"),
          variant === "floating" && "bg-sidebar m-2 rounded-lg border border-sidebar-border shadow-lg",
          variant === "inset" && "bg-sidebar", // Inset might be handled by SidebarInset margins
          className
        )}
        data-state={state}
        data-collapsible={collapsible} 
        data-variant={variant}
        data-side={side}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"


const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (isMobile) {
      setOpenMobile(true); // Explicitly open mobile sheet
    } else {
      toggleSidebar();
    }
  };


  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 text-muted-foreground hover:text-foreground", 
        isMobile ? "" : "group-data-[collapsible=icon]/sidebar-wrapper:absolute group-data-[collapsible=icon]/sidebar-wrapper:top-2 group-data-[collapsible=icon]/sidebar-wrapper:left-2", // Example positioning for desktop icon trigger
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"


const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement, // Changed to HTMLDivElement
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  // This component is designed to be the <main> content area that adjusts its margins.
  // The parent div of Sidebar and SidebarInset should be display: flex.
  return (
    <main // It's already a main tag
      ref={ref}
      className={cn(
        "flex-1 bg-background overflow-y-auto", // Removed relative, added flex-1 for flex layouts
        // Margins/paddings for inset variant are complex and depend on sidebar state.
        // The current Sidebar component doesn't directly control SidebarInset's margins.
        // This needs to be handled by parent layout or specific classes based on sidebar state.
        // For simplicity, basic styling is applied.
        // "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))]",
        // "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2",
        // "md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        "group-data-[state=collapsed]/sidebar-wrapper:hidden", // Hide input when sidebar is collapsed
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar();
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn(
        "flex items-center gap-2 p-2 h-12", // Fixed height for header
        state === "collapsed" ? "justify-center" : "justify-between",
        className
        )}
      {...props}
    >
      {/* Children will render the trigger or logo based on state */}
      {children}
    </div>
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2 mt-auto", className)} // Ensure footer is at the bottom
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden", // Adjusted gap and overflow
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("flex w-full min-w-0 flex-col px-2 py-1", className)} // Adjusted padding
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  const { state } = useSidebar();

  if (state === "collapsed") return null; // Don't render label when collapsed

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none",
        // "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", // Old logic
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { state } = useSidebar();
  if (state === "collapsed") return null;

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        // "group-data-[collapsible=icon]:hidden", // Old logic
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} // Adjusted gap
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative w-full", className)} // Ensure full width
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all duration-200 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-9 text-sm", // Adjusted height
        sm: "h-8 text-xs", // Adjusted height
        lg: "h-10 text-base", // Adjusted height
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Updated SidebarMenuButton
const SidebarMenuButton = React.forwardRef<
  any, 
  React.ComponentProps<typeof Link> & { 
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
    children: React.ReactNode; 
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false, 
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      children, 
      href, 
      ...props
    },
    ref
  ) => {
    const { isMobile, state: sidebarState } = useSidebar();

    const commonProps = {
      "data-sidebar": "menu-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        sidebarMenuButtonVariants({ variant, size, className }), // Apply variant and size classes first
        sidebarState === 'collapsed' && !isMobile && "!justify-center !p-2 !size-9", // Icon-only styling when collapsed and not mobile
        className // Apply user-provided className last to allow overrides
      ),
      ...props, // Spread other props like onClick
    };
    
    const Comp = asChild ? Slot : (href ? "a" : "button");
    let finalButtonElement;

    if (asChild) {
      // If asChild, Comp is Slot. User's component (children) is passed directly.
      // commonProps (including className for sizing) are applied to Slot,
      // which then passes them to the child (e.g., Link).
      finalButtonElement = React.createElement(
        Comp, // This will be Slot
        { ref, ...commonProps }, // href is part of children (e.g. <Link href...>) or props if Comp becomes 'a'
        children
      );
    } else {
      // If not asChild, Comp is 'a' or 'button'.
      // Construct inner content (icon, label) based on sidebarState.
      const buttonInnerContent = (
        <>
          {React.Children.map(children, (childElement) => {
            // Handle Chevrons if they are direct children
            if (React.isValidElement(childElement) && typeof childElement.type !== 'string' && (childElement.type as any).displayName?.includes('Chevron')) {
              return childElement;
            }
            // If collapsed, not mobile, multiple children exist, and current child is not the first one: hide it.
            // This assumes the icon is the first child.
            if (sidebarState === 'collapsed' && !isMobile && React.Children.count(children) > 1 && React.Children.toArray(children).indexOf(childElement) > 0) {
              return null;
            }
            return childElement;
          })}
        </>
      );
      
      // Comp is already 'a' or 'button' from the top assignment
      finalButtonElement = React.createElement(
        Comp, 
        { ref, ...commonProps, ...(Comp === "a" && href && { href }) }, // Add href if Comp is 'a'
        buttonInnerContent
      );
    }

    if (!tooltip || (sidebarState === 'expanded' && !isMobile)) {
      return finalButtonElement;
    }
    
    let tooltipSide: 'right' | 'left' | 'top' | 'bottom' = 'right';
    if (typeof tooltip === 'object' && tooltip.side) {
        tooltipSide = tooltip.side;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{finalButtonElement}</TooltipTrigger>
        <TooltipContent
          side={tooltipSide}
          align="center"
          {...(typeof tooltip === 'string' ? {} : { ...tooltip, children: undefined })} // Pass props from tooltip obj, content is via children prop below
        >
          {typeof tooltip === 'string' ? tooltip : tooltip.children}
        </TooltipContent>
      </Tooltip>
    );
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"


const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { state } = useSidebar();
  if (state === "collapsed") return null;


  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1/2 -translate-y-1/2 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        // "group-data-[collapsible=icon]:hidden", // Old logic
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar();
  if (state === "collapsed") return null;

  return (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "ml-auto text-xs font-medium text-sidebar-foreground/80 bg-sidebar-accent/20 rounded px-1.5 py-0.5",
      // "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
      // "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      // "peer-data-[size=sm]/menu-button:top-1",
      // "peer-data-[size=default]/menu-button:top-1.5",
      // "peer-data-[size=lg]/menu-button:top-2.5",
      // "group-data-[collapsible=icon]:hidden", // Old logic
      className
    )}
    {...props}
  >
    {children}
  </div>
)})
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = true, ...props }, ref) => { // Default showIcon to true
  const { state } = useSidebar();
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn(
        "rounded-md h-9 flex gap-2 px-2 items-center",  // Adjusted height
        state === "collapsed" && "justify-center",
        className
      )}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-5 rounded-md" // Adjusted size
          data-sidebar="menu-skeleton-icon"
        />
      )}
      {state === "expanded" && (
        <Skeleton
          className="h-4 flex-1 max-w-[--skeleton-width]"
          data-sidebar="menu-skeleton-text"
          style={
            {
              "--skeleton-width": width,
            } as React.CSSProperties
          }
        />
      )}
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"


const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar();
  if (state === "collapsed") return null;

  return (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "ml-5 flex min-w-0 flex-col gap-0.5 border-l border-sidebar-border pl-2 pr-0 py-1", // Adjusted padding/margin
      // "group-data-[collapsible=icon]:hidden", // Old logic
      className
    )}
    {...props}
  >
    {children}
  </ul>
)})
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} className="w-full" {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  any,
  React.ComponentProps<typeof Link> & {
    asChild?: boolean
    size?: "sm" | "default" // Changed md to default
    isActive?: boolean
    children: React.ReactNode;
  }
>(({ asChild = false, size = "default", isActive, className, children, href, ...props }, ref) => {
  const Comp = asChild ? Slot : (href ? "a" : "button");
  const { state } = useSidebar();
  if (state === "collapsed") return null;

  return React.createElement(
    Comp,
    {
      ref,
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        "flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground/90 outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "[&>svg]:text-sidebar-accent", // Removed conditional coloring for svg, let parent handle it
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium",
        size === "sm" ? "h-7 text-xs" : "h-8 text-sm", // Adjusted height
        // "group-data-[collapsible=icon]:hidden", // Old logic
        className
      ),
      ...(Comp === "a" && href && { href }),
      ...props
    },
    children
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
