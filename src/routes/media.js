/**
 * Created by Andy on 8/25/2017.
 */

import {basicController} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import File from "../model/file";
import {o} from 'atp-sugar';
import base64 from 'base-64';

const model = File;
const permissions = createCrudPermissions('media', 'file');
const idField = 'fileId';

export default o(basicController.entity.crud({model, permissions, idField})).merge({
    get: basicController.entity.collection({
        model,
        permission: permissions.view,
        processResults: files => files.map(file => o(file).delete('data').raw)
    }),
    [':' + idField]: {
        download: {
            //TODO:  Add support for resizing and cropping
            get: basicController.entity.view({
                model,
                permission: permissions.view,
                idField,
                validate: (v, req) => v.isInteger(req.params[idField], idField),
                processResults: file => base64.decode(file.data),
                raw: true,
                contentType: file => file.mime
            })
        }
    }
}).raw;
