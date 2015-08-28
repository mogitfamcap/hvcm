module.exports = {
    name: function(path) {
        return path.replace(/^.*[\\\/]/, '');
    }
};
