// src/components/TaskStatus.jsx
const TaskStatus = ({ activeTasks, resolvedTasks, onCompleteTask }) => {
  return (
    <div className="w-full lg:w-80 samiul-task-status-container">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Task Status</h2>
        <p className="text-gray-500 mb-6 text-sm">Select a ticket to add to Task Status</p>

        <h3 className="text-xl font-semibold mb-4">Active Tasks</h3>
        <div id="activeTasks">
          {activeTasks.length > 0 ? (
            activeTasks.map(task => (
              <div key={task.id} className="mb-4 pb-4 border-b last:border-b-0">
                <h4 className="font-semibold mb-1">{task.title}</h4>
                <p className="text-gray-600 text-xs mb-2">
                  {task.description.substring(0, 50)}...
                </p>
                <button 
                  onClick={() => onCompleteTask(task.id)}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1 px-3 rounded mt-2"
                >
                  Complete
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No active tasks yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Resolved Tasks</h3>
        <div id="resolvedTasks">
          {resolvedTasks.length > 0 ? (
            resolvedTasks.map(task => (
              <div key={task.id} className="mb-4 pb-4 border-b last:border-b-0">
                <h4 className="font-semibold mb-1">{task.title}</h4>
                <p className="text-gray-600 text-xs mb-2">
                  {task.description.substring(0, 50)}...
                </p>
                <span className="text-green-600 text-xs font-medium">Completed</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No resolved tasks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskStatus;