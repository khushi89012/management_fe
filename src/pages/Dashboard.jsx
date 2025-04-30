import React, { useEffect, useState } from 'react';
import API from '../api/axios';

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', status: 'pending' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      alert('Error fetching tasks');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await API.put(`/tasks/${editingTaskId}`, form);
      } else {
        await API.post('/tasks', form);
      }
      setForm({ title: '', description: '', status: 'pending' });
      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      alert('Error saving task');
    }
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setEditingTaskId(task._id);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await API.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (err) {
        alert('Error deleting task');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const filteredTasks =
    filterStatus === 'all'
      ? tasks
      : tasks.filter((task) => task.status === filterStatus);

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Task Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>{editingTaskId ? 'Edit Task' : 'Create Task'}</h3>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <button type="submit">{editingTaskId ? 'Update Task' : 'Add Task'}</button>
        {editingTaskId && (
          <button type="button" onClick={() => {
            setEditingTaskId(null);
            setForm({ title: '', description: '', status: 'pending' });
          }}>
            Cancel Edit
          </button>
        )}
      </form>

      <h3>Filter Tasks</h3>
      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      <h3>My Tasks</h3>
      {filteredTasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <ul>
          {filteredTasks.map((task) => (
            <li key={task._id}>
              <strong>{task.title}</strong> - {task.description} ({task.status})
              <button onClick={() => handleEdit(task)}>Edit</button>
              <button onClick={() => handleDelete(task._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DashboardPage;
