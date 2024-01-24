import Map from "@/components/map";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-white p-12 text-black">

      <Navbar />
      <Map />
      <Footer />

    </div>
  );
}

export default Home;
