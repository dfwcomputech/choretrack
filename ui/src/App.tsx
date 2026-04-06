import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Chore = {
  id: number
  title: string
  completed: boolean
}

function App() {
  const [chores, setChores] = useState<Chore[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadChores = async () => {
    try {
      setError('')
      const response = await fetch('/api/chores')
      if (!response.ok) {
        throw new Error(`Failed to load chores: ${response.status}`)
      }
      const data = (await response.json()) as Chore[]
      setChores(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadChores()
  }, [])

  const handleCreateChore = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = newTitle.trim()
    if (!title) {
      return
    }

    try {
      setError('')
      const response = await fetch('/api/chores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create chore: ${response.status}`)
      }

      const created = (await response.json()) as Chore
      setChores((current) => [...current, created])
      setNewTitle('')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleToggle = async (id: number) => {
    try {
      setError('')
      const response = await fetch(`/api/chores/${id}/toggle`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error(`Failed to update chore: ${response.status}`)
      }

      const updated = (await response.json()) as Chore
      setChores((current) => current.map((chore) => (chore.id === id ? updated : chore)))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>ChoreTrack</h1>
        <p>React UI connected to Spring Boot REST endpoints.</p>
      </header>

      <section className="card">
        <form onSubmit={handleCreateChore} className="chore-form">
          <input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Add a chore"
            aria-label="New chore title"
          />
          <button type="submit">Add</button>
        </form>

        {error && <p className="error">{error}</p>}
        {loading ? (
          <p>Loading chores...</p>
        ) : (
          <ul className="chore-list">
            {chores.map((chore) => (
              <li key={chore.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={chore.completed}
                    onChange={() => void handleToggle(chore.id)}
                  />
                  <span className={chore.completed ? 'done' : ''}>{chore.title}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
