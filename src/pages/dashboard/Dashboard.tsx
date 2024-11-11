import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import { FiTrash } from 'react-icons/fi'

import { deleteObject, ref } from 'firebase/storage'
import { Container } from '../../components/Container'
import { DashboardHeader } from '../../components/PanelHeader'
import { AuthContext } from '../../contexts/AuthContext'
import { db, storage } from '../../services/firebaseConnection'
import { CarProps } from '../Home'

export function Dashboard({}) {
  const [cars, setCars] = useState<CarProps[]>([])
  const { user } = useContext(AuthContext)

  useEffect(() => {
    function loadCars() {
      if (!user?.uid) {
        return
      }

      const carsRef = collection(db, 'cars')
      const queryRef = query(carsRef, where('uid', '==', user.uid))

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
        console.log(listCars)
      })
    }

    loadCars()
  }, [user])

  async function handleDeleteCar(car: CarProps) {
    const selectedCar = car

    const docRef = doc(db, 'cars', selectedCar.id)
    await deleteDoc(docRef)

    selectedCar.images.map(async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`
      const imageRef = ref(storage, imagePath)

      try {
        await deleteObject(imageRef)
      } catch (error) {
        console.log(error)
      }
    })

    setCars(cars.filter((car) => car.id !== selectedCar.id))
  }

  return (
    <Container>
      <DashboardHeader />

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <section className="w-full bg-white rounded-lg relative">
            <button
              className="absolute bg-white size-10 rounded-full flex items-center justify-center right-2 top-2 drop-shadow"
              onClick={() => {
                handleDeleteCar(car)
              }}
            >
              <FiTrash size={20} color="#000" />
            </button>
            <img src={car.images[0].url} alt="foto do carro" className="w-full rounded-t-lg mb-2 max-h-70" />
            <p className="font-bold mt-1 px-2 mb-2">{car.name}</p>

            <div className="flex flex-col px-2">
              <span className="text-zinc-700">
                {car.year} | {car.km}
              </span>
              <strong className="text-black font-bold mt-4">{car.price}</strong>
            </div>

            <div className="w-full h-px bg-slate-200 my-2"></div>

            <div className="px-2 pb-2">
              <span className="text-black">{car.city}</span>
            </div>
          </section>
        ))}
      </main>
    </Container>
  )
}
