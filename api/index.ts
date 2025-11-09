import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { GoogleGenAI } from '@google/genai'

const app = express()
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

app.use(bodyParser.json())
app.use(
  cors({
    origin: ['https://spoticeipt.vercel.app', 'http://localhost:3000'],
  })
)
app.get('/music-taste', async (req, res) => {
  const { tracks, type = 'insult' } = req.query
  if (!tracks) {
    res.status(400).json({ message: 'you should add "tracks" query' })
    return
  }
  if (type && type !== 'compliment' && type !== 'insult') {
    res.status(400).json({ message: 'you can either compliment or insult' })
    return
  }

  try {
    const parsedTracks = typeof tracks === 'string' ? [tracks] : (tracks as string[])
    const asWhat = `as ${type === 'compliment' ? 'good' : 'bad'} as possible`

    const contents = `${type} ${asWhat} the music taste of someone whose top tracks is as follows:\n ${parsedTracks.join(
      '\n'
    )}\n make it as brief as no more than 120 words ${
      type === 'insult' ? 'and enough for other people to laugh about it' : ''
    }. at the end, give one word to describe it ${asWhat} with this format 'Your taste is absolutely {one_word_description}'`
    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents })

    res.status(200).json({ taste: result.text || '' })
  } catch (err) {
    let parsed = null
    if (err instanceof Error) {
      try {
        parsed = JSON.parse(err.message)
      } catch {}
    }

    if (parsed?.error) {
      const { code, message, status, details } = parsed.error
      res.status(code || 500).json({
        message: message || 'Unknown API error',
        status,
        details,
      })
      return
    }

    res.status(500).json({ message: err.message || 'Internal server error' })
  }
})

module.exports = app
