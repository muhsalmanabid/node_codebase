const { mongoSaveUser, mongoFindUser } = require("../repository/user");
const bcrypt = require("bcrypt");
const wrapper = require("../../../../helpers/utils/wrapper");
const { v4: uuidV4 } = require("uuid");
const crypsi = require("../../../../helpers/utils/crypsi");

class UserV1Usecase { 
    async saveUser(payload) {
        try {
            let { password } = payload;
            const userExist = await mongoFindUser({ emailByHmac: crypsi.generatedHmacSha256(payload.email)});
            if (!userExist.err) {
                return wrapper.error('fail', `User ${payload.email} already exist`, 409);
            }
            console.log('masuk sini lagi emang?')
            payload.userId = uuidV4();
            payload.password = await bcrypt.hash(password, 10);
            const user = await mongoSaveUser(payload);
            if (user.err) {
                return wrapper.error('fail', user.message, 500);
            }
            return wrapper.data({userId: user.data.userId}, 'success', 201);
        } catch (error) {
            return wrapper.error('fail', error, 500);
        }
    } 
}

module.exports = new UserV1Usecase();