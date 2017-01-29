/* Object */
var Page = function(requiresAuthentication,minimumProfileId) {
    this.requiresAuthentication = requiresAuthentication;
    this.minimumProfileId = minimumProfileId;
}

Page.prototype.authorization = function(authenticated,profileId,callback) {
    if ( !this.requiresAuthentication || (this.requiresAuthentication && authenticated) ) {
        if (profileId >= this.minimumProfileId) {
            callback(true);
        } else {
            callback(false);
        }
    } else {
        callback(false);
    }
};

/* Map of pages */
var map = {};
map['/log'] = new Page(true,3);
map['/configure/issue'] = new Page(true,1);
map['/terms'] = new Page(true,1);
map['/logout'] = new Page(true,1);

var ensureAuthorization = function(user,pathAccessed,callback) {
    var page = map[pathAccessed];
    if (page) {
        page.authorization(user.authenticated,user.profile.id,function(canAccess){
            callback(canAccess);
        });
    } else {
        callback(true);
    }
};

module.exports = {
    ensureAuthorization: ensureAuthorization
};