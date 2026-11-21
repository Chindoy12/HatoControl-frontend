import { useEffect, useState } from 'react'
import { enviar } from '../../servicios/ClienteApi'
import type { AnimalResponse } from '../../tipos/dto'

/** Animales de la finca para los selectores (peso, leche, parto y sanidad). */
export function useAnimales(): AnimalResponse[] {
  const [animales, setAnimales] = useState<AnimalResponse[]>([])
  useEffect(() => {
    enviar<AnimalResponse[]>({ metodo: 'GET', ruta: '/animales' }).then(setAnimales).catch(() => setAnimales([]))
  }, [])
  return animales
}
