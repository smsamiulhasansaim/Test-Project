const TicketCard = ({ ticket, isSelected, onSelect }) => {
  const ticketDate = new Date(ticket.createdAt);
  const formattedDate = ticketDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  let statusClass = '';
  let statusText = '';
  switch(ticket.status) {
    case 'open':
      statusClass = 'samiul-status-open-badge bg-green-100 text-green-700';
      statusText = 'Open';
      break;
    case 'in-progress':
      statusClass = 'samiul-status-in-progress-badge bg-yellow-100 text-yellow-700';
      statusText = 'In-Progress';
      break;
    case 'resolved':
      statusClass = 'samiul-status-resolved-badge bg-gray-100 text-gray-700';
      statusText = 'Resolved';
      break;
    default:
      statusClass = 'bg-gray-100 text-gray-700';
      statusText = ticket.status;
  }

  let priorityClass = '';
  let priorityText = '';
  switch(ticket.priority) {
    case 'high':
      priorityClass = 'samiul-priority-high';
      priorityText = 'HIGH PRIORITY';
      break;
    case 'medium':
      priorityClass = 'samiul-priority-medium';
      priorityText = 'MEDIUM PRIORITY';
      break;
    case 'low':
      priorityClass = 'samiul-priority-low';
      priorityText = 'LOW PRIORITY';
      break;
    default:
      priorityClass = 'samiul-priority-low';
      priorityText = ticket.priority.toUpperCase();
  }
  return (
    <div 
      className={`samiul-ticket-card bg-white rounded-lg shadow-md p-6 relative ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-black text-xl font-semibold">{ticket.title}</h3>
        <span className={`samiul-status-badge ${statusClass} text-xs font-medium px-4 py-1 rounded-full`}>
          {statusText}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-4">{ticket.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <span className="font-bold">#{ticket.id}</span>
          <span className={`${priorityClass} text-xs font-medium px-2 py-1 rounded-full`}>
            {priorityText}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span>{ticket.customer}</span>
          <span className="ml-4">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;