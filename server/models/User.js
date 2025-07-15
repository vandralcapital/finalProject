const mongoose = require('mongoose')
const auditMiddleware = require('../middleware/auditMiddleware')
const appLogsMiddleware = require('../middleware/appLogsMiddleware')

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function() { return this.authType !== 'ldap'; } },
    company_name: { type: String, required: false, default: null },
    role: { type: String, enum: ['admin', 'hod', 'user', 'app_admin'], default: 'user' },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: false },
    applicationName: { type: String, required: false },
    created_at: { type: Date, default: Date.now }, 
    updated_at: { type: Date, default: Date.now }, 
    deleted_at: { type: Date, default: null }, 
    status: { type: Boolean, default: true },
    authType: { type: String, enum: ['local', 'ldap'], default: 'local' }
});

auditMiddleware(UserSchema);
appLogsMiddleware(UserSchema);

const UserModel = mongoose.model("User", UserSchema)

module.exports = UserModel