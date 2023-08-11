const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')
const token = '6360097777:AAH4cTmFmYxl-h6To2KXJ8jH8hC-x7cnLGo'

const bot = new TelegramBot(token, { polling: true })

bot.onText(/\/start/, msg => {
	const chatId = msg.chat.id
	bot.sendMessage(
		'Привет, этот бот может показывать погоду для любого города. Для этого напиши название города'
	)
})

bot.on('message', async msg => {
	const chatId = msg.chat.id
	const userInput = msg.text

	try {
		const response = await axios.get(
			`https://api.openweathermap.org/data/2.5/weather?q=${userInput}&lang=ru&appid=68dad6d6ab6d64087dd084d5e57b69b0`
		)
		const data = response.data
		const weather = data.weather[0].description
		const temperature = data.main.temp - 273.15
		const city = data.name
		const humidity = data.main.humidity
		const pressure = data.main.pressure
		const windSpeed = data.wind.speed
		const message = `Погода в ${city} - ${weather} температура ${temperature.toFixed(
			2
		)}°C. Влажность - ${humidity}%, давление - ${pressure} Па, и скорость ветра - ${windSpeed}м/с.`

		bot.sendMessage(chatId, message)
	} catch (error) {
		bot.sendMessage(chatId, 'Иди глянь в окошко ;)')
	}
})
