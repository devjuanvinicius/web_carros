import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/Container'
import { db } from '../services/firebaseConnection'

export interface CarProps {
  id: string
  name: string
  model?: string
  year: string
  uid: string
  price: string | number
  city: string
  km: string
  description?: string
  created?: string
  owner?: string
  whatsapp?: string
  images: ImageCarProps[]
}

interface ImageCarProps {
  name: string
  uid: string
  url: string
}

export function Home({}) {
  const [cars, setCars] = useState<CarProps[]>([])
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [input, setInput] = useState<string>()

  useEffect(() => {
    loadCars()
  }, [])

  function loadCars() {
    const carsRef = collection(db, 'cars')
    const queryRef = query(carsRef, orderBy('createdAt', 'desc'))

    getDocs(queryRef).then((snapShot) => {
      let listCars = [] as CarProps[]

      snapShot.forEach((doc) => {
        listCars.push({
          id: doc.id,
          name: doc.data().name,
          year: doc.data().year,
          km: doc.data().km,
          city: doc.data().city,
          price: doc.data().price,
          images: doc.data().images,
          uid: doc.data().uid,
        })
      })

      setCars(listCars)
    })
  }

  function handeImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
  }

  async function handleSearchCar() {
    if (input === '') {
      loadCars()
      return
    }

    setCars([])
    setLoadImages([])

    const q = query(
      collection(db, 'cars'),
      where('name', '>=', input?.toUpperCase()),
      where('name', '<=', input?.toUpperCase() + '\uf8ff')
    )

    const querySnapshot = await getDocs(q)

    let listCars = [] as CarProps[]

    querySnapshot.forEach((doc) => {
      listCars.push({
        id: doc.id,
        name: doc.data().name,
        year: doc.data().year,
        km: doc.data().km,
        city: doc.data().city,
        price: doc.data().price,
        images: doc.data().images,
        uid: doc.data().uid,
      })
    })

    setCars(listCars)
  }

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <input
          type="text"
          placeholder="Digite o nome do carro..."
          className="w-full border-2 rounded-lg h-9 px-3 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg" onClick={handleSearchCar}>
          Buscar
        </button>
      </section>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">Carros novos e usados em todo o Brasil</h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Link to={`/car/${car.id}`} key={car.id}>
            <section className="w-full bg-white rounded-lg">
              <div
                className="w-full h-72 rounded-lg bg-slate-200"
                style={{ display: loadImages.includes(car.id) ? 'none' : 'block' }}
              ></div>
              <img
                className="w-full rounded-t-lg mb-2 max-h-72 hover:scale-105 transition-all"
                src={car.images[0].url}
                alt="Carro"
                onLoad={() => handeImageLoad(car.id)}
                style={{ display: loadImages.includes(car.id) ? 'block' : 'none' }}
              />

              <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>

              <div className="flex flex-col px-2">
                <span className="text-zinc-700 mb-6">
                  {car.year} | {car.km}
                </span>
                <strong className="text-black font-medium text-xl">
                  {parseInt(car.price.toString()).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
                </strong>
              </div>

              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-zinc-700">{car.city}</span>
              </div>
            </section>
          </Link>
        ))}
      </main>
    </Container>
  )
}
