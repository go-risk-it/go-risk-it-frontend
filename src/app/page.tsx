'use client';
import Map from "@/components/map";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useEffect } from "react";

const Home: React.FC = () => {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');
    console.log(ws)

    var first = true;
    // Add an event listener for the 'message' event
    ws.addEventListener('message', (event) => {
      console.log('Received message:', event.data);
      if (first) {
        ws.send("ciao");
        first = false;
      }
      // You can handle the received message here or update the component state
    });



  }, [])

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-white p-12 text-black">
      <Navbar />
      <Map />
      <Footer />
    </div>
  );
}

export default Home;