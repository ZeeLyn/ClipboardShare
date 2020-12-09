const fs = require('fs');
const os = require('os');
const path = require('path');
const configFileName = ".conf";
var UUID = require('uuid');
export default {
    GetConfig: () => {
        if (fs.existsSync(configFileName)) {
            var json = fs.readFileSync(configFileName);
            return JSON.parse(json);
        } else {
            var config = {
                uid: UUID.v1(),
                nick_name: os.hostname(),
                save_file_dir: path.resolve("./"),
                token: "",
                postion: null,
                enable: true,
                connect_info: {
                    host: "",
                }
            };
            fs.writeFileSync(configFileName, JSON.stringify(config));
            return config;
        }
    },
    ModifyConfig: (conf) => {
        fs.writeFileSync(configFileName, JSON.stringify(conf));
    }
}