const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DocumentModel = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true
});
const Document = mongoose.model('Document', DocumentModel);
module.exports = Document;
