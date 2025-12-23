'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const SidebarContext = React.createContext<{
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  state: 'expanded',
  open: false,
  setOpen: () => {},
});

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ defaultOpen = true, open: openProp, onOpenChange, className, children, ...props }, ref) => {
  const [open, setOpenState] = React.useState(defaultOpen);
  const openState = openProp ?? open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const newState = typeof value === 'function' ? value(openState) : value;
      if (openProp === undefined) {
        setOpenState(newState);
      }
      onOpenChange?.(newState);
    },
    [openProp, onOpenChange, openState]
  );

  const state = openState ? 'expanded' : 'collapsed';

  return (
    <SidebarContext.Provider value={{ state, open: openState, setOpen }}>
      <div
        ref={ref}
        data-state={state}
        className={cn('group/sidebar-wrapper flex min-h-svh w-full', className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = 'SidebarProvider';

const sidebarVariants = cva(
  'group/sidebar fixed inset-y-0 left-0 z-30 flex-col gap-4 border-r border-slate-800/50 bg-slate-950/95 backdrop-blur-sm p-6 transition-all duration-300 ease-in-out',
  {
    variants: {
      state: {
        expanded: 'w-64',
        collapsed: 'w-16',
      },
    },
    defaultVariants: {
      state: 'expanded',
    },
  }
);

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof sidebarVariants>
>(({ className, state, ...props }, ref) => {
  const { state: contextState } = useSidebar();
  const sidebarState = state ?? contextState;

  return (
    <aside
      ref={ref}
      data-state={sidebarState}
      className={cn(sidebarVariants({ state: sidebarState }), 'hidden lg:flex', className)}
      {...props}
    />
  );
});
Sidebar.displayName = 'Sidebar';

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { setOpen, open } = useSidebar();

  return (
    <button
      ref={ref}
      data-state={open ? 'expanded' : 'collapsed'}
      onClick={() => setOpen(!open)}
      className={cn(
        'inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-900/50 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ade8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex h-16 shrink-0 items-center gap-2 border-b border-slate-800/50', className)}
      {...props}
    />
  );
});
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden', className)}
      {...props}
    />
  );
});
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex shrink-0 flex-col gap-2 border-t border-slate-800/50 pt-4', className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = 'SidebarFooter';

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
});
SidebarGroup.displayName = 'SidebarGroup';

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      className={cn('flex min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
});
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn('group/item relative', className)}
      {...props}
    />
  );
});
SidebarMenuItem.displayName = 'SidebarMenuItem';

const sidebarMenuButtonVariants = cva(
  'peer/menubutton group/menubutton flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-normal transition-all hover:bg-slate-900/50 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ade8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent text-slate-500',
        active: 'bg-slate-900/50 text-slate-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof sidebarMenuButtonVariants> & {
      asChild?: boolean;
      isActive?: boolean;
    }
>(({ asChild = false, isActive, variant, className, children, ...props }, ref) => {
  const finalVariant = isActive ? 'active' : variant;
  const buttonClassName = cn(sidebarMenuButtonVariants({ variant: finalVariant }), className);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: buttonClassName,
      ref,
    });
  }

  return (
    <button
      ref={ref}
      data-active={isActive}
      className={buttonClassName}
      {...props}
    >
      {children}
    </button>
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
};
