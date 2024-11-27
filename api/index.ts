import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import OpenAI from 'openai'

const app = express()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
    const content = `banter the music taste of someone whose top tracks is as follows:\n ${parsedTracks.join('\n')}`
    const result = await openai.chat.completions.create({
      messages: [{ role: 'user', content }],
      model: 'gpt-4o-mini',
      max_completion_tokens: 50,
      temperature: 0.7,
    })

    res.status(200).json({ taste: result.choices[0].message.content || '' })
  } catch (error) {
    res.status(500).json({ error })
  }
})

module.exports = app
