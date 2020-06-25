/**
 * Class Name: Session数据存储对象
 * Author: Bl.Chock
 * Update time: 2019年7月4日 14:44:33
 */
module.exports = (id) => {
    return {
        id: id,
        data: [],
        set: function(key,value) {
            this.data[key] = value;
        },
        get: function(key) {
            return this.data[key];
        },
        clear: function() {
            this.data.splice(0);
        }
    }
}