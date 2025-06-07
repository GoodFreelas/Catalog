import React from "react";
import { CartProvider } from "./contexts/CartContext";
import { HomePage } from "./pages/HomePage";

// Main App Component
export default function App() {
  return (
    <CartProvider>
      <div className="App">
        <HomePage />
      </div>
    </CartProvider>
  );
}
