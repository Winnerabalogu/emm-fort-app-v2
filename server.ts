import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true)
      handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request:', err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err?: Error) => {
    if (err) throw err
    console.log(
      `🚀 Server running at http://localhost:${port} in ${dev ? 'development' : 'production'} mode`
    )
  })
})
