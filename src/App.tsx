import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { CoreDataProvider } from "./contexts/CoreDataContext";
import { BurgerMenu } from "./components/BurgerMenu";
import Home from "./pages/Home";
import Items from "./pages/Items";
// Make sure the file exists at src/pages/Order.tsx
import Order from "./pages/Order";
import BulkOrder from "./pages/BulkOrder";
import Tags from "./pages/Tags";
import Settings from "./pages/Settings";
import ManagerView from "./pages/ManagerView";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CoreDataProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/items" element={<Items />} />
              <Route path="/order" element={<Order />} />
              <Route path="/bulk" element={<BulkOrder />} />
              <Route path="/tags" element={<Tags />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/manager-view" element={<ManagerView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BurgerMenu />
          </BrowserRouter>
          </AppProvider>
        </CoreDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
