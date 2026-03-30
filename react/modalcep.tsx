import React, { useEffect, useState } from 'react'
import { Button } from 'vtex.styleguide'

const ToggleShippingContainer: React.FC = () => {
  const TARGET_SELECTOR = '.vtex-flex-layout-0-x-flexRow--linha-cep'

  const [modalOpen, setModalOpen] = useState(false)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const target = document.querySelector(TARGET_SELECTOR) as HTMLElement
    if (target && hidden) {
      target.style.display = 'none'
    }
  }, [hidden])

  const handleOpen = () => {
    const target = document.querySelector(TARGET_SELECTOR) as HTMLElement
    if (target) {
      target.style.display = 'flex'
    }

    setHidden(false)
    setModalOpen(true)
  }

  return (
    <div>
      {/* Wrapper com margin garantida */}
      <div style={{ margin: '10px' }}>
        {hidden && (
          <Button onClick={handleOpen}>
            Calcular Frete
          </Button>
        )}
      </div>

      {/* Modal custom */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '420px',
              background: '#fff',
              borderRadius: '16px',
              padding: '32px 24px',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                fontSize: '26px',
                cursor: 'pointer',
                color: '#777',
              }}
            >
              ×
            </button>

            <img
              src="https://stermax.com.br/images_idealine/image37.webp"
              alt="Aviso"
              style={{ width: '110px', marginBottom: '20px' }}
            />

            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: 14, color: '#333' }}>
              AVISO IMPORTANTE
            </h2>

            <p style={{ fontSize: 16, lineHeight: '24px', color: '#444' }}>
              Devido ao recesso de fim de ano,
              <br />
              nossos prazos de fabricação podem
              <br />
              sofrer alterações.
            </p>

            <p style={{ fontSize: 16, lineHeight: '24px', color: '#444', marginTop: 16 }}>
              O frete calculado continua correto,
              <br />
              mas o envio pode levar um pouco mais
              <br />
              que o habitual.
            </p>

            <p style={{ marginTop: 22, fontSize: 18, fontWeight: 700, color: '#333' }}>
              Boas Festas!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ToggleShippingContainer
