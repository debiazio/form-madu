import React, { useState } from 'react'
import styles from './styles.css'

const TrabalheConoscoForm: React.FC = () => {
  const [form, setForm] = useState({
    Nome: '',
    Email: '',
    Telefone: '',
    AreaInteresse: '',
    Cidade: '',
    Estado: '',
    MensagemTexto: '',
    ConsentimentoLGPD: false,
  })

  const [errors, setErrors] = useState({
    Nome: '',
    Email: '',
    Telefone: '',
    AreaInteresse: '',
    Cidade: '',
    Estado: '',
    MensagemTexto: '',
    ConsentimentoLGPD: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    let formatted = digits.replace(/^(\d{2})(\d)/g, '($1)$2')
    formatted = formatted.replace(/(\d{5})(\d)/, '$1-$2')
    return formatted
  }

  // Formata em PT-BR (São Paulo) e 24h
  const formatDateTimeBR = (date: Date) => {
    const parts = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date)

    const get = (type: string) => parts.find((p) => p.type === type)?.value || ''
    return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}`
  }

  const validateField = (name: string, value: any) => {
    const newErrors: any = { ...errors }

    switch (name) {
      case 'Nome':
        newErrors.Nome =
          /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(String(value)) &&
          String(value).trim().length >= 3
            ? ''
            : 'Informe seu nome completo'
        break

      case 'Telefone': {
        const digits = String(value).replace(/\D/g, '')
        if (digits.length !== 11) newErrors.Telefone = 'O telefone deve ter 11 números'
        else if (digits.substring(0, 2) === '00') newErrors.Telefone = 'DDD inválido'
        else if (/^(\d)\1+$/.test(digits)) newErrors.Telefone = 'Telefone inválido'
        else newErrors.Telefone = ''
        break
      }

      case 'Email':
        newErrors.Email =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? '' : 'E-mail inválido'
        break

      case 'AreaInteresse':
        newErrors.AreaInteresse = String(value).trim() === '' ? 'Selecione uma área' : ''
        break

      case 'Cidade':
        newErrors.Cidade = String(value).trim() === '' ? 'Cidade é obrigatória' : ''
        break

      case 'Estado': {
        const uf = String(value).trim().toUpperCase()
        newErrors.Estado = /^[A-Z]{2}$/.test(uf) ? '' : 'Informe o estado com 2 letras (UF)'
        break
      }

      case 'MensagemTexto':
        newErrors.MensagemTexto =
          String(value).trim().length >= 10
            ? ''
            : 'Descreva um pouco sobre você (mín. 10 caracteres)'
        break

      case 'ConsentimentoLGPD':
        newErrors.ConsentimentoLGPD = value ? '' : 'Você precisa aceitar o consentimento'
        break
    }

    setErrors(newErrors)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement
    const { name } = target
    let value: any = (target as any).value

    if (name === 'Telefone') value = maskPhone(value)
    if (target.type === 'checkbox') value = target.checked
    if (name === 'Estado') value = String(value).toUpperCase()

    setForm({ ...form, [name]: value })
    validateField(name, value)
  }

  const isFormValid = () => {
    const noErrors = Object.values(errors).every((e) => e === '')
    const requiredFilled =
      form.Nome.trim() !== '' &&
      form.Email.trim() !== '' &&
      form.Telefone.trim() !== '' &&
      form.AreaInteresse.trim() !== '' &&
      form.Cidade.trim() !== '' &&
      form.Estado.trim() !== '' &&
      form.MensagemTexto.trim() !== '' &&
      form.ConsentimentoLGPD === true

    return noErrors && requiredFilled
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    Object.keys(form).forEach((key) => validateField(key, (form as any)[key]))
    if (!isFormValid()) return

    setLoading(true)
    setSuccess(false)
    setError(false)

    try {
      const now = new Date()

      const payload = {
        ...form,
        DataHora: now.toISOString(),        // mantém ISO (útil pra filtros/integrações)
        DataHoraBR: formatDateTimeBR(now),  // texto final (sem fuso/AMPM)
      }

      const res = await fetch('/api/dataentities/TC/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vtex.ds.v10+json',
        },
        body: JSON.stringify(payload),
      })

      const contentType = res.headers.get('content-type') || ''
      let body: any = null
      try {
        body = contentType.includes('application/json') ? await res.json() : await res.text()
      } catch {
        body = null
      }

      if (!res.ok) {
        console.error('Master Data error:', { status: res.status, body, payloadSent: payload })
        setError(true)
      } else {
        console.log('Master Data success:', body)
        setSuccess(true)
        setForm({
          Nome: '',
          Email: '',
          Telefone: '',
          AreaInteresse: '',
          Cidade: '',
          Estado: '',
          MensagemTexto: '',
          ConsentimentoLGPD: false,
        })
        setErrors({
          Nome: '',
          Email: '',
          Telefone: '',
          AreaInteresse: '',
          Cidade: '',
          Estado: '',
          MensagemTexto: '',
          ConsentimentoLGPD: '',
        })
      }
    } catch (err) {
      console.error('Request failed:', err)
      setError(true)
    }

    setLoading(false)
  }

  return (
    <div className={styles.fccontainer}>
      <form onSubmit={handleSubmit} className={styles.fcform}>
        <input
          type="text"
          name="Nome"
          placeholder="Seu nome completo"
          value={form.Nome}
          onChange={handleChange}
          onBlur={(e) => validateField('Nome', (e.target as HTMLInputElement).value)}
          className={styles.fcinput}
        />
        {errors.Nome && <p className={styles.fcerror}>{errors.Nome}</p>}

        <input
          type="email"
          name="Email"
          placeholder="Seu e-mail"
          value={form.Email}
          onChange={handleChange}
          onBlur={(e) => validateField('Email', (e.target as HTMLInputElement).value)}
          className={styles.fcinput}
        />
        {errors.Email && <p className={styles.fcerror}>{errors.Email}</p>}

        <input
          type="text"
          name="Telefone"
          placeholder="Seu telefone"
          value={form.Telefone}
          onChange={handleChange}
          onBlur={(e) => validateField('Telefone', (e.target as HTMLInputElement).value)}
          className={styles.fcinput}
        />
        {errors.Telefone && <p className={styles.fcerror}>{errors.Telefone}</p>}

        <select
          name="AreaInteresse"
          value={form.AreaInteresse}
          onChange={handleChange}
          onBlur={(e) => validateField('AreaInteresse', (e.target as HTMLSelectElement).value)}
          className={styles.fcinput}
        >
          <option value="">Selecione a área</option>
          <option value="Comercial">Comercial</option>
          <option value="Marketing">Marketing</option>
          <option value="TI">TI</option>
          <option value="Logística">Logística</option>
          <option value="Financeiro">Financeiro</option>
          <option value="Outros">Outros</option>
        </select>
        {errors.AreaInteresse && <p className={styles.fcerror}>{errors.AreaInteresse}</p>}

        <input
          type="text"
          name="Cidade"
          placeholder="Cidade"
          value={form.Cidade}
          onChange={handleChange}
          onBlur={(e) => validateField('Cidade', (e.target as HTMLInputElement).value)}
          className={styles.fcinput}
        />
        {errors.Cidade && <p className={styles.fcerror}>{errors.Cidade}</p>}

        <input
          type="text"
          name="Estado"
          placeholder="Estado (UF)"
          value={form.Estado}
          onChange={handleChange}
          onBlur={(e) => validateField('Estado', (e.target as HTMLInputElement).value)}
          className={styles.fcinput}
        />
        {errors.Estado && <p className={styles.fcerror}>{errors.Estado}</p>}

        <textarea
          name="MensagemTexto"
          placeholder="Fale um pouco sobre você"
          value={form.MensagemTexto}
          onChange={handleChange}
          onBlur={(e) =>
            validateField('MensagemTexto', (e.target as HTMLTextAreaElement).value)
          }
          className={styles.fctextarea}
        />
        {errors.MensagemTexto && <p className={styles.fcerror}>{errors.MensagemTexto}</p>}

        <label className={styles.fccheckbox}>
          <input
            type="checkbox"
            name="ConsentimentoLGPD"
            checked={form.ConsentimentoLGPD}
            onChange={handleChange}
            onBlur={(e) =>
              validateField('ConsentimentoLGPD', (e.target as HTMLInputElement).checked)
            }
          />
          Autorizo o uso dos meus dados para fins de recrutamento e seleção.
        </label>
        {errors.ConsentimentoLGPD && (
          <p className={styles.fcerror}>{errors.ConsentimentoLGPD}</p>
        )}

        <button
          type="submit"
          disabled={!isFormValid() || loading}
          className={styles.fcbutton}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>

        {success && <p className={styles.fcsuccess}>Candidatura enviada com sucesso!</p>}
        {error && <p className={styles.fcerror}>Ocorreu um erro ao enviar.</p>}
      </form>
    </div>
  )
}

export default TrabalheConoscoForm
