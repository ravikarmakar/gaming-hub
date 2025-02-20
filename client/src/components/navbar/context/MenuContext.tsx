import { createContext, useContext, useState, ReactNode } from "react";

interface MenuContextType {
  activeMenu: string | null;
  setActiveMenu: (menu: string | null) => void;
  closeAllMenus: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const closeAllMenus = () => setActiveMenu(null);

  return (
    <MenuContext.Provider value={{ activeMenu, setActiveMenu, closeAllMenus }}>
      {children}
    </MenuContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
