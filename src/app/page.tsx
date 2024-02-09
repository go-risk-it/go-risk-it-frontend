'use client';
import Map from "@/components/map";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useEffect } from "react";
import WebSocketService from "@/components/websocket";

const Home: React.FC = () => {

  const webSocketService = WebSocketService();
    return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-white p-12 text-black">
      <Navbar />
      <Map />
      <Footer />
    </div>
  );
}

export default Home;