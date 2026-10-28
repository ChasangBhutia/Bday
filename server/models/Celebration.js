const mongoose = require('mongoose');

const CelebrationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    recipientName: {
      type: String,
      default: 'Sophia',
      trim: true
    },
    senderName: {
      type: String,
      default: 'Your Loved Ones',
      trim: true
    },
    milestone: {
      type: String,
      default: '',
      trim: true
    },
    relationship: {
      type: String,
      default: 'Friend',
      trim: true
    },
    message: {
      type: String,
      default: ''
    },
    envelopeStyle: {
      type: String,
      default: 'rose-velvet'
    },
    giftStyle: {
      type: String,
      default: 'crimson-gold'
    },
    giftItem: {
      type: {
        type: String,
        default: 'teddy'
      },
      name: {
        type: String,
        default: 'Cuddly Birthday Teddy Bear 🧸'
      },
      message: {
        type: String,
        default: 'Sending you the warmest birthday hugs, endless smiles, and lots of love on your special day!'
      },
      badge: {
        type: String,
        default: 'Special Birthday Gift'
      }
    },
    music: {
      type: {
        type: String,
        default: 'synth'
      },
      name: {
        type: String,
        default: 'Celestial Music Box Melody'
      },
      url: {
        type: String,
        default: ''
      }
    },
    images: [
      {
        id: String,
        url: String,
        caption: String,
        alt: String
      }
    ],
    video: {
      url: {
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: ''
      }
    },
    wishes: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Format output to remove Mongo internal __v and expose clean json
CelebrationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Celebration', CelebrationSchema);
