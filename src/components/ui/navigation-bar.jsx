import React from "react"
import { Bell, Info, ShieldAlert, Cpu, Settings, LogOut, Activity, FileText, ChevronDown } from "lucide-react"
import { Button } from "./button"
import { MetalButton } from "./button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"

// Custom InfoMenu Component for Space Traffic parameters
function InfoMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white cursor-pointer">
          <Info className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-950/95 border-slate-800 text-slate-200">
        <DropdownMenuLabel className="text-slate-400 font-mono text-xs">SYSTEM STATUS</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem className="focus:bg-slate-800 cursor-pointer flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span>Operational Logs</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="focus:bg-slate-800 cursor-pointer flex items-center gap-2">
          <FileText className="h-4 w-4 text-sky-400" />
          <span>Protocol Docs</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="focus:bg-slate-800 cursor-pointer flex items-center gap-2">
          <Cpu className="h-4 w-4 text-purple-400" />
          <span>ZKP Audit Ledger</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Custom NotificationMenu Component for Space operational alerts
function NotificationMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white relative cursor-pointer">
          <Bell className="h-4 w-4" />
          <span 
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse"
          >
            3
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-slate-950/95 border-slate-800 text-slate-200">
        <DropdownMenuLabel className="flex items-center justify-between text-slate-400 font-mono text-xs">
          <span>OPERATIONAL ALERTS</span>
          <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 rounded font-mono">3 ACTIVE</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem className="flex-col items-start p-3 focus:bg-slate-800 cursor-pointer">
          <div className="flex w-full items-center justify-between">
            <span className="font-semibold text-xs text-red-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 inline-block" />
              Conjunction Alert
            </span>
            <span className="text-[10px] text-slate-500 font-mono">LEO-82</span>
          </div>
          <span className="text-xs text-slate-300 mt-1">
            Probability at LEO-82 &gt; 1.2% offset. Maneuver suggested.
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex-col items-start p-3 focus:bg-slate-800 cursor-pointer">
          <div className="flex w-full items-center justify-between">
            <span className="font-semibold text-xs text-amber-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
              Maneuver Bid
            </span>
            <span className="text-[10px] text-slate-500 font-mono">2m ago</span>
          </div>
          <span className="text-xs text-slate-300 mt-1">
            Sat-12 submitted bid of 0.23 Delta-V for trajectory right-of-way.
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex-col items-start p-3 focus:bg-slate-800 cursor-pointer">
          <div className="flex w-full items-center justify-between">
            <span className="font-semibold text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
              Ledger Block
            </span>
            <span className="text-[10px] text-slate-500 font-mono">1h ago</span>
          </div>
          <span className="text-xs text-slate-300 mt-1">
            Audit block #4829 secured and hashed via SHA-256.
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Custom UserMenu Component for Satellite Operators
function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-slate-800 bg-slate-900 text-slate-300 hover:text-white cursor-pointer font-mono text-xs flex items-center justify-center">
          OP
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-950/95 border-slate-800 text-slate-200">
        <DropdownMenuLabel className="text-slate-400 font-mono text-xs">OPERATOR PORTAL</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem className="focus:bg-slate-800 cursor-pointer flex items-center gap-2">
          <Settings className="h-4 w-4 text-slate-400" />
          <span>Thruster Tuning</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="focus:bg-slate-800 cursor-pointer flex items-center gap-2">
          <Cpu className="h-4 w-4 text-slate-400" />
          <span>Key Management</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem className="focus:bg-slate-800 text-red-400 focus:text-red-300 cursor-pointer flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span>Disconnect Portal</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Navigation links array mapping to section anchors
const navigationLinks = [
  { href: "#", label: "Home" },
  { href: "#overview", label: "Overview" },
  { href: "#protocols", label: "Protocols" },
]

export default function NavigationBar({ onLaunch }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b border-slate-800 bg-slate-950/85 backdrop-blur-md px-4 md:px-6 h-16">
      <div className="flex h-full items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-6">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group h-8 w-8 md:hidden text-slate-400 hover:text-white"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-40 p-1 bg-slate-950 border-slate-800 text-slate-200">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      <NavigationMenuLink href={link.href} className="py-2 px-3 block rounded text-sm hover:bg-slate-850 hover:text-white">
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>

          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="font-mono text-sm font-extrabold tracking-wider text-cyan-400">
                ORBITAL NEGOTIATOR
              </span>
              <span className="font-mono text-[8px] text-slate-500 tracking-widest leading-none">
                SPACE OPERATIONS HUB
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <NavigationMenu className="max-md:hidden">
              <NavigationMenuList className="gap-4">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink
                      href={link.href}
                      className="text-slate-400 hover:text-white py-1.5 px-2 text-sm font-medium transition-colors font-mono uppercase tracking-wider"
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Right side operational controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-emerald-400 flex items-center gap-1.5 max-sm:hidden mr-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
              NOMINAL
            </span>
            <InfoMenu />
            <NotificationMenu />
            <UserMenu />
          </div>
          
          <div className="max-sm:hidden">
            <MetalButton onClick={onLaunch} style={{ height: "32px", fontSize: "10px", padding: "0 12px", fontFamily: "monospace" }}>
              LAUNCH CONTROLS
            </MetalButton>
          </div>
        </div>
      </div>
    </header>
  )
}
