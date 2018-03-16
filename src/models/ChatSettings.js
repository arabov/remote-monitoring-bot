
import mongoose from 'mongoose';

export default mongoose.model('ChatSettings', {
    _id: Number,
    language_code: { type: String, default: 'en' },
    miners: { type: Array, default: [] },
    tmp: { type: Object, default: {} }
});