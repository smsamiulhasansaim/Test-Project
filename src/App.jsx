// src/App.jsx
import { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import TicketCard from './components/TicketCard';
import TaskStatus from './components/TaskStatus';
import Footer from './components/Footer';
  import { ToastContainer,} from 'react-toastify';
function App() {
  const [allTickets, setAllTickets] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [resolvedTasks, setResolvedTasks] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Fetch tickets from JSON file
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/src/data/tickets.json');
        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }
        const tickets = await response.json();
        setAllTickets(tickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };

    fetchTickets();
  }, []);

  // Function to select a ticket
  const handleSelectTicket = (ticket) => {
    // Check if ticket is already in active tasks
    if (activeTasks.some(task => task.id === ticket.id)) {
      alert('This ticket is already in the Task Status section.');
      return;
    }
    
    // Add to active tasks
    setActiveTasks(prev => [...prev, ticket]);
    setSelectedTicketId(ticket.id);
    
    // Show success alert
    alert(`Ticket "${ticket.title}" has been added to Task Status.`);
  };

  // Function to complete a task
  const handleCompleteTask = (ticketId) => {
    // Find the task in activeTasks
    const taskIndex = activeTasks.findIndex(task => task.id === ticketId);
    if (taskIndex === -1) return;
    
    const task = activeTasks[taskIndex];
    
    // Remove from active tasks
    const updatedActiveTasks = [...activeTasks];
    updatedActiveTasks.splice(taskIndex, 1);
    setActiveTasks(updatedActiveTasks);
    
    // Add to resolved tasks
    setResolvedTasks(prev => [...prev, task]);
    
    // Remove from Customer Tickets list
    const ticketIndex = allTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      const updatedAllTickets = [...allTickets];
      updatedAllTickets.splice(ticketIndex, 1);
      setAllTickets(updatedAllTickets);
    }
    
    // Show completion alert
    alert(`Task "${task.title}" has been marked as completed.`);
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <Header />
      
      <HeroSection 
        inProgressCount={activeTasks.length} 
        resolvedCount={resolvedTasks.length} 
      />
      
      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Customer Tickets Section */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-8">Customer Tickets</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allTickets.length === 0 ? (
                  <p className="text-gray-500">No tickets found.</p>
                ) : (
                  allTickets.map(ticket => (
                    <TicketCard 
                      key={ticket.id}
                      ticket={ticket}
                      isSelected={selectedTicketId === ticket.id}
                      onSelect={() => handleSelectTicket(ticket)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Task Status Sidebar */}
            <TaskStatus 
              activeTasks={activeTasks}
              resolvedTasks={resolvedTasks}
              onCompleteTask={handleCompleteTask}
            />
          </div>
        </div>
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default App;