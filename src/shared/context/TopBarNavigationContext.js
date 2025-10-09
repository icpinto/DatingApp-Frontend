import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const TopBarNavigationContext = createContext(undefined);

export function TopBarNavigationProvider({ children }) {
  const [navigation, setNavigationNode] = useState(null);

  const setNavigation = useCallback((content) => {
    setNavigationNode(content);
  }, []);

  const clearNavigation = useCallback(() => {
    setNavigationNode(null);
  }, []);

  const value = useMemo(
    () => ({ navigation, setNavigation, clearNavigation }),
    [navigation, setNavigation, clearNavigation]
  );

  return (
    <TopBarNavigationContext.Provider value={value}>
      {children}
    </TopBarNavigationContext.Provider>
  );
}

export function useTopBarNavigation() {
  const context = useContext(TopBarNavigationContext);

  if (!context) {
    throw new Error(
      "useTopBarNavigation must be used within a TopBarNavigationProvider"
    );
  }

  return context;
}

