import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Figuras, Marca } from '../piezas'

export function PaginaPublica({ children }: { children: ReactNode }) {
  return (
    <>
      <section className="banner" style={{ height: 180 }}>
        <Figuras alto={180} hoja />
        <div style={{ position: 'absolute', left: 'max(16px, calc((100% - 1200px) / 2))', top: 60, zIndex: 2 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Marca claro tam={30} />
          </Link>
        </div>
      </section>
      <main className="cuerpo" style={{ display: 'flex', justifyContent: 'center' }}>{children}</main>
    </>
  )
}
