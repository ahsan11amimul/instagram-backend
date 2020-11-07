const mongoose = require('mongoose');
const PostSchema = mongoose.Schema({
    caption: String,
    user: String,
    image: String,
    comments: []
});
export default mongoose.model('posts', PostSchema);