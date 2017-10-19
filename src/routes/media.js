/**
 * Created by Andy on 8/25/2017.
 */

import {basicController, NOT_IMPLEMENTED} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import File from "../model/file";
import {o} from 'atp-sugar';
import base64 from 'base-64';

const permissions = createCrudPermissions('media', 'file');

const restParams = permission => ({
    model: File,
    permission,
    idField: 'fileId',
    validate: (v, req) => v.isInteger(req.params.fileId, "fileId") //.fileExists(req.params.fileId)
});

const updateParams = permission => ({
    model: File,
    permission,
    idField: "fileId",
    validate: v => v, //TODO:  Implement media file edit validations
});

export default {
    get: basicController.entity.collection({
        model: File,
        permission: permissions.view,
        processResults: files => files.map(file => o(file).delete('data').raw)
    }),
    post: basicController.entity.create({
        model: File,
        permission: permissions.create,
        validate: v => v, //TODO:  Implement file creation validations
    }),
    ':fileId': {
        get: basicController.entity.view(restParams(permissions.view)),
        put: basicController.entity.replace(updateParams(permissions.edit)),
        patch: basicController.entity.update(updateParams(permissions.edit)),
        delete: basicController.entity.delete(restParams(permissions.delete)),
        download: {
            //TODO:  Add support for resizing and cropping
            get: basicController.entity.view(o(restParams(permissions.view)).merge({
                    processResults: file => base64.decode(file.data),
                    raw: true,
                    contentType: file => file.mime
                }).raw
            )
        }
    }
};
