/**
 * Modelleri tek noktadan export ediyoruz.
 * Bu sayede controller'larda:
 *   const { User, Trip } = require('../models');
 * gibi temiz bir import yazabiliyoruz.
 */
module.exports = {
  User: require('./User'),
  Device: require('./Device'),
  Trip: require('./Trip'),
  SensorData: require('./SensorData'),
  Alarm: require('./Alarm')
};
