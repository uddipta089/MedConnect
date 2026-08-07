import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true // One review per appointment
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ doctorId: 1 });

// Statics method to calculate average rating
reviewSchema.statics.getAverageRating = async function (doctorId) {
  const obj = await this.aggregate([
    {
      $match: { doctorId: doctorId },
    },
    {
      $group: {
        _id: '$doctorId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Doctor').findByIdAndUpdate(doctorId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        totalReviews: obj[0].totalReviews,
      });
    } else {
      await this.model('Doctor').findByIdAndUpdate(doctorId, {
        rating: 0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.doctorId);
});

// Call getAverageRating after remove
reviewSchema.post('remove', function () {
  this.constructor.getAverageRating(this.doctorId);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
