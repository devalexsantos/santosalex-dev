"use client";

/**
 * NavbarSwitcherContext
 *
 * Allows specific pages (e.g. post detail) to hide the Navbar's global
 * LocaleSwitcher and replace it with a more context-aware one rendered
 * inline in the page header.
 *
 * Usage: Wrap the post detail page content with <HideNavbarSwitcher />,
 * and the Navbar will read the context and suppress its switcher.
 */

import { createContext, useContext, useState } from "react";

interface NavbarSwitcherContextValue {
  hidden: boolean;
  setHidden: (v: boolean) => void;
}

const NavbarSwitcherContext = createContext<NavbarSwitcherContextValue>({
  hidden: false,
  setHidden: () => {},
});

export function NavbarSwitcherProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return (
    <NavbarSwitcherContext.Provider value={{ hidden, setHidden }}>
      {children}
    </NavbarSwitcherContext.Provider>
  );
}

export function useNavbarSwitcher() {
  return useContext(NavbarSwitcherContext);
}
