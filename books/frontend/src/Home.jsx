export default function Home({ user, setUser }) {
  const logout = async () => {
    await fetch('http://54.190.139.122:3001/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  return (
    <div>
      <h2>Welcome, {user.email}</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

