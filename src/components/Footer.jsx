// src/components/Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-black text-white p-8 mt-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">CS — Ticket System</h2>
            <p className="text-gray-400 text-sm">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Our Mission</a></li>
              <li><a href="#" className="hover:underline">Contact Sales</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:underline">Products & Services</a></li>
              <li><a href="#" className="hover:underline">Customer Stories</a></li>
              <li><a href="#" className="hover:underline">Download Apps</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Information</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
              <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
              <li><a href="#" className="hover:underline">Join Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Social Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <i className="fab fa-twitter"></i>
                <a href="#" className="hover:underline">@CS — Ticket System</a>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fab fa-linkedin"></i>
                <a href="#" className="hover:underline">@CS — Ticket System</a>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fab fa-facebook"></i>
                <a href="#" className="hover:underline">@CS — Ticket System</a>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-envelope"></i>
                <a href="#" className="hover:underline">support@cst.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          © 2025 CS — Ticket System. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;