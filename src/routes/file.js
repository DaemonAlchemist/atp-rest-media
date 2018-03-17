
import {basicController} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import validator from 'atp-validator';
import {s3} from "../util";

const permissions = createCrudPermissions('media', 'file');

//TODO:  Delete single files by Key
export default {
    get: basicController.rest({
        getValidator: req => validator()
            .loggedIn(req)
            .hasPermission(permissions.view, req),
        loadResource: req => s3().listObjects(req.query.prefix)
    })
};
