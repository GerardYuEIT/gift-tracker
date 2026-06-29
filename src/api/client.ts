import type { Gift, NewGift, NewPerson, Person } from '../types'

export const BASE_URL = 'https://gift-tracker-api-production.up.railway.app/api'

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

function normalizePerson(person: Person): Person {
  return { ...person, gifts: person.gifts ?? [] }
}

export async function getPeople(): Promise<Person[]> {
  const res = await fetch(`${BASE_URL}/persons`)
  const people = await handle<Person[]>(res)
  return people.map(normalizePerson)
}

export async function getPerson(id: string): Promise<Person> {
  const res = await fetch(`${BASE_URL}/persons/${id}`)
  return normalizePerson(await handle<Person>(res))
}

export async function createPerson(data: NewPerson): Promise<Person> {
  const res = await fetch(`${BASE_URL}/persons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return normalizePerson(await handle<Person>(res))
}

export async function updatePerson(id: string, data: NewPerson): Promise<Person> {
  const res = await fetch(`${BASE_URL}/persons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return normalizePerson(await handle<Person>(res))
}

export async function deletePerson(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/persons/${id}`, { method: 'DELETE' })
  return handle<void>(res)
}

export async function createGift(personId: string, data: NewGift): Promise<Gift> {
  const res = await fetch(`${BASE_URL}/gifts/person/${personId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handle<Gift>(res)
}

export async function updateGift(_personId: string, giftId: string, data: NewGift): Promise<Gift> {
  const res = await fetch(`${BASE_URL}/gifts/${giftId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handle<Gift>(res)
}

export async function deleteGift(_personId: string, giftId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/gifts/${giftId}`, { method: 'DELETE' })
  return handle<void>(res)
}
