import axios from 'axios'

const APIUrl = 'https://us-central1-remax-api.cloudfunctions.net'
const myToken = "Hvh8n23m53.n7hiu32S09gh6tUj.JJpyfq.HioJ19J3RGgHJSIOop4t4t"
export const getAPI = axios.create({
  baseURL: APIUrl,
  headers: {
    "Authorization": `Bearer ${myToken}`,
    'Content-Type': 'application/json',
  },
})

