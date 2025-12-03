import React, { useState } from 'react'
import styles from './styles.css'

const FaleConoscoForm: React.FC = () => {
  const [form, setForm] = useState({
    Assunto: '',
    Mensagem: '',
    Email: '',
    Nome: '',
    Telefone: ''
  })

  const [errors, setErrors] = useState({
    Nome: '',
    Email: '',
    Telefone: '',
    Assunto: '',
    Mensagem: ''
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  // Máscara (XX)9XXXX-XXXX
  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    let formatted = digits.replace(/^(\d{2})(\d)/g, '($1)$2')
    formatted = formatted.replace(/(\d{5})(\d)/, '$1-$2')
    return formatted
  }

  const validateField = (name: string, value: string) => {
    const newErrors: any = { ...errors }

    switch (name) {
      case 'Nome':
        newErrors.Nome =
          /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)
            ? ''
            : 'O nome deve conter apenas letras'
        break

      case 'Telefone': {
        const digits = value.replace(/\D/g, '')

        if (digits.length !== 11) {
          newErrors.Telefone = 'O telefone deve ter 11 números'
        } else if (digits.substring(0, 2) === '00') {
          newErrors.Telefone = 'DDD inválido'
        } else if (/^(\d)\1+$/.test(digits)) {
          newErrors.Telefone = 'Telefone inválido'
        } else {
          newErrors.Telefone = ''
        }
        break
      }

      case 'Email':
        newErrors.Email =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? ''
            : 'E-mail inválido'
        break

      case 'Assunto':
        newErrors.Assunto = value.trim() === '' ? 'O assunto é obrigatório' : ''
        break

      case 'Mensagem':
        newErrors.Mensagem =
          value.trim() === '' ? 'A mensagem é obrigatória' : ''
        break
    }

    setErrors(newErrors)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let { name, value } = e.target

    if (name === 'Telefone') {
      value = maskPhone(value)
    }

    setForm({ ...form, [name]: value })
    validateField(name, value)
  }

  const isFormValid = () => {
    const noErrors = Object.values(errors).every((e) => e === '')
    const allFilled = Object.values(form).every((v) => v.trim() !== '')
    return noErrors && allFilled
  }

  const validateForm = () => {
    Object.keys(form).forEach((key) =>
      validateField(key, (form as any)[key])
    )
    return isFormValid()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setSuccess(false)
    setError(false)

    try {
      const res = await fetch('/api/dataentities/PE/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vtex.ds.v10+json'
        },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        setSuccess(true)
        setForm({
          Assunto: '',
          Mensagem: '',
          Email: '',
          Nome: '',
          Telefone: ''
        })
      } else {
        setError(true)
      }
    } catch (err) {
      console.error(err)
      setError(true)
    }

    setLoading(false)
  }

  return (
    <div className={styles.fccontainer}>
      <h2 className={styles.fctitle}>Fale Conosco</h2>

      <form onSubmit={handleSubmit} className={styles.fcform}>

        <input
          type="text"
          name="Nome"
          placeholder="Nome"
          value={form.Nome}
          onChange={handleChange}
          onBlur={(e) => validateField('Nome', e.target.value)}
          className={styles.fcinput}
        />
        {errors.Nome && <p className={styles.fcerror}>{errors.Nome}</p>}

        <input
          type="text"
          name="Telefone"
          placeholder="Telefone"
          value={form.Telefone}
          onChange={handleChange}
          onBlur={(e) => validateField('Telefone', e.target.value)}
          className={styles.fcinput}
        />
        {errors.Telefone && <p className={styles.fcerror}>{errors.Telefone}</p>}

        <input
          type="email"
          name="Email"
          placeholder="E-mail"
          value={form.Email}
          onChange={handleChange}
          onBlur={(e) => validateField('Email', e.target.value)}
          className={styles.fcinput}
        />
        {errors.Email && <p className={styles.fcerror}>{errors.Email}</p>}

        <input
          type="text"
          name="Assunto"
          placeholder="Assunto"
          value={form.Assunto}
          onChange={handleChange}
          onBlur={(e) => validateField('Assunto', e.target.value)}
          className={styles.fcinput}
        />
        {errors.Assunto && <p className={styles.fcerror}>{errors.Assunto}</p>}

        <textarea
          name="Mensagem"
          placeholder="Mensagem"
          value={form.Mensagem}
          onChange={handleChange}
          onBlur={(e) => validateField('Mensagem', e.target.value)}
          className={styles.fctextarea}
        />
        {errors.Mensagem && <p className={styles.fcerror}>{errors.Mensagem}</p>}

        <button
          type="submit"
          disabled={!isFormValid() || loading}
          className={styles.fcbutton}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>

        {success && <p className={styles.fcsuccess}>Mensagem enviada com sucesso!</p>}
        {error && <p className={styles.fcerror}>Ocorreu um erro ao enviar.</p>}
      </form>
    </div>
  )
}

export default FaleConoscoForm
