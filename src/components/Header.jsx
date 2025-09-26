// src/components/Header.jsx
const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto">
        <nav className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">CS — Ticket System</h1>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6 lg:space-x-8">
            <div className="hidden md:flex items-center space-x-4 md:space-x-6 text-sm md:text-base">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">FAQ</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Changelog</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Blog</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Download</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Contact</a>
            </div>
            
            <a
            href="#"
            className="text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
            style={{ background: "linear-gradient(135deg, #632EE3 0%, #9F62F2 100%)" }}>
            + New Ticket
          </a>

          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;