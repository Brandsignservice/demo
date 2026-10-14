import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import CompareTray from "./components/CompareTray";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ChatWidget from "./components/chat/ChatWidget";
import CollectionPage from "./pages/CollectionPage";
import ComparePage from "./pages/ComparePage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProductPage from "./pages/ProductPage";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-svh flex-col bg-noir">
      <ScrollToTop />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-champagne focus:px-4 focus:py-2 focus:text-noir">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jewellery" element={<CollectionPage />} />
          <Route path="/watches" element={<CollectionPage />} />
          <Route path="/engagement-rings" element={<CollectionPage />} />
          <Route path="/gifts" element={<CollectionPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CompareTray />
      <ChatWidget />
    </div>
  );
}
