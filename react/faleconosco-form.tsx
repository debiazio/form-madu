import React, { useState } from 'react'

import styles from './styles.css'

type FormState = {
  Assunto: string
  Mensagem: string
  Email: string
  Nome: string
  Telefone: string
}

type ErrorState = {
  Nome: string
  Email: string
  Telefone: string
  Assunto: string
  Mensagem: string
}

const initialForm: FormState = {
  Assunto: '',
  Mensagem: '',
  Email: '',
  Nome: '',
  Telefone: '',
}

const initialErrors: ErrorState = {
  Nome: '',
  Email: '',
  Telefone: '',
  Assunto: '',
  Mensagem: '',
}

const FaleConoscoForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<ErrorState>(initialErrors)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    let formatted = digits.replace(/^(\d{2})(\d)/g, '($1)$2')

    formatted = formatted.replace(/(\d{5})(\d)/, '$1-$2')

    return formatted
  }

  const validateField = (name: keyof FormState, value: string) => {
    const newErrors: ErrorState = { ...errors }

    switch (name) {
      case 'Nome':
        newErrors.Nome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value.trim())
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
        newErrors.Email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
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

      default:
        break
    }

    setErrors(newErrors)

    return newErrors
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let { name, value } = e.target

    if (name === 'Telefone') {
      value = maskPhone(value)
    }

    const fieldName = name as keyof FormState

    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }))

    validateField(fieldName, value)
  }

  const getValidatedErrors = (currentForm: FormState): ErrorState => {
    const nextErrors: ErrorState = { ...initialErrors }

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(currentForm.Nome.trim())) {
      nextErrors.Nome = 'O nome deve conter apenas letras'
    }

    const phoneDigits = currentForm.Telefone.replace(/\D/g, '')

    if (phoneDigits.length !== 11) {
      nextErrors.Telefone = 'O telefone deve ter 11 números'
    } else if (phoneDigits.substring(0, 2) === '00') {
      nextErrors.Telefone = 'DDD inválido'
    } else if (/^(\d)\1+$/.test(phoneDigits)) {
      nextErrors.Telefone = 'Telefone inválido'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentForm.Email.trim())) {
      nextErrors.Email = 'E-mail inválido'
    }

    if (currentForm.Assunto.trim() === '') {
      nextErrors.Assunto = 'O assunto é obrigatório'
    }

    if (currentForm.Mensagem.trim() === '') {
      nextErrors.Mensagem = 'A mensagem é obrigatória'
    }

    return nextErrors
  }

  const isFormValid = (nextErrors = errors, currentForm = form) => {
    const noErrors = Object.values(nextErrors).every((e) => e === '')
    const allFilled = Object.values(currentForm).every((v) => v.trim() !== '')

    return noErrors && allFilled
  }

  const validateForm = () => {
    const nextErrors = getValidatedErrors(form)

    setErrors(nextErrors)

    return isFormValid(nextErrors, form)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setSuccess(false)
    setError(false)

    try {
      const res = await fetch('/_v/fale-conosco', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        throw new Error(`Erro ao enviar formulário: ${res.status}`)
      }

      setSuccess(true)
      setForm(initialForm)
      setErrors(initialErrors)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
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
          onBlur={(e) => validateField('Nome', e.target.value)}
          className={styles.fcinput}
        />
        {errors.Nome && <p className={styles.fcerror}>{errors.Nome}</p>}

        <input
          type="email"
          name="Email"
          placeholder="Seu e-mail"
          value={form.Email}
          onChange={handleChange}
          onBlur={(e) => validateField('Email', e.target.value)}
          className={styles.fcinput}
        />
        {errors.Email && <p className={styles.fcerror}>{errors.Email}</p>}

        <input
          type="text"
          name="Telefone"
          placeholder="Seu telefone"
          value={form.Telefone}
          onChange={handleChange}
          onBlur={(e) => validateField('Telefone', e.target.value)}
          className={styles.fcinput}
        />
        {errors.Telefone && <p className={styles.fcerror}>{errors.Telefone}</p>}

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

        {success && (
          <p className={styles.fcsuccess}>Mensagem enviada com sucesso!</p>
        )}
        {error && <p className={styles.fcerror}>Ocorreu um erro ao enviar.</p>}
      </form>
    </div>
  )
}

export default FaleConoscoForm
