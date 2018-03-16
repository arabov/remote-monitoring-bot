export default {
    "hello": "👋 Привет! *RemoteMonitoringBot* - это бот 🤖, позволяющий отслеживать текущее состояние ваших ригов. Бот берет текущее состояние (время работы, температура, хешрейт, мощность и т.п.) майнеров через доступное API и отправляет вам в чат. Для работы включите API майнера, добавьте один или несколько URL и нажмите на ⛏.\n\n*RemoteMonitoringBot* поддерживает майнеры:\n - _Claymore’s Dual Ethereum_\n - _CUDA EquiHash_\n - _CCminer_\n\n*Команды*:\n/add [[name]] [[URL]] - ➕ добавить майнер\n/delete - ➖ удалить майнер\n/miners - 🎛 посмотреть добавленные майнеры\n/languages - 💬 выбор языка\n/help - 🤔 помощь\n",
    "welcome_back": "👋 Добро пожаловать обратно! Вы можете продолжить работу с ботом, все предыдущие настройки были сохранены.",
    "set_language": "💬 Выберите язык.",
    "language_set": "👍 🇷🇺 Язык *выбран*.",
    "empty_miners": "🙁 Похоже у вас нет настроенных майнеров, для добавления *используйте команду* /add.",
    "how_add": "🔗 Для добавления введите *команду* /add _название_ и _URL_ или _IP-адрес_ майнера.\n\n*Пример*:\n/add _4x1060_ _https://myminer.io_\n/add _6x570_ _tcp://192.168.0.1:3333_",
    "set_miner": "⛏ Отлично! Теперь выберите майнер.",
    "miner_added": "✅ <b>Майнер добавлен.</b>\n{miner}",
    "miner_deleted": "❎ <b>Майнер удален.</b>\n{miner}",
    "choose_miner": "❓Выберите майнер для *удаления*.",
    "your_miners": "🎛 Ваши майнеры:\n",
    "info": "\n/add [[name]] [[URL]] - ➕ добавить майнер\n/delete - ➖ удалить майнер",
    "request_error": "⛔️ *Ошибка при запросе.*\nЧто-то не так с {miner}.\nПопробуйте выполнить запрос позже. Если ошибка повторяется, проверьте настройки.",
    "server_error": "🆘 *Ошибка сервера.*",
    "help": "🤔 *Помощь.*\n\nОсновные команды:\n/add [[name]] [[URL]] - ➕ добавить майнер\n/delete - ➖ удалить майнер\n/miners - 🎛 посмотреть добавленные майнеры\n/languages - 💬 выбор языка\n\nБолее подробную информацию и инструкцию по настройке вы найдете на [remotemonitoringbot.info](http://remotemonitoringbot.info/ru).",

    "ewbf_pool": "🖥 Пул: {server}\n⏱ Время работы: {uptime}\n\n",
    "ewbf_gpu": "\n{name}\n⚡ {speed} Sol/s 📊 {accepted} | {rejected}\n🌡 {temperature} C 🔌 {power} W\n\n",
    "ewbf_total": "<b>Шары:</b> {total_accepted} | {total_rejected}\n<b>Скорость:</b> {total_speed} Sol/s\n<b>Мощность:</b> {total_power} W\n<b>Эффективность:</b> {total_efficiency} Sol/W",

    "claymore_pool": "🖥 Пул: {server}\n⏱ Время работы: {uptime}\n\n",
    "claymore_gpu": "{name}\n⚡{speed} Mh/s 📊 {accepted} | {rejected}\n🌡 {temperature} C ♨️ {fan} %\n\n",
    "claymore_total": "<b>Шары:</b> {total_accepted} | {total_rejected}\n<b>Скорость:</b> {total_speed} Mh/s",

    "ccminer_pool": "🖥 Пул: {server}\n⏱ Время работы: {uptime}\n\n",
    "ccminer_gpu": "{name}\n⚡ {speed} Kh/s 📊 {accepted} | {rejected}\n🌡 {temperature} C ♨️ {fan} % 🔌 {power} W\n\n",
    "ccminer_total": "<b>Шары:</b> {total_accepted} | {total_rejected}\n<b>Скорость:</b> {total_speed} Kh/s\n<b>Мощность:</b> {total_power} W\n<b>Эффективность:</b> {total_efficiency} Kh/W"





}