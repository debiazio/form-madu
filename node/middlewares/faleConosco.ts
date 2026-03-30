export async function faleConosco(ctx: any, next: () => Promise<any>) {
  try {
    let rawBody = ''

    await new Promise<void>((resolve, reject) => {
      ctx.req.on('data', (chunk: Buffer | string) => {
        rawBody += chunk.toString()
      })

      ctx.req.on('end', () => resolve())
      ctx.req.on('error', (error: Error) => reject(error))
    })

    const body = rawBody ? JSON.parse(rawBody) : {}

    const payload = {
      Nome: body.Nome ?? '',
      Email: body.Email ?? '',
      Telefone: body.Telefone ?? '',
      Assunto: body.Assunto ?? '',
      Mensagem: body.Mensagem ?? '',
    }

    await ctx.clients.masterdata.createDocument({
      dataEntity: 'PE',
      fields: payload,
    })

    ctx.status = 200
    ctx.body = {
      success: true,
      message: 'Mensagem enviada com sucesso',
    }

    await next()
  } catch (error) {
    console.error('Erro ao salvar no Master Data:', error)

    ctx.status = 500
    ctx.body = {
      success: false,
      message: 'Erro ao processar a requisição',
    }
  }
}
