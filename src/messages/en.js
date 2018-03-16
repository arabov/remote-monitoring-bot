export default {
    "hello": "👋 Hello there! *RemoteMonitoringBot* is a bot 🤖, that can gather info on current state of your rigs. It gathers information about your miners (uptime, temperature, hash rate, power etc) through available API and sends you a message with the info to Telegram chat. To start, turn on miner's API, add 1 or couple URLs and press the ⛏ button.\n\n*RemoteMonitoringBot* supports following miners:\n - _Claymore's Dual Ethereum_\n - _CUDA EquiHash_\n - _CCminer_\n\n*Commands*:\n/add [[name]] [[URL]] - ➕ add miner\n/delete - ➖ delete miner\n/miners - 🎛 see added miners\n/languages - 💬 choose language\n/help - 🤔 help\n",
    "welcome_back": "👋 Welcome back! You can continue working with Bot, all previous settings have been saved.",
    "set_language": "💬 Choose language.",
    "language_set": "👍 🇺🇸 Language *set*.",
    "empty_miners": "🙁 Looks like you don't have any set up miners, to add *use command* /add.",
    "how_add": "🔗 To add enter *command* /add _name_ and _URL_ or miner's _IP-address_.\n\n*Example*:\n/add _4x1060_ _https://myminer.io_\n/add _6x570_ _tcp://192.168.0.1:3333_",
    "set_miner": "⛏ Great! Now choose miner.",
    "miner_added": "✅ <b>Miner added.</b>\n{miner}",
    "miner_deleted": "❎ <b>Miner deleted.</b>\n{miner}",
    "choose_miner": "❓Choose miner *to delete*.",
    "your_miners": "🎛 Your miners:\n",
    "info": "\n/add [[name]] [[URL]] - ➕ add miner\n/delete - ➖ delete miner",
    "request_error": "⛔️ *Request failure.*\nSomething is wrong with the {miner}.\nTry again later. Check settings if failure occurs again.",
    "server_error": "🆘 *Server error.*",
    "help": "🤔 *Help.*\n\nBasic commands:\n/add [[name]] [[URL]] - ➕ add miner\n/delete - ➖ delete miner\n/miners - 🎛 see added miners\n/languages - 💬 choose language\n\nFor more information and configuration instructions, see [remotemonitoringbot.info](http://remotemonitoringbot.info).",

    "ewbf_pool": "🖥 Pool: {server}\n⏱ Uptime: {uptime}\n\n",
    "ewbf_gpu": "\n{name}\n⚡ {speed} Sol/s 📊 {accepted} | {rejected}\n🌡 {temperature} C 🔌 {power} W\n\n",
    "ewbf_total": "<b>Shares:</b> {total_accepted}|{total_rejected}\n<b>Total speed:</b> {total_speed} Sol/s\n<b>Power:</b> {total_power} W\n<b>Efficiency:</b> {total_efficiency} Sol/W",

    "claymore_pool": "🖥 Pool: {server}\n⏱ Uptime: {uptime}\n\n",
    "claymore_gpu": "{name}\n⚡{speed} Mh/s 📊 {accepted} | {rejected}\n🌡 {temperature} C ♨️ {fan} %\n\n",
    "claymore_total": "<b>Shares:</b> {total_accepted}|{total_rejected}\n<b>Total speed:</b> {total_speed} Mh/s",

    "ccminer_pool": "🖥 Pool: {server}\n⏱ Uptime: {uptime}\n\n",
    "ccminer_gpu": "{name}\n⚡ {speed} Kh/s 📊 {accepted} | {rejected}\n🌡 {temperature} C ♨️ {fan} % 🔌 {power} W\n\n",
    "ccminer_total": "<b>Shares:</b> {total_accepted}|{total_rejected}\n<b>Total speed:</b> {total_speed} Kh/s\n<b>Power:</b> {total_power} W\n<b>Efficiency:</b> {total_efficiency} Kh/W"

}