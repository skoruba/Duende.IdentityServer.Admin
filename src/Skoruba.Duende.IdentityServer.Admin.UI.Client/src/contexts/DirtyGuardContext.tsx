import React, { createContext, useCallback, useContext, useState } from "react";

type DirtyMap = Record<string, boolean>;
type DirtyGuardContextType = {
  setDirty: (key: string, dirty: boolean) => void;
  isAnyDirty: boolean;
  reset: () => void;
};

const DirtyGuardContext = createContext<DirtyGuardContextType | null>(null);

export const DirtyGuardProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [dirtyMap, setDirtyMap] = useState<DirtyMap>({});

  const setDirty = useCallback((key: string, dirty: boolean) => {
    setDirtyMap((prev) => ({ ...prev, [key]: dirty }));
  }, []);

  const reset = useCallback(() => setDirtyMap({}), []);

  const isAnyDirty = Object.values(dirtyMap).some(Boolean);

  return (
    <DirtyGuardContext.Provider value={{ setDirty, isAnyDirty, reset }}>
      {children}
    </DirtyGuardContext.Provider>
  );
};

export const useDirtyGuard = () => {
  const ctx = useContext(DirtyGuardContext);
  if (!ctx)
    throw new Error("useDirtyGuard must be used within DirtyGuardProvider");
  return ctx;
};
