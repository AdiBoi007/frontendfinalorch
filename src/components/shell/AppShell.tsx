import { motion } from "framer-motion";
import { useState } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { Outlet, useLocation } from "react-router-dom";
import { NAV_BAR_WIDTH, NavBar } from "./NavBar";
import { SocratesPanel } from "./SocratesPanel";

const navTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
} as const;

const SOCRATES_WIDTH = 300;

export function AppShell() {
  const [socratesOpen, setSocratesOpen] = useState(true);
  const location = useLocation();
  const isBrainRoute = location.pathname.includes("/brain");
  const socratesWidth = isBrainRoute ? 0 : socratesOpen ? SOCRATES_WIDTH : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <NavBar />
      <div aria-hidden="true" style={{ width: NAV_BAR_WIDTH }} className="h-screen flex-shrink-0" />
      {!isBrainRoute ? (
        <>
          <motion.div
            initial={false}
            animate={{ width: socratesWidth }}
            transition={navTransition}
            className="h-screen flex-shrink-0 overflow-hidden"
          >
            <SocratesPanel />
          </motion.div>

          <motion.button
            type="button"
            initial={false}
            animate={{ left: NAV_BAR_WIDTH + socratesWidth }}
            transition={navTransition}
            onClick={() => setSocratesOpen((open) => !open)}
            className="fixed top-1/2 z-[60] flex h-9 w-5 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-[rgba(26,22,18,0.08)] bg-white text-[#78716C] shadow-[2px_0_8px_rgba(26,22,18,0.06)] transition-colors hover:border-[#B8543D] hover:text-[#B8543D]"
            aria-label={socratesOpen ? "Hide Socrates panel" : "Show Socrates panel"}
            aria-expanded={socratesOpen}
          >
            {socratesOpen ? <TbChevronLeft size={16} strokeWidth={1.8} /> : <TbChevronRight size={16} strokeWidth={1.8} />}
          </motion.button>
        </>
      ) : null}
      <main className="min-w-0 flex-1 overflow-hidden bg-bg">
        <Outlet />
      </main>
    </div>
  );
}
