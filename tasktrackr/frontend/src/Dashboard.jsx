import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ backendURL }) {
  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filter, setFilter] = useState('All');
  const [editingTask, setEditingTask] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/tasks`, { withCredentials: true });
      setTasks(res.data);
    } catch (err) {
      console.error('Fetch tasks error:', err.response ? err.response.data : err.message);
    }
  };

  // Create a new task
  const createTask = async () => {
    try {
      await axios.post(`${backendURL}/api/tasks`, {
        title: newTaskTitle || 'New Task',
        description: '',
        due_date: null,
        completed: false,
        category: newCategory || 'General'
      }, { withCredentials: true });

      setNewTaskTitle('');
      setNewCategory('');
      fetchTasks();
    } catch (err) {
      console.error('Create task error:', err.response ? err.response.data : err.message);
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${backendURL}/api/tasks/${id}`, { withCredentials: true });
      fetchTasks();
    } catch (err) {
      console.error('Delete task error:', err.response ? err.response.data : err.message);
    }
  };

  // Save edits to a task (Auto-save)
  const saveEditing = async (field, value) => {
    const updatedTask = { ...editingTask, [field]: value };
    setEditingTask(updatedTask);

    try {
      await axios.put(`${backendURL}/api/tasks/${editingTask.id}`, updatedTask, { withCredentials: true });
      fetchTasks();
    } catch (err) {
      console.error('Update task error:', err.response ? err.response.data : err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${backendURL}/api/logout`, {}, { withCredentials: true });
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err.response ? err.response.data : err.message);
    }
  };

  const startEditing = (task) => {
    setEditingTask({ ...task });
  };

  // Handle filtering tasks
  const filteredTasks = tasks.filter(task => {
    if (selectedCategory !== 'All' && task.category !== selectedCategory) return false;

    if (filter === 'Due Soon') {
      if (!task.due_date) return false;
      const today = new Date();
      const dueDate = new Date(task.due_date);
      const diffDays = (dueDate - today) / (1000 * 60 * 60 * 24);
      return diffDays <= 7 && diffDays >= 0 && !task.completed;
    }

    if (filter === 'Completed') {
      return task.completed;
    }

    return !task.completed; // Normal active tasks
  });

  // Build list of unique categories
  const categories = ['All', ...new Set(tasks.map(task => task.category))];

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Categories</h3>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}>
            {cat}
          </button>
        ))}
        <h3>Filters</h3>
        <button onClick={() => setFilter('All')}>All Tasks</button>
        <button onClick={() => setFilter('Due Soon')}>Due Soon</button>
        <button onClick={() => setFilter('Completed')}>Completed</button>
        <button onClick={handleLogout} className="logout">Logout</button>
      </div>

      {/* Main Content */}
      <div className="main">
        <h2>Tasks</h2>

        {/* New Task Form */}
        <input
          type="text"
          placeholder="New Task Title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category (Optional)"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        />
        <button onClick={createTask} style={{ marginLeft: '0.5rem' }}>Add Task</button>

        {/* List of Tasks */}
        {filteredTasks.map(task => (
          <div key={task.id} className={`task ${task.completed ? 'completed' : ''}`}>
            {editingTask && editingTask.id === task.id ? (
              <div>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => saveEditing('title', e.target.value)}
                />
                <textarea
                  value={editingTask.description}
                  onChange={(e) => saveEditing('description', e.target.value)}
                />
                <input
                  type="date"
                  value={editingTask.due_date ? editingTask.due_date.split('T')[0] : ''}
                  onChange={(e) => saveEditing('due_date', e.target.value)}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={editingTask.completed}
                    onChange={(e) => saveEditing('completed', e.target.checked)}
                  /> Completed
                </label>
              </div>
            ) : (
              <div onClick={() => startEditing(task)}>
                <strong>{task.title}</strong> ({task.category})
                <br />
                {task.description}
                <br />
                {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                <br />
                {task.completed ? '✅ Completed' : ''}
              </div>
            )}
            <button onClick={() => deleteTask(task.id)} className="delete">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

