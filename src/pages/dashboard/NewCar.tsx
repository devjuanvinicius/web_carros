import { zodResolver } from '@hookform/resolvers/zod'
import { addDoc, collection } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { ChangeEvent, useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FiTrash, FiUpload } from 'react-icons/fi'
import { v4 as uuidV4 } from 'uuid'
import { z } from 'zod'

import { Container } from '../../components/Container'
import { DashboardHeader } from '../../components/PanelHeader'
import { AuthContext } from '../../contexts/AuthContext'
import { db, storage } from '../../services/firebaseConnection'
import { Input } from '../Input'

const schema = z.object({
  name: z.string().min(1, 'O campo nome é obrigatório'),
  model: z.string().min(1, 'O campo modelo é obrigatório'),
  year: z.string().min(1, 'O ano do carro é obrigatório'),
  km: z.string().min(1, 'O KM do carro é obrigatório'),
  price: z.string().min(1, 'O preço do carro é obrigatório'),
  city: z.string().min(1, 'O campo cidade é obrigatório'),
  whatsapp: z
    .string()
    .min(1, 'O telefone é obrigatório')
    .refine((value) => /^(\d{11,12})$/.test(value), {
      message: 'Numero de telefone invalido',
    }),
  description: z.string().min(1, 'A descrição é obrigatória'),
})

type FormData = z.infer<typeof schema>

interface ImageItemProps {
  uid: string
  name: string
  previewUrl: string
  url: string
}

export function NewCar() {
  const { user } = useContext(AuthContext)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })
  const [carImages, setCarImages] = useState<ImageItemProps[]>([])

  function onSubmit(data: FormData) {
    if (carImages.length === 0) {
      toast.error('Envie pelo menos 1 imagem do carro!')
      return
    }

    const carListImages = carImages.map((car) => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url,
      }
    })

    addDoc(collection(db, 'cars'), {
      name: data.name.toUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description,
      createdAt: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages,
    })
      .then(() => {
        reset()
        setCarImages([])
        toast.success('Veiculo cadastrado com sucesso!')
      })
      .catch((error) => {
        console.log(error)
        toast.error('Erro ao cadastrar o veiculo!')
      })
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0]

      if (image.type === 'image/jpeg' || image.type === 'image/png') {
        handleUpload(image)
      } else {
        alert('Envie uma imagem JPEG ou PNG!')
        return
      }
    }
  }

  async function handleUpload(image: File) {
    if (!user?.uid) {
      return
    }

    const currentUid = user.uid
    const uidImage = uuidV4()

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

    uploadBytes(uploadRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          name: uidImage,
          uid: currentUid,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl,
        }

        setCarImages((images) => [...images, imageItem])
      })
    })
  }

  async function handleDeleteImage(item: ImageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`

    const imageRef = ref(storage, imagePath)

    try {
      await deleteObject(imageRef)
      setCarImages(carImages.filter((car) => car.url !== item.url))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer w-full h-full">
            <input
              type="file"
              accept="image/*"
              className="opacity-0 cursor-pointer w-full h-full"
              onChange={handleFile}
            />
          </div>
        </button>

        {carImages.map((item) => (
          <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
            <button className="absolute" onClick={() => handleDeleteImage(item)}>
              <FiTrash size={28} color="#FFf" />
            </button>
            <img src={item.previewUrl} className="rounded-lg w-full h-32 object-cover" alt="foto do carro" />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col md:flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome do carro</p>
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Ex: Onix 1.0..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do carro</p>
            <Input
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
              placeholder="Ex: 1.0 Flex Plus Manual..."
            />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano do carro</p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Ex: 2014/2015"
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">Km do carro</p>
              <Input type="text" register={register} name="km" error={errors.km?.message} placeholder="Ex: 23.000km" />
            </div>
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone/WhatsApp para contato</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: 41988915838"
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Curitiba/PR"
              />
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Preço</p>
            <Input
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
              placeholder="Ex: R$35.000"
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              {...register('description')}
              name="description"
              id="description"
              className="border-2 w-full rounded-md h-24 px-2 pt-1"
              placeholder="Informa a descrição completa sobre o carro..."
            />
            {errors.description && <p className="mb-1 text-red-500">{errors.description.message}</p>}
          </div>

          <button type="submit" className="w-full h-10 rounded-md bg-zinc-900 text-white font-medium">
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  )
}
