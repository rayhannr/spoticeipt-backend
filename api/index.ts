import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { GoogleGenerativeAI } from '@google/generative-ai'

const app = express()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

app.use(bodyParser.json())
app.use(
  cors({
    origin: ['https://spoticeipt.vercel.app', 'http://localhost:3000'],
  })
)
app.get('/music-taste', async (req, res) => {
  const { tracks } = req.query
  if (!tracks) {
    res.status(500).json({ message: 'you should add "tracks" query' })
  }
  try {
    const parsedTracks = typeof tracks === 'string' ? [tracks] : (tracks as string[])
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `banter the music taste of someone whose top tracks is as follows:\n ${parsedTracks.join('\n')}`
    const result = await model.generateContent(prompt)

    res.status(200).json({ taste: result.response.text() || '' })
  } catch ({ status, error }) {
    res.status(status || 500).json({ error })
  }
})

module.exports = app
