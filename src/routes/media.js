/**
 * Created by Andy on 8/25/2017.
 */

import {basicController, NOT_IMPLEMENTED} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import File from "../model/file";
import randomstring from 'randomstring';
import {s3} from "../util";
import {prop, _} from 'atp-pointfree';

const model = File;
const permissions = createCrudPermissions('media', 'file');
const idField = 'fileId';

const crud = basicController.entity.crud({
    model, permissions, idField,
    validateCreate: v => v,
    preInsert: file => {
        file.s3Prefix = randomstring.generate({length: 8, readable: true});
        const fileNameFull = file.s3Prefix + " - " + file.fileName + "." + file.fileExtension;
        return s3().upload(fileNameFull, file.data).then(() => {
            delete file.data;
            return file;
        });
    },
    preDelete: req => new model().getById(req.params[idField])
        .then(_(s3().listObjects, media => `${media.s3Prefix ? media.s3Prefix + " - " : ""}${media.fileName}`))
        .then(s3().deleteObjects)
});

export default {
    ...crud,
    [":" + idField]: {
        ...crud[":" + idField],
        put: NOT_IMPLEMENTED,
    }
};
