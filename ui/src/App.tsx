import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Chore = {
  id: number
  title: string
  completed: boolean
}

function App() {
  const [chores, setChores] = useState<Chore[]>([])
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const apiFetch = useCallback((input: string, init?: RequestInit) => {
    return fetch(input, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }, [token])

  const loadChores = useCallback(async () => {
    try {
      setError('')
      const response = await apiFetch('/api/chores')
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
  }, [apiFetch])

  useEffect(() => {
    const existingToken = localStorage.getItem('choretrack.token')
    if (!existingToken) {
      setLoading(false)
      return
    }
    setToken(existingToken)
  }, [])

  useEffect(() => {
    if (!token) {
      return
    }
    setLoading(true)
    void loadChores()
  }, [token, loadChores])

  const handleCreateChore = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = newTitle.trim()
    if (!title) {
      return
    }

    try {
      setError('')
      const response = await apiFetch('/api/chores', {
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
      const response = await apiFetch(`/api/chores/${id}/toggle`, {
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

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setError('')
      setLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`)
      }

      const data = (await response.json()) as { token: string }
      localStorage.setItem('choretrack.token', data.token)
      setToken(data.token)
      setPassword('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('choretrack.token')
    setToken('')
    setChores([])
    setError('')
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>ChoreTrack</h1>
        <p>React UI connected to secured Spring Boot REST endpoints.</p>
      </header>

      <section className="card">
        {!token ? (
          <form onSubmit={handleLogin} className="chore-form auth-form">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              aria-label="Username"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              aria-label="Password"
              type="password"
            />
            <button type="submit">Login</button>
          </form>
        ) : (
          <button type="button" onClick={handleLogout} className="logout-button">
            Logout
          </button>
        )}

        <form onSubmit={handleCreateChore} className="chore-form">
          <input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Add a chore"
            aria-label="New chore title"
            disabled={!token}
          />
          <button type="submit" disabled={!token}>
            Add
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {!token ? (
          <p>Login to access chores.</p>
        ) : loading ? (
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
