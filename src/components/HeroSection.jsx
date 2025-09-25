// src/components/HeroSection.jsx
const HeroSection = ({ inProgressCount, resolvedCount }) => {
  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center">
          {/* In-Progress Card */}
          <div className="w-full sm:w-1/2 p-4">
            <div className="relative flex flex-col justify-center items-center h-64 md:h-50 samiul-gradient-purple rounded-xl shadow-xl overflow-hidden text-white">
              <div className="samiul-image-container samiul-left-image">
                <img src="img/vector1.png" alt="Left background" className="samiul-background-image" />
              </div>
              
              <div className="samiul-image-container samiul-right-image">
                <img src="#" alt="Right background" className="samiul-background-image" />
              </div>

              <div className="relative z-10 text-center p-6">
                <p className="text-2xl md:text-3xl font-semibold mb-4">In-Progress</p>
                <p className="text-7xl md:text-8xl font-bold">{inProgressCount}</p>
              </div>
            </div>
          </div>

          {/* Resolved Card */}
          <div className="w-full sm:w-1/2 p-4">
            <div className="relative flex flex-col justify-center items-center h-64 md:h-50 samiul-gradient-green rounded-xl shadow-xl overflow-hidden text-white">
              <div className="samiul-image-container samiul-left-image">
                <img src="img/vector1.png" alt="Left background" className="samiul-background-image" />
              </div>
              
              <div className="samiul-image-container samiul-right-image">
                <img src="#" alt="Right background" className="samiul-background-image" />
              </div>

              <div className="relative z-10 text-center p-6">
                <p className="text-2xl md:text-3xl font-semibold mb-4">Resolved</p>
                <p className="text-7xl md:text-8xl font-bold">{resolvedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;