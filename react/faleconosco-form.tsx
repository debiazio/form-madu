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
  const [errorMessage, setErrorMessage] = useState('')

  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)

    if (!digits) return ''

    let formatted = digits.replace(/^(\d{2})(\d)/, '($1) $2')
    formatted = formatted.replace(/(\d{5})(\d)/, '$1-$2')

    return formatted
  }

  const validateSingleField = (
    name: keyof FormState,
    value: string
  ): string => {
    switch (name) {
      case 'Nome':
        if (!value.trim()) return 'O nome é obrigatório'
        return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value.trim())
          ? ''
          : 'O nome deve conter apenas letras'

      case 'Telefone': {
        const digits = value.replace(/\D/g, '')

        if (!digits) return 'O telefone é obrigatório'
        if (digits.length !== 11) return 'O telefone deve ter 11 números'
        if (digits.substring(0, 2) === '00') return 'DDD inválido'
        if (/^(\d)\1+$/.test(digits)) return 'Telefone inválido'
        return ''
      }

      case 'Email':
        if (!value.trim()) return 'O e-mail é obrigatório'
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? ''
          : 'E-mail inválido'

      case 'Assunto':
        return value.trim() ? '' : 'O assunto é obrigatório'

      case 'Mensagem':
        return value.trim() ? '' : 'A mensagem é obrigatória'

      default:
        return ''
    }
  }

  const validateAll = (data: FormState): ErrorState => {
    return {
      Nome: validateSingleField('Nome', data.Nome),
      Email: validateSingleField('Email', data.Email),
      Telefone: validateSingleField('Telefone', data.Telefone),
      Assunto: validateSingleField('Assunto', data.Assunto),
      Mensagem: validateSingleField('Mensagem', data.Mensagem),
    }
  }

  const isFormValid = (nextErrors: ErrorState, nextForm: FormState) => {
    const noErrors = Object.values(nextErrors).every((item) => item === '')
    const allFilled = Object.values(nextForm).every(
      (value) => value.trim() !== ''
    )

    return noErrors && allFilled
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target
    let { value } = e.target

    if (name === 'Telefone') {
      value = maskPhone(value)
    }

    const nextForm = {
      ...form,
      [name]: value,
    } as FormState

    const nextErrors = {
      ...errors,
      [name]: validateSingleField(name as keyof FormState, value),
    } as ErrorState

    setForm(nextForm)
    setErrors(nextErrors)
    setSuccess(false)
    setError(false)
    setErrorMessage('')
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setErrors((prev) => ({
      ...prev,
      [name]: validateSingleField(name as keyof FormState, value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nextErrors = validateAll(form)
    setErrors(nextErrors)

    if (!isFormValid(nextErrors, form)) {
      return
    }

    setLoading(true)
    setSuccess(false)
    setError(false)
    setErrorMessage('')

    try {
      // NÃO use este endpoint em produção no storefront público.
      // Mantenho aqui só para debug local.
      const res = await fetch('/api/dataentities/PE/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vtex.ds.v10+json',
        },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSuccess(true)
        setForm(initialForm)
        setErrors(initialErrors)
      } else {
        const text = await res.text().catch(() => '')
        setError(true)
        setErrorMessage(`Falha ao enviar. Status: ${res.status} ${text}`)
      }
    } catch (err) {
      console.error(err)
      setError(true)
      setErrorMessage('Erro de rede ao enviar o formulário.')
    } finally {
      setLoading(false)
    }
  }

  const currentErrors = validateAll(form)
  const submitDisabled = loading || !isFormValid(currentErrors, form)

  return (
    <div className={styles.fccontainer}>
      <form onSubmit={handleSubmit} className={styles.fcform}>
        <input
          type="text"
          name="Nome"
          placeholder="Seu nome completo"
          value={form.Nome}
          onChange={handleChange}
          onBlur={handleBlur}
          className={styles.fcinput}
        />
        {errors.Nome && <p className={styles.fcerror}>{errors.Nome}</p>}

        <input
          type="email"
          name="Email"
          placeholder="Seu e-mail"
          value={form.Email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={styles.fcinput}
        />
        {errors.Email && <p className={styles.fcerror}>{errors.Email}</p>}

        <input
          type="text"
          name="Telefone"
          placeholder="Seu telefone"
          value={form.Telefone}
          onChange={handleChange}
          onBlur={handleBlur}
          className={styles.fcinput}
        />
        {errors.Telefone && (
          <p className={styles.fcerror}>{errors.Telefone}</p>
        )}

        <input
          type="text"
          name="Assunto"
          placeholder="Assunto"
          value={form.Assunto}
          onChange={handleChange}
          onBlur={handleBlur}
          className={styles.fcinput}
        />
        {errors.Assunto && <p className={styles.fcerror}>{errors.Assunto}</p>}

        <textarea
          name="Mensagem"
          placeholder="Mensagem"
          value={form.Mensagem}
          onChange={handleChange}
          onBlur={handleBlur}
          className={styles.fctextarea}
        />
        {errors.Mensagem && (
          <p className={styles.fcerror}>{errors.Mensagem}</p>
        )}

        <button
          type="submit"
          disabled={submitDisabled}
          className={styles.fcbutton}
        >
          {loading ? 'Enviando..' : 'Enviar'}
        </button>

        {success && (
          <p className={styles.fcsuccess}>Mensagem enviada com sucesso!</p>
        )}

        {error && (
          <p className={styles.fcerror}>
            {errorMessage || 'Ocorreu um erro ao enviar.'}
          </p>
        )}
      </form>
    </div>
  )
}

export default FaleConoscoForm
