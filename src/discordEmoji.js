// https://undercards.net/images/emotes/NAME.EXT
const stats = require('./stats');

const emoji = {};
const popular = stats.counters('emoji');

function add({ key, id, name, animated }) {
  if (!id) return;
  emoji[key] = `<${animated?'a':''}:${name || key}:${id}>`;
  popular.get(key); // Add entry to popularity list
}

function png(key, id, name) {
  add({ key, id, name });
}

function gif(key, id, name) {
  add({ key, id, name, animated: true });
}

png('Asriel_Cry', '704053799513489439');
png('T_Pose', '704363739243217036');
png('Mocking_Frisk', '704652512673792006');
png('Oh_Yes', '704662150458638376');
png('Flowey_What', '704660534049636432');
png('Winking_Papyrus', '704660451509665832');
png('Undyne_LUL', '704660777075736657');
png('This_is_fine', '704662271648989314');
png('Chara_Huh', '705361092100227124');
png('Smirkriel', '704662232138645506');
png('Omega_Stare', '704661071599894569');
png('Sleeping_Frisk', '710869556410974290', 'FriskSleeping');
png('Frisk_Meh', '');
png('Processing_Flowey', ''),
png('Chara_Stop', '');
png('Shy_Chara', '');
png('Angry_Mad_Dummy', '');
png('Asriel_Yes', '');
png('Chara_No', '');
png('Happy_Greater_Dog', '');
png('Surprised_Alphys', '');
png('Sansger', '');
png('Mettatowo', '');
png('Ping_Pon', '');
png('Susie_Creepy', '');
png('Diabolic_Kris', '');
png('Snail_Fury', '');
png('Disturbed_Burger_Pants', '');

// Gifs
gif('Bad_Time', '704662119211204648');
gif('Frisk_Hello', '704660898819604491');
gif('Frisk_Tears', '705368192750452738');
gif('Intensive_Asriel', '705368116997390346');
gif('Frisk_Clap', '704660866158690375');
gif('Angry_Paps', '704661923828072488');
gif('Wheevil', '704364078570799134');
gif('Apoca_What', '704662014395416576');
gif('zzz', '704688349587439627');
gif('Thinking_Asriel', '704661971693469716');
gif('Confused_Lost_Sans', '704661648379478066');

module.exports = emoji;
