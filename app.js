require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')
const TELEGRRAM_BOT_TOKEN = '6360097777:AAH4cTmFmYxl-h6To2KXJ8jH8hC-x7cnLGo'
const OPENWEATHERMAP_API_KEY = '9763217e6602f16a5c39c79d7aa2af4f'
const bot = new TelegramBot(TELEGRRAM_BOT_TOKEN, { polling: true })
const storage = {}

bot.onText(/\/start/, msg => {
	const chatId = msg.chat.id
	bot.sendMessage(
		chatId,
		'Привет, этот бот может показывать погоду для любого города.Для этого, используй параметры ниже:',
		{
			reply_markup: {
				inline_keyboard: [
					[{ text: 'Узнать погоду', callback_data: 'get_weather' }],
				],
			},
		}
	)
})

bot.on('callback_query', async callbackQuery => {
	const chatId = callbackQuery.message.chat.id
	const data = callbackQuery.data

	switch (data) {
		case 'get_weather':
			const userDataWeather = getUserData(chatId)
			userDataWeather.waitingForCity = true
			userDataWeather.waitingForWeather = true
			bot.sendMessage(
				chatId,
				'Пожалуйста, введите имя города или отправьте /stop чтобы остановить:'
			)
			break

		default:
			break
	}
})

function getUserData(chatId) {
	let userData = storage[chatId]
	if (!userData) {
		userData = {
			waitingForCity: false,
			waitingForWeather: false,
		}
		storage[chatId] = userData
	}
	return userData
}

bot.on('message', async msg => {
	const chatId = msg.chat.id
	const text = msg.text

	const userData = getUserData(chatId)
	if (userData && userData.waitingForCity) {
		const city = text
		let messageText = ''
		if (userData.waitingForWeather) {
			messageText = await getWeatherData(city)
		}
		bot.sendMessage(chatId, messageText)
		resetUserData(chatId)
	}
})

function resetUserData(chatId) {
	const userData = getUserData(chatId)
	userData.waitingForCity = false
	userData.waitingForWeather = false
}

async function getWeatherData(city) {
	const response = await axios.get(
		`http://api.openweathermap.org/data/2.5/weather?q=${city}&lang=ru&appid=${OPENWEATHERMAP_API_KEY}`
	)
	const weatherData = response.data
	const weatherDescription = weatherData.weather[0].description
	const temperature = Math.round(weatherData.main.temp - 273.15)
	const messageText = `Погода в городе ${city} это ${weatherDescription} с температурой ${temperature} °C.`
	return messageText
}
