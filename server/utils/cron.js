import cron from 'node-cron';
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import sendEmail from './email.js';
import logger from './logger.js';
import moment from 'moment';

export const initCronJobs = () => {
  // Run everyday at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running Smart Follow-up Reminder Cron Job');
    
    try {
      const tomorrowStr = moment().add(1, 'days').format('YYYY-MM-DD');
      const tomorrowEnd = moment().add(1, 'days').endOf('day').toDate();
      const tomorrowStart = moment().add(1, 'days').startOf('day').toDate();

      // Find prescriptions with followUpDate set to tomorrow
      const prescriptions = await Prescription.find({
        followUpDate: { $gte: tomorrowStart, $lte: tomorrowEnd }
      }).populate('patientId').populate('doctorId');

      for (const rx of prescriptions) {
        if (!rx.patientId || !rx.patientId.userId) continue;

        const user = await User.findById(rx.patientId.userId);
        if (user && user.email) {
          await sendEmail({
            email: user.email,
            subject: 'MedConnect AI - Follow-up Reminder',
            html: `<h3>Hello ${user.firstName},</h3>
                   <p>This is a smart reminder that your doctor has scheduled a follow-up for you tomorrow (${tomorrowStr}).</p>
                   <p>Please log in to MedConnect AI to book a slot if you haven't already.</p>`
          });
          logger.info(`Follow-up reminder sent to ${user.email}`);
        }
      }
    } catch (err) {
      logger.error(`Error in Cron Job: ${err.message}`);
    }
  });
};
