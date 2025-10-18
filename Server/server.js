const express = require('express')
const app = express()
const morgan = require('morgan')
const { readdirSync } = require('fs')
const cors = require('cors')
const { log } = require('console')

app.use(morgan('dev'))
app.use(express.json({ limit: '20mb' }))
// app.use(cors())

app.use(cors({
    origin: ['https://kanbanboardv1.netlify.app','http://localhost:5173'],
    credentials: true
  }));
  
readdirSync('./routes')
    .map((c) => app.use('/api', require('./routes/' + c)))
    
// app.listen(5001,
//     () => console.log('Server running port 5001'))
1
const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.get('/', (req, res) => res.send('OK'));
app.get('/api/health', (req, res) => res.json({ ok: true }));