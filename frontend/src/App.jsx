import { useState } from "react";

function App() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [faveFood, setFaveFood] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      firstName,
      lastName,
      faveFood,
    };

    const res = await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    const msg = await res.text();
    console.log("Server response:", msg);

    alert("Saved!");

    setFirstName("");
    setLastName("");
    setFaveFood("");
  };

  return (
    <main className="app">
      <h1 className="app-title">DevOps Multi-Service Application</h1>

      <form className="app-form" onSubmit={handleSubmit}>
        <label htmlFor="firstname">First name:</label>
        <input
          name="firstname"
          type="text"
          className="app-input"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label htmlFor="lastname">Last name:</label>
        <input
          name="lastname"
          type="text"
          value={lastName}
          className="app-input"
          onChange={(e) => setLastName(e.target.value)}
        />

        <label htmlFor="food">Favorite food:</label>
        <input
          name="food"
          type="text"
          className="app-input"
          value={faveFood}
          onChange={(e) => setFaveFood(e.target.value)}
        />
        <button type="submit" className="app-button">
          Submit
        </button>
      </form>
    </main>
  );
}

export default App;
