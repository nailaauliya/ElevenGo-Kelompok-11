import { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useNavigate = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useNavigate must be used within RouterProvider');
  }
  return context.navigate;
};

export const useCurrentPath = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useCurrentPath must be used within RouterProvider');
  }
  return context.currentPath;
};

interface RouteProps {
  path: string;
  component: React.ComponentType;
}

export const Route = ({ path, component: Component }: RouteProps) => {
  const currentPath = useCurrentPath();
  return currentPath === path ? <Component /> : null;
};
